package com.tasklife.routes

import com.tasklife.controllers.InsightsController
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.*

fun Application.configureInsightsRoutes() {
    val controller = InsightsController()

    routing {
        route("/users/{userId}") {
            get("/stats") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                call.respond(controller.stats(userId))
            }

            get("/weekly-report") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                call.respond(controller.weeklyReport(userId))
            }

            get("/reminders/due") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                call.respond(controller.dueReminders(userId))
            }

            get("/reminders/run") {
                val userId = call.parameters["userId"] ?: return@get call.respondText(
                    "Falta userId",
                    status = HttpStatusCode.BadRequest,
                )
                val due = controller.dueReminders(userId)
                var processed = 0
                val repo = com.tasklife.repository.TaskRepository()
                val nowIso = java.time.Instant.now().toString()
                due.reminders.forEach { item ->
                    val parts = item.taskId to item.areaId
                    // taskId contains id only; areaId is separate
                    val taskId = item.taskId
                    val areaId = item.areaId
                    val ok = repo.markReminderSent(userId, areaId, taskId, item.offsetMs, nowIso)
                    if (ok) processed++
                }

                call.respond(mapOf("processed" to processed, "found" to due.reminders.size))
            }
        }
    }
}
