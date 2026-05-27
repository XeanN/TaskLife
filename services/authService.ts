import { auth } from "@/config/firebase";
import { User } from "@/models/User";
import { parseApiError } from "@/services/errorHandler";
import { getApiUrl } from "@/services/runtimeConfig";
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

type AuthUser = Exclude<User, null>;

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "245945667061-7hacdc6e1jgjcbt1b84mjb8ijg3q6tg3.apps.googleusercontent.com";

export const isGoogleAuthConfigured = Boolean(GOOGLE_WEB_CLIENT_ID);

export function subscribeToAuthState(
  callback: (firebaseUser: FirebaseUser | null) => void,
) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  return user;
}

export async function signOutUser() {
  return signOut(auth);
}

type FirebaseAuthBackendResponse = {
  uid?: string;
  email?: string;
  emailVerified?: boolean;
  user?: AuthUser;
};

function normalizeBackendUser(
  backendUser: Partial<AuthUser> | undefined,
  fallbackUser: FirebaseUser,
): AuthUser {
  return {
    id: backendUser?.id ?? fallbackUser.uid,
    email: backendUser?.email ?? fallbackUser.email ?? "",
    name: backendUser?.name ?? fallbackUser.displayName ?? "Usuario Google",
    picture: backendUser?.picture ?? fallbackUser.photoURL ?? undefined,
    provider: "google",
  };
}

export async function signInWithGoogleFirebase(): Promise<AuthUser> {
  throw new Error(
    "Este helper fue reemplazado por el flujo Expo Auth Session en useGoogleAuth",
  );
}

export async function exchangeGoogleIdTokenWithFirebase(
  idToken: string,
): Promise<AuthUser> {
  if (!isGoogleAuthConfigured) {
    const error = new Error("Google Sign-In no está configurado en este build");
    (error as any).code = "GOOGLE_SIGNIN_NOT_CONFIGURED";
    throw error;
  }

  const credential = GoogleAuthProvider.credential(
    idToken,
  );

  const credentialResult = await signInWithCredential(auth, credential);
  const firebaseIdToken = await credentialResult.user.getIdToken();

  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/auth/firebase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken: firebaseIdToken }),
  });

  if (!res.ok) {
    throw await parseApiError(res);
  }

  const response = (await res.json()) as FirebaseAuthBackendResponse;
  return normalizeBackendUser(response.user, credentialResult.user);
}
