# 📊 Roadmap: Logros, Mejoras Pendientes y Coordinación Backend

**Fecha**: 18 Mayo 2026  
**Estado**: TaskLife MVP funcional en producción (dispositivo físico)  
**Coordinación**: Frontend ✅ | Backend 🔄 | GCP Firestore ✅

---

## ✅ LOGROS COMPLETADOS (Fase 1)

### Core Funcionalidades
- ✅ Autenticación con Firebase Auth (email + Google Sign-In)
- ✅ CRUD completo de tareas (crear, leer, actualizar, eliminar, marcar done)
- ✅ 4 áreas de vida (Trabajo, Educación, Finanzas, Bienestar)
- ✅ Etiquetas personalizadas con colores
- ✅ Filtros por estado (Pendientes/Completadas/Todas)
- ✅ Ordenamiento (por fecha, prioridad, nombre)
- ✅ Prioridades de tarea (Alta, Media, Baja)
- ✅ Fechas de vencimiento
- ✅ Grid de áreas con contadores en Home
- ✅ Navegación ◄► entre áreas sin volver al inicio
- ✅ Modo oscuro completo

### Optimizaciones (Fase 1.5 - Cuota Firestore)
- ✅ Deduplicación de requests en hooks (isFetchingRef)
- ✅ Cache TTL 30s en cliente (allTasks + areaTasks)
- ✅ Estado compartido entre pantallas (tasksStore)
- ✅ Refetch SOLO en CRUD (sin auto-refetch en focus)
- ✅ Lock de promesas en vuelo (fetchAreaPromises, allFetchPromise)
- ✅ Retry con backoff 2s/5s/10s (máx 3 intentos)
- ✅ Sincronización en tiempo real entre tabs (subscription pattern)

### Infraestructura
- ✅ Proyecto GCP: tasklife-a2824
- ✅ Firestore (Native mode) creado y configurado
- ✅ IAM: firebase-adminsdk-fbsvc con roles/datastore.user
- ✅ Backend Ktor corriendo en producción
- ✅ Frontend apunta a IP LAN del backend (http://192.168.18.183:8080)
- ✅ Firebase Auth funcional en ambos proyectos

---

## 🚀 MEJORAS PENDIENTES (Priorización)

### TIER 1 (Crítico - Próximo Sprint)

#### 1. Notificaciones Locales de Vencimiento
**Por qué**: Las tareas con fecha vencida no avisaban. Usuario podría perder deadlines.  
**Scope**:
- Verificar tareas vencidas diariamente (background task).
- Si hay pendientes vencidas → mostrar notificación local.
- Abrir tarea vencida al tap en notificación.

**Backend**: No requiere cambios. Frontend consume `dueDate` que ya envía.  
**Complejidad**: Baja (usar `react-native-notifications` o `expo-notifications`).

---

#### 2. Módulo de Alarmas / Recordatorios
**Por qué**: Complementa vencimientos. Poder avisar X horas antes de una tarea importante.  
**Scope**:
- Cada tarea puede tener 0-3 recordatorios (1h, 3h, 1d antes de vencimiento).
- Guardar en backend: `task.reminders: [{ offsetMs: 3600000, sent: false }]`.
- Sistema de scheduling (cron o worker) en backend/frontend.
- Notificación con descripción y botón "Completar ahora".

**Backend**: Agregar campo `reminders` a Task. Scheduler para avisar.  
**Frontend**: UI en TaskFormSheet para seleccionar recordatorios.  
**Complejidad**: Media.

---

#### 3. Estadísticas y Reporte (Dashboard)
**Por qué**: Motivación + insights. Mostrar progreso del usuario.  
**Scope**:
- Pantalla nueva en Profile: "Mi estadística"
- Cartas: tareas totales, completadas hoy, racha (días sin perder deadline), promedio por área.
- Gráfico: completadas vs pendientes por semana (7 últimos días).
- Exportar CSV con reporte semanal.

**Backend**: Nuevos endpoints `/users/{userId}/stats` y `/users/{userId}/weekly-report`.  
**Frontend**: Nueva pantalla, gráficos (usar `react-native-chart-kit` o similar).  
**Complejidad**: Media-Alta.

---

### TIER 2 (Importante - Sprint 2-3)

#### 4. Compartir Tareas / Colaboración
**Por qué**: Tareas de equipo (trabajo grupal, familias).  
**Scope**:
- Cada tarea tiene `sharedWith: [{ userId, role: 'viewer'|'editor' }]`.
- Botón "Compartir" → seleccionar contactos o ingresar email.
- Notificación al usuario compartido: "X te compartió tarea Y".
- Viewer: solo lee. Editor: lee + modifica + marca done.

**Backend**: 
- Campo `sharedWith` en Task model.
- Endpoint `POST /users/{userId}/tasks/{taskId}/share`.
- Permisioning en GET/PUT para usuarios compartidos.

**Frontend**: Nuevo modal de compartir, lista de compartidos en detalle tarea.  
**Complejidad**: Alta (backend + frontend + permisos).

---

#### 5. Subtareas
**Por qué**: Desglosar tareas complejas sin saturar la lista.  
**Scope**:
- Cada tarea puede tener subtareas (lista anidada).
- UI: expandible en TaskCard.
- Crear/editar/eliminar subtareas desde taskFormSheet.
- Progreso visual: "2 de 4 subtareas completadas".

**Backend**: 
- Campo `subtasks: [{ id, title, done, createdAt, updatedAt }]` en Task.
- Endpoints separados o inline en PUT/POST de tarea.

**Frontend**: Componente SubtaskList reutilizable.  
**Complejidad**: Media.

---

#### 6. Búsqueda y Filtros Avanzados
**Por qué**: Con muchas tareas, buscar manualmente es lento.  
**Scope**:
- Búsqueda full-text por título + descripción.
- Filtros: por rango de fecha, prioridad múltiple, área múltiple, etiqueta múltiple.
- Guardar búsquedas frecuentes.

**Backend**: Endpoint `GET /users/{userId}/tasks/search?q=...&filters=...`.  
**Frontend**: Nueva pantalla "Búsqueda", componente de filtros avanzados.  
**Complejidad**: Media.

---

#### 7. Sincronización Offline (Persistent Local State)
**Por qué**: Mejor UX en conexión lenta / sin internet momentáneo.  
**Scope**:
- AsyncStorage persiste tareas locales.
- Si no hay red, crear/editar/eliminar queda en "pending" (badge visual).
- Al recuperar conexión, sincronizar cambios.
- Conflictos: last-write-wins o mostrar prompt.

**Backend**: No cambia. Frontend es responsable.  
**Frontend**: Enhanced AsyncStorage + queue de cambios pendientes.  
**Complejidad**: Media-Alta.

---

### TIER 3 (Mejoras de Experiencia)

#### 8. Temas Personalizables
**Por qué**: Ampliar más allá de solo Dark/Light.  
**Scope**:
- 5 temas: Default, Ocean, Forest, Sunset, Minimal.
- Cada tema tiene paleta propia (primary, secondary, accents).
- Guardar en AsyncStorage y sincronizar en backend (user.themeId).

**Backend**: Campo `themeId` en User model.  
**Frontend**: Selector de temas en Settings.  
**Complejidad**: Baja.

---

#### 9. Notificaciones Push (Producción)
**Por qué**: Recordatorios incluso si app no está abierta.  
**Scope**:
- Integrar Firebase Cloud Messaging (FCM) o Expo Push Notifications.
- Backend envía notificación cuando es hora de un recordatorio.
- User puede suscribirse/desuscribirse por tipo.

**Backend**: Servicio de FCM, almacenar device tokens.  
**Frontend**: Registrar device token, pedir permisos.  
**Complejidad**: Media (requiere APK nativo para push en background).

---

#### 10. Repetición de Tareas (Recurrentes)
**Por qué**: No escribir "Hacer ejercicio" cada día.  
**Scope**:
- Campo `recurrence: null | 'daily' | 'weekly' | 'monthly' | 'yearly'`.
- Campo `recurrenceEndDate: null | Date` (parar en X fecha).
- Backend genera automáticamente instancias futura al completar.

**Backend**: Lógica de recurrencia en POST toggleTask.  
**Frontend**: UI en TaskFormSheet.  
**Complejidad**: Media.

---

## ❓ ANÁLISIS: ¿Crashlytics sí o no?

### Recomendación: **NO AHORA. Sí después (Sprint 3-4).**

**Razón 1: No corrige problemas actuales**
- Crashlytics = observabilidad de crashes en producción.
- No soluciona bugs de lógica, errores de API, o perf issues.
- Mejor enfoque: logs en backend + monitoreo de cuota Firestore.

**Razón 2: Costo de integración alto sin Expo Go**
- Expo Go = compilado sin soporte nativo → no hay background crash handling.
- Compilar con EAS Build/Dev Client = complejidad + tiempo.
- Solo tiene sentido si suben a Play Store con builds nativos.

**Cuándo implementar**:
- ✅ Cuando hagan build APK/IPA nativo (antes de Play Store).
- ✅ Cuando hayan logrado >1000 usuarios activos (para merecer observabilidad).
- ✅ Después de estabilizar core features (estos 10 Tiers).

**Alternativa temporal** (Recomendado):
- Usar logs centralizados en backend (Stackdriver, Sentry).
- Frontend envía errors vía endpoint POST `/logs` con stacktrace.
- Backend agrega + visualiza en dashboard.
- Costo: ~$50/mes Sentry, mejor que Crashlytics para MVP.

---

## 📋 PRIORIZACIÓN SUGERIDA (18-24 meses)

```
Sprint 1 (Ahora - 2 semanas)
├─ ✅ [DONE] Cuota Firestore optimization
└─ ✅ [DONE] Sincronización entre tabs

Sprint 2 (Próximas 3 semanas)
├─ Notificaciones locales de vencimiento (TIER 1)
├─ Módulo de alarmas básico (TIER 1)
└─ Estadísticas MVP (TIER 2)

Sprint 3 (Mes 2)
├─ Compartir tareas (TIER 2) 
├─ Subtareas (TIER 2)
└─ Búsqueda avanzada (TIER 2)

Sprint 4 (Mes 3)
├─ Offline sync (TIER 2)
├─ Temas personalizables (TIER 3)
└─ Notificaciones push (TIER 3)

Sprint 5+ (Mes 4+)
├─ Repetición de tareas (TIER 3)
├─ Integración Crashlytics (TIER 3)
└─ Build nativo + Play Store
```

---

## 📨 MENSAJES PARA COORDINACIÓN CON BACKEND

### Mensaje 1: Confirmación de Éxito (Inmediato)

**Subject**: ✅ Frontend Ready - Firestore Cuota Mitigada + Sincronización en Vivo

Equipo backend,

Confirmamos que el frontend ha completado la fase de optimización contra cuota Firestore y sincronización entre pantallas:

**Logros Frontend (v1.0)**:
- ✅ Deduplicación de requests en hooks (isFetchingRef)
- ✅ Cache compartido 30s entre todas las pantallas
- ✅ Refetch SOLO en acciones CRUD (sin auto-focus)
- ✅ Estado sincronizado entre Home + Tasks + Area tabs
- ✅ Lock de promesas para evitar doble-fetch simultáneo
- ✅ Retry con backoff 2s/5s/10s (máx 3 intentos)

**Testeo en Producción**:
- ✅ Dispositivo físico Android conectado a IP LAN backend (192.168.18.183:8080)
- ✅ Firestore project: tasklife-a2824 (Native mode)
- ✅ IAM: firebase-adminsdk-fbsvc con roles/datastore.user asignado
- ✅ Crear + leer + editar + marcar done → funciona sin errores 429

**Estimado**: ~90% reducción de requests comparado a auto-refetch original.

**Próximos pasos frontend**:
1. Notificaciones locales de vencimiento (2 sem)
2. Módulo de alarmas/recordatorios (3 sem)
3. Estadísticas (4 sem)

Pueden proceder con confianza en producción.

---

### Mensaje 2: Plan de Mejoras Coordinadas (Semana 1)

**Subject**: 🚀 Frontend Roadmap Sprint 2-3 - Cambios Backend Requeridos

Equipo backend,

Para ejecutar mejoras del roadmap, requerimos cambios backend en las siguientes features:

#### **TIER 1 - Sprint 2 (Próximas 3 semanas)**

**1. Notificaciones de Vencimiento**
- Frontend: Verificar local `task.dueDate < now()` diariamente.
- Backend: No requiere cambios.
- Status: ✅ Listo para frontend.

**2. Módulo de Alarmas** ⚠️ **Requiere cambio backend**
- Nuevo campo en Task model:
  ```json
  "reminders": [
    { "offsetMs": 3600000, "sent": false },  // 1h antes
    { "offsetMs": 86400000, "sent": false }   // 1 día antes
  ]
  ```
- Nuevos endpoints:
  - `PUT /users/{userId}/areas/{areaId}/tasks/{taskId}` → aceptar reminders array
  - `POST /reminders/notify` (backend cron job) → verificar cada minuto y notificar
- Payload notificación: `{ taskId, title, message, dueDate, reminderTime }`

- **Estimado backend**: ~2 días dev + testing.

#### **TIER 2 - Sprint 3 (Semana 4+)**

**3. Estadísticas y Reporte**
- Nuevos endpoints:
  - `GET /users/{userId}/stats` → retorna { totalTasks, completedToday, streak, byArea }
  - `GET /users/{userId}/weekly-report` → últimos 7 días: { date, completed, pending }
- Frontend graficará los datos.

- **Estimado backend**: ~3 días dev + testing.

**4. Compartir Tareas** ⚠️ **Requiere cambios de modelo + permisos**
- Campo `sharedWith: [{ userId, role: 'viewer'|'editor', addedAt }]` en Task.
- Endpoints:
  - `POST /users/{userId}/tasks/{taskId}/share` → agregar usuario
  - `DELETE /users/{userId}/tasks/{taskId}/share/{sharedUserId}` → remover
  - `GET /users/{userId}/tasks?shared=true` → tareas compartidas conmigo
- Permisioning: GET/PUT valida si user es owner o editor.

- **Estimado backend**: ~4-5 días dev + testing (más crítico).

#### **Preguntas para confirmar:**

1. ¿Pueden empezar dev del módulo de alarmas esta semana? (Para que frontend espere 2 sem)
2. ¿Tienen una estrategia para notificaciones push (FCM) o prefieren que frontend use Expo Push?
3. ¿Hay restricción de permisos para que usuarios no autenticados vean tareas compartidas?

---

### Mensaje 3: Dependencias y Comunicación Continua (Ongoing)

**Subject**: 📡 Frontend ↔ Backend - Comunicación de Cambios API

Para próximos sprints, proponemos comunicar cambios API con anticipación:

**Formato de notificación**:
- Lunes: Backend propone cambios API (nuevos campos, endpoints, validaciones).
- Miércoles: Frontend confirma y propone ajustes (naming, payloads).
- Viernes: Implementación en paralelo (backend + frontend).

**Herramientas sugeridas**:
- Swagger/OpenAPI spec (source of truth para API).
- Postman collection (testing manual de endpoints).
- Changelog en repo backend (qué cambió, cuándo, por qué).

**Versionado API**:
- Prefijo `/v1/` en endpoints.
- Cambios breaking → `/v2/` futura.

---

## 📊 SUMMARY TABLE

| Feature | Tier | Sprint | Frontend | Backend | Status |
|---------|------|--------|----------|---------|--------|
| Cuota Optimization | — | ✅ Done | ✅ | ✅ | **LIVE** |
| Notificaciones Venc. | 1 | 2 | TBD (1w) | ✅ No req | Planned |
| Alarmas/Recordatorios | 1 | 2 | TBD (2w) | 🔄 Dev req | **BLOCKED** |
| Estadísticas | 2 | 2-3 | TBD (3w) | 🔄 Dev req | **BLOCKED** |
| Compartir Tareas | 2 | 3 | TBD (3w) | 🔄 Dev req | **BLOCKED** |
| Subtareas | 2 | 3 | TBD (2w) | Minor | Planned |
| Búsqueda Avanzada | 2 | 3 | TBD (2w) | 🔄 Dev req | **BLOCKED** |
| Offline Sync | 2 | 4 | TBD (3w) | ✅ No req | Planned |
| Temas | 3 | 4 | TBD (1w) | Minor | Planned |
| Push Notifications | 3 | 4 | TBD (2w) | 🔄 Dev req | **BLOCKED** |
| Recurrencia Tareas | 3 | 5 | TBD (2w) | 🔄 Dev req | **BLOCKED** |
| Crashlytics | 3 | 5 | TBD (2w) | ✅ No req | **NOT RECOMMENDED NOW** |

---

## 🎯 CONCLUSIÓN

### ¿Está listo para producción el MVP actual?
✅ **SÍ** — Todo funciona, cuota está mitigada, sincronización en vivo.

### ¿Necesita Crashlytics ahora?
❌ **NO** — Mejor usar logs centralizados en backend temporalmente.

### ¿Modulo de alarmas es recomendado?
✅ **SÍ** — Es complemento natural a vencimientos. No es core pero suma UX.

### Próximo paso inmediato:
1. Enviar **Mensaje 1** al backend (confirmación de éxito).
2. Enviar **Mensaje 2** con dependencias de features (alarmas, stats, compartir).
3. Coordinar sprint 2 con backend esta semana.

---

**Documento generado**: 18 May 2026  
**Autor**: Frontend Team  
**Estado**: Ready for Backend Review
