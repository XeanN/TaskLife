export type AreaId = "work" | "education" | "finance" | "health";

export type Area = {
  id: AreaId;
  label: string;
  color: string;
  icon: string;
  lib: "ionicons" | "fa5" | "material";
};

export const AREAS: Area[] = [
  {
    id: "work",
    label: "Trabajo",
    color: "#4A7FA5",
    icon: "briefcase",
    lib: "ionicons",
  },
  {
    id: "education",
    label: "Educación",
    color: "#5BA4C8",
    icon: "school",
    lib: "ionicons",
  },
  {
    id: "finance",
    label: "Finanzas",
    color: "#3AA88A",
    icon: "bar-chart",
    lib: "ionicons",
  },
  {
    id: "health",
    label: "Bienestar",
    color: "#4DBF8A",
    icon: "heart-outline",
    lib: "ionicons",
  },
];

export const PRIORITIES = [
  { value: "alta" as const, label: "Alta", color: "#E53E3E" },
  { value: "media" as const, label: "Media", color: "#C58B00" },
  { value: "baja" as const, label: "Baja", color: "#38A169" },
];

// Navegación circular entre áreas con ◄ ►
export function getNextArea(currentId: AreaId): Area {
  const idx = AREAS.findIndex((a) => a.id === currentId);
  return AREAS[(idx + 1) % AREAS.length];
}

export function getPrevArea(currentId: AreaId): Area {
  const idx = AREAS.findIndex((a) => a.id === currentId);
  return AREAS[(idx - 1 + AREAS.length) % AREAS.length];
}
