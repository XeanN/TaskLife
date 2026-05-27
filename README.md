# TaskLife Backend

Backend REST de TaskLife con Ktor, Kotlin y Firebase Firestore.

**Estado:** listo y compilando  
**Servidor:** http://127.0.0.1:8080  
**Stack:** Kotlin 1.9.22, Ktor 2.3.7, Netty, kotlinx-serialization, Firebase Admin SDK

## Acceso externo para demo

Si necesitas probar la app fuera de la red local, usa la URL pública temporal del túnel:

```text
https://throwing-sons-gained-yard.trycloudflare.com
```

Para el frontend, apunta `EXPO_PUBLIC_API_URL` a esa base URL mientras dure la demo.

Verificación rápida:

```bash
curl https://throwing-sons-gained-yard.trycloudflare.com/health
curl https://throwing-sons-gained-yard.trycloudflare.com/health/firebase
```

## Qué hace

- CRUD de tareas por área y usuario
- CRUD de etiquetas por usuario
- Autenticación Firebase para Google Sign-In mediante `idToken`
- Lectura y actualización de usuarios
- Consulta de áreas y prioridades
- Health check de Firebase

## Endpoints

### Health
- `GET /health`
- `GET /health/firebase`

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

### Recordatorios
- `GET /users/{userId}/reminders/due`
- `GET /users/{userId}/reminders/run`

## Quick Start

```bash
cd "c:\Users\User\Documents\VSC Android\TaskLifeBackend"
.\gradlew.bat run
```

Verificaciones rápidas:

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

## Cambiar a otro proyecto Firebase

Si quieres apuntar este backend a otro proyecto, define estas variables de entorno antes de arrancar:

```bash
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_SERVICE_ACCOUNT_FILE=/tu-service-account.json
```

Luego coloca el JSON del nuevo proyecto en `src/main/resources` con ese nombre exacto.

Si no defines variables, se sigue usando el proyecto actual por defecto.

## Build

```bash
.\gradlew.bat build -x test
```

## Archivos útiles

- `TaskLife_Backend_API.postman_collection.json`
- `src/main/kotlin/com/tasklife/main.kt`
- `src/main/kotlin/com/tasklife/routes/`
- `src/main/kotlin/com/tasklife/repository/`
