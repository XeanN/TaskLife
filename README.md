# 📱 TaskLife

> Organiza tu estudio, trabajo y bienestar en un solo lugar.

![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat&logo=react)
![Expo](https://img.shields.io/badge/Expo-52-000020?style=flat&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)

---

## 📸 Pantallas

| Welcome                          | Home                          | Tareas                      | Áreas                      | Perfil           |
| -------------------------------- | ----------------------------- | --------------------------- | -------------------------- | ---------------- |
| Pantalla de bienvenida con login | Dashboard con resumen del día | Lista de tareas con filtros | Grid de áreas con progreso | Info del usuario |

---

## 🚀 Funcionalidades

- ✅ Autenticación con **email/contraseña**
- ✅ Autenticación con **Google** (en desarrollo)
- ✅ **Dashboard** con saludo dinámico y resumen del día
- ✅ **Gestión de tareas** con filtros por estado y área
- ✅ **4 áreas de vida**: Trabajo, Educación, Finanzas, Bienestar
- ✅ **Perfil de usuario** con estadísticas
- ✅ Navegación por **tabs** con Expo Router
- ✅ Diseño responsive para Android e iOS

---

## 🗂️ Arquitectura

```
miApp/
├── app/
│   ├── (auth)/              # Pantallas sin tabs
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx      # Pantalla inicial
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/              # Pantallas con bottom tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx        # Home / Dashboard
│   │   ├── tasks.tsx        # Mis tareas
│   │   ├── areas.tsx        # Mis áreas
│   │   └── profile.tsx      # Perfil
│   ├── _layout.tsx          # Root layout con AuthProvider
│   └── index.tsx            # Redirige según sesión
├── components/ui/           # Componentes reutilizables
├── constants/theme.ts       # Colores y fuentes
├── context/AuthContext.tsx  # Estado global de autenticación
└── hooks/useGoogleAuth.ts   # Hook para Google Sign In
```

---

## 🛠️ Tech Stack

| Tecnología                     | Uso                           |
| ------------------------------ | ----------------------------- |
| React Native                   | Framework móvil               |
| Expo SDK 52                    | Plataforma de desarrollo      |
| Expo Router                    | Navegación basada en archivos |
| TypeScript                     | Tipado estático               |
| Context API                    | Estado global                 |
| @expo/vector-icons             | Íconos                        |
| react-native-safe-area-context | Áreas seguras                 |

---

## ⚙️ Instalación

### Requisitos previos

- Node.js 18+
- npm o yarn
- Expo Go (para desarrollo) o Android Studio (para build nativo)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/tasklife.git
cd tasklife

# 2. Instalar dependencias
npm install

# 3. Iniciar el proyecto
npx expo start
```

Luego presiona **`a`** para abrir en el emulador de Android o escanea el QR con Expo Go.

---

## 🔐 Variables de entorno

Para activar Google Sign In crea un proyecto en [Google Cloud Console](https://console.cloud.google.com) y agrega tu `webClientId` en `hooks/useGoogleAuth.ts`.

```ts
GoogleSignin.configure({
  webClientId: "TU_WEB_CLIENT_ID.apps.googleusercontent.com",
});
```

---

## 📋 Roadmap

- [x] Pantalla de bienvenida
- [x] Autenticación con email
- [x] Autenticación con Google (simulada)
- [x] Home con dashboard
- [x] Pantalla de tareas con CRUD básico
- [x] Pantalla de áreas con progreso
- [x] Perfil de usuario
- [ ] Google Sign In nativo (build)
- [ ] Base de datos real (Supabase / Firebase)
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Publicación en Play Store

---

## 👨‍💻 Autor

Desarrollado como proyecto de aprendizaje de **React Native** con Expo.

---

## 📄 Licencia

MIT License — siéntete libre de usar este proyecto como base para tus propias apps.
