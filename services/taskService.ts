import { db } from "@/config/firebase";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
} from "firebase/firestore";

// ─── Tipos ────────────────────────────────────────────────
export type Priority = "alta" | "media" | "baja";

export type Label = {
  id: string;
  name: string;
  color: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  dueDate?: Date;
  priority: Priority;
  labels: string[]; // ids de etiquetas
  areaId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTask = Omit<Task, "id" | "createdAt" | "updatedAt">;

// ─── Rutas Firestore ──────────────────────────────────────
const tasksRef = (userId: string, areaId: string) =>
  collection(db, "users", userId, "areas", areaId, "tasks");

const labelsRef = (userId: string) => collection(db, "users", userId, "labels");

// ─── TAREAS ───────────────────────────────────────────────

// Escucha tareas en tiempo real
export function subscribeToTasks(
  userId: string,
  areaId: string,
  callback: (tasks: Task[]) => void,
) {
  const q = query(tasksRef(userId, areaId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const tasks: Task[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title,
        description: data.description ?? "",
        done: data.done ?? false,
        dueDate: data.dueDate
          ? (data.dueDate as Timestamp).toDate()
          : undefined,
        priority: data.priority ?? "media",
        labels: data.labels ?? [],
        areaId,
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      };
    });
    callback(tasks);
  });
}

// Crear tarea
export async function createTask(
  userId: string,
  areaId: string,
  task: NewTask,
) {
  const now = Timestamp.now();
  await addDoc(tasksRef(userId, areaId), {
    ...task,
    dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
    createdAt: now,
    updatedAt: now,
  });
}

// Actualizar tarea
export async function updateTask(
  userId: string,
  areaId: string,
  taskId: string,
  changes: Partial<Omit<Task, "id" | "createdAt">>,
) {
  const ref = doc(db, "users", userId, "areas", areaId, "tasks", taskId);
  await updateDoc(ref, {
    ...changes,
    dueDate: changes.dueDate ? Timestamp.fromDate(changes.dueDate) : null,
    updatedAt: Timestamp.now(),
  });
}

// Eliminar tarea
export async function deleteTask(
  userId: string,
  areaId: string,
  taskId: string,
) {
  const ref = doc(db, "users", userId, "areas", areaId, "tasks", taskId);
  await deleteDoc(ref);
}

// Marcar/desmarcar completada
export async function toggleTask(
  userId: string,
  areaId: string,
  taskId: string,
  done: boolean,
) {
  const ref = doc(db, "users", userId, "areas", areaId, "tasks", taskId);
  await updateDoc(ref, { done, updatedAt: Timestamp.now() });
}

// ─── ETIQUETAS ────────────────────────────────────────────

export async function getLabels(userId: string): Promise<Label[]> {
  const snap = await getDocs(labelsRef(userId));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Label, "id">),
  }));
}

export async function createLabel(
  userId: string,
  label: Omit<Label, "id">,
): Promise<string> {
  const ref = await addDoc(labelsRef(userId), label);
  return ref.id;
}

export async function deleteLabel(userId: string, labelId: string) {
  const ref = doc(db, "users", userId, "labels", labelId);
  await deleteDoc(ref);
}
