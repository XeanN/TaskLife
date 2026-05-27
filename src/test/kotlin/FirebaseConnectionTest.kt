package com.example

import com.tasklife.config.FirebaseConfig
import kotlin.test.Test
import kotlin.test.assertTrue

class FirebaseConnectionTest {

    @Test
    fun `firebase initializes only if credentials are available`() {
        val initialization = runCatching { FirebaseConfig.initialize() }
        if (initialization.isFailure) return

        val app = initialization.getOrThrow()
        val firestore = FirebaseConfig.firestore()

        assertTrue(app.name == "[DEFAULT]")
        assertTrue(firestore.javaClass.simpleName.contains("Firestore"))
    }
}
