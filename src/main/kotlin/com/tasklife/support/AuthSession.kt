package com.tasklife.support

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.header
import io.ktor.server.response.respondText
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.nio.charset.StandardCharsets
import java.time.Instant
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

private const val DEFAULT_SESSION_TTL_SECONDS = 86_400L
private const val DEFAULT_SESSION_SECRET = "tasklife-dev-secret-change-me"

@Serializable
data class SessionClaims(
    val sub: String,
    val email: String? = null,
    val iat: Long,
    val exp: Long,
)

data class VerifiedSession(
    val userId: String,
    val email: String? = null,
    val expiresAt: Instant,
)

object AuthSession {
    private val json = Json { ignoreUnknownKeys = true }
    private val encoder = Base64.getUrlEncoder().withoutPadding()
    private val decoder = Base64.getUrlDecoder()

    fun issueToken(userId: String, email: String? = null, ttlSeconds: Long = DEFAULT_SESSION_TTL_SECONDS): Pair<String, Instant> {
        val now = Instant.now()
        val claims = SessionClaims(
            sub = userId,
            email = email,
            iat = now.epochSecond,
            exp = now.plusSeconds(ttlSeconds).epochSecond,
        )
        val payload = json.encodeToString(claims)
        val payloadPart = encoder.encodeToString(payload.toByteArray(StandardCharsets.UTF_8))
        val signature = sign(payloadPart)
        return "tasklife.$payloadPart.$signature" to Instant.ofEpochSecond(claims.exp)
    }

    fun verifyToken(rawToken: String?): VerifiedSession? {
        val token = rawToken?.trim().orEmpty()
        if (token.isBlank()) return null
        val parts = token.split('.')
        if (parts.size != 3 || parts[0] != "tasklife") return null

        val payloadPart = parts[1]
        val signature = parts[2]
        if (!constantTimeEquals(signature, sign(payloadPart))) return null

        val payload = runCatching {
            decoder.decode(payloadPart).toString(StandardCharsets.UTF_8)
        }.getOrNull() ?: return null

        val claims = runCatching { json.decodeFromString(SessionClaims.serializer(), payload) }.getOrNull() ?: return null
        val now = Instant.now().epochSecond
        if (claims.exp <= now) return null

        return VerifiedSession(
            userId = claims.sub,
            email = claims.email,
            expiresAt = Instant.ofEpochSecond(claims.exp),
        )
    }

    fun extractBearerToken(call: ApplicationCall): String? {
        val header = call.request.header(HttpHeaders.Authorization) ?: return null
        if (!header.startsWith("Bearer ", ignoreCase = true)) return null
        return header.removePrefix("Bearer ").trim()
    }

    private fun sign(payloadPart: String): String {
        val secret = System.getenv("TASKLIFE_AUTH_SECRET")?.takeIf { it.isNotBlank() } ?: DEFAULT_SESSION_SECRET
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secret.toByteArray(StandardCharsets.UTF_8), "HmacSHA256"))
        return encoder.encodeToString(mac.doFinal(payloadPart.toByteArray(StandardCharsets.UTF_8)))
    }

    private fun constantTimeEquals(left: String, right: String): Boolean {
        if (left.length != right.length) return false
        var result = 0
        for (index in left.indices) {
            result = result or (left[index].code xor right[index].code)
        }
        return result == 0
    }
}

suspend fun ApplicationCall.requireBearerUser(expectedUserId: String): VerifiedSession? {
    val verified = AuthSession.verifyToken(AuthSession.extractBearerToken(this))
    if (verified == null) {
        respondText("No autorizado", status = HttpStatusCode.Unauthorized)
        return null
    }
    if (verified.userId != expectedUserId) {
        respondText("Prohibido", status = HttpStatusCode.Forbidden)
        return null
    }
    return verified
}

suspend fun ApplicationCall.requireAuthenticatedUser(): VerifiedSession? {
    val verified = AuthSession.verifyToken(AuthSession.extractBearerToken(this))
    if (verified == null) {
        respondText("No autorizado", status = HttpStatusCode.Unauthorized)
        return null
    }
    return verified
}