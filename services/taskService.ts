// ─── taskService.ts ──────────────────────────────────────
// Único archivo que habla directamente con Firestore.
// Todas las pantallas usan estas funciones; ninguna hace
// llamadas a Firebase por su cuenta.
import { db } from "@/config/firebase";
import {
  addDoc, // crea un documento con ID automático
  collection, // referencia a una colección
  deleteDoc, // elimina un documento
  doc, // referencia a un documento específico por ID
  getDocs, // lectura única (sin tiempo real)
  onSnapshot, // escucha cambios en tiempo real
  orderBy, // ordena los resultados de una consulta
  query, // construye una consulta con filtros/orden
  Timestamp, // tipo de fecha de Firestore (≠ Date de JS)
  updateDoc, // actualiza campos de un documento existente
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
// Estructura en la base de datos:
//   users/{userId}/areas/{areaId}/tasks/{taskId}
//   users/{userId}/labels/{labelId}
// Cada usuario tiene sus propios datos aislados por su uid.

// Referencia a la subcolección de tareas de un área
const tasksRef = (userId: string, areaId: string) =>
  collection(db, "users", userId, "areas", areaId, "tasks");

// Referencia a las etiquetas personalizadas del usuario
const labelsRef = (userId: string) => collection(db, "users", userId, "labels");

// ─── TAREAS ───────────────────────────────────────────────

// Escucha tareas en tiempo real con onSnapshot:
// cada vez que cambia un dato en Firestore, la UI se actualiza
// sin necesidad de recargar manualmente.
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

// Crea una tarea nueva en Firestore.
// addDoc genera el ID automáticamente; los timestamps
// se convierten al formato Timestamp de Firestore.
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

// Actualiza solo los campos enviados (Partial), sin reescribir
// todo el documento. Siempre actualiza updatedAt.
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

// Elimina el documento de la tarea permanentemente.
export async function deleteTask(
  userId: string,
  areaId: string,
  taskId: string,
) {
  const ref = doc(db, "users", userId, "areas", areaId, "tasks", taskId);
  await deleteDoc(ref);
}

// Cambia solo el campo 'done' de la tarea (true/false).
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
// Las etiquetas son colores/nombres que el usuario puede
// asignar a sus tareas. Se leen una sola vez (getDocs),
// no necesitan tiempo real.

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
