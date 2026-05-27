package com.tasklife.routes

import com.tasklife.controllers.UserController
import com.tasklife.models.CreateUserRequest
import com.tasklife.models.PushTokenRequest
import com.tasklife.models.UpdateUserRequest
import com.tasklife.support.requireBearerUser
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.*

fun Application.configureUserRoutes() {
    val controller = UserController()

    routing {
        route("/users") {
            post {
                try {
                    val request = call.receive<CreateUserRequest>()
                    // El userId viene desde Firebase Auth, aquí solo registramos el usuario en Firestore
                    // En un proyecto real, esto se haría con un token JWT validado
                    call.respondText(
                        "Para crear un usuario, primero autentica con Firebase",
                        status = HttpStatusCode.BadRequest,
                    )
                } catch (e: Exception) {
                    call.respondText(e.message ?: "Error al crear usuario", status = HttpStatusCode.BadRequest)
                }
            }
        }

        route("/users/{userId}/push-token") {
            post {
                val userId = call.parameters["userId"] ?: return@post call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@post

                try {
                    val request = call.receive<PushTokenRequest>()
                    val updated = controller.savePushToken(userId, request)
                    if (updated != null) {
                        call.respond(updated)
                    } else {
                        call.respondText("Token invalido o usuario no encontrado", status = HttpStatusCode.BadRequest)
                    }
                } catch (e: Exception) {
                    call.respondText(e.message ?: "Error al guardar push token", status = HttpStatusCode.BadRequest)
                }
            }
        }

        route("/users/{userId}") {
            get {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@get
                val user = controller.getById(userId)
                if (user != null) call.respond(user)
                else call.respondText("Usuario no encontrado", status = HttpStatusCode.NotFound)
            }

            put {
                val userId = call.parameters["userId"] ?: return@put call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@put
                try {
                    val request = call.receive<UpdateUserRequest>()
                    val updated = controller.update(userId, request)
                    if (updated != null) {
                        call.respond(updated)
                    } else {
                        call.respondText("Usuario no encontrado", status = HttpStatusCode.NotFound)
                    }
                } catch (e: Exception) {
                    call.respondText(e.message ?: "Error al actualizar usuario", status = HttpStatusCode.BadRequest)
                }
            }
        }
    }
}
