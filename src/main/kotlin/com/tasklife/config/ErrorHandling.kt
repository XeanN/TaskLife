package com.tasklife.config

import com.google.api.gax.rpc.ResourceExhaustedException
import io.grpc.Status
import io.grpc.StatusRuntimeException
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.plugins.statuspages.exception
import io.ktor.server.request.*
import io.ktor.server.response.respond
import kotlinx.serialization.Serializable

@Serializable
data class ApiErrorResponse(
    val message: String,
    val code: String,
)

fun Application.configureErrorHandling() {
    install(StatusPages) {
        exception<io.ktor.server.plugins.BadRequestException> { call, cause ->
            call.application.log.warn(
                "Bad request on ${call.request.httpMethod.value} ${call.request.uri}",
                cause,
            )
            call.respond(
                HttpStatusCode.BadRequest,
                ApiErrorResponse(
                    message = cause.message ?: "Bad request",
                    code = "BAD_REQUEST",
                ),
            )
        }

        exception<Throwable> { call, cause ->
            if (cause.isFirestoreQuotaExceeded()) {
                call.application.log.warn(
                    "Firestore quota exceeded on ${call.request.httpMethod.value} ${call.request.uri}",
                    cause,
                )
                call.respond(
                    HttpStatusCode.TooManyRequests,
                    ApiErrorResponse(
                        message = "Firestore quota exceeded",
                        code = "RESOURCE_EXHAUSTED",
                    ),
                )
            } else {
                call.application.log.error(
                    "Unhandled backend error on ${call.request.httpMethod.value} ${call.request.uri}",
                    cause,
                )
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ApiErrorResponse(
                        message = cause.message ?: "Internal server error",
                        code = "INTERNAL_ERROR",
                    ),
                )
            }
        }
    }
}

private fun Throwable.isFirestoreQuotaExceeded(): Boolean {
    var current: Throwable? = this
    while (current != null) {
        if (current is ResourceExhaustedException) return true
        if (current is StatusRuntimeException && current.status.code == Status.Code.RESOURCE_EXHAUSTED) return true
        current = current.cause
    }
    return false
}