package com.tasklife.models

import kotlinx.serialization.Serializable

@Serializable
data class ReminderCreateRequest(
    val clientId: String? = null,
    val type: String,
    val taskId: String? = null,
    val title: String,
    val body: String? = null,
    val scheduledAt: String? = null,
    val dueAt: String? = null,
    val metadata: Map<String, String>? = null,
)

@Serializable
data class ReminderItem(
    val id: String,
    val userId: String,
    val clientId: String? = null,
    val type: String,
    val taskId: String? = null,
    val title: String,
    val body: String? = null,
    val scheduledAt: String,
    val dueAt: String? = null,
    val status: String = "pending",
    val sentAt: String? = null,
    val metadata: Map<String, String>? = null,
    val createdAt: String,
    val updatedAt: String,
)

@Serializable
data class ReminderListResponse(
    val userId: String,
    val generatedAt: String,
    val reminders: List<ReminderItem>,
)

@Serializable
data class ReminderRunResponse(
    val userId: String,
    val generatedAt: String,
    val processed: Int,
    val reminders: List<ReminderItem>,
)