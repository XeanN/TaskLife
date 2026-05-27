package com.tasklife.repository

import com.google.cloud.Timestamp
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Query
import com.tasklife.config.FirebaseConfig
import com.tasklife.models.ReminderCreateRequest
import com.tasklife.models.ReminderItem
import com.tasklife.support.FirestoreResponseCache
import org.slf4j.LoggerFactory
import java.time.Instant

class ReminderRepository {
    private companion object {
        private const val REMINDER_TTL_MILLIS = 60_000L
    }

    private val logger = LoggerFactory.getLogger(ReminderRepository::class.java)
    private val firestore: Firestore by lazy { FirebaseConfig.firestore() }

    private fun remindersCollection(userId: String) = firestore.collection("users").document(userId).collection("reminders")

    private fun reminderCacheKey(userId: String, reminderId: String) = "reminders:item:$userId:$reminderId"

    private fun pendingListCacheKey(userId: String) = "reminders:list:$userId"

    private fun com.google.cloud.firestore.DocumentSnapshot.toReminder(userId: String): ReminderItem {
        val data = data ?: emptyMap<String, Any>()
        val metadata = (data["metadata"] as? Map<*, *>)
            ?.mapNotNull { entry ->
                val key = entry.key as? String ?: return@mapNotNull null
                val value = entry.value?.toString() ?: return@mapNotNull null
                key to value
            }
            ?.toMap()
        return ReminderItem(
            id = id,
            userId = userId,
            clientId = data["clientId"] as? String,
            type = data["type"] as? String ?: "TASK_DUE_ONE_DAY",
            taskId = data["taskId"] as? String,
            title = data["title"] as? String ?: "",
            body = data["body"] as? String,
            scheduledAt = (data["scheduledAt"] as? Timestamp)?.toDate()?.toInstant()?.toString() ?: Instant.now().toString(),
            dueAt = (data["dueAt"] as? Timestamp)?.toDate()?.toInstant()?.toString(),
            status = data["status"] as? String ?: "pending",
            sentAt = (data["sentAt"] as? Timestamp)?.toDate()?.toInstant()?.toString() ?: data["sentAt"] as? String,
            metadata = metadata,
            createdAt = (data["createdAt"] as? Timestamp)?.toDate()?.toInstant()?.toString() ?: Instant.now().toString(),
            updatedAt = (data["updatedAt"] as? Timestamp)?.toDate()?.toInstant()?.toString() ?: Instant.now().toString(),
        )
    }

    fun findByClientId(userId: String, clientId: String): ReminderItem? {
        val snapshot = remindersCollection(userId)
            .whereEqualTo("clientId", clientId)
            .limit(1)
            .get()
            .get()
            .documents
            .firstOrNull()
        return snapshot?.toReminder(userId)
    }

    fun createOrGet(userId: String, request: ReminderCreateRequest): ReminderItem {
        request.clientId?.takeIf { it.isNotBlank() }?.let { clientId ->
            findByClientId(userId, clientId)?.let { existing ->
                return existing
            }
        }

        val now = Timestamp.now()
        val scheduledAt = Timestamp.parseTimestamp(request.scheduledAt ?: request.dueAt ?: now.toDate().toInstant().toString())
        val dueAt = request.dueAt?.let { Timestamp.parseTimestamp(it) }
        val ref = remindersCollection(userId).document()
        val payload = mapOf(
            "clientId" to request.clientId,
            "type" to request.type,
            "taskId" to request.taskId,
            "title" to request.title,
            "body" to request.body,
            "scheduledAt" to scheduledAt,
            "dueAt" to dueAt,
            "status" to "pending",
            "sentAt" to null,
            "metadata" to request.metadata,
            "createdAt" to now,
            "updatedAt" to now,
        ).filterValues { it != null }

        ref.set(payload).get()
        val created = ReminderItem(
            id = ref.id,
            userId = userId,
            clientId = request.clientId,
            type = request.type,
            taskId = request.taskId,
            title = request.title,
            body = request.body,
            scheduledAt = scheduledAt.toDate().toInstant().toString(),
            dueAt = dueAt?.toDate()?.toInstant()?.toString(),
            status = "pending",
            sentAt = null,
            metadata = request.metadata,
            createdAt = now.toDate().toInstant().toString(),
            updatedAt = now.toDate().toInstant().toString(),
        )
        FirestoreResponseCache.put(reminderCacheKey(userId, created.id), created, REMINDER_TTL_MILLIS)
        FirestoreResponseCache.invalidate(pendingListCacheKey(userId))
        logger.info("Reminder created for userId={} reminderId={} clientId={}", userId, created.id, request.clientId)
        return created
    }

    fun getById(userId: String, reminderId: String): ReminderItem? {
        return FirestoreResponseCache.getOrLoad(reminderCacheKey(userId, reminderId), REMINDER_TTL_MILLIS) {
            val snapshot = remindersCollection(userId).document(reminderId).get().get()
            if (snapshot.exists()) snapshot.toReminder(userId) else null
        }
    }

    fun listPendingDue(userId: String, fromIso: String? = null, toIso: String? = null): List<ReminderItem> {
        val cached = FirestoreResponseCache.getOrLoad(pendingListCacheKey(userId), REMINDER_TTL_MILLIS) {
            remindersCollection(userId)
                .whereEqualTo("status", "pending")
                .orderBy("scheduledAt", Query.Direction.ASCENDING)
                .get()
                .get()
                .documents
                .map { it.toReminder(userId) }
        }

        val fromInstant = fromIso?.let { runCatching { Instant.parse(it) }.getOrNull() }
        val toInstant = toIso?.let { runCatching { Instant.parse(it) }.getOrNull() }

        return cached.filter { reminder ->
            val scheduled = runCatching { Instant.parse(reminder.scheduledAt) }.getOrNull() ?: return@filter false
            val inFrom = fromInstant == null || !scheduled.isBefore(fromInstant)
            val inTo = toInstant == null || !scheduled.isAfter(toInstant)
            inFrom && inTo
        }
    }

    fun markSent(userId: String, reminderId: String, sentAtIso: String): ReminderItem? {
        val ref = remindersCollection(userId).document(reminderId)
        val snapshot = ref.get().get()
        if (!snapshot.exists()) return null
        val data = snapshot.data ?: emptyMap<String, Any>()
        if ((data["status"] as? String) == "sent" || data["sentAt"] != null) {
            return snapshot.toReminder(userId)
        }

        val sentAt = Timestamp.parseTimestamp(sentAtIso)
        ref.update(
            mapOf(
                "status" to "sent",
                "sentAt" to sentAt,
                "updatedAt" to Timestamp.now(),
            ),
        ).get()
        FirestoreResponseCache.invalidate(reminderCacheKey(userId, reminderId))
        FirestoreResponseCache.invalidate(pendingListCacheKey(userId))
        return getById(userId, reminderId)
    }

    fun markFailed(userId: String, reminderId: String, errorMessage: String): ReminderItem? {
        val ref = remindersCollection(userId).document(reminderId)
        val snapshot = ref.get().get()
        if (!snapshot.exists()) return null
        ref.update(
            mapOf(
                "status" to "failed",
                "lastError" to errorMessage,
                "updatedAt" to Timestamp.now(),
            ),
        ).get()
        FirestoreResponseCache.invalidate(reminderCacheKey(userId, reminderId))
        FirestoreResponseCache.invalidate(pendingListCacheKey(userId))
        return getById(userId, reminderId)
    }
}