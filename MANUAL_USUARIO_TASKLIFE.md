Manual de Usuario de TaskLife

Introducción

TaskLife es una aplicación móvil para organizar tareas de forma sencilla. La idea principal es que el usuario pueda crear actividades, ordenarlas por áreas, asignarles prioridad, poner fecha de vencimiento y recibir recordatorios para no olvidar lo importante.

El proyecto está formado por dos partes. Por un lado está el frontend, hecho con React Native y Expo, que es lo que ve y usa el usuario. Por otro lado está el backend, hecho con Kotlin, Ktor y Firebase, que guarda la información, valida el inicio de sesión, sincroniza los datos y prepara los recordatorios y estadísticas.

Este manual resume lo necesario para instalar, usar y entender la aplicación de manera general, sin entrar en demasiados detalles técnicos.

Requisitos de instalación

1. Sistema operativo Windows 10 o 11, macOS o Linux para desarrollo.
2. Node.js versión 18 o superior.
3. npm o Yarn para instalar dependencias.
4. Expo CLI o EAS CLI para ejecutar y compilar la app.
5. Android Studio o Xcode, si se quieren usar emuladores.
6. Cuenta de Firebase, si se utiliza inicio de sesión con Google.
7. Backend accesible por URL local o por túnel público, para que el dispositivo pueda conectarse.

Instrucciones de instalación

1. Clonar el repositorio del proyecto.
2. Instalar dependencias del frontend con npm install o yarn install.
3. Configurar la variable EXPO_PUBLIC_API_URL con la dirección del backend.
4. Si el proyecto lo requiere, agregar los archivos de Firebase para Android e iOS.
5. Ejecutar la app con npx expo start y abrirla en emulador, dispositivo físico o Expo Go.
6. Si se necesita Google Sign-In nativo, usar un build con dev-client o EAS.
7. Verificar que el backend esté encendido y responda antes de probar login, tareas o recordatorios.

Inicio de sesión

La aplicación puede iniciar sesión con Firebase. En ese flujo, el usuario entra con su cuenta de Google y el frontend obtiene un idToken.

Después de obtener ese token, la app lo envía al backend para que sea validado. Si el token es correcto, el servidor sincroniza el usuario y devuelve los datos necesarios para seguir usando la aplicación.

Este método permite que el inicio de sesión funcione de forma real sin manejar contraseñas propias dentro de la app.

Descripción de funcionalidades

1. Gestión de tareas: crear, editar, eliminar y marcar tareas como completadas.
2. Organización por áreas: separar tareas por contexto como trabajo, educación, finanzas o bienestar.
3. Etiquetas y prioridades: clasificar cada tarea para encontrarla más fácil.
4. Fechas de vencimiento: asignar dueDate para controlar cuándo debe cumplirse una tarea.
5. Alarmas y notificaciones: crear avisos automáticos para recordar tareas importantes.
6. Estadísticas y reporte semanal: revisar el avance general del usuario.
7. Sincronización con backend: guardar y consultar la información en el servidor.
8. Prueba de notificaciones: enviar una notificación de prueba desde Ajustes.
9. Cambio de backend en runtime: permitir alternar entre una URL local y una pública sin reinstalar la app.
10. Soporte para push token: guardar el token del dispositivo para futuras notificaciones push.

Capturas de pantalla

En esta parte del informe se deben insertar capturas reales de la aplicación. Lo ideal es que muestren lo más importante del sistema para que el profesor vea cómo funciona.

Se recomienda incluir estas imágenes:

1. Pantalla principal con áreas y tareas.
2. Formulario de creación o edición de tarea.
3. Pantalla de ajustes o notificaciones.
4. Vista de estadísticas o reporte semanal.

Bajo cada captura conviene escribir una breve descripción y el nombre de la pantalla. Si la imagen está guardada en una carpeta del proyecto, también se puede indicar la ruta del archivo para ubicarla más rápido.

Guía básica de uso

1. Abrir la aplicación y autenticarse.
2. Entrar en una área y crear una tarea nueva.
3. Completar el título, la fecha de vencimiento, la prioridad y las etiquetas.
4. Guardar la tarea para que quede registrada en el sistema.
5. Editar o eliminar tareas desde la lista principal.
6. Revisar si la tarea tiene recordatorios o alarmas configuradas.
7. Ir a Ajustes y probar la notificación de prueba.
8. Cambiar la URL del backend si se necesita usar otra instancia del servidor.
9. Consultar estadísticas o el reporte semanal para revisar el avance.

Solución de errores comunes

1. No conecta al backend: revisar EXPO_PUBLIC_API_URL y confirmar que el servidor esté encendido y accesible desde el dispositivo.
2. Google Sign-In falla: verificar que se esté usando un build compatible con Firebase y que la configuración sea correcta.
3. Las notificaciones no aparecen: revisar permisos del dispositivo y confirmar que el módulo de notificaciones esté bien instalado.
4. La alarma se programa en una hora incorrecta: comprobar la zona horaria del dispositivo y la fecha de vencimiento de la tarea.
5. La app marca errores de compilación: revisar dependencias, limpiar caché y volver a ejecutar el proyecto.
6. El backend no responde: confirmar que el servidor esté activo y que la URL configurada sea la correcta.

Integración con backend

Para que la app funcione bien, el backend debe responder correctamente en algunas rutas básicas.

1. Validar el idToken de Firebase en POST /auth/firebase.
2. Responder con datos claros del usuario para que el frontend no tenga que duplicar lógica.
3. Exponer recordatorios pendientes en GET /users/{userId}/reminders/due.
4. Permitir guardar recordatorios en POST /users/{userId}/reminders.
5. Guardar el push token del dispositivo en POST /users/{userId}/push-token.
6. Usar fechas en formato ISO 8601 y preferiblemente en UTC.
7. Manejar errores con códigos HTTP correctos y mensajes fáciles de entender.
8. Mantener documentación básica de los endpoints para pruebas desde el frontend.

En resumen, TaskLife funciona como un sistema completo donde el frontend permite al usuario interactuar de manera simple y el backend se encarga de guardar, validar y sincronizar la información. Esa combinación hace posible que las tareas, alertas y estadísticas se mantengan organizadas y consistentes.
