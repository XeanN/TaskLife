import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVBVnwNKIcIAd59KrA1Yskv_6V9k97pvQ",
  authDomain: "tasklife-4918b.firebaseapp.com",
  projectId: "tasklife-4918b",
  storageBucket: "tasklife-4918b.firebasestorage.app",
  messagingSenderId: "998669261303",
  appId: "1:998669261303:android:4880ae604ceda1b3a8b6f2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
