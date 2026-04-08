import { db } from "@/config/firebase";
import { Label, NewLabel } from "@/models/Label";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";

// Ruta: users/{userId}/labels/{labelId}
const labelsRef = (userId: string) => collection(db, "users", userId, "labels");

export function subscribeToLabels(
  userId: string,
  callback: (labels: Label[]) => void,
) {
  const q = query(labelsRef(userId), orderBy("name", "asc"));
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Label, "id">),
      })),
    );
  });
}

export async function createLabel(
  userId: string,
  label: NewLabel,
): Promise<string> {
  const ref = await addDoc(labelsRef(userId), label);
  return ref.id;
}

export async function deleteLabel(userId: string, labelId: string) {
  await deleteDoc(doc(db, "users", userId, "labels", labelId));
}
