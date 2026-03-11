import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ─── Credenciales del proyecto Firebase ───────────────────
// Se obtienen en: console.firebase.google.com
// → Project Settings → Your apps → SDK setup
// ⚠️  No compartir públicamente estas claves.
const firebaseConfig = {
  apiKey: "AIzaSyAVBVnwNKIcIAd59KrA1Yskv_6V9k97pvQ",
  authDomain: "tasklife-4918b.firebaseapp.com",
  projectId: "tasklife-4918b",           // identifica el proyecto en Firebase
  storageBucket: "tasklife-4918b.firebasestorage.app",
  messagingSenderId: "998669261303",
  appId: "1:998669261303:android:4880ae604ceda1b3a8b6f2",
};

// Inicializa Firebase una sola vez para toda la app
const app = initializeApp(firebaseConfig);

// auth → maneja login, registro y sesión de usuarios
export const auth = getAuth(app);

// db → instancia de Firestore (base de datos NoSQL en la nube)
export const db = getFirestore(app);
