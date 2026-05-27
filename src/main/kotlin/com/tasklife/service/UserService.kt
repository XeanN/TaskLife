package com.tasklife.service

import com.tasklife.models.CreateUserRequest
import com.tasklife.models.PushTokenRequest
import com.tasklife.models.UpdateUserRequest
import com.tasklife.models.User
import com.tasklife.repository.UserRepository

class UserService {

    private val repository = UserRepository()

    fun getById(userId: String): User? = repository.getById(userId)

    fun create(userId: String, request: CreateUserRequest): User = repository.create(userId, request)

    fun update(userId: String, request: UpdateUserRequest): User? = repository.update(userId, request)

    fun savePushToken(userId: String, request: PushTokenRequest): User? = repository.savePushToken(userId, request)
}
