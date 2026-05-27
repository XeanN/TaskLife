# 📱 TaskLife

> Organiza tu estudio, trabajo y bienestar en un solo lugar.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat&logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?style=flat&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=flat&logo=firebase)
![Arquitectura](https://img.shields.io/badge/Arquitectura-MVC_Hibrida-5E60CE?style=flat)

---

## 🚀 Funcionalidades

- ✅ Autenticación con **email/contraseña** (Firebase Auth)
- ✅ Autenticación con **Google** real (Firebase + backend; requiere build/dev client)
- ✅ Sesión persistente — no pide login al reabrir la app
- ✅ **Home** con grid de áreas y acceso rápido a "Mi día"
- ✅ **Gestión de tareas** por área con CRUD completo
- ✅ Tareas con **nombre, descripción, prioridad, fecha y etiquetas**
- ✅ **Etiquetas personalizadas** con colores — crea las tuyas
- ✅ **Filtros** por estado (Pendientes / Completadas / Todas)
- ✅ **Filtro por etiqueta** dentro de cada área
- ✅ **Ordenar** por fecha, prioridad o nombre
- ✅ **Navegación ◄ ►** entre áreas sin volver al inicio
- ✅ **4 áreas de vida**: Trabajo, Educación, Finanzas, Bienestar
- ✅ **Sección Completadas** colapsable dentro de cada área
- ✅ **Modo oscuro** completo — toda la app cambia en tiempo real
- ✅ **Perfil de usuario** con estadísticas y configuración
- ✅ Datos sincronizados a través de **backend REST** (Ktor)
- ✅ Navegación por **tabs** con Expo Router
- ✅ Arquitectura **MVC híbrida** (Model + Controller + View + hooks/context)

### Estado actual del front

- ✅ Sprint 1: manejo de errores unificado y limpieza base.
- ✅ Sprint 2: integración de `stats`, `weekly-report` y `reminders` en el cliente.
- ✅ Nueva vista de prueba: `app/settings/stats.tsx` con acceso desde Perfil.
- ✅ Hooks con cache y deduplicación: `useStats`, `useWeeklyReport`, `useReminders`.
- ✅ Google Sign-In real ya quedó conectado; el mock solo queda como fallback temporal.
- ✅ Recordatorios con notificación local en Android y sonido por defecto.
- ✅ Botón de prueba de alarma en `app/settings/notifications.tsx`.

### Google Sign-In real

Para probar Google real necesitas un dev client o un build nativo, no Expo Go.
El flujo usa `POST /auth/firebase` con `idToken` real y luego sincroniza al usuario con el backend.

### Recordatorios y notificaciones

El frontend ya consulta recordatorios pendientes desde el backend y programa notificaciones locales cuando llegan fechas válidas.

- La pantalla de estadísticas muestra los recordatorios pendientes.
- La pantalla de notificaciones incluye una acción para probar una alarma local.
- Android usa sonido por defecto del sistema.
- Si quieres un ringtone propio, hay que agregar un asset de audio y reconstruir la app.
- Para push server-side todavía se requiere scheduler del backend y token de dispositivo.

---

## 🗂️ Arquitectura MVC (Híbrida)

```text
TaskLife/
│
├── 📁 models/ ← MODEL (tipos puros)
│ ├── Task.ts
│ ├── User.ts
│ ├── Area.ts (AREAS y PRIORITIES — fuente única)
│ └── Label.ts
│
├── 📁 controllers/ ← CONTROLLER (lógica de negocio)
│ ├── AuthController.ts
│ ├── TaskController.ts
│ └── LabelController.ts
│
├── 📁 services/ ← DATA LAYER (Firebase)
│ ├── taskService.ts
│ ├── labelService.ts
│ ├── authService.ts
│ └── storageService.ts
│
├── 📁 context/ ← STATE GLOBAL
│ ├── AuthContext.tsx
│ └── ThemeContext.tsx
│
├── 📁 hooks/ ← PUENTE View ↔ Controller
│ ├── useTasks.ts
│ ├── useLabels.ts
│ └── useGoogleAuth.ts
│
├── 📁 components/ ← COMPONENTES REUTILIZABLES
│ ├── TaskFormSheet.tsx (bottom sheet crear/editar tarea)
│ ├── LabelSheet.tsx (bottom sheet etiquetas)
│ └── ui/
│ ├── ConfirmModal.tsx
│ └── LabelBadge.tsx
│
├── 📁 app/ ← VIEW (solo UI)
│ ├── (auth)/
│ │ ├── welcome.tsx
│ │ ├── login.tsx
│ │ └── register.tsx
│ ├── (tabs)/
│ │ ├── index.tsx (Home — grid áreas + Mi día)
│ │ ├── tasks.tsx (Lista global de tareas)
│ │ └── profile.tsx (Perfil + modo oscuro)
│ ├── area/
│ │ └── [areaId].tsx (Tareas por área + nav ◄ ►)
│ └── settings/
│ ├── notifications.tsx
│ ├── theme.tsx
│ ├── privacy.tsx
│ ├── help.tsx
│ └── about.tsx
│
├── 📁 config/
│ └── firebase.ts
├── 📁 constants/
│ └── theme.ts
└── 📁 assets/
```

### Estado real de la arquitectura

Esta rama implementa **MVC híbrida**:

- **Model**: `models/` define entidades y contratos (`Task`, `User`, `Label`, `Area`).
- **Controller**: `controllers/` centraliza reglas de negocio, validaciones y transformación de datos.
- **View**: `app/` renderiza pantallas y delega lógica a hooks/controllers.
- **Application layer**: `hooks/` conecta View con Controller para orquestar estado y casos de uso.

No es MVC estricto al 100% porque hay accesos directos a `services/` en puntos concretos (por ejemplo, `app/settings/notifications.tsx` y `context/ThemeContext.tsx`).

---

## 🛠️ Tech Stack

| Tecnología                     | Versión | Uso                                       |
| ------------------------------ | ------- | ----------------------------------------- |
| React Native                   | 0.81    | Framework móvil                           |
| Expo SDK                       | 54      | Plataforma de desarrollo                  |
| Expo Router                    | 6.x     | Navegación basada en archivos             |
| TypeScript                     | 5.9     | Tipado estático                           |
| Firebase Auth                  | 12.x    | Autenticación (login/registro)            |
| Backend REST (Ktor)            | —       | API para tareas, labels y CRUD            |
| AsyncStorage                   | 2.2     | Persistencia local (tema, notificaciones) |
| React Native Reanimated        | 3.x     | Animaciones fluidas                       |
| Context API                    | —       | Estado global                             |
| @expo/vector-icons             | 15.x    | Íconos                                    |
| react-native-safe-area-context | 5.x     | Áreas seguras                             |

---

## 🔄 Estado Actual de Integración


Esta copia del repositorio contiene únicamente el cliente frontend de TaskLife (aplicación móvil construida con Expo + React Native). El backend (API REST y la capa que accede a Firestore) vive en un repositorio separado y comunica con esta app a través de `EXPO_PUBLIC_API_URL`.

Qué contiene este repositorio:

- Código cliente: `app/`, `components/`, `hooks/`, `controllers/`, `models/`, `services/` (cliente HTTP que consume la API REST).
- Configuración local: `.env.local` o `.env.example` para apuntar al backend.

Cómo conectar con el backend (configuración mínima)

1. Abrir `.env.local` (o crear uno si no existe) en la raíz del proyecto.

```bash
EXPO_PUBLIC_API_URL=http://<BACKEND_HOST>:8080
```

2. Reiniciar el bundler de Expo para que cargue las variables de entorno:

```bash
npx expo start --clear
```

3. Para comprobar la conexión desde la máquina de desarrollo puedes usar:

```bash
curl -i $EXPO_PUBLIC_API_URL/health/firebase
```

Respuesta esperada (ejemplo):

```
HTTP/1.1 200 OK
Firebase conectado
```

Si recibes `Network request failed` en la app, revisa:
- que el `EXPO_PUBLIC_API_URL` apunte a la URL correcta.
- que el backend esté corriendo y accesible desde la red local o desde la URL pública.
- que no haya políticas de firewall bloqueando el puerto 8080.

Para la demo actual, la base URL pública temporal es:

```bash
EXPO_PUBLIC_API_URL=https://gmt-brokers-sampling-democrat.trycloudflare.com
```

Estado actual de la integración en esta rama:

- El frontend ya está preparado para consumir la API REST (las funciones en `services/` usan `fetch()` hacia `EXPO_PUBLIC_API_URL`).
- El frontend muestra errores de servidor recibidos en texto plano o JSON.
- El frontend ya consume `stats`, `weekly-report` y `reminders` para la pantalla `app/settings/stats.tsx`.
- El login de Google ya obtiene credenciales reales, se sincroniza con Firebase y luego llama a `POST /auth/firebase`.
- NOTA: El backend corre en un repositorio separado; esta rama no contiene código de servidor.

### Resumen operativo rápido

- `EXPO_PUBLIC_API_URL` define la base del backend en `.env.local`.
- Para teléfono físico en red distinta, el front debe apuntar a una URL pública temporal o a un backend accesible desde Internet.
- Para desarrollo con dev client, usa `npm run dev-client` o `npx expo start --dev-client --tunnel` si Metro no alcanza por red.
- La build Android de desarrollo se genera con `npm run build:android:dev`.
- La build APK de demo se genera con EAS usando el perfil `preview`.

### Sprint 2 en curso

Ya quedó listo el primer bloque visible de Sprint 2 para validación en dispositivo:

- `services/statsService.ts` y `services/remindersService.ts`
- `hooks/useStats.ts`, `hooks/useWeeklyReport.ts`, `hooks/useReminders.ts`
- `app/settings/stats.tsx` para ver estadísticas, reporte semanal y recordatorios
- botón de acceso desde `app/(tabs)/profile.tsx`

Si el backend mantiene los contratos actuales, el front ya puede probarse sin cambios adicionales.

### Endpoints disponibles y contratos esperados

- `GET /health`
- `GET /health/firebase`
- `POST /auth/firebase` con `{ "idToken": "..." }`
- `GET /users/{userId}/stats`
- `GET /users/{userId}/weekly-report`
- `GET /users/{userId}/reminders/due`
- `GET /users/{userId}/reminders/run`
- `POST /users/{userId}/push-token`

El contrato de recordatorios usa una lista de objetos con campos como `id`, `taskId`, `type`, `title`, `body`, `dueAt`, `scheduledAt`, `sentAt` y `status`.

### Recordatorios y alarmas

El front ya consume recordatorios y además programa notificaciones locales cuando recibe fechas válidas.

Si quieres una alarma tipo app real que salte aunque la app no esté abierta, hace falta que el backend programe el disparo y, si corresponde, envíe push o alimente el scheduler local con el contrato correcto.

### Estructura mínima para ejecutar y probar

```bash
# Instalar dependencias
npm install

# Levantar el bundle para dev client
npm run dev-client

# O usar túnel si la red local da problemas
npx expo start --dev-client --tunnel

# Crear una nueva build de desarrollo Android
npm run build:android:dev

# Crear APK de demo con EAS
npx --yes eas-cli build --platform android --profile preview
```

---

## 📦 Documentación consolidada

- Los MD auxiliares de mensajes y prueba de recordatorios fueron retirados para evitar duplicación.
- El flujo actual de backend y demo se documenta aquí mismo en `README.md`.
- La arquitectura del frontend para el informe técnico está en [FRONTEND_ARQUITECTURA.md](FRONTEND_ARQUITECTURA.md).

---

## Arquitectura de Datos

### Frontend → Backend → Firestore

```text
📱 Frontend (React Native + Expo)
   ↓ fetch() / API calls
🖥️  Backend (Ktor)
   ↓ CRUD / queries
🗄️  Firestore (Google Cloud)
```

- **Frontend** (`app/`, `services/`) comunica con backend a través de REST API en `EXPO_PUBLIC_API_URL`.
- **Backend** (repositorio separado) maneja lógica de negocio, cache, deduplicación y conexión a Firestore.
- **Firestore** almacena tareas, etiquetas y datos de usuario con estructura jerárquica.

### Caché y Optimizaciones Frontend

- **Cache TTL**: 30 segundos en cliente para reducir llamadas innecesarias.
- **Deduplicación**: `isFetchingRef` en hooks evita solicitudes paralelas duplicadas.
- **Retry con backoff**: 2s, 5s, 10s (máx 3 intentos) en caso de errores transientes (429, etc).
- **Refetch solo en CRUD**: No hay refetch automático en navegación; solo después de create/edit/delete.

---

## ⚙️ Instalación

### Requisitos previos

- Node.js 18+
- npm o yarn
- Expo Go (desarrollo) o Android Studio (build nativo)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/XeanN/TaskLife.git
cd TaskLife

# 2. Instalar dependencias
npm install

# 3. Iniciar el proyecto
npx expo start --clear
```

Presiona `a` para abrir en Android o `i` para iOS.

---

## 🔐 Configuración

### Firebase Auth

El archivo `config/firebase.ts` contiene las credenciales para **autenticación solamente** (login/registro). Obtén los valores en [console.firebase.google.com](https://console.firebase.google.com) → Project Settings → Your apps.

Para Google Sign-In real, la app usa también `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` como client ID de OAuth.

Curiosamente, **las tareas ya no vienen de Firestore directo**, sino del backend REST. Esto fue un cambio arquitectónico para mejorar control y observabilidad.

### Backend API URL

Crea o edita `.env.local` en la raíz:

```bash
EXPO_PUBLIC_API_URL=http://<BACKEND_HOST>:8080
```

Ejemplo para desarrollo local:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

Reinicia el bundler para que cargue: `npx expo start --clear`

---

## 📋 Roadmap

- [x] Autenticación con email (Firebase Auth)
- [x] Autenticación con Google
- [x] Sesión persistente
- [x] Home con grid de áreas
- [x] Tareas por área con CRUD completo
- [x] Filtros y ordenamiento
- [x] Prioridad y fecha de vencimiento
- [x] Etiquetas personalizadas con colores
- [x] Navegación ◄ ► entre áreas
- [x] Sección completadas colapsable
- [x] Modo oscuro completo
- [x] Perfil de usuario con estadísticas
- [x] Arquitectura MVC
- [x] Google Sign In real conectado con Firebase y backend
- [ ] Notificaciones push
- [ ] Integración de recordatorios locales por tarea
- [ ] Dashboard visual de estadísticas ampliado
- [ ] Subtareas
- [ ] Widget de pantalla de inicio
- [ ] Publicación en Play Store

---

## ⚡ Optimizaciones: Request Deduplication & Firestore Quota

### Problema Inicial
Cuando el usuario navegaba rápidamente entre pantallas (Home → Profile → Tasks), cada tab disparaba un refetch automático en `useFocusEffect`, causando múltiples llamadas simultáneas a la API. Con 4 áreas por request, esto agotaba la cuota diaria de Firestore.

### Solución Implementada

**1. Auto-refetch en focus DESACTIVADO**
```typescript
// ❌ BEFORE - Causaba 429 quota exceeded
useFocusEffect(
  useCallback(() => {
    fetchTasks();  // ← Ejecutaba en CADA tab focus
  }, [fetchTasks]),
);

// ✅ AFTER - Solo refetch en acciones explícitas
// Tasks refetch SOLO después de:
// - Crear tarea
// - Editar tarea
// - Marcar como completada/pendiente
// - Eliminar tarea
```

**2. Request Deduplication en hooks** (`hooks/useTasks.ts`)
```typescript
const isFetchingRef = useRef(false);

const fetchTasks = async () => {
  if (isFetchingRef.current) {
    console.log("⏭️ Fetch already in progress, skipping");
    return;  // ← Ignora duplicados
  }
  isFetchingRef.current = true;
  try {
    // ... fetch
  } finally {
    isFetchingRef.current = false;
  }
}
```

### Impacto
- ✅ ~90% reducción de requests innecesarios
- ✅ Firestore quota no se agota durante navegación normal
- ✅ Sincronización aún funciona (refetch después de CRUD)
- ✅ Mejor performance y menos batería

### Monitoreo
Logs de deduplicación:
```
LOG  ⏭️ Fetch already in progress for education, skipping duplicate
LOG  ⏭️ Fetch all tasks already in progress, skipping duplicate request
```

Para más detalles técnicos sobre el problema y solución en backend, revisa el historial del proyecto o el código de `hooks/useTasks.ts`.

---



