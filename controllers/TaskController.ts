import { AREAS } from "@/models/Area";
import { NewTask, Task, TaskFormData } from "@/models/Task";
import {
    createTask,
    deleteTask,
    subscribeToTasks,
    toggleTask,
    updateTask,
} from "@/services/taskService";

export { subscribeToTasks };

// ── Suscripción a todas las áreas ────────────────────────

export function subscribeToAllAreas(
  userId: string,
  onUpdate: (allTasks: Record<string, Task[]>) => void,
): () => void {
  const cache: Record<string, Task[]> = {};
  const unsubs = AREAS.map((area) =>
    subscribeToTasks(userId, area.id, (tasks) => {
      cache[area.id] = tasks;
      onUpdate({ ...cache });
    }),
  );
  return () => unsubs.forEach((u) => u());
}

// ── CRUD ─────────────────────────────────────────────────

export async function addTask(
  userId: string,
  formData: TaskFormData,
): Promise<void> {
  if (!formData.title.trim()) {
    throw new Error("Escribe un nombre para la tarea");
  }
  if (!formData.areaId) {
    throw new Error("Selecciona un área");
  }
  const newTask: NewTask = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    priority: formData.priority,
    dueDate: formData.dueDate,
    labelIds: formData.labelIds,
    done: false,
    areaId: formData.areaId,
  };
  await createTask(userId, formData.areaId, newTask);
}

export async function editTask(
  userId: string,
  areaId: string,
  taskId: string,
  formData: TaskFormData,
): Promise<void> {
  if (!formData.title.trim()) {
    throw new Error("Escribe un nombre para la tarea");
  }
  await updateTask(userId, areaId, taskId, {
    title: formData.title.trim(),
    description: formData.description.trim(),
    priority: formData.priority,
    dueDate: formData.dueDate,
    labelIds: formData.labelIds,
  });
}

export async function toggleTaskDone(
  userId: string,
  areaId: string,
  taskId: string,
  currentDone: boolean,
): Promise<void> {
  await toggleTask(userId, areaId, taskId, !currentDone);
}

export async function removeTask(
  userId: string,
  areaId: string,
  taskId: string,
): Promise<void> {
  await deleteTask(userId, areaId, taskId);
}

// ── Helpers de UI ─────────────────────────────────────────

export function getTodayTasks(allTasks: Record<string, Task[]>): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Object.values(allTasks)
    .flat()
    .filter((t) => {
      if (t.done || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d >= today && d < tomorrow;
    })
    .slice(0, 5);
}

export function countPending(allTasks: Record<string, Task[]>): number {
  return Object.values(allTasks)
    .flat()
    .filter((t) => !t.done).length;
}

export function countDone(allTasks: Record<string, Task[]>): number {
  return Object.values(allTasks)
    .flat()
    .filter((t) => t.done).length;
}

export function getAreaStats(tasks: Task[]): {
  pending: number;
  completed: number;
  total: number;
  pct: number;
} {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const pending = total - completed;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { pending, completed, total, pct };
}

// ── Filtros y ordenamiento ────────────────────────────────

export type FilterType = "Todas" | "Pendientes" | "Completadas";
export type SortKey = "fecha" | "prioridad" | "nombre";

const PRIORITY_ORDER: Record<string, number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

export function filterAndSortTasks(
  tasks: Task[],
  filter: FilterType,
  sort: SortKey,
): Task[] {
  let list = tasks.filter((t) => {
    if (filter === "Pendientes") return !t.done;
    if (filter === "Completadas") return t.done;
    return true;
  });

  if (sort === "prioridad") {
    list = [...list].sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
    );
  } else if (sort === "nombre") {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  }
  // "fecha" usa el orden por defecto de Firestore (createdAt desc)

  return list;
}

export function filterTasksByLabel(
  tasks: Task[],
  labelId: string | null,
): Task[] {
  if (!labelId) return tasks;
  return tasks.filter((t) => t.labelIds.includes(labelId));
}
