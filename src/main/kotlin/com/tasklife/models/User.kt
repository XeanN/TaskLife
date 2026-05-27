package com.tasklife.models

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val name: String,
    val picture: String? = null,
    val provider: String = "email",
    val pushToken: String? = null,
    val pushTokenPlatform: String? = null,
    val pushTokenDeviceInfo: Map<String, String>? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)

@Serializable
data class UpdateUserRequest(
    val name: String? = null,
    val picture: String? = null,
)

@Serializable
data class PushTokenRequest(
    val token: String,
    val platform: String? = null,
    val deviceInfo: Map<String, String>? = null,
)

@Serializable
data class CreateUserRequest(
    val email: String,
    val name: String,
    val picture: String? = null,
    val provider: String = "email",
)
