package com.tasklife.models

import kotlinx.serialization.Serializable

@Serializable
data class FirebaseAuthRequest(
    val idToken: String,
)

@Serializable
data class FirebaseAuthResponse(
    val uid: String,
    val email: String,
    val emailVerified: Boolean,
    val user: User,
)
