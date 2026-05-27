package com.tasklife.controllers

import com.tasklife.models.ReminderCreateRequest
import com.tasklife.models.ReminderItem
import com.tasklife.models.ReminderListResponse
import com.tasklife.models.ReminderRunResponse
import com.tasklife.service.ReminderService

class ReminderController(
    private val service: ReminderService = ReminderService(),
) {
    fun create(userId: String, request: ReminderCreateRequest): ReminderItem = service.create(userId, request)

    fun due(userId: String, fromIso: String? = null, toIso: String? = null): ReminderListResponse = service.due(userId, fromIso, toIso)

    fun run(userId: String, fromIso: String? = null, toIso: String? = null): ReminderRunResponse = service.run(userId, fromIso, toIso)
}