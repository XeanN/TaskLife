package com.tasklife.routes

import com.tasklife.controllers.AreaController
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.*

fun Application.configureAreaRoutes() {
    val controller = AreaController()

    routing {
        route("/areas") {
            get {
                call.respond(controller.listAll())
            }

            get("/priorities") {
                call.respond(controller.getPriorities())
            }
        }

        route("/areas/{areaId}") {
            get {
                val areaId = call.parameters["areaId"] ?: return@get call.respondText(
                    "Falta areaId",
                    status = HttpStatusCode.BadRequest,
                )
                val area = controller.getById(areaId)
                if (area != null) call.respond(area)
                else call.respondText("Área no encontrada", status = HttpStatusCode.NotFound)
            }
        }
    }
}
