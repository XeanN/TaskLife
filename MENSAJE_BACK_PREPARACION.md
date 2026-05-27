Hola equipo backend,

Decidimos la Opción B: haremos una build de producción con EAS y la app apuntará directamente a la URL pública (variable `EXPO_PUBLIC_API_URL`). Les pido por favor preparar lo siguiente para la demo:

1) URL pública y TLS
- Confirmar la URL pública HTTPS exacta donde recibiremos las peticiones (p. ej. https://api.mi-backend.com).
- TLS válido (no self-signed) y resolución desde redes externas.

2) Endpoints mínimos y formato
- `POST /auth/firebase` — recibe `{ "idToken": "..." }` y responde el token/session del backend. Indiquen ejemplos de éxito y error (status y body).
- `GET /users/{userId}/reminders/due?since=ISO&until=ISO` — devuelve lista de recordatorios con { id, title, body, isoDatetime, repeat? }.
- `POST /users/{userId}/reminders/{reminderId}/run` — ejecuta/ack del recordatorio. Responder 200/201 en éxito.
- `POST /users/{userId}/push-token` — opcional, para guardar token FCM `{ token: "..." }`.

3) Push (opcional)
- Si van a enviar notificaciones push, compartir credenciales FCM (o indicar quién las gestionará) y el formato de la `data` que la app recibirá (ej. `{ reminderId, action }`).

4) Accesos y pruebas
- Proveer una cuenta de prueba o un token para las llamadas desde el dispositivo.
- Si tienen un endpoint temporal (ngrok/tunnel) para validar antes de la build, compartirlo.

5) Google Sign-In / Firebase (importante para login nativo)
- Para que Google Sign-In nativo funcione en la build, necesitaremos que en Firebase Console estén registrados los SHA-1 y SHA-256 correspondientes al keystore que usará EAS. Podemos generar la build y pasarles las huellas para que las agreguen, o si ya tienen huellas registradas confirmen que están correctas.

6) Qué esperamos que confirmen por escrito
- URL pública final.
- Ejemplos de request/response (máximo 2 ejemplos por endpoint).
- Si usarán push: credenciales/formatos y si requieren que la app registre `push-token`.

Notas técnicas rápidas (cómo lo implementaremos)
- Nosotros construiremos con EAS estableciendo `EXPO_PUBLIC_API_URL` a la URL que confirmen; la app no necesitará override de AsyncStorage.
- Comando de build (ejemplo):

```bash
EXPO_PUBLIC_API_URL=https://api.mi-backend.com npx eas build --platform android --profile production
```

Por favor confirmen todo lo anterior en este hilo y, si es posible, envíen una URL de prueba y una cuenta de test. Cuando confirmen, procedo a generar la build y les paso las huellas SHA si necesitan registrarlas en Firebase.

Gracias — quedo atento para coordinar la build y las pruebas.
