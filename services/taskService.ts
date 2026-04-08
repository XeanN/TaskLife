import { db } from "@/config/firebase";
import { NewTask, Task } from "@/models/Task";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
} from "firebase/firestore";

// Ruta: users/{userId}/areas/{areaId}/tasks/{taskId}
const tasksRef = (userId: string, areaId: string) =>
  collection(db, "users", userId, "areas", areaId, "tasks");

function docToTask(d: any, areaId: string): Task {
  const data = d.data();
  return {
    id: d.id,
    title: data.title,
    description: data.description ?? "",
    done: data.done ?? false,
    dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
    priority: data.priority ?? "media",
    labelIds: data.labelIds ?? [],
    areaId,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  };
}

export function subscribeToTasks(
  userId: string,
  areaId: string,
  callback: (tasks: Task[]) => void,
) {
  const q = query(tasksRef(userId, areaId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => docToTask(d, areaId)));
  });
}

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

export async function updateTask(
  userId: string,
  areaId: string,
  taskId: string,
  changes: Partial<Omit<Task, "id" | "createdAt">>,
) {
  const ref = doc(db, "users", userId, "areas", areaId, "tasks", taskId);
  await updateDoc(ref, {
    ...changes,
    dueDate: changes.dueDate
      ? Timestamp.fromDate(changes.dueDate)
      : changes.dueDate === undefined
        ? undefined
        : null,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTask(
  userId: string,
  areaId: string,
  taskId: string,
) {
  await deleteDoc(doc(db, "users", userId, "areas", areaId, "tasks", taskId));
}

export async function toggleTask(
  userId: string,
  areaId: string,
  taskId: string,
  done: boolean,
) {
  const ref = doc(db, "users", userId, "areas", areaId, "tasks", taskId);
  await updateDoc(ref, { done, updatedAt: Timestamp.now() });
}
