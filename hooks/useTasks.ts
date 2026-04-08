import { useAuth } from "@/context/AuthContext";
import {
    addTask,
    editTask,
    filterAndSortTasks,
    filterTasksByLabel,
    FilterType,
    getAreaStats,
    getTodayTasks,
    removeTask,
    SortKey,
    subscribeToAllAreas,
    subscribeToTasks,
    toggleTaskDone,
} from "@/controllers/TaskController";
import { Task, TaskFormData } from "@/models/Task";
import { useEffect, useMemo, useState } from "react";

// ── Para una sola área — [areaId].tsx ─────────────────────

export function useAreaTasks(
  areaId: string,
  filter: FilterType = "Todas",
  sort: SortKey = "fecha",
  labelFilter: string | null = null,
) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user || !areaId) return;
    return subscribeToTasks(user.id, areaId, setTasks);
  }, [user, areaId]);

  const displayed = useMemo(() => {
    const filtered = filterAndSortTasks(tasks, filter, sort);
    return filterTasksByLabel(filtered, labelFilter);
  }, [tasks, filter, sort, labelFilter]);

  const pending = useMemo(() => tasks.filter((t) => !t.done), [tasks]);

  const completed = useMemo(() => tasks.filter((t) => t.done), [tasks]);

  const stats = useMemo(() => getAreaStats(tasks), [tasks]);

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
  };

  const toggle = (task: Task): Promise<void> => {
    if (!user) return Promise.resolve();
    return toggleTaskDone(user.id, areaId, task.id, task.done);
  };

  const remove = (task: Task): Promise<void> => {
    if (!user) return Promise.resolve();
    return removeTask(user.id, areaId, task.id);
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
  };
}

// ── Para todas las áreas — index.tsx, tasks.tsx ───────────

export function useAllTasks() {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    if (!user) return;
    return subscribeToAllAreas(user.id, setAllTasks);
  }, [user]);

  const todayTasks = useMemo(() => getTodayTasks(allTasks), [allTasks]);

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
    return toggleTaskDone(user.id, task.areaId, task.id, task.done);
  };

  const remove = (task: Task): Promise<void> => {
    if (!user) return Promise.resolve();
    return removeTask(user.id, task.areaId, task.id);
  };

  const saveQuick = async (formData: TaskFormData): Promise<void> => {
    if (!user) return;
    await addTask(user.id, formData);
  };

  return {
    allTasks,
    todayTasks,
    totalPending,
    totalDone,
    toggle,
    remove,
    saveQuick,
  };
}
