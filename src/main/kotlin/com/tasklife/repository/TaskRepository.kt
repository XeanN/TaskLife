package com.tasklife.repository

import com.google.cloud.Timestamp
import com.google.cloud.firestore.DocumentSnapshot
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.QueryDocumentSnapshot
import com.tasklife.config.FirebaseConfig
import com.tasklife.models.NewTask
import com.tasklife.models.Task
import com.tasklife.models.TaskReminder
import com.tasklife.models.TaskUpdate
import com.tasklife.support.FirestoreResponseCache
import org.slf4j.LoggerFactory
import java.time.Instant

class TaskRepository {

    private companion object {
        private const val TASK_TTL_MILLIS = 60_000L
    }

    private val logger = LoggerFactory.getLogger(TaskRepository::class.java)

    private val firestore: Firestore by lazy { FirebaseConfig.firestore() }

    private fun tasksCollection(userId: String, areaId: String) =
        firestore.collection("users")
            .document(userId)
            .collection("areas")
            .document(areaId)
            .collection("tasks")

    private fun taskListCacheKey(userId: String, areaId: String) = "tasks:list:$userId:$areaId"

    private fun taskCacheKey(userId: String, areaId: String, taskId: String) = "tasks:item:$userId:$areaId:$taskId"

    private fun parseReminders(rawReminders: Any?): List<TaskReminder> {
        val rawList = rawReminders as? List<*> ?: return emptyList()
        return rawList.mapNotNull { item ->
            val data = item as? Map<*, *> ?: return@mapNotNull null
            val offsetMs = (data["offsetMs"] as? Number)?.toLong() ?: return@mapNotNull null
            val sent = data["sent"] as? Boolean ?: false
            val sentAt = data["sentAt"] as? String
            TaskReminder(offsetMs = offsetMs, sent = sent, sentAt = sentAt)
        }
    }

    private fun DocumentSnapshot.toTask(areaId: String, userId: String): Task {
        val data = data ?: emptyMap<String, Any>()
        return Task(
            id = id,
            title = data["title"] as? String ?: "",
            description = data["description"] as? String ?: "",
            done = data["done"] as? Boolean ?: false,
            dueDate = (data["dueDate"] as? Timestamp)?.toDate()?.toInstant()?.toString(),
            priority = data["priority"] as? String ?: "media",
            labelIds = (data["labelIds"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
            reminders = parseReminders(data["reminders"]),
            completedAt = (data["completedAt"] as? Timestamp)?.toDate()?.toInstant()?.toString(),
            areaId = areaId,
            userId = userId,
            createdAt = (data["createdAt"] as? Timestamp)?.toDate()?.toInstant()?.toString()
                ?: Instant.now().toString(),
            updatedAt = (data["updatedAt"] as? Timestamp)?.toDate()?.toInstant()?.toString()
                ?: Instant.now().toString(),
        )
    }

    fun getAll(userId: String, areaId: String, limit: Int? = null, offset: Int? = null): List<Task> {
        val fullList = FirestoreResponseCache.getOrLoad(taskListCacheKey(userId, areaId), TASK_TTL_MILLIS) {
            logger.info("Task list cache miss for userId={} areaId={}", userId, areaId)

            val tasks = tasksCollection(userId, areaId)
                .orderBy("createdAt", com.google.cloud.firestore.Query.Direction.DESCENDING)
                .get()
                .get()
                .documents
                .map { it.toTask(areaId, userId) }

            tasks.forEach { task ->
                FirestoreResponseCache.put(taskCacheKey(userId, areaId, task.id), task, TASK_TTL_MILLIS)
            }
            logger.info("Task list loaded from Firestore for userId={} areaId={} docs={}", userId, areaId, tasks.size)
            tasks
        }

        val safeOffset = offset ?: 0
        val offsetList = if (safeOffset > 0) fullList.drop(safeOffset) else fullList
        return if (limit != null) offsetList.take(limit) else offsetList
    }

    fun getById(userId: String, areaId: String, taskId: String): Task? {
        return FirestoreResponseCache.getOrLoad(taskCacheKey(userId, areaId, taskId), TASK_TTL_MILLIS) {
            logger.info("Task cache miss for userId={} areaId={} taskId={}", userId, areaId, taskId)

            val snapshot = tasksCollection(userId, areaId)
                .document(taskId)
                .get()
                .get()

            if (snapshot.exists()) {
                snapshot.toTask(areaId, userId).also {
                    logger.info("Task loaded from Firestore for userId={} areaId={} taskId={}", userId, areaId, taskId)
                }
            } else {
                null
            }
        }
    }

    fun save(userId: String, areaId: String, task: NewTask): Task {
        val now = Timestamp.now()
        val ref = tasksCollection(userId, areaId).document()
        val payload = mapOf(
            "title" to task.title,
            "description" to task.description,
            "done" to task.done,
            "dueDate" to task.dueDate?.let { Timestamp.parseTimestamp(it) } ,
            "priority" to task.priority,
            "labelIds" to task.labelIds,
            "reminders" to task.reminders.map {
                mapOf(
                    "offsetMs" to it.offsetMs,
                    "sent" to it.sent,
                    "sentAt" to it.sentAt,
                ).filterValues { value -> value != null }
            },
            "completedAt" to if (task.done) now else null,
            "createdAt" to now,
            "updatedAt" to now,
        ).filterValues { it != null }

        ref.set(payload).get()
        val createdTask = Task(
            id = ref.id,
            title = task.title,
            description = task.description,
            done = task.done,
            dueDate = task.dueDate?.let { Timestamp.parseTimestamp(it).toDate().toInstant().toString() },
            priority = task.priority,
            labelIds = task.labelIds,
            reminders = task.reminders,
            completedAt = if (task.done) now.toDate().toInstant().toString() else null,
            areaId = areaId,
            userId = userId,
            createdAt = now.toDate().toInstant().toString(),
            updatedAt = now.toDate().toInstant().toString(),
        )
        FirestoreResponseCache.put(taskCacheKey(userId, areaId, createdTask.id), createdTask, TASK_TTL_MILLIS)
        FirestoreResponseCache.invalidate(taskListCacheKey(userId, areaId))
        return createdTask
    }

    fun update(userId: String, areaId: String, taskId: String, changes: TaskUpdate): Task? {
        val ref = tasksCollection(userId, areaId).document(taskId)
        val updateMap = mutableMapOf<String, Any?>()
        val now = Timestamp.now()

        changes.title?.let { updateMap["title"] = it }
        changes.description?.let { updateMap["description"] = it }
        changes.done?.let { updateMap["done"] = it }
        changes.done?.let { updateMap["completedAt"] = if (it) now else null }
        if (changes.dueDate != null) {
            updateMap["dueDate"] = Timestamp.parseTimestamp(changes.dueDate)
        }
        changes.priority?.let { updateMap["priority"] = it }
        changes.labelIds?.let { updateMap["labelIds"] = it }
        changes.reminders?.let {
            updateMap["reminders"] = it.map { reminder ->
                mapOf(
                    "offsetMs" to reminder.offsetMs,
                    "sent" to reminder.sent,
                    "sentAt" to reminder.sentAt,
                ).filterValues { value -> value != null }
            }
        }

        if (updateMap.isEmpty()) return null
        updateMap["updatedAt"] = now
        ref.update(updateMap).get()

        val cachedCurrent = FirestoreResponseCache.get<Task>(taskCacheKey(userId, areaId, taskId))
        val updatedTask = cachedCurrent?.copy(
            title = changes.title ?: cachedCurrent.title,
            description = changes.description ?: cachedCurrent.description,
            done = changes.done ?: cachedCurrent.done,
            dueDate = changes.dueDate?.let { Timestamp.parseTimestamp(it).toDate().toInstant().toString() } ?: cachedCurrent.dueDate,
            priority = changes.priority ?: cachedCurrent.priority,
            labelIds = changes.labelIds ?: cachedCurrent.labelIds,
            reminders = changes.reminders ?: cachedCurrent.reminders,
            completedAt = changes.done?.let { if (it) now.toDate().toInstant().toString() else null } ?: cachedCurrent.completedAt,
            updatedAt = now.toDate().toInstant().toString(),
        ) ?: getById(userId, areaId, taskId)

        if (updatedTask != null) {
            FirestoreResponseCache.put(taskCacheKey(userId, areaId, taskId), updatedTask, TASK_TTL_MILLIS)
            FirestoreResponseCache.invalidate(taskListCacheKey(userId, areaId))
        }

        return updatedTask
    }

    fun delete(userId: String, areaId: String, taskId: String): Boolean {
        val ref = tasksCollection(userId, areaId).document(taskId)
        val result = ref.delete().get()
        FirestoreResponseCache.invalidate(taskCacheKey(userId, areaId, taskId))
        FirestoreResponseCache.invalidate(taskListCacheKey(userId, areaId))
        return result.updateTime != null
    }

    fun markReminderSent(userId: String, areaId: String, taskId: String, offsetMs: Long, sentAtIso: String): Boolean {
        val ref = tasksCollection(userId, areaId).document(taskId)
        val snapshot = ref.get().get()
        if (!snapshot.exists()) return false
        val data = snapshot.data ?: emptyMap<String, Any>()
        val rawReminders = data["reminders"] as? List<*>
        val newReminders = rawReminders?.mapNotNull { item ->
            val map = item as? Map<*, *> ?: return@mapNotNull null
            val ofs = (map["offsetMs"] as? Number)?.toLong() ?: return@mapNotNull null
            if (ofs == offsetMs) {
                mapOf("offsetMs" to ofs, "sent" to true, "sentAt" to sentAtIso)
            } else {
                map
            }
        } ?: return false

        ref.update(mapOf("reminders" to newReminders)).get()
        FirestoreResponseCache.invalidate(taskCacheKey(userId, areaId, taskId))
        FirestoreResponseCache.invalidate(taskListCacheKey(userId, areaId))
        return true
    }
}
