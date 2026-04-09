# 📱 TaskLife

> Organiza tu estudio, trabajo y bienestar en un solo lugar.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat&logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?style=flat&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat&logo=firebase)

---

## 🚀 Funcionalidades

- ✅ Autenticación con **email/contraseña** (Firebase Auth)
- ✅ Autenticación con **Google** (en desarrollo)
- ✅ Sesión persistente — no pide login al reabrir la app
- ✅ **Dashboard** con saludo dinámico y resumen del día
- ✅ **Gestión de tareas** por área con CRUD completo
- ✅ Tareas con **nombre, descripción, prioridad y fecha de vencimiento**
- ✅ **Filtros** por estado (Pendientes / Completadas / Todas)
- ✅ **Ordenar** por fecha, prioridad o nombre
- ✅ **4 áreas de vida**: Trabajo, Educación, Finanzas, Bienestar
- ✅ **Progreso por área** con barra visual en tiempo real
- ✅ **Perfil de usuario** con estadísticas
- ✅ Datos sincronizados en **Firebase Firestore**
- ✅ Navegación por **tabs** con React Navigation

---

## 🗂️ Arquitectura

```
TaskLife/
├── App.js                       # Monta providers y navegación
├── index.js                     # Entry point de Expo
├── src/
│   ├── components/              # UI reutilizable
│   ├── config/
│   │   └── firebase.ts          # Inicialización de Firebase
│   ├── constants/
│   │   └── theme.ts             # Tokens visuales
│   ├── context/
│   │   ├── AuthContext.tsx      # Estado y acciones de autenticación
│   │   └── ThemeContext.tsx     # Tema claro/oscuro
│   ├── hooks/                   # Hooks auxiliares
│   ├── navigation/
│   │   ├── AuthStack.tsx        # Flujo de autenticación
│   │   ├── MainTabs.tsx         # Tabs principales
│   │   ├── RootNavigator.tsx    # Decide si entra por auth o app
│   │   └── SettingsStack.tsx    # Navegación de ajustes
│   ├── screens/                 # Pantallas
│   │   ├── WelcomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── AreaScreen.tsx
│   │   └── settings/
│   │       ├── AboutScreen.tsx
│   │       ├── HelpScreen.tsx
│   │       ├── NotificationsScreen.tsx
│   │       ├── PrivacyScreen.tsx
│   │       └── ThemeScreen.tsx
│   └── services/
│       └── taskService.ts       # Acceso centralizado a Firestore
└── assets/
        └── images/
```

### Sustento arquitectónico

La rama `juan` no implementa MVC puro. Lo que sí existe es una arquitectura por capas con separación clara de responsabilidades:

- `src/screens/` actúa como capa de presentación e interacción con el usuario.
- `src/components/` contiene UI reutilizable sin lógica de persistencia.
- `src/services/taskService.ts` centraliza el acceso a Firestore, por lo que las pantallas no hablan con Firebase directamente.
- `src/context/AuthContext.tsx` y `src/context/ThemeContext.tsx` concentran estado global y reglas compartidas.
- `src/navigation/` resuelve el flujo de pantallas y la transición entre autenticación, tabs y ajustes.

Por eso, el término más preciso para documentar el proyecto es **arquitectura por capas orientada a pantallas** o **separación presentation/state/service**, no MVC clásico.

---

## 🛠️ Tech Stack

| Tecnología                     | Uso                           |
| ------------------------------ | ----------------------------- |
| React Native                   | Framework móvil               |
| Expo SDK 54                    | Plataforma de desarrollo      |
| React Navigation               | Navegación por stacks y tabs   |
| TypeScript                     | Tipado estático               |
| Firebase Auth                  | Autenticación de usuarios     |
| Firebase Firestore             | Base de datos en tiempo real  |
| Context API                    | Estado global                 |
| @expo/vector-icons             | Íconos                        |
| react-native-safe-area-context | Áreas seguras                 |

---

## 🗄️ Base de datos — Firebase Firestore

### ¿Qué es Firestore?

Firestore es una base de datos **NoSQL en la nube** de Google. En lugar de tablas como SQL, organiza los datos en **colecciones** (listas) y **documentos** (objetos JSON). Los datos se sincronizan en tiempo real entre la app y la nube.

### Estructura de datos

```
users/
└── {userId}/                     ← cada usuario tiene su propio espacio aislado
    ├── areas/
    │   └── {areaId}/             ← work | education | finance | health
    │       └── tasks/
    │           └── {taskId}/     ← cada tarea del usuario en esa área
    └── labels/
        └── {labelId}/            ← etiquetas personalizadas del usuario
```

> El `userId` es el UID que Firebase Auth asigna automáticamente al registrarse. Así cada usuario solo puede ver y modificar sus propios datos.

### Campos de cada tarea (`{taskId}`)

| Campo | Tipo | Descripción |
|---|---|---|
| `title` | string | Nombre de la tarea |
| `description` | string | Descripción opcional |
| `done` | boolean | `true` si está completada |
| `priority` | string | `alta` \| `media` \| `baja` |
| `dueDate` | Timestamp | Fecha de vencimiento (formato Firestore) |
| `labels` | string[] | IDs de etiquetas asignadas |
| `areaId` | string | Área a la que pertenece |
| `createdAt` | Timestamp | Fecha de creación |
| `updatedAt` | Timestamp | Última modificación |

### ¿Cómo fluyen los datos en la app?

```
Firebase Console (nube)
        ↕  tiempo real (onSnapshot)
src/services/taskService.ts ← único punto de contacto con Firestore
        ↕
src/screens/AreaScreen.tsx  ← lee y escribe tareas por área
src/screens/HomeScreen.tsx  ← resume tareas de todas las áreas
src/screens/TasksScreen.tsx ← filtra, crea y actualiza tareas
```

### Archivos clave de la base de datos

| Archivo | Rol |
|---|---|
| `src/config/firebase.ts` | Inicializa Firebase con las credenciales del proyecto |
| `src/services/taskService.ts` | Todas las operaciones CRUD de tareas y etiquetas |
| `src/context/AuthContext.tsx` | Autenticación — gestiona el `userId` que se usa en todas las rutas |
| `src/navigation/RootNavigator.tsx` | Decide qué flujo mostrar según la sesión |

---

## ⚙️ Instalación

### Requisitos previos

- Node.js 18+
- npm o yarn
- Expo Go o Android Studio

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/XeanN/TaskLife.git
cd TaskLife

# 2. Instalar dependencias
npm install

# 3. Iniciar el proyecto
npx expo start
```

Presiona **`a`** para abrir en el emulador de Android.

---

## 🔐 Variables de entorno

Crea el archivo `src/config/firebase.ts` con tu configuración de Firebase:

```ts
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};
```

Obtén estos valores en [console.firebase.google.com](https://console.firebase.google.com) → Project Settings → Your apps.

---

## 📋 Roadmap

- [x] Pantalla de bienvenida
- [x] Autenticación con email (Firebase Auth)
- [x] Sesión persistente
- [x] Home con dashboard dinámico
- [x] Pantalla de áreas con progreso en tiempo real
- [x] Tareas por área con CRUD completo (Firestore)
- [x] Filtros y ordenamiento de tareas
- [x] Prioridad y fecha de vencimiento
- [x] Perfil de usuario
- [ ] Google Sign In nativo (build nativo)
- [ ] Notificaciones push
- [ ] Subtareas
- [ ] Modo oscuro
- [ ] Publicación en Play Store

---

## 👨‍💻 Autor

Desarrollado como proyecto de aprendizaje de **React Native** con Expo.

---

## 📄 Licencia

MIT License — siéntete libre de usar este proyecto como base para tus propias apps.
