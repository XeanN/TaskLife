package com.tasklife.service

import com.tasklife.config.FirebaseConfig
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.Message
import com.google.firebase.messaging.Notification
import com.tasklife.models.ReminderCreateRequest
import com.tasklife.models.ReminderItem
import com.tasklife.models.ReminderListResponse
import com.tasklife.models.ReminderRunResponse
import com.tasklife.repository.ReminderRepository
import com.tasklife.repository.UserRepository
import java.time.Instant

class ReminderService(
    private val reminderRepository: ReminderRepository = ReminderRepository(),
    private val userRepository: UserRepository = UserRepository(),
) {
    fun create(userId: String, request: ReminderCreateRequest): ReminderItem = reminderRepository.createOrGet(userId, request)

    fun due(userId: String, fromIso: String? = null, toIso: String? = null): ReminderListResponse =
        ReminderListResponse(
            userId = userId,
            generatedAt = Instant.now().toString(),
            reminders = reminderRepository.listPendingDue(userId, fromIso, toIso),
        )

    fun run(userId: String, fromIso: String? = null, toIso: String? = null): ReminderRunResponse {
        FirebaseConfig.initialize()
        val dueReminders = reminderRepository.listPendingDue(userId, fromIso, toIso)
        val user = userRepository.getById(userId)
        var processed = 0
        val sentReminders = mutableListOf<ReminderItem>()

        dueReminders.forEach { reminder ->
            val alreadySent = reminder.status == "sent" || reminder.sentAt != null
            if (alreadySent) return@forEach

            val pushToken = user?.pushToken?.trim().orEmpty()
            val result = if (pushToken.isNotBlank()) {
                runCatching {
                    FirebaseMessaging.getInstance().send(
                        Message.builder()
                            .setToken(pushToken)
                            .setNotification(
                                Notification.builder()
                                    .setTitle(reminder.title)
                                    .setBody(reminder.body ?: reminder.title)
                                    .build(),
                            )
                            .putData("reminderId", reminder.id)
                            .putData("userId", userId)
                            .putData("type", reminder.type)
                            .apply { reminder.taskId?.let { putData("taskId", it) } }
                            .apply { reminder.clientId?.let { putData("clientId", it) } }
                            .build(),
                    )
                }.isSuccess
            } else {
                true
            }

            if (result) {
                reminderRepository.markSent(userId, reminder.id, Instant.now().toString())?.let {
                    processed++
                    sentReminders += it
                }
            } else {
                reminderRepository.markFailed(userId, reminder.id, "No se pudo enviar push")
            }
        }

        return ReminderRunResponse(
            userId = userId,
            generatedAt = Instant.now().toString(),
            processed = processed,
            reminders = sentReminders,
        )
    }
}