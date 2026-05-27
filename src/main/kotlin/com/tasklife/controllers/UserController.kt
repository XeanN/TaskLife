package com.tasklife.controllers

import com.tasklife.models.CreateUserRequest
import com.tasklife.models.PushTokenRequest
import com.tasklife.models.UpdateUserRequest
import com.tasklife.models.User
import com.tasklife.service.UserService

class UserController {

    private val service = UserService()

    fun getById(userId: String): User? = service.getById(userId)

    fun create(userId: String, request: CreateUserRequest): User = service.create(userId, request)

    fun update(userId: String, request: UpdateUserRequest): User? = service.update(userId, request)

    fun savePushToken(userId: String, request: PushTokenRequest): User? = service.savePushToken(userId, request)
}
