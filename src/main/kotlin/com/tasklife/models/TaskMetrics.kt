package com.tasklife.models

import kotlinx.serialization.Serializable

@Serializable
data class AreaTaskStats(
    val areaId: String,
    val areaLabel: String,
    val total: Int,
    val completed: Int,
    val pending: Int,
    val overdue: Int,
)

@Serializable
data class TaskStatsResponse(
    val userId: String,
    val generatedAt: String,
    val totalTasks: Int,
    val completedTasks: Int,
    val pendingTasks: Int,
    val overdueTasks: Int,
    val byArea: List<AreaTaskStats>,
)

@Serializable
data class WeeklyReportDay(
    val date: String,
    val completed: Int,
    val pending: Int,
)

@Serializable
data class WeeklyReportResponse(
    val userId: String,
    val generatedAt: String,
    val days: List<WeeklyReportDay>,
)

@Serializable
data class DueReminderItem(
    val taskId: String,
    val taskTitle: String,
    val areaId: String,
    val dueDate: String,
    val offsetMs: Long,
    val triggerAt: String,
)

@Serializable
data class DueRemindersResponse(
    val userId: String,
    val generatedAt: String,
    val reminders: List<DueReminderItem>,
)
