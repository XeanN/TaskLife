package com.tasklife.scheduler

import com.tasklife.repository.TaskRepository
import com.tasklife.repository.UserRepository
import com.tasklife.service.InsightsService
import io.ktor.server.application.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory
import java.time.Instant

fun installReminderScheduler(app: Application, intervalSeconds: Long = 60) {
    val logger = LoggerFactory.getLogger("ReminderScheduler")
    app.launch {
        logger.info("Reminder scheduler starting with interval {}s", intervalSeconds)
        val userRepo = UserRepository()
        val taskRepo = TaskRepository()
        val insights = InsightsService()
        while (true) {
            try {
                val userIds = try { userRepo.listAllUserIds() } catch (e: Exception) {
                    logger.warn("Failed to list users for reminders: {}", e.message)
                    emptyList()
                }

                var totalProcessed = 0
                userIds.forEach { userId ->
                    try {
                        val due = insights.dueReminders(userId)
                        due.reminders.forEach { item ->
                            val ok = taskRepo.markReminderSent(userId, item.areaId, item.taskId, item.offsetMs, Instant.now().toString())
                            if (ok) totalProcessed++
                        }
                    } catch (e: Exception) {
                        logger.warn("Failed processing reminders for user {}: {}", userId, e.message)
                    }
                }

                if (userIds.isNotEmpty()) logger.info("Reminder scheduler run complete: users={} processed={}", userIds.size, totalProcessed)
            } catch (e: Throwable) {
                logger.error("Reminder scheduler error: {}", e.message)
            }

            delay(intervalSeconds * 1000)
        }
    }
}
