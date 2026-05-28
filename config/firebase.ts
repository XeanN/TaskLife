import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ─── Firebase Auth Config (actualizado a tasklife-a2824) ───
// Valores extraídos de `google-services.json` (raíz del repo)
// Proyecto definitivo: tasklife-a2824
const firebaseConfig = {
  apiKey: "AIzaSyBsUoSKYbSF4GuiDmqfJPXU5-hKQoF-xkY",
  authDomain: "tasklife-a2824.firebaseapp.com",
  projectId: "tasklife-a2824",
  storageBucket: "tasklife-a2824.firebasestorage.app",
  messagingSenderId: "245945667061",
  appId: "1:245945667061:android:b6e19423e0f041f2e6a4bc",
};

// Inicializa Firebase Auth
const app = initializeApp(firebaseConfig);

// auth → maneja login, registro y sesión de usuarios
export const auth = getAuth(app);
