import { Label, NewLabel } from "@/models/Label";
import {
    createLabel,
    deleteLabel,
    subscribeToLabels,
} from "@/services/labelService";

export { subscribeToLabels };

export async function addLabel(
  userId: string,
  name: string,
  color: string,
): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Escribe un nombre para la etiqueta");
  }
  if (!color) {
    throw new Error("Selecciona un color");
  }
  const newLabel: NewLabel = {
    name: trimmed,
    color,
    userId,
  };
  return createLabel(userId, newLabel);
}

export async function removeLabel(
  userId: string,
  labelId: string,
): Promise<void> {
  await deleteLabel(userId, labelId);
}

export function getLabelById(
  labels: Label[],
  labelId: string,
): Label | undefined {
  return labels.find((l) => l.id === labelId);
}

export function getLabelsByIds(labels: Label[], labelIds: string[]): Label[] {
  return labelIds
    .map((id) => labels.find((l) => l.id === id))
    .filter(Boolean) as Label[];
}
