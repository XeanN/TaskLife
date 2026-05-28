export type Label = {
  id: string;
  name: string;
  color: string;
  userId: string;
};

export type NewLabel = Omit<Label, "id">;

// Colores predefinidos para que el usuario elija al crear etiquetas
export const LABEL_COLORS = [
  "#3B82F6", // azul
  "#10B981", // verde
  "#8B5CF6", // morado
  "#F59E0B", // amarillo
  "#EF4444", // rojo
  "#EC4899", // rosa
  "#06B6D4", // cyan
  "#F97316", // naranja
  "#6B7280", // gris
  "#14B8A6", // teal
];
