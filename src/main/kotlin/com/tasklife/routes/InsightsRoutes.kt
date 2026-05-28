package com.tasklife.routes

import com.tasklife.controllers.InsightsController
import com.tasklife.controllers.ReminderController
import com.tasklife.models.ReminderCreateRequest
import com.tasklife.support.AuthSession
import com.tasklife.support.requireAuthenticatedUser
import com.tasklife.support.requireBearerUser
import com.tasklife.support.Validation
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.*

fun Application.configureInsightsRoutes() {
    val controller = InsightsController()
    val reminderController = ReminderController()

    routing {
        route("/users/{userId}") {
            get("/stats") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@get
                call.respond(controller.stats(userId))
            }

            get("/weekly-report") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@get
                call.respond(controller.weeklyReport(userId))
            }

            get("/reminders/due") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@get
                val fromIso = call.request.queryParameters["from"]
                val toIso = call.request.queryParameters["to"]
                call.respond(reminderController.due(userId, fromIso, toIso))
            }

            post("/reminders") {
                val userId = call.parameters["userId"] ?: return@post call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@post
                val request = call.receive<ReminderCreateRequest>()
                val validationError = Validation.validateReminderCreate(request)
                if (validationError != null) {
                    return@post call.respondText(validationError, status = HttpStatusCode.BadRequest)
                }
                val created = reminderController.create(userId, request)
                call.respond(HttpStatusCode.Created, created)
            }

            post("/reminders/run") {
                val userId = call.parameters["userId"] ?: return@post call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@post
                val fromIso = call.request.queryParameters["from"]
                val toIso = call.request.queryParameters["to"]
                call.respond(reminderController.run(userId, fromIso, toIso))
            }

            get("/reminders/run") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                if (call.requireBearerUser(userId) == null) return@get
                val fromIso = call.request.queryParameters["from"]
                val toIso = call.request.queryParameters["to"]
                call.respond(reminderController.run(userId, fromIso, toIso))
            }
        }

        route("/users/me") {
            get("/stats") {
                val session = call.requireAuthenticatedUser() ?: return@get
                call.respond(controller.stats(session.userId))
            }

            get("/weekly-report") {
                val session = call.requireAuthenticatedUser() ?: return@get
                call.respond(controller.weeklyReport(session.userId))
            }

            get("/reminders/due") {
                val session = call.requireAuthenticatedUser() ?: return@get
                val fromIso = call.request.queryParameters["from"]
                val toIso = call.request.queryParameters["to"]
                call.respond(reminderController.due(session.userId, fromIso, toIso))
            }

            get("/reminders/run") {
                val session = call.requireAuthenticatedUser() ?: return@get
                val fromIso = call.request.queryParameters["from"]
                val toIso = call.request.queryParameters["to"]
                call.respond(reminderController.run(session.userId, fromIso, toIso))
            }
        }
    }
}
