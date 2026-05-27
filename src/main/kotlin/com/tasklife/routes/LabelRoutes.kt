package com.tasklife.routes

import com.tasklife.controllers.LabelController
import com.tasklife.models.NewLabel
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.*

fun Application.configureLabelRoutes() {
    val controller = LabelController()

    routing {
        route("/users/{userId}/labels") {
            get {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                call.respond(controller.list(userId))
            }

            post {
                val userId = call.parameters["userId"] ?: return@post call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val label = call.receive<NewLabel>()
                val updatedLabel = label.copy(userId = userId)
                call.respond(HttpStatusCode.Created, controller.create(userId, updatedLabel))
            }

            get("{labelId}") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val labelId = call.parameters["labelId"] ?: return@get call.respondText(
                    "Falta labelId",
                    status = HttpStatusCode.BadRequest,
                )
                val label = controller.get(userId, labelId)
                if (label != null) call.respond(label)
                else call.respondText("No encontrado", status = HttpStatusCode.NotFound)
            }

            delete("{labelId}") {
                val userId = call.parameters["userId"] ?: return@delete call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val labelId = call.parameters["labelId"] ?: return@delete call.respondText(
                    "Falta labelId",
                    status = HttpStatusCode.BadRequest,
                )
                if (controller.delete(userId, labelId)) {
                    call.respondText("Eliminado", status = HttpStatusCode.OK)
                } else {
                    call.respondText("No encontrado", status = HttpStatusCode.NotFound)
                }
            }
        }
    }
}
