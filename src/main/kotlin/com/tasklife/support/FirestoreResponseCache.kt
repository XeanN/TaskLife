package com.tasklife.support

import java.util.concurrent.ConcurrentHashMap

object FirestoreResponseCache {

    private const val DEFAULT_TTL_MILLIS = 10_000L

    private data class CacheEntry(
        val value: Any,
        val expiresAtMillis: Long,
    )

    private val entries = ConcurrentHashMap<String, CacheEntry>()
    private val locks = ConcurrentHashMap<String, Any>()

    @Suppress("UNCHECKED_CAST")
    fun <T> get(key: String): T? {
        val entry = entries[key] ?: return null
        if (entry.expiresAtMillis < System.currentTimeMillis()) {
            entries.remove(key)
            return null
        }
        return entry.value as? T
    }

    fun put(key: String, value: Any, ttlMillis: Long = DEFAULT_TTL_MILLIS) {
        entries[key] = CacheEntry(
            value = value,
            expiresAtMillis = System.currentTimeMillis() + ttlMillis,
        )
    }

    fun invalidate(key: String) {
        entries.remove(key)
    }

    fun invalidatePrefix(prefix: String) {
        entries.keys.removeIf { it.startsWith(prefix) }
    }

    fun <T> getOrLoad(key: String, ttlMillis: Long = DEFAULT_TTL_MILLIS, loader: () -> T): T {
        get<T>(key)?.let { return it }

        val lock = locks.computeIfAbsent(key) { Any() }
        synchronized(lock) {
            get<T>(key)?.let { return it }

            val loaded = loader()
            if (loaded != null) {
                put(key, loaded as Any, ttlMillis)
            }
            return loaded
        }
    }
}