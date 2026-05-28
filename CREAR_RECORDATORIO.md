# Crear y programar recordatorios (Dev / Test)

Este documento explica cómo usar la nueva pantalla de la app para crear recordatorios de prueba **sin necesidad de desplegar backend** (funciona en local y con backend cuando está disponible).

## Qué hace
- Intenta crear el recordatorio en el backend (`POST /users/{userId}/reminders`).
- Si el backend no responde o da error, crea un recordatorio local y lo programa como notificación local.
- Programa la notificación local usando el mismo mecanismo que la app ya usa para `reminders/due`.

## Uso desde la app
1. Abre la app y entra a `Perfil > Configuración > Crear recordatorio`.
2. Rellena `Título` y `Descripción` (opcionales).
3. Ingresa una `Fecha/Hora (ISO)` o usa los botones rápidos `+10s`, `+1m`, `+5m`.
4. Pulsa `Programar recordatorio`.
5. La app intentará crear en el backend; si no puede, programará localmente la notificación.

La notificación debería sonar con el sonido por defecto (Android) en la hora indicada.

## Ejemplo de curl para backend (si quieres crear vía API)

```bash
curl -X POST "https://<API>/users/USER_ID/reminders" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rem-123",
    "title": "Tomar medicina",
    "body": "Pastilla roja - después del almuerzo",
    "dueAt": "2026-05-26T15:30:00.000Z",
    "status": "pending"
  }'
```

Si el backend implementa este endpoint, la app lo consumirá y programará la notificación en el dispositivo.

## Notas y limitaciones
- Las notificaciones locales solo garantizan el sonido si el dispositivo tiene permiso y el modo no silenciado.
- Para que la alarma suene aunque la app esté completamente cerrada/kill, necesitas implementar push server-side (FCM) y que el backend envíe la push en `dueAt`.
- Para un ringtone personalizado hay que agregar el asset al proyecto nativo y reconstruir la app.

---

Archivo relacionado: `services/remindersService.ts` exporta ahora `crearReminder(userId, reminder)`.
