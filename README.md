# TaskLife Backend

Backend REST de TaskLife con Ktor, Kotlin y Firebase Firestore.

**Estado:** listo y compilando  
**Servidor local:** http://127.0.0.1:8080
**Stack:** Kotlin 1.9.22, Ktor 2.3.7, Netty, kotlinx-serialization, Firebase Admin SDK

## Resumen rápido

Este backend expone toda la capa de datos y coordinación del MVP:

- autentica usuarios con Firebase Auth mediante `idToken`
- sincroniza usuarios en Firestore
- gestiona áreas, tareas y etiquetas
- expone métricas, reporte semanal y recordatorios
- guarda el token del dispositivo para futuras notificaciones push
- mantiene caché corta en memoria para reducir lecturas repetidas

La API está pensada para que el frontend consuma Firestore solo a través de este backend, no directamente.

## Arquitectura

La estructura del backend sigue una separación simple por capas:

- `routes`: define los endpoints HTTP
- `controllers`: adapta la request hacia los servicios
- `service`: concentra la lógica de negocio
- `repository`: habla con Firestore
- `models`: contiene los contratos de datos
- `config`: arranque, serialización, Firebase y manejo global de errores
- `support`: validaciones, caché y excepciones de dominio

Flujo típico:

1. el frontend llama al endpoint HTTP
2. el controller valida y delega al service
3. el service ejecuta reglas de negocio
4. el repository lee o escribe en Firestore
5. la respuesta vuelve en JSON con el formato del modelo

## Acceso externo para demo

Si necesitas probar la app fuera de la red local, usa la URL pública temporal del túnel:

```text
https://gmt-brokers-sampling-democrat.trycloudflare.com
```

Para el frontend, apunta `EXPO_PUBLIC_API_URL` a esa base URL mientras dure la demo.

Verificación rápida:

```bash
curl https://gmt-brokers-sampling-democrat.trycloudflare.com/health
curl https://gmt-brokers-sampling-democrat.trycloudflare.com/health/firebase
```

## Qué hace

- CRUD de tareas por área y usuario
- CRUD de etiquetas por usuario
- autenticación Firebase para Google Sign-In mediante `idToken`
- lectura y actualización de usuarios
- consulta de áreas y prioridades
- health check de Firebase
- métricas y reporte semanal
- recordatorios de tareas y ejecución manual de pendientes
- persistencia de `pushToken` por usuario

## Cómo funciona la autenticación

El backend no maneja contraseñas propias. El flujo real es este:

1. el frontend obtiene un `idToken` de Firebase Auth
2. el frontend envía `POST /auth/firebase`
3. el backend verifica el token con Firebase Admin
4. si el token es válido, sincroniza el usuario en Firestore
5. el backend devuelve el usuario normalizado para usarlo en el resto del API

Eso permite usar Google Sign-In real sin depender de una sesión local separada.

## Persistencia

Firestore organiza los datos por usuario y área:

- `users/{userId}`: perfil, proveedor, nombre, email y `pushToken`
- `users/{userId}/areas/{areaId}/tasks`: tareas de cada área
- `users/{userId}/labels`: etiquetas del usuario

Los repositorios también aplican:

- caché TTL corta para evitar lecturas repetidas
- invalidación después de crear, editar o borrar
- manejo de paginación en listados de tareas
- soporte de recordatorios en cada tarea

## Recordatorios y alarmas

El backend ya expone el contrato base para recordatorios:

- consulta de recordatorios pendientes con `GET /users/{userId}/reminders/due`
- ejecución manual con `GET /users/{userId}/reminders/run`
- guardado de offsets por tarea en `task.reminders`

Si el scheduler está activado por entorno, el backend puede revisar usuarios y marcar recordatorios procesados en segundo plano.

## Endpoints

### Health y documentación
- `GET /`
- `GET /health`
- `GET /health/firebase`
- `GET /openapi.json`

### Auth
- `POST /auth/firebase`

### Áreas
- `GET /areas`
- `GET /areas/{areaId}`
- `GET /areas/priorities`

### Usuarios
- `GET /users/{userId}`
- `PUT /users/{userId}`
- `POST /users/{userId}/push-token`

### Tareas
- `GET /users/{userId}/areas/{areaId}/tasks`
- `POST /users/{userId}/areas/{areaId}/tasks`
- `GET /users/{userId}/areas/{areaId}/tasks/{taskId}`
- `PUT /users/{userId}/areas/{areaId}/tasks/{taskId}`
- `PATCH /users/{userId}/areas/{areaId}/tasks/{taskId}`
- `DELETE /users/{userId}/areas/{areaId}/tasks/{taskId}`

### Etiquetas
- `GET /users/{userId}/labels`
- `POST /users/{userId}/labels`
- `GET /users/{userId}/labels/{labelId}`
- `DELETE /users/{userId}/labels/{labelId}`

### Recordatorios e insights
- `GET /users/{userId}/stats`
- `GET /users/{userId}/weekly-report`
- `GET /users/{userId}/reminders/due`
- `GET /users/{userId}/reminders/run`

## Contratos importantes

Algunos detalles que conviene conocer antes de integrarlo con frontend:

- `priority` se serializa con valor por defecto `media`
- `limit` y `offset` están soportados en el listado de tareas
- `pushToken` se guarda por usuario para notificaciones futuras
- las respuestas de quota de Firestore vuelven en JSON con `code: RESOURCE_EXHAUSTED`
- las validaciones de tareas rechazan prioridades inválidas y fechas mal formadas

## Quick Start

```bash
cd "c:\Users\User\Documents\VSC Android\TaskLifeBackend"
.\gradlew.bat run
```

Verificaciones rápidas desde otra terminal:

```bash
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/health/firebase
curl http://127.0.0.1:8080/areas
curl http://127.0.0.1:8080/users/hCll5lfuGPN1J8voVXYkRe7AtUP2/areas/education/tasks
```

Autenticación Firebase (Google Sign-In real):

```bash
curl -X POST http://127.0.0.1:8080/auth/firebase ^
	-H "Content-Type: application/json" ^
	-d "{\"idToken\":\"<FIREBASE_ID_TOKEN>\"}"
```

El backend valida el `idToken`, sincroniza el usuario en Firestore y devuelve el usuario listo para usar en el resto del API.

Respuesta típica:

```json
{
	"uid": "firebase-uid",
	"email": "usuario@correo.com",
	"emailVerified": true,
	"user": {
		"id": "firebase-uid",
		"email": "usuario@correo.com",
		"name": "Nombre Google",
		"picture": "https://...",
		"provider": "google"
	}
}
```

## Estructura

```text
src/main/kotlin/com/tasklife/
├── config
├── models
├── repository
├── service
├── controllers
├── routes
└── main.kt
```

## Notas operativas

- El backend usa Firebase Admin y no depende de sesiones locales.
- Si el puerto 8080 está ocupado, hay que liberar el proceso Java antes de arrancar otra vez.
- Las respuestas de error por cuota de Firestore se devuelven en JSON con `code: RESOURCE_EXHAUSTED`.
- Se usa una caché corta en memoria para reducir lecturas repetidas en tareas, usuarios y etiquetas.
- El campo `priority="media"` ya se serializa correctamente en respuestas JSON.
- Google Sign-In real queda resuelto por backend mediante `POST /auth/firebase` con `idToken` de Firebase.
- La URL pública temporal de demo debe usarse solo mientras el túnel esté activo.
- El módulo de recordatorios ya expone lista de pendientes y ejecución manual para evolucionar hacia alarmas reales.
- Si van por push, el backend ya puede guardar el token del dispositivo con `POST /users/{userId}/push-token`.

## Requisitos

- Java 21+
- Gradle wrapper incluido
- Credenciales de Firebase Firestore en `src/main/resources`
- Archivo de service account configurado para el proyecto activo

## Cambiar a otro proyecto Firebase

Si quieres apuntar este backend a otro proyecto, define estas variables de entorno antes de arrancar:

```bash
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_SERVICE_ACCOUNT_FILE=/tu-service-account.json
```

Luego coloca el JSON del nuevo proyecto en `src/main/resources` con ese nombre exacto.

Si no defines variables, se sigue usando el proyecto actual por defecto.

## Variables de entorno útiles

- `FIREBASE_PROJECT_ID`: fuerza el proyecto Firebase a usar
- `FIREBASE_SERVICE_ACCOUNT_FILE`: ruta al JSON de service account
- `ENABLE_REMINDER_SCHEDULER=true`: activa el scheduler de recordatorios

## Build

```bash
.\gradlew.bat build -x test
```

## Archivos útiles

- `TaskLife_Backend_API.postman_collection.json`
- `src/main/kotlin/com/tasklife/main.kt`
- `src/main/kotlin/com/tasklife/routes/`
- `src/main/kotlin/com/tasklife/repository/`
