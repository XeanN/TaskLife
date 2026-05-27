package com.tasklife.controllers

import com.tasklife.models.FirebaseAuthRequest
import com.tasklife.models.FirebaseAuthResponse
import com.tasklife.service.AuthService

class AuthController(
    private val service: AuthService = AuthService(),
) {
    fun authenticateWithFirebase(request: FirebaseAuthRequest): FirebaseAuthResponse =
        service.authenticateWithFirebase(request)
}
