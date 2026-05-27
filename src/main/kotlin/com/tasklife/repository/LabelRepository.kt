package com.tasklife.repository

import com.google.cloud.firestore.Firestore
import com.tasklife.config.FirebaseConfig
import com.tasklife.models.Label
import com.tasklife.models.NewLabel
import com.tasklife.support.FirestoreResponseCache
import org.slf4j.LoggerFactory

class LabelRepository {

    private companion object {
        private const val LABEL_TTL_MILLIS = 60_000L
    }

    private val logger = LoggerFactory.getLogger(LabelRepository::class.java)

    private val firestore: Firestore by lazy { FirebaseConfig.firestore() }

    private fun labelsCollection(userId: String) =
        firestore.collection("users").document(userId).collection("labels")

    private fun labelsListCacheKey(userId: String) = "labels:list:$userId"

    private fun labelCacheKey(userId: String, labelId: String) = "labels:item:$userId:$labelId"

    fun getAll(userId: String): List<Label> {
        return FirestoreResponseCache.getOrLoad(labelsListCacheKey(userId), LABEL_TTL_MILLIS) {
            logger.info("Label list cache miss for userId={}", userId)

            val labels = labelsCollection(userId)
                .orderBy("name", com.google.cloud.firestore.Query.Direction.ASCENDING)
                .get()
                .get()
                .documents
                .map {
                    Label(
                        id = it.id,
                        name = it.get("name") as? String ?: "",
                        color = it.get("color") as? String ?: "#000000",
                        userId = userId,
                    )
                }

            labels.forEach { label ->
                FirestoreResponseCache.put(labelCacheKey(userId, label.id), label, LABEL_TTL_MILLIS)
            }
            logger.info("Label list loaded from Firestore for userId={} docs={}", userId, labels.size)
            labels
        }
    }

    fun getById(userId: String, labelId: String): Label? {
        return FirestoreResponseCache.getOrLoad(labelCacheKey(userId, labelId), LABEL_TTL_MILLIS) {
            logger.info("Label cache miss for userId={} labelId={}", userId, labelId)

            val snapshot = labelsCollection(userId).document(labelId).get().get()
            if (snapshot.exists()) {
                Label(
                    id = snapshot.id,
                    name = snapshot.get("name") as? String ?: "",
                    color = snapshot.get("color") as? String ?: "#000000",
                    userId = userId,
                ).also {
                    logger.info("Label loaded from Firestore for userId={} labelId={}", userId, labelId)
                }
            } else {
                null
            }
        }
    }

    fun create(userId: String, label: NewLabel): Label {
        val ref = labelsCollection(userId).document()
        ref.set(mapOf("name" to label.name, "color" to label.color)).get()
        val createdLabel = Label(id = ref.id, name = label.name, color = label.color, userId = userId)
        FirestoreResponseCache.put(labelCacheKey(userId, ref.id), createdLabel, LABEL_TTL_MILLIS)
        FirestoreResponseCache.invalidate(labelsListCacheKey(userId))
        return createdLabel
    }

    fun delete(userId: String, labelId: String): Boolean {
        val result = labelsCollection(userId).document(labelId).delete().get()
        FirestoreResponseCache.invalidate(labelCacheKey(userId, labelId))
        FirestoreResponseCache.invalidate(labelsListCacheKey(userId))
        return result.updateTime != null
    }
}
