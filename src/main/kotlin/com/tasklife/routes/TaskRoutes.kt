package com.tasklife.routes

import com.tasklife.controllers.TaskController
import com.tasklife.models.NewTask
import com.tasklife.models.TaskUpdate
import com.tasklife.support.requireBearerUser
import com.tasklife.support.Validation
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.*

fun Application.configureTaskRoutes() {
    val controller = TaskController()

    routing {
        route("/users/{userId}/areas/{areaId}/tasks") {
            get {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val areaId = call.parameters["areaId"] ?: return@get call.respondText(
                    "Falta areaId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@get
                val limit = call.request.queryParameters["limit"]?.toIntOrNull()
                val offset = call.request.queryParameters["offset"]?.toIntOrNull()
                val paginationError = Validation.validatePagination(limit, offset)
                if (paginationError != null) {
                    return@get call.respondText(paginationError, status = HttpStatusCode.BadRequest)
                }
                call.respond(controller.list(userId, areaId, limit, offset))
            }

            post {
                val userId = call.parameters["userId"] ?: return@post call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val areaId = call.parameters["areaId"] ?: return@post call.respondText(
                    "Falta areaId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@post
                val task = call.receive<NewTask>()
                val validationError = Validation.validateNewTask(task)
                if (validationError != null) {
                    return@post call.respondText(validationError, status = HttpStatusCode.BadRequest)
                }
                call.respond(controller.create(userId, areaId, task))
            }

            get("{taskId}") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val areaId = call.parameters["areaId"] ?: return@get call.respondText(
                    "Falta areaId",
                    status = HttpStatusCode.BadRequest,
                )
                val taskId = call.parameters["taskId"] ?: return@get call.respondText(
                    "Falta taskId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@get
                val task = controller.get(userId, areaId, taskId)
                if (task != null) call.respond(task)
                else call.respondText("No encontrado", status = HttpStatusCode.NotFound)
            }

            patch("{taskId}") {
                val userId = call.parameters["userId"] ?: return@patch call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val areaId = call.parameters["areaId"] ?: return@patch call.respondText(
                    "Falta areaId",
                    status = HttpStatusCode.BadRequest,
                )
                val taskId = call.parameters["taskId"] ?: return@patch call.respondText(
                    "Falta taskId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@patch
                val changes = call.receive<TaskUpdate>()
                val validationError = Validation.validateTaskUpdate(changes)
                if (validationError != null) {
                    return@patch call.respondText(validationError, status = HttpStatusCode.BadRequest)
                }
                val updatedTask = controller.update(userId, areaId, taskId, changes)
                if (updatedTask != null) {
                    call.respond(HttpStatusCode.OK, updatedTask)
                } else {
                    call.respondText("No encontrado o sin cambios", status = HttpStatusCode.NotFound)
                }
            }

            put("{taskId}") {
                val userId = call.parameters["userId"] ?: return@put call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val areaId = call.parameters["areaId"] ?: return@put call.respondText(
                    "Falta areaId",
                    status = HttpStatusCode.BadRequest,
                )
                val taskId = call.parameters["taskId"] ?: return@put call.respondText(
                    "Falta taskId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@put
                val changes = call.receive<TaskUpdate>()
                val validationError = Validation.validateTaskUpdate(changes)
                if (validationError != null) {
                    return@put call.respondText(validationError, status = HttpStatusCode.BadRequest)
                }
                val updatedTask = controller.update(userId, areaId, taskId, changes)
                if (updatedTask != null) {
                    call.respond(HttpStatusCode.OK, updatedTask)
                } else {
                    call.respondText("No encontrado o sin cambios", status = HttpStatusCode.NotFound)
                }
            }

            delete("{taskId}") {
                val userId = call.parameters["userId"] ?: return@delete call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val areaId = call.parameters["areaId"] ?: return@delete call.respondText(
                    "Falta areaId",
                    status = HttpStatusCode.BadRequest,
                )
                val taskId = call.parameters["taskId"] ?: return@delete call.respondText(
                    "Falta taskId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@delete
                if (controller.delete(userId, areaId, taskId)) {
                    call.respondText("Eliminado", status = HttpStatusCode.OK)
                } else {
                    call.respondText("No encontrado", status = HttpStatusCode.NotFound)
                }
            }
        }
    }
}
