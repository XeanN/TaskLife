# 📱 TaskLife

> Organiza tu estudio, trabajo y bienestar en un solo lugar.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat&logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?style=flat&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=flat&logo=firebase)
![Arquitectura](https://img.shields.io/badge/Arquitectura-MVC-purple?style=flat)

---

## 🚀 Funcionalidades

- ✅ Autenticación con **email/contraseña** (Firebase Auth)
- ✅ Autenticación con **Google**
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
- ✅ Datos sincronizados en **Firebase Firestore** en tiempo real
- ✅ Navegación por **tabs** con Expo Router
- ✅ Arquitectura **MVC** — código limpio y escalable

---

## 🗂️ Arquitectura MVC

TASKLIFE/
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

---

## 🛠️ Tech Stack

| Tecnología                     | Versión | Uso                                       |
| ------------------------------ | ------- | ----------------------------------------- |
| React Native                   | 0.81    | Framework móvil                           |
| Expo SDK                       | 54      | Plataforma de desarrollo                  |
| Expo Router                    | 6.x     | Navegación basada en archivos             |
| TypeScript                     | 5.9     | Tipado estático                           |
| Firebase Auth                  | 12.x    | Autenticación de usuarios                 |
| Firebase Firestore             | 12.x    | Base de datos en tiempo real              |
| AsyncStorage                   | 2.2     | Persistencia local (tema, notificaciones) |
| React Native Reanimated        | 3.x     | Animaciones fluidas                       |
| Context API                    | —       | Estado global                             |
| @expo/vector-icons             | 15.x    | Íconos                                    |
| react-native-safe-area-context | 5.x     | Áreas seguras                             |

---

## 🗄️ Base de datos — Firebase Firestore

### Estructura de datos

users/
└── {userId}/
├── areas/
│ └── {areaId}/ ← work | education | finance | health
│ └── tasks/
│ └── {taskId}/
└── labels/
└── {labelId}/ ← etiquetas personalizadas

### Campos de cada tarea

| Campo         | Tipo      | Descripción                 |
| ------------- | --------- | --------------------------- |
| `title`       | string    | Nombre de la tarea          |
| `description` | string    | Descripción opcional        |
| `done`        | boolean   | `true` si está completada   |
| `priority`    | string    | `alta` \| `media` \| `baja` |
| `dueDate`     | Timestamp | Fecha de vencimiento        |
| `labelIds`    | string[]  | IDs de etiquetas asignadas  |
| `areaId`      | string    | Área a la que pertenece     |
| `createdAt`   | Timestamp | Fecha de creación           |
| `updatedAt`   | Timestamp | Última modificación         |

### Campos de cada etiqueta

| Campo    | Tipo   | Descripción           |
| -------- | ------ | --------------------- |
| `name`   | string | Nombre de la etiqueta |
| `color`  | string | Color en hex          |
| `userId` | string | Usuario propietario   |

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

## 🔐 Configuración de Firebase

Crea o edita el archivo `config/firebase.ts`:

```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

Obtén estos valores en [console.firebase.google.com](https://console.firebase.google.com) → Project Settings → Your apps.

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
- [ ] Google Sign In nativo (build nativo)
- [ ] Notificaciones push
- [ ] Subtareas
- [ ] Widget de pantalla de inicio
- [ ] Publicación en Play Store

---

## 👨‍💻 Autor

**Angel (XeanN)** — Desarrollado como proyecto de aprendizaje de React Native con Expo y arquitectura MVC.

[![GitHub](https://img.shields.io/badge/GitHub-XeanN-181717?style=flat&logo=github)](https://github.com/XeanN)

---

## 📄 Licencia

MIT License — siéntete libre de usar este proyecto como base para tus propias apps.
