# Sustento de Arquitectura MVC en TaskLife

Fecha de verificacion: 2026-04-09
Rama revisada: feature/mvc-architecture

## Veredicto

El proyecto SI implementa arquitectura MVC, pero en formato hibrido.

- Cumple con separacion Model, Controller y View en estructura y uso real.
- Agrega una capa intermedia de hooks para conectar vistas con controladores.
- Tiene algunas excepciones puntuales donde la vista/contexto consume servicios directamente.

Por eso, la clasificacion mas precisa es: MVC hibrida (MVC + hooks/context + services).

## Evidencia por capa

### 1) Model

Ubicacion:
- models/Task.ts
- models/User.ts
- models/Label.ts
- models/Area.ts

Sustento:
- Define tipos y contratos de datos (Task, User, Label, Area, Priority, TaskFormData).
- Se reutiliza en controladores, hooks y vistas para mantener consistencia de dominio.

### 2) Controller

Ubicacion:
- controllers/TaskController.ts
- controllers/AuthController.ts
- controllers/LabelController.ts

Sustento:
- TaskController centraliza casos de uso (addTask, editTask, toggleTaskDone, removeTask), filtros y reglas de ordenamiento.
- AuthController valida credenciales, mapea usuario de Firebase y encapsula errores de autenticacion.
- LabelController valida y orquesta CRUD de etiquetas.

### 3) View

Ubicacion:
- app/(tabs)/index.tsx
- app/(tabs)/tasks.tsx
- app/(tabs)/profile.tsx
- app/area/[areaId].tsx
- app/(auth)/*

Sustento:
- Las pantallas se enfocan en render/UI y eventos.
- Delegan logica a hooks y controladores en la mayoria de flujos.

### 4) Data/Services

Ubicacion:
- services/taskService.ts
- services/authService.ts
- services/labelService.ts
- services/storageService.ts

Sustento:
- Encapsula acceso a Firebase/Auth/Firestore y persistencia local.
- Es consumida por controladores; en algunos casos tambien directamente por vista/contexto.

### 5) Application Layer (hooks)

Ubicacion:
- hooks/useTasks.ts
- hooks/useLabels.ts

Sustento:
- Orquesta estado de pantalla y conecta View con Controller.
- Reduce logica dentro de componentes de UI.

## Excepciones detectadas (no MVC estricto)

1. app/settings/notifications.tsx importa services/storageService directamente.
2. context/ThemeContext.tsx importa services/storageService directamente.

Estas excepciones no rompen el proyecto, pero indican que no es un MVC clasico estricto.

## Recomendacion tecnica

Si buscan MVC mas estricto, mover los accesos directos a services en view/context hacia controladores dedicados (por ejemplo SettingsController y ThemeController).

## Conclusion

Si, hay arquitectura MVC en esta rama, con implementacion hibrida y funcional.
La documentacion debe describirla como MVC hibrida para ser precisa y verificable con el codigo actual.
