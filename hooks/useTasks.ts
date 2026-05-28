import { useAuth } from "@/context/AuthContext";
import { addTask, editTask, FilterType, removeTask, SortKey, toggleTaskDone } from "@/controllers/TaskController";
import { AREAS } from "@/models/Area";
import { Task, TaskFormData } from "@/models/Task";
import { syncReminderNotifications } from "@/services/notificationsService";
import { crearReminder } from "@/services/remindersService";
import { obtenerTareas } from "@/services/taskService";
import { useEffect, useMemo, useRef, useState } from "react";

type TasksMap = Record<string, Task[]>;

const TASKS_CACHE_TTL_MS = 30000;

const tasksStore = {
  userId: null as string | null,
  allTasks: {} as TasksMap,
  areaTasks: {} as TasksMap,
  allLastFetchedAt: 0,
  areaLastFetchedAt: {} as Record<string, number>,
  allFetchPromise: null as Promise<TasksMap> | null,
  areaFetchPromises: {} as Record<string, Promise<Task[]> | undefined>,
  listeners: new Set<() => void>(),
};

function emitTasksStoreUpdate() {
  tasksStore.listeners.forEach((listener) => listener());
}

function subscribeTasksStore(listener: () => void) {
  tasksStore.listeners.add(listener);
  return () => tasksStore.listeners.delete(listener);
}

function resetTasksStoreForUser(userId: string | null | undefined) {
  if (tasksStore.userId === userId) return;
  tasksStore.userId = userId ?? null;
  tasksStore.allTasks = {};
  tasksStore.areaTasks = {};
  tasksStore.allLastFetchedAt = 0;
  tasksStore.areaLastFetchedAt = {};
  emitTasksStoreUpdate();
}

function setAreaTasksInStore(areaId: string, tasks: Task[]) {
  tasksStore.areaTasks[areaId] = tasks;
  tasksStore.allTasks = {
    ...tasksStore.allTasks,
    [areaId]: tasks,
  };
  const now = Date.now();
  tasksStore.areaLastFetchedAt[areaId] = now;
  tasksStore.allLastFetchedAt = now;
  emitTasksStoreUpdate();
}

function replaceAllTasksInStore(tasksMap: TasksMap) {
  tasksStore.allTasks = tasksMap;
  tasksStore.areaTasks = { ...tasksMap };
  const now = Date.now();
  Object.keys(tasksMap).forEach((areaId) => {
    tasksStore.areaLastFetchedAt[areaId] = now;
  });
  tasksStore.allLastFetchedAt = now;
  emitTasksStoreUpdate();
}

function getTasksSnapshot() {
  return tasksStore.allTasks;
}

function getAreaSnapshot(areaId: string) {
  return tasksStore.areaTasks[areaId] ?? [];
}

function buildOneDayReminderDate(dueDate?: Date) {
  if (!dueDate) return null;
  const parsedDueDate = new Date(dueDate);
  if (Number.isNaN(parsedDueDate.getTime())) return null;

  const reminderDate = new Date(parsedDueDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(9, 0, 0, 0);

  if (reminderDate.getTime() <= Date.now()) return null;
  return reminderDate;
}

function normalizeTaskDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as any).toDate === "function") {
    const parsed = (value as any).toDate();
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
  }
  return null;
}

function getLastSevenDaysWindow(reference = new Date()) {
  const end = new Date(reference);
  end.setHours(23, 59, 59, 999);

  const start = new Date(reference);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

export function buildWeeklyReportFromTasks(allTasks: Record<string, Task[]>) {
  const { start, end } = getLastSevenDaysWindow();
  const tasks = Object.values(allTasks).flat();

  const weeklyTasks = tasks.filter((task: any) => {
    const createdAt = normalizeTaskDate(task?.createdAt) || normalizeTaskDate(task?.updatedAt);
    return !!createdAt && createdAt >= start && createdAt <= end;
  });

  const completedTasks = weeklyTasks.filter((task: any) => {
    if (!task?.done) return false;
    const updatedAt = normalizeTaskDate(task?.updatedAt) || normalizeTaskDate(task?.completedAt);
    return !!updatedAt && updatedAt >= start && updatedAt <= end;
  });

  const byArea: Record<string, number> = {};
  weeklyTasks.forEach((task: any) => {
    const area = AREAS.find((a) => a.id === task?.areaId)?.label || task?.areaId || "Sin área";
    byArea[area] = (byArea[area] || 0) + 1;
  });

  const tasksCreated = weeklyTasks.length;
  const tasksCompleted = completedTasks.length;

  return {
    generatedAt: new Date().toISOString(),
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    tasksCreated,
    tasksCompleted,
    completionRate: tasksCreated > 0 ? tasksCompleted / tasksCreated : 0,
    byArea,
  };
}

function buildReminderDueDate(dueDate: Date, offsetDays: number, hour = 9, minute = 0) {
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - offsetDays);
  reminderDate.setHours(hour, minute, 0, 0);
  return reminderDate;
}

export function collectUpcomingTaskReminders(allTasks: Record<string, Task[]>) {
  const now = Date.now();
  const reminders: any[] = [];

  Object.values(allTasks)
    .flat()
    .forEach((task: any) => {
      const dueDate = normalizeTaskDate(task?.dueDate);
      if (!dueDate) return;

      const taskReminders = Array.isArray(task?.reminders) && task.reminders.length > 0
        ? task.reminders
        : [{ offsetDays: 1, hour: 9, minute: 0 }];

      taskReminders.forEach((spec: any, index: number) => {
        const reminderDate = buildReminderDueDate(
          dueDate,
          Number(spec?.offsetDays || 0),
          typeof spec?.hour === "number" ? spec.hour : 9,
          typeof spec?.minute === "number" ? spec.minute : 0,
        );

        if (reminderDate.getTime() <= now) return;

        reminders.push({
          id: `task-${task?.id || task?.taskId || "task"}-reminder-${index}`,
          taskId: task?.id || task?.taskId || null,
          type: `TASK_DUE_${Number(spec?.offsetDays || 0)}D`,
          title: task?.title || "Recordatorio de tarea",
          body: task?.description || `La tarea vence el ${dueDate.toLocaleDateString()}`,
          dueAt: reminderDate.toISOString(),
          scheduledAt: reminderDate.toISOString(),
          status: task?.done ? "done" : "pending",
          areaId: task?.areaId || null,
        });
      });
    });

  reminders.sort((a, b) => new Date(a.dueAt || a.scheduledAt).getTime() - new Date(b.dueAt || b.scheduledAt).getTime());
  return reminders;
}

async function createAutoDueReminder(
  userId: string,
  formData: TaskFormData,
  createdTask?: any,
) {
  if (!formData.dueDate) return;

  const title = formData.title?.trim() || "Tarea";
  const taskId = String(createdTask?.id || createdTask?.taskId || `${formData.areaId}-${Date.now()}`);

  // Build list of reminder dates: use programmable reminders if provided, otherwise default 1 day before 09:00
  const reminderSpecs = formData.reminders && Array.isArray(formData.reminders) && formData.reminders.length > 0
    ? formData.reminders
    : [{ offsetDays: 1, hour: 9, minute: 0 }];

  const now = Date.now();
  const payloads: any[] = [];

  for (const spec of reminderSpecs) {
    const parsedDue = new Date(formData.dueDate as any);
    if (Number.isNaN(parsedDue.getTime())) continue;
    const reminderDate = new Date(parsedDue);
    reminderDate.setDate(reminderDate.getDate() - (spec.offsetDays || 0));
    reminderDate.setHours(typeof spec.hour === 'number' ? spec.hour : 9, typeof spec.minute === 'number' ? spec.minute : 0, 0, 0);
    if (reminderDate.getTime() <= now) continue;

    const payload = {
      id: `task-${taskId}-due-${spec.offsetDays}d-${reminderDate.getTime()}`,
      taskId,
      type: `TASK_DUE_${spec.offsetDays}D`,
      title: `Te queda ${spec.offsetDays} día(s): ${title}`,
      body: `La tarea \"${title}\" vence el ${new Date(formData.dueDate as any).toLocaleDateString()}.`,
      dueAt: reminderDate.toISOString(),
      scheduledAt: reminderDate.toISOString(),
      status: "pending",
    };

    payloads.push(payload);
  }

  if (payloads.length === 0) return;

  try {
    const created = await Promise.all(payloads.map((p) => crearReminder(userId, p)));
    const remindersToSchedule = payloads.map((payload, i) => ({
      ...payload,
      ...(created[i] || {}),
      dueAt: created[i]?.dueAt || created[i]?.scheduledAt || payload.dueAt,
      scheduledAt: created[i]?.scheduledAt || created[i]?.dueAt || payload.scheduledAt,
      id: String(created[i]?.id || created[i]?.reminderId || payload.id),
    }));
    await syncReminderNotifications(remindersToSchedule);
  } catch (err: any) {
    console.warn("⚠️ No se pudo crear/sincronizar recordatorios automáticos de tarea:", err?.message || err);
  }
}

async function fetchAreaTasks(userId: string, areaId: string) {
  const existingPromise = tasksStore.areaFetchPromises[areaId];
  if (existingPromise) return existingPromise;

  const promise = (async () => {
    const data = await obtenerTareas(userId, areaId);
    setAreaTasksInStore(areaId, data || []);
    return data || [];
  })();

  tasksStore.areaFetchPromises[areaId] = promise;

  try {
    return await promise;
  } finally {
    if (tasksStore.areaFetchPromises[areaId] === promise) {
      delete tasksStore.areaFetchPromises[areaId];
    }
  }
}

async function fetchAllTasks(userId: string) {
  if (tasksStore.allFetchPromise) return tasksStore.allFetchPromise;

  const tasksMap: TasksMap = {};

  const promise = (async () => {
    for (const area of AREAS) {
      try {
        const data = await obtenerTareas(userId, area.id);
        tasksMap[area.id] = data || [];
      } catch (err) {
        console.warn(`Error fetching tasks for area ${area.id}:`, err);
        tasksMap[area.id] = [];
      }
    }

    replaceAllTasksInStore(tasksMap);
    return tasksMap;
  })();

  tasksStore.allFetchPromise = promise;

  try {
    return await promise;
  } finally {
    if (tasksStore.allFetchPromise === promise) {
      tasksStore.allFetchPromise = null;
    }
  }
}

// ── Para una sola área — [areaId].tsx ─────────────────────

export function useAreaTasks(
  areaId: string,
  filter: FilterType = "Todas",
  sort: SortKey = "fecha",
  labelFilter: string | null = null,
) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(() => getAreaSnapshot(areaId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const lastFetchedRef = useRef<number | null>(tasksStore.areaLastFetchedAt[areaId] ?? null);

  const fetchTasks = async (force = false) => {
    const now = Date.now();
    if (!force && lastFetchedRef.current && now - lastFetchedRef.current < TASKS_CACHE_TTL_MS) {
      console.log("♻️ Using cached tasks for " + areaId + ", skipping fetch (TTL)");
      setLoading(false);
      return;
    }

    if (isFetchingRef.current) {
      console.log("⏭️ Fetch already in progress for " + areaId + ", skipping duplicate");
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      if (!user || !user.id) {
        console.warn("⚠️ User not available for fetching tasks");
        setTasks([]);
        setError("Usuario no autenticado");
        return;
      }
      const data = await fetchAreaTasks(user.id, areaId);
      setTasks(data || []);
      lastFetchedRef.current = Date.now();
      setError(null);
    } catch (err: any) {
      console.error("❌ Error fetching tasks:", err);
      const msg = err?.message?.toString() || "Error al cargar tareas";
      if (msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("429")) {
        setError(null);
        console.warn("⚠️ Límite temporal detectado; se omite el mensaje para la demo.");
      } else {
        setError(msg);
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    resetTasksStoreForUser(user?.id);
    fetchTasks();
  }, [user, areaId]);

  useEffect(() => {
    const unsubscribe = subscribeTasksStore(() => {
      setTasks(getAreaSnapshot(areaId));
    });

    return unsubscribe;
  }, [areaId]);

  const displayed = useMemo(() => {
    let filtered = tasks;

    // Filtrar tareas según el tipo de filtro
    if (filter === "Pendientes") {
      filtered = tasks.filter((task) => !task.done);
    } else if (filter === "Completadas") {
      filtered = tasks.filter((task) => task.done);
    }

    // Filtrar por etiqueta si es necesario
    if (labelFilter) {
      filtered = filtered.filter((task) => task.labelIds?.includes(labelFilter));
    }

    // Ordenar tareas según la clave de orden
    if (sort === "fecha") {
      filtered = filtered.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
      });
    } else if (sort === "prioridad") {
      const priorityOrder = { alta: 0, media: 1, baja: 2 };
      filtered = filtered.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));
    }

    return filtered;
  }, [tasks, filter, sort, labelFilter]);

  const pending = useMemo(() => tasks.filter((t) => !t.done), [tasks]);

  const completed = useMemo(() => tasks.filter((t) => t.done), [tasks]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.done).length;
    const pendingTasks = totalTasks - completedTasks;

    return {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
    };
  }, [tasks]);

  const save = async (
    formData: TaskFormData,
    editingTask?: Task,
  ): Promise<void> => {
    if (!user) return;
    if (editingTask) {
      await editTask(user.id, areaId, editingTask.id, formData);
    } else {
      const createdTask = await addTask(user.id, { ...formData, areaId });
      await createAutoDueReminder(user.id, { ...formData, areaId }, createdTask);
    }
    await fetchAreaTasks(user.id, areaId);
  };

  const toggle = (task: Task): Promise<void> => {
    if (!user) return Promise.resolve();
    return toggleTaskDone(user.id, areaId, task.id, task.done).then(() => fetchAreaTasks(user.id, areaId));
  };

  const remove = (task: Task): Promise<void> => {
    if (!user) return Promise.resolve();
    return removeTask(user.id, areaId, task.id).then(() => fetchAreaTasks(user.id, areaId));
  };

  return {
    tasks,
    displayed,
    pending,
    completed,
    stats,
    save,
    toggle,
    remove,
    loading,
    error,
  };
}

// ── Para todas las áreas — index.tsx, tasks.tsx ───────────

export function useAllTasks() {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>(() => getTasksSnapshot());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const lastFetchedRef = useRef<number | null>(tasksStore.allLastFetchedAt || null);

  const fetchTasks = async (force = false) => {
    const now = Date.now();
    if (!force && lastFetchedRef.current && now - lastFetchedRef.current < TASKS_CACHE_TTL_MS) {
      console.log("♻️ Using cached allTasks, skipping fetch (TTL)");
      setLoading(false);
      return;
    }

    if (isFetchingRef.current) {
      console.log("⏭️ Fetch all tasks already in progress, skipping duplicate request");
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      const tasksMap = await fetchAllTasks(user.id);
      setAllTasks(tasksMap);
      lastFetchedRef.current = Date.now();
      setError(null);
    } catch (err: any) {
      const msg = err?.message?.toString() || "Error al cargar tareas";
      if (msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("429")) {
        setError(null);
        console.warn("⚠️ Límite temporal detectado; se omite el mensaje para la demo.");
      } else {
        setError(msg);
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    resetTasksStoreForUser(user?.id);
    fetchTasks();
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeTasksStore(() => {
      setAllTasks(getTasksSnapshot());
    });

    return unsubscribe;
  }, []);

  const todayTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Object.values(allTasks)
      .flat()
      .filter((task) => {
        if (task.done || !task.dueDate) return false;
        const d = new Date(task.dueDate);
        d.setHours(0, 0, 0, 0);
        return d >= today && d < tomorrow;
      });
  }, [allTasks]);

  const totalPending = useMemo(
    () =>
      Object.values(allTasks)
        .flat()
        .filter((t) => !t.done).length,
    [allTasks],
  );

  const totalDone = useMemo(
    () =>
      Object.values(allTasks)
        .flat()
        .filter((t) => t.done).length,
    [allTasks],
  );

  const toggle = (task: Task): Promise<void> => {
    if (!user) return Promise.resolve();
    return toggleTaskDone(user.id, task.areaId, task.id, task.done).then(() => fetchAreaTasks(user.id, task.areaId));
  };

  const remove = (task: Task): Promise<void> => {
    if (!user) return Promise.resolve();
    return removeTask(user.id, task.areaId, task.id).then(() => fetchAreaTasks(user.id, task.areaId));
  };

  const saveQuick = async (formData: TaskFormData): Promise<void> => {
    if (!user) return;
    const createdTask = await addTask(user.id, formData);
    await createAutoDueReminder(user.id, formData, createdTask);
    await fetchAreaTasks(user.id, formData.areaId);
  };

  return {
    allTasks,
    todayTasks,
    totalPending,
    totalDone,
    toggle,
    remove,
    saveQuick,
    loading,
    error,
    fetchTasks,
  };
}
