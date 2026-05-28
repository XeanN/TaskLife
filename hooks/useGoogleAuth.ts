import { useAuth } from "@/context/AuthContext";
import { exchangeGoogleIdTokenWithFirebase } from "@/services/authService";
import Constants from "expo-constants";
import { useState } from "react";
import { Platform } from "react-native";

type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin").GoogleSignin;

function isNativeGoogleSigninSupported() {
  return Constants.executionEnvironment !== "storeClient";
}

function getGoogleSignin(): GoogleSigninModule | null {
  if (!isNativeGoogleSigninSupported()) {
    return null;
  }

  try {
    // Carga diferida para no romper Expo Go; en dev client/build nativo sí existe.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require("@react-native-google-signin/google-signin");
    return (pkg.GoogleSignin ?? pkg.default ?? pkg) as GoogleSigninModule;
  } catch {
    return null;
  }
}

function configureGoogleSignin() {
  const googleSignin = getGoogleSignin();
  if (!googleSignin) return null;

  googleSignin.configure({
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      "245945667061-7hacdc6e1jgjcbt1b84mjb8ijg3q6tg3.apps.googleusercontent.com",
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    offlineAccess: true,
  });

  return googleSignin;
}

export function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const googleSignin = configureGoogleSignin();
      if (!googleSignin) {
        throw new Error(
          "Google Sign-In nativo no está disponible en este entorno. Usa un dev client o build nativo.",
        );
      }

      if (Platform.OS === "android") {
        await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const result = await googleSignin.signIn();
      if (result.type !== "success") {
        throw new Error("Login con Google cancelado o no completado");
      }

      const tokens = await googleSignin.getTokens();
      const idToken = tokens.idToken || result.data.idToken;
      if (!idToken) {
        throw new Error("No se pudo obtener el idToken de Google");
      }

      const backendUser = await exchangeGoogleIdTokenWithFirebase(idToken);
      await loginWithGoogle(backendUser);
    } finally {
      setLoading(false);
    }
  };

  const isReady = isNativeGoogleSigninSupported();

  return { signInWithGoogle, isReady, loading };
}
