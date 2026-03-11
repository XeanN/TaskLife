import { useAuth } from "@/context/AuthContext";
import {
    GoogleSignin,
    statusCodes,
} from "@react-native-google-signin/google-signin";

// Configurar Google Sign In con tu Web Client ID
GoogleSignin.configure({
  webClientId:
    "952846098210-bm9ohb8mdg7ahp79l964k01t45vbo6le.apps.googleusercontent.com",
});

export function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      await loginWithGoogle({
        id: userInfo.data?.user.id ?? "",
        email: userInfo.data?.user.email ?? "",
        name: userInfo.data?.user.name ?? "",
        picture: userInfo.data?.user.photo ?? "",
      });
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Usuario canceló el login");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Login ya en progreso");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Google Play Services no disponible");
      } else {
        console.error("Error Google Sign In:", error);
      }
    }
  };

  return { signInWithGoogle, isReady: true };
}
