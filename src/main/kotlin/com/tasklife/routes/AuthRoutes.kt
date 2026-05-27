package com.tasklife.routes

import com.tasklife.controllers.AuthController
import com.tasklife.models.FirebaseAuthRequest
import com.tasklife.support.InvalidFirebaseTokenException
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.*

fun Application.configureAuthRoutes() {
    val controller = AuthController()

    routing {
        route("/auth") {
            post("/firebase") {
                try {
                    val request = call.receive<FirebaseAuthRequest>()
                    val response = controller.authenticateWithFirebase(request)
                    call.respond(response)
                } catch (e: InvalidFirebaseTokenException) {
                    call.respondText(
                        e.message ?: "Token de Firebase invalido",
                        status = HttpStatusCode.Unauthorized,
                    )
                }
            }
        }
    }
}
