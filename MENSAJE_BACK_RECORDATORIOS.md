Hola equipo backend,

Con la app actual, recordatorios significa dos cosas distintas:

1) Estado actual del frontend
- Ya consumimos `GET /users/{userId}/reminders/due` para listar lo que está pendiente.
- Ya consumimos `GET /users/{userId}/reminders/run` para ejecutar/consumir el recordatorio.
- Eso hoy sirve para mostrar y refrescar pendientes, pero todavía no es una alarma real que salte sola aunque la app esté cerrada.

2) Lo que falta para que quede como app real
- Scheduler del backend para decidir cuándo dispara cada recordatorio.
- Push notification real (FCM) o notificación local programada.
- Endpoint para guardar token de dispositivo si van por push: `POST /users/{userId}/push-token`.

La opción recomendada para demo robusta es backend + push:
- El backend programa el recordatorio.
- Cuando llega la hora, envía push con `{ reminderId, taskId, title, body, action }`.
- La app abre o refresca la tarea correspondiente.

Contrato mínimo que necesitamos dejar cerrado:
- `GET /users/{userId}/reminders/due?since=ISO&until=ISO`
- `GET /users/{userId}/reminders/run`
- `POST /users/{userId}/push-token` si usarán push
- Formato exacto de payload de la notificación

Si quieren, también podemos soportar una versión híbrida:
- backend calcula el due
- frontend programa notificaciones locales cuando la app esté activa o haya sincronización

Confirmen por favor cuál estrategia usarán para que el frontend quede alineado y podamos probar la experiencia completa de recordatorios.
