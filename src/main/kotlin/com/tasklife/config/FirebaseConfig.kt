package com.tasklife.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.auth.oauth2.ServiceAccountCredentials
import com.google.cloud.firestore.Firestore
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.cloud.FirestoreClient
import java.io.InputStream

object FirebaseConfig {
    private const val DEFAULT_SERVICE_ACCOUNT_FILE = "/tasklife-4918b-firebase-adminsdk.json"
    private const val DEFAULT_PROJECT_ID = "tasklife-a2824"

    @Volatile
    private var initialized = false

    @Synchronized
    fun initialize(): FirebaseApp {
        if (initialized) {
            return FirebaseApp.getInstance()
        }

        val serviceAccountFile = System.getenv("FIREBASE_SERVICE_ACCOUNT_FILE")?.takeIf { it.isNotBlank() }
            ?: DEFAULT_SERVICE_ACCOUNT_FILE

        val credentialsStream = loadServiceAccountStream(serviceAccountFile)
        val credentials = GoogleCredentials.fromStream(credentialsStream)
        val projectIdFromCredentials = (credentials as? ServiceAccountCredentials)?.projectId
        val projectId = System.getenv("FIREBASE_PROJECT_ID")?.takeIf { it.isNotBlank() }
            ?: projectIdFromCredentials
            ?: DEFAULT_PROJECT_ID

        val options = FirebaseOptions.builder()
            .setCredentials(credentials)
            .setProjectId(projectId)
            .build()

        val app = if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options)
        } else {
            FirebaseApp.getInstance()
        }

        initialized = true
        return app
    }

    fun firestore(): Firestore {
        initialize()
        return FirestoreClient.getFirestore()
    }

    private fun loadServiceAccountStream(serviceAccountFile: String): InputStream {
        val stream = FirebaseConfig::class.java.getResourceAsStream(serviceAccountFile)
        return stream ?: throw IllegalStateException(
            "No se encontro $serviceAccountFile en src/main/resources"
        )
    }
}
