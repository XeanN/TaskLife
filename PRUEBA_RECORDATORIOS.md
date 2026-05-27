# Prueba de Recordatorios en TaskLife

Este documento explica cómo probar el estado actual de recordatorios en el frontend y qué esperar hoy.

## Qué hace hoy la app

- Lista recordatorios pendientes desde `GET /users/{userId}/reminders/due`.
- Ejecuta/refresca recordatorios desde `GET /users/{userId}/reminders/run`.
- Muestra la información en la pantalla de estadísticas.
- Sincroniza notificaciones locales en Android con sonido por defecto cuando el backend entrega `dueAt`.
- Incluye un botón de prueba para disparar una alarma local de verificación.

## Requisitos previos

- Tener sesión iniciada en la app.
- Tener `EXPO_PUBLIC_API_URL` apuntando al backend público correcto.
- El backend debe responder `200` en `GET /health`.

## Cómo probar desde la app

1. Abre la app y entra a la pantalla de estadísticas.
2. Verifica la sección `Recordatorios Pendientes`.
3. Si hay recordatorios, la app debe mostrarlos como lista.
4. Si no hay recordatorios, debe mostrar que no hay pendientes.
5. Verifica que no aparezcan errores de red en consola.
6. En `Configuración > Notificaciones`, toca `Probar alarma con sonido` para validar que el sistema muestra una notificación local.

## Qué revisar en consola

- La app debe hacer una petición a:

```bash
GET /users/{userId}/reminders/due
```

- Si se usa la pantalla de prueba de Sprint 2, también puedes forzar la ejecución de recordatorios con:

```bash
GET /users/{userId}/reminders/run
```

## Qué esperar hoy

- La lógica actual sirve para consultar y refrescar recordatorios.
- Cuando el backend devuelva `dueAt`, la app programa una notificación local con sonido por defecto.
- Si quieres recordatorios que salten aunque la app no se abra, el backend debe seguir entregando recordatorios futuros y la app debe recibir/sincronizar esos eventos.

## Cómo validar si el backend está bien

Prueba en navegador o terminal:

```bash
curl -i https://gmt-brokers-sampling-democrat.trycloudflare.com/health
curl -i https://gmt-brokers-sampling-democrat.trycloudflare.com/users/{userId}/reminders/due
curl -i https://gmt-brokers-sampling-democrat.trycloudflare.com/users/{userId}/reminders/run
```

## Criterios de éxito

- La app muestra recordatorios sin error.
- El botón de refrescar o ejecutar responde correctamente.
- No hay `Network request failed`.
- El backend responde con JSON válido o lista vacía.

## Si quieres recordatorios tipo alarma real

- La versión actual ya cubre la parte local con sonido por defecto.
- Si quieres un ringtone personalizado, hay que agregar un asset de sonido y reconstruir la app.
- Para push server-side sigue haciendo falta scheduler en backend + `POST /users/{userId}/push-token`.