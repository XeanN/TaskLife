package com.tasklife.service

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthException
import com.tasklife.config.FirebaseConfig
import com.tasklife.models.FirebaseAuthRequest
import com.tasklife.models.FirebaseAuthResponse
import com.tasklife.repository.UserRepository
import com.tasklife.support.AuthSession
import com.tasklife.support.InvalidFirebaseTokenException

class AuthService(
    private val userRepository: UserRepository = UserRepository(),
) {
    fun authenticateWithFirebase(request: FirebaseAuthRequest): FirebaseAuthResponse {
        if (request.idToken.isBlank()) {
            throw InvalidFirebaseTokenException("Falta idToken")
        }

        FirebaseConfig.initialize()
        val firebaseAuth = FirebaseAuth.getInstance()
        val decoded = try {
            firebaseAuth.verifyIdToken(request.idToken)
        } catch (e: FirebaseAuthException) {
            throw InvalidFirebaseTokenException(e.message ?: "Token de Firebase invalido")
        } catch (e: Exception) {
            throw InvalidFirebaseTokenException(e.message ?: "Token de Firebase invalido")
        }

        val uid = decoded.uid ?: throw InvalidFirebaseTokenException("El token no contiene uid")
        val firebaseUser = try {
            firebaseAuth.getUser(uid)
        } catch (e: Exception) {
            null
        }

        val email = firebaseUser?.email
            ?: decoded.claims["email"] as? String
            ?: throw InvalidFirebaseTokenException("El token no contiene email")
        val displayName = firebaseUser?.displayName
            ?: decoded.claims["name"] as? String
            ?: email.substringBefore("@").ifBlank { "TaskLife User" }
        val picture = firebaseUser?.photoUrl?.toString()
            ?: decoded.claims["picture"] as? String

        val syncedUser = userRepository.syncFromFirebaseAuth(
            userId = uid,
            email = email,
            name = displayName,
            picture = picture,
            provider = "google",
        )

        val (accessToken, expiresAt) = AuthSession.issueToken(uid, email)

        return FirebaseAuthResponse(
            uid = uid,
            email = email,
            emailVerified = firebaseUser?.isEmailVerified ?: (decoded.claims["email_verified"] as? Boolean ?: false),
            accessToken = accessToken,
            expiresAt = expiresAt.toString(),
            user = syncedUser,
        )
    }
}
