import { useAuth } from "@/context/AuthContext";
import { addTask, editTask, FilterType, removeTask, SortKey, toggleTaskDone } from "@/controllers/TaskController";
import { AREAS } from "@/models/Area";
import { Task, TaskFormData } from "@/models/Task";
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
        setError("Límite temporal de lecturas alcanzado. Intenta en unos minutos.");
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
      await addTask(user.id, { ...formData, areaId });
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
        setError("Límite temporal de lecturas alcanzado. Intenta en unos minutos.");
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
    await addTask(user.id, formData);
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
