# TaskLife Frontend

Este documento describe cómo está distribuido el frontend de TaskLife, cómo se organiza su arquitectura y cómo se relaciona con el backend para el informe técnico.

## Resumen ejecutivo

El frontend está construido con React Native + Expo + TypeScript y sigue una **arquitectura MVC híbrida**:

- **Model**: define entidades y contratos de datos.
- **Controller**: concentra reglas de negocio, validaciones y transformación de datos.
- **View**: pantallas y componentes visibles para el usuario.
- **Application layer**: hooks y contextos que coordinan estado, caché y casos de uso.

No es MVC puro, porque en varios puntos la capa de vista también consume servicios concretos para resolver tareas puntuales. Aun así, el flujo principal sí respeta la separación de responsabilidades.

## Arquitectura general

```text
app/           → Views y navegación (Expo Router)
components/    → Componentes reutilizables de UI
context/       → Estado global de sesión y tema
hooks/         → Capa de aplicación entre View y Controller
controllers/   → Reglas de negocio y coordinación de operaciones
services/      → Acceso a backend REST, Firebase, almacenamiento local
models/        → Tipos y contratos de dominio
config/        → Configuración de Firebase y entorno
constants/     → Constantes visuales y de sistema
assets/        → Imágenes, iconos y recursos estáticos
```

### Flujo de dependencias

```text
View (app/) → hooks/ → controllers/ → services/ → backend REST / Firebase
               ↘ context/ ↗
```

La UI nunca debería hablar directamente con Firestore ni con la lógica remota. El acceso se hace por `services/`, mientras que los `hooks/` exponen una API de consumo estable a las pantallas.

## Qué hace cada capa

### 1) Model

Los modelos viven en `models/` y representan el contrato de los datos de la app.

- `models/Task.ts` define `Task`, `TaskFormData`, `NewTask` y `Priority`.
- `models/User.ts` define el usuario autenticado.
- `models/Area.ts` centraliza áreas, prioridades y navegación entre áreas.
- `models/Label.ts` define etiquetas y sus colores.

Esta capa no contiene lógica de UI ni llamadas de red; solo tipos y estructuras.

### 2) Controller

Los controladores viven en `controllers/` y centralizan reglas de negocio del cliente.

- `controllers/AuthController.ts` administra login, registro, logout y sincronización con Firebase.
- `controllers/TaskController.ts` valida y normaliza la creación/edición/lectura de tareas.
- `controllers/LabelController.ts` hace lo mismo para etiquetas.

Ejemplo de responsabilidad real:

- validar que una tarea tenga título,
- normalizar prioridad,
- convertir datos de formularios a payloads listos para el backend,
- devolver errores comprensibles para la UI.

### 3) Services

`services/` contiene la capa de acceso a datos y dependencias externas.

- `services/taskService.ts` hace `fetch()` al backend para tareas.
- `services/statsService.ts` consulta estadísticas y reporte semanal.
- `services/remindersService.ts` obtiene recordatorios, ejecuta recordatorios y crea recordatorios dev/test.
- `services/notificationsService.ts` programa notificaciones locales en Android.
- `services/authService.ts` gestiona la comunicación con Firebase y el backend.
- `services/storageService.ts` persiste preferencias locales con AsyncStorage.
- `services/runtimeConfig.ts` resuelve la URL del backend mediante `EXPO_PUBLIC_API_URL` y overrides locales.

### 4) Hooks

Los hooks son la capa de aplicación que orquesta estado, caché y coordinación con el backend.

- `hooks/useTasks.ts` maneja listas globales, tareas por área, caché TTL y CRUD.
- `hooks/useLabels.ts` expone etiquetas a la UI.
- `hooks/useStats.ts` y `hooks/useWeeklyReport.ts` consultan métricas.
- `hooks/useReminders.ts` consulta recordatorios y sincroniza notificaciones locales.
- `hooks/useGoogleAuth.ts` encapsula el flujo de Google Sign-In.
- `hooks/useTasks.ts` también construye un reporte semanal local y las alarmas próximas derivadas de las tareas cuando el backend no aporta datos suficientes.

Aquí aparece el patrón clave del proyecto: **las pantallas no llaman todo directamente al backend**; normalmente llaman a un hook, y el hook decide si usa caché, si pide al servicio o si sincroniza notificaciones.

### 5) Context

Los contextos globales están en `context/`.

- `context/AuthContext.tsx` mantiene la sesión del usuario y expone login/logout.
- `context/ThemeContext.tsx` mantiene el modo claro/oscuro y preferencias visuales.

Estos contextos permiten que la navegación y la UI reaccionen a cambios de estado sin pasar props por toda la jerarquía.

### 6) View

La carpeta `app/` contiene las pantallas reales usando Expo Router.

- `app/(auth)/` agrupa acceso y registro.
- `app/(tabs)/` contiene la navegación principal.
- `app/area/[areaId].tsx` muestra tareas por área.
- `app/settings/` agrupa configuración, estadísticas, notificaciones, privacidad, ayuda y tema.

La vista solo compone UI, escucha eventos y llama a hooks o acciones. No debería guardar lógica de negocio compleja.

## Distribución por pantallas

### Inicio

`app/(tabs)/index.tsx` es la Home. Muestra:

- saludo según la hora,
- acceso a perfil,
- botón `Mi día`,
- grid de áreas,
- estado general de tareas con `useAllTasks()`.

### Tareas globales

`app/(tabs)/tasks.tsx` reúne todas las tareas y permite filtrar por área, priorizar y crear nuevas tareas rápidas.

### Perfil

`app/(tabs)/profile.tsx` concentra:

- estadísticas del usuario,
- modo oscuro,
- acceso a notificaciones,
- acceso a backend/API,
- acceso a estadísticas detalladas,
- acciones de configuración.

### Área específica

`app/area/[areaId].tsx` representa la vista CRUD principal por área. Desde aquí se puede:

- crear tarea,
- editar tarea,
- eliminar tarea,
- marcar como completada,
- filtrar por prioridad o etiqueta,
- navegar entre áreas.

### Ajustes y utilidades

`app/settings/` reúne funcionalidades secundarias pero importantes:

- `notifications.tsx` para preferencias y prueba de alarma,
- `stats.tsx` para métricas y recordatorios,
- `theme.tsx`, `privacy.tsx`, `help.tsx`, `about.tsx`.

## Flujo de autenticación

1. El usuario inicia sesión con correo/contraseña o Google.
2. `AuthController` llama a Firebase Auth.
3. `AuthContext` guarda la sesión activa.
4. `app/_layout.tsx` mantiene la app envuelta con `AuthProvider` y `ThemeProvider`.
5. Si el usuario ya tiene sesión, la app restaura automáticamente el estado.

Con Google Sign-In, el frontend obtiene un `idToken` y luego lo intercambia con el backend mediante `POST /auth/firebase`.

## Flujo de tareas

```text
Pantalla → hook → controller → service → backend
```

Ejemplo de creación:

1. `TaskFormSheet` recopila título, prioridad, fecha, área y etiquetas.
2. `useTasks()` llama a `addTask()` del controlador.
3. `TaskController` valida y normaliza el formulario.
4. `taskService.ts` hace `POST` al backend.
5. El hook refresca la caché local y actualiza la UI.

### Automatización de alarmas sobre tareas

Cuando se crea o edita una tarea con fecha de vencimiento, el frontend programa una alarma asociada a esa misma tarea, no a un recordatorio independiente.

El flujo actual es:

1. El usuario guarda una tarea con `dueDate`.
2. `useTasks.ts` calcula si existe una fecha válida para avisar 1 día antes.
3. Si aplica, arma un payload de alarma tipo `TASK_DUE_ONE_DAY` ligado al `taskId`.
4. `services/remindersService.ts` intenta persistir esa alarma en backend.
5. `services/notificationsService.ts` programa la notificación local.

Esto mantiene la experiencia centrada en la tarea. La pantalla de recordatorios queda como apoyo para ver pendientes y probar alarmas, pero la acción principal sale de la tarea misma.

### Recordatorios y notificaciones

El frontend ya soporta dos caminos, ambos ligados a tareas o a pruebas controladas:

- **Recordatorios consultados desde backend**: `GET /users/{userId}/reminders/due`.
- **Alarmas automáticas derivadas de tareas**: se crean al guardar tareas con fecha de vencimiento.
- **Notificación local de prueba**: botón de verificación en la pantalla de notificaciones.

La pantalla `app/settings/stats.tsx` lista recordatorios pendientes y la pantalla `app/settings/notifications.tsx` permite probar una alarma.

Estado final de integración del backend para recordatorios:

- `POST /auth/firebase` devuelve el `userId` que el frontend usa para asociar tareas, recordatorios y push token.
- `GET /users/{userId}/reminders/due` devuelve los recordatorios pendientes visibles en estadísticas.
- `GET /users/{userId}/reminders/run` permite ejecutar o simular el procesamiento manual de recordatorios.
- `POST /users/{userId}/push-token` guarda el token del dispositivo para futuras notificaciones push.
- Las fechas se validan en JSON y el backend responde de forma consistente, así que el frontend ya puede consumir estos datos sin cambiar el contrato principal.
- Cuando el backend de reportes viene vacío, el cliente reconstruye una vista local de la semana usando las tareas sincronizadas.
- Los recordatorios de tarea ahora pueden llevar varios presets `{ offsetDays, hour, minute }` y se persisten al crear/editar tareas.

Con esto, la parte de recordatorios queda cerrada del lado del frontend y lista para la presentación.

## Caché y rendimiento

El frontend usa caché en memoria por usuario para reducir lecturas innecesarias.

- `useStats()` TTL aproximado: 1 minuto.
- `useWeeklyReport()` TTL aproximado: 1 minuto.
- `useReminders()` TTL aproximado: 30 segundos.
- `useTasks()` tiene caché por área y por listado global.

Además, los hooks usan single-flight para evitar solicitudes duplicadas cuando ya hay un `fetch` en curso.

## Configuración y arranque

`app/_layout.tsx` inicializa dos cosas al arrancar:

- el canal de notificaciones Android,
- la carga temprana del override de la URL del backend.

### Variables importantes

- `EXPO_PUBLIC_API_URL`: URL base del backend.
- `TASKLIFE_API_URL_OVERRIDE`: override persistido localmente.

## Mapeo MVC práctico en esta rama

| Capa | Carpeta / archivo | Rol |
| --- | --- | --- |
| Model | `models/` | Entidades y contratos |
| Controller | `controllers/` | Reglas de negocio y validación |
| View | `app/` | Pantallas y navegación |
| Application layer | `hooks/` + `context/` | Estado, caché, coordinación |
| Data / Integración | `services/` | API REST, Firebase, notificaciones, storage |

## Archivos clave para citar en el informe

- `app/_layout.tsx` — inicialización global de la app.
- `context/AuthContext.tsx` — sesión y redirección tras login.
- `context/ThemeContext.tsx` — tema claro/oscuro.
- `controllers/TaskController.ts` — validación y normalización de tareas.
- `hooks/useTasks.ts` — caché, CRUD y automatización de recordatorios.
- `hooks/useStats.ts` — métricas del usuario.
- `hooks/useWeeklyReport.ts` — reporte semanal.
- `hooks/useReminders.ts` — recordatorios + sincronización de notificaciones.
- `services/taskService.ts` — acceso REST a tareas.
- `services/statsService.ts` — acceso REST a métricas.
- `services/remindersService.ts` — acceso REST a recordatorios.
- `services/notificationsService.ts` — programación de alarmas locales.
- `app/(tabs)/index.tsx` — pantalla principal.
- `app/(tabs)/tasks.tsx` — lista global de tareas.
- `app/(tabs)/profile.tsx` — perfil y accesos de configuración.
- `app/area/[areaId].tsx` — CRUD por área.

## Conclusión

El frontend de TaskLife está organizado con una separación clara entre interfaz, lógica de negocio y acceso a datos. La implementación no es MVC puro, pero sí una **MVC híbrida bien estructurada** que permite:

- mantener la UI limpia,
- reutilizar lógica en hooks y controllers,
- conectar con el backend REST sin acoplar las pantallas,
- agregar notificaciones y métricas sin romper la navegación principal.

En otras palabras: la app está distribuida para crecer por capas sin volver el código de pantallas un bloque difícil de mantener.
