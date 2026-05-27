package com.tasklife.service

import com.tasklife.models.AreaTaskStats
import com.tasklife.models.DueReminderItem
import com.tasklife.models.DueRemindersResponse
import com.tasklife.models.Task
import com.tasklife.models.TaskStatsResponse
import com.tasklife.models.WeeklyReportDay
import com.tasklife.models.WeeklyReportResponse
import com.tasklife.repository.AreaRepository
import com.tasklife.repository.TaskRepository
import java.time.Instant
import java.time.temporal.ChronoUnit

class InsightsService(
    private val taskRepository: TaskRepository = TaskRepository(),
    private val areaRepository: AreaRepository = AreaRepository(),
) {
    fun stats(userId: String): TaskStatsResponse {
        val allTasksByArea = tasksByArea(userId)
        val allTasks = allTasksByArea.values.flatten()
        val now = Instant.now()

        val byArea = areaRepository.getAll().map { area ->
            val tasks = allTasksByArea[area.id].orEmpty()
            val completed = tasks.count { it.done }
            val pending = tasks.count { !it.done }
            val overdue = tasks.count { !it.done && it.dueDate?.let(::parseInstantSafe)?.isBefore(now) == true }
            AreaTaskStats(
                areaId = area.id,
                areaLabel = area.label,
                total = tasks.size,
                completed = completed,
                pending = pending,
                overdue = overdue,
            )
        }

        return TaskStatsResponse(
            userId = userId,
            generatedAt = now.toString(),
            totalTasks = allTasks.size,
            completedTasks = allTasks.count { it.done },
            pendingTasks = allTasks.count { !it.done },
            overdueTasks = allTasks.count { !it.done && it.dueDate?.let(::parseInstantSafe)?.isBefore(now) == true },
            byArea = byArea,
        )
    }

    fun weeklyReport(userId: String): WeeklyReportResponse {
        val allTasks = tasksByArea(userId).values.flatten()
        val today = Instant.now().truncatedTo(ChronoUnit.DAYS)
        val days = (6 downTo 0).map { dayOffset ->
            val dayStart = today.minus(dayOffset.toLong(), ChronoUnit.DAYS)
            val dayEnd = dayStart.plus(1, ChronoUnit.DAYS)
            WeeklyReportDay(
                date = dayStart.toString(),
                completed = allTasks.count { task ->
                    task.completedAt?.let(::parseInstantSafe)?.let { !it.isBefore(dayStart) && it.isBefore(dayEnd) } == true
                },
                pending = allTasks.count { task ->
                    task.dueDate?.let(::parseInstantSafe)?.let { !task.done && !it.isBefore(dayStart) && it.isBefore(dayEnd) } == true
                },
            )
        }

        return WeeklyReportResponse(
            userId = userId,
            generatedAt = Instant.now().toString(),
            days = days,
        )
    }

    fun dueReminders(userId: String): DueRemindersResponse {
        val now = Instant.now()
        val dueItems = tasksByArea(userId).values.flatten().flatMap { task ->
            val dueDate = task.dueDate?.let(::parseInstantSafe) ?: return@flatMap emptyList<DueReminderItem>()
            task.reminders.filter { reminder ->
                !reminder.sent && !dueDate.minusMillis(reminder.offsetMs).isAfter(now)
            }.map { reminder ->
                DueReminderItem(
                    taskId = task.id,
                    taskTitle = task.title,
                    areaId = task.areaId,
                    dueDate = task.dueDate,
                    offsetMs = reminder.offsetMs,
                    triggerAt = dueDate.minusMillis(reminder.offsetMs).toString(),
                )
            }
        }

        return DueRemindersResponse(
            userId = userId,
            generatedAt = now.toString(),
            reminders = dueItems,
        )
    }

    private fun tasksByArea(userId: String): Map<String, List<Task>> {
        return areaRepository.getAll().associate { area ->
            area.id to taskRepository.getAll(userId, area.id)
        }
    }

    private fun parseInstantSafe(value: String): Instant = Instant.parse(value)
}
