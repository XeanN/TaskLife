package com.tasklife.repository

import com.google.cloud.Timestamp
import com.google.cloud.firestore.Firestore
import com.tasklife.config.FirebaseConfig
import com.tasklife.models.CreateUserRequest
import com.tasklife.models.PushTokenRequest
import com.tasklife.models.UpdateUserRequest
import com.tasklife.models.User
import com.tasklife.support.FirestoreResponseCache
import org.slf4j.LoggerFactory

class UserRepository {

    private companion object {
        private const val USER_TTL_MILLIS = 60_000L
    }

    private val logger = LoggerFactory.getLogger(UserRepository::class.java)

    private val firestore: Firestore by lazy { FirebaseConfig.firestore() }

    private fun usersCollection() = firestore.collection("users")

    fun listAllUserIds(): List<String> {
        return usersCollection().listDocuments().map { it.id }
    }

    private fun userCacheKey(userId: String) = "users:item:$userId"

    fun getById(userId: String): User? {
        return FirestoreResponseCache.getOrLoad(userCacheKey(userId), USER_TTL_MILLIS) {
            logger.info("User cache miss for userId={}", userId)

            val snapshot = usersCollection().document(userId).get().get()
            if (snapshot.exists()) {
                snapshot.toUser(userId).also {
                    logger.info("User loaded from Firestore for userId={}", userId)
                }
            } else {
                null
            }
        }
    }

    fun create(userId: String, request: CreateUserRequest): User {
        val now = Timestamp.now()
        val userData = mapOf(
            "email" to request.email,
            "name" to request.name,
            "picture" to request.picture,
            "provider" to request.provider,
            "pushToken" to null,
            "createdAt" to now,
            "updatedAt" to now,
        ).filterValues { it != null }

        usersCollection().document(userId).set(userData).get()
        val createdUser = User(
            id = userId,
            email = request.email,
            name = request.name,
            picture = request.picture,
            provider = request.provider,
            createdAt = now.toDate().toString(),
            updatedAt = now.toDate().toString(),
        )
        FirestoreResponseCache.put(userCacheKey(userId), createdUser, USER_TTL_MILLIS)
        return createdUser
    }

    fun syncFromFirebaseAuth(
        userId: String,
        email: String,
        name: String,
        picture: String?,
        provider: String = "google",
    ): User {
        val now = Timestamp.now()
        val snapshot = usersCollection().document(userId).get().get()
        val createdAt = (snapshot.data?.get("createdAt") as? Timestamp)?.toDate()?.toString() ?: now.toDate().toString()

        val userData = mapOf(
            "email" to email,
            "name" to name,
            "picture" to picture,
            "provider" to provider,
            "pushToken" to snapshot.data?.get("pushToken") as? String,
            "createdAt" to createdAt,
            "updatedAt" to now,
        ).filterValues { it != null }

        usersCollection().document(userId).set(userData).get()
        val syncedUser = User(
            id = userId,
            email = email,
            name = name,
            picture = picture,
            provider = provider,
            createdAt = createdAt,
            updatedAt = now.toDate().toString(),
        )
        FirestoreResponseCache.put(userCacheKey(userId), syncedUser, USER_TTL_MILLIS)
        return syncedUser
    }

    fun update(userId: String, request: UpdateUserRequest): User? {
        val updates = mutableMapOf<String, Any?>()
        request.name?.let { updates["name"] = it }
        request.picture?.let { updates["picture"] = it }
        val now = Timestamp.now()
        updates["updatedAt"] = now

        usersCollection().document(userId).update(updates).get()
        val cachedCurrent = FirestoreResponseCache.get<User>(userCacheKey(userId))
        val updatedUser = cachedCurrent?.copy(
            name = request.name ?: cachedCurrent.name,
            picture = request.picture ?: cachedCurrent.picture,
            updatedAt = now.toDate().toString(),
        ) ?: getById(userId)

        if (updatedUser != null) {
            FirestoreResponseCache.put(userCacheKey(userId), updatedUser, USER_TTL_MILLIS)
        }

        return updatedUser
    }

    fun savePushToken(userId: String, request: PushTokenRequest): User? {
        val token = request.token.trim()
        if (token.isBlank()) return null

        val now = Timestamp.now()
        val updates = mapOf(
            "pushToken" to token,
            "pushTokenPlatform" to request.platform,
            "pushTokenDeviceInfo" to request.deviceInfo,
            "updatedAt" to now,
        )

        usersCollection().document(userId).set(updates, com.google.cloud.firestore.SetOptions.merge()).get()
        val cachedCurrent = FirestoreResponseCache.get<User>(userCacheKey(userId))
        val updatedUser = cachedCurrent?.copy(
            pushToken = token,
            pushTokenPlatform = request.platform ?: cachedCurrent.pushTokenPlatform,
            pushTokenDeviceInfo = request.deviceInfo ?: cachedCurrent.pushTokenDeviceInfo,
            updatedAt = now.toDate().toString(),
        ) ?: getById(userId)

        if (updatedUser != null) {
            FirestoreResponseCache.put(userCacheKey(userId), updatedUser, USER_TTL_MILLIS)
        }

        return updatedUser
    }

    private fun com.google.cloud.firestore.DocumentSnapshot.toUser(userId: String): User {
        val data = data ?: emptyMap<String, Any>()
        return User(
            id = userId,
            email = data["email"] as? String ?: "",
            name = data["name"] as? String ?: "",
            picture = data["picture"] as? String,
            provider = data["provider"] as? String ?: "email",
            pushToken = data["pushToken"] as? String,
            pushTokenPlatform = data["pushTokenPlatform"] as? String,
            pushTokenDeviceInfo = (data["pushTokenDeviceInfo"] as? Map<*, *>)
                ?.mapNotNull { entry ->
                    val key = entry.key as? String ?: return@mapNotNull null
                    val value = entry.value?.toString() ?: return@mapNotNull null
                    key to value
                }
                ?.toMap(),
            createdAt = (data["createdAt"] as? Timestamp)?.toDate()?.toString(),
            updatedAt = (data["updatedAt"] as? Timestamp)?.toDate()?.toString(),
        )
    }
}
