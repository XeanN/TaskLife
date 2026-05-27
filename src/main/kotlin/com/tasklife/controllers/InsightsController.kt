package com.tasklife.controllers

import com.tasklife.models.DueRemindersResponse
import com.tasklife.models.TaskStatsResponse
import com.tasklife.models.WeeklyReportResponse
import com.tasklife.service.InsightsService

class InsightsController(
    private val service: InsightsService = InsightsService(),
) {
    fun stats(userId: String): TaskStatsResponse = service.stats(userId)

    fun weeklyReport(userId: String): WeeklyReportResponse = service.weeklyReport(userId)

    fun dueReminders(userId: String): DueRemindersResponse = service.dueReminders(userId)
}
