# 📱 TaskLife

> Organiza tu estudio, trabajo y bienestar en un solo lugar.

![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat&logo=react)
![Expo](https://img.shields.io/badge/Expo-52-000020?style=flat&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)
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
- ✅ Navegación por **tabs** con Expo Router

---

## 🗂️ Arquitectura

```
miApp/
├── app/
│   ├── (auth)/                  # Pantallas sin tabs
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx          # Pantalla inicial
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                  # Pantallas con bottom tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Home / Dashboard
│   │   ├── tasks.tsx            # Mis tareas
│   │   ├── areas.tsx            # Mis áreas (grid con progreso)
│   │   └── profile.tsx          # Perfil de usuario
│   ├── area/
│   │   └── [areaId].tsx         # Tareas por área (CRUD completo)
│   ├── _layout.tsx              # Root layout con AuthProvider
│   └── index.tsx                # Redirige según sesión
├── config/
│   └── firebase.ts              # Configuración Firebase
├── components/ui/               # Componentes reutilizables
├── constants/theme.ts           # Colores y fuentes
├── context/
│   └── AuthContext.tsx          # Estado global de autenticación
├── services/
│   └── taskService.ts           # CRUD de tareas en Firestore
└── hooks/
    └── useGoogleAuth.ts         # Hook para Google Sign In
```

---

## 🛠️ Tech Stack

| Tecnología                     | Uso                           |
| ------------------------------ | ----------------------------- |
| React Native                   | Framework móvil               |
| Expo SDK 52                    | Plataforma de desarrollo      |
| Expo Router                    | Navegación basada en archivos |
| TypeScript                     | Tipado estático               |
| Firebase Auth                  | Autenticación de usuarios     |
| Firebase Firestore             | Base de datos en tiempo real  |
| Context API                    | Estado global                 |
| @expo/vector-icons             | Íconos                        |
| react-native-safe-area-context | Áreas seguras                 |

---

## 🗄️ Estructura de datos en Firestore

```
users/
└── {userId}/
    ├── areas/
    │   └── {areaId}/             ← work | education | finance | health
    │       └── tasks/
    │           └── {taskId}/     ← cada tarea del usuario
    └── labels/
        └── {labelId}/            ← etiquetas personalizadas
```

Cada tarea guarda:

- `title` — nombre
- `description` — descripción opcional
- `done` — estado completada
- `priority` — alta | media | baja
- `dueDate` — fecha de vencimiento
- `labels` — arreglo de ids de etiquetas
- `createdAt` / `updatedAt` — timestamps

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

Crea el archivo `config/firebase.ts` con tu configuración de Firebase:

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
