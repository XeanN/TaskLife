package com.tasklife.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.EncodeDefault
import kotlinx.serialization.ExperimentalSerializationApi

@Serializable
data class TaskReminder(
    val offsetMs: Long,
    val sent: Boolean = false,
    val sentAt: String? = null,
)

@Serializable
data class Task(
    val id: String,
    val title: String,
    val description: String = "",
    val done: Boolean = false,
    val dueDate: String? = null,
    @OptIn(ExperimentalSerializationApi::class)
    @EncodeDefault
    val priority: String = "media",
    val labelIds: List<String> = emptyList(),
    val reminders: List<TaskReminder> = emptyList(),
    val completedAt: String? = null,
    val areaId: String,
    val userId: String,
    val createdAt: String,
    val updatedAt: String,
)

@Serializable
data class NewTask(
    val title: String,
    val description: String = "",
    val done: Boolean = false,
    val dueDate: String? = null,
    val priority: String = "media",
    val labelIds: List<String> = emptyList(),
    val reminders: List<TaskReminder> = emptyList(),
    val areaId: String,
)

@Serializable
data class TaskUpdate(
    val title: String? = null,
    val description: String? = null,
    val done: Boolean? = null,
    val dueDate: String? = null,
    val priority: String? = null,
    val labelIds: List<String>? = null,
    val reminders: List<TaskReminder>? = null,
)
