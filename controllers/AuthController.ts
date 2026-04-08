import { GoogleUserInfo, User } from "@/models/User";
import {
    registerWithEmail,
    signInWithEmail,
    signOutUser,
    subscribeToAuthState,
} from "@/services/authService";
import { User as FirebaseUser } from "firebase/auth";

export { subscribeToAuthState };

export function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? "",
    name: fbUser.displayName ?? "Usuario",
    picture: fbUser.photoURL ?? undefined,
    provider: "email",
  };
}

export function mapGoogleUser(googleUser: GoogleUserInfo): User {
  return {
    id: googleUser.id,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    provider: "google",
  };
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  if (!email.trim() || !password.trim()) {
    throw new Error("Por favor completa todos los campos");
  }
  try {
    const { user } = await signInWithEmail(email, password);
    return mapFirebaseUser(user);
  } catch (error: any) {
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
    ) {
      throw new Error("Correo o contraseña incorrectos");
    }
    if (error.code === "auth/invalid-email") {
      throw new Error("El correo electrónico no es válido");
    }
    if (error.code === "auth/too-many-requests") {
      throw new Error("Demasiados intentos. Intenta más tarde");
    }
    throw new Error("Error al iniciar sesión. Revisa tu conexión");
  }
}

export async function registerWithEmailAndName(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): Promise<User> {
  if (!name.trim() || !email.trim() || !password || !confirmPassword) {
    throw new Error("Por favor completa todos los campos");
  }
  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden");
  }
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }
  try {
    const fbUser = await registerWithEmail(name.trim(), email.trim(), password);
    return { ...mapFirebaseUser(fbUser), name: name.trim() };
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      throw new Error("Este correo ya está registrado");
    }
    if (error.code === "auth/invalid-email") {
      throw new Error("El correo electrónico no es válido");
    }
    if (error.code === "auth/weak-password") {
      throw new Error("La contraseña es muy débil");
    }
    throw new Error("Error al crear la cuenta. Revisa tu conexión");
  }
}

export async function logoutUser() {
  await signOutUser();
}
