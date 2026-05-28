package com.tasklife

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

import com.tasklife.config.ApiDocumentation
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*

import com.tasklife.config.FirebaseConfig
import com.tasklife.config.configureErrorHandling
import com.tasklife.config.configureSerialization
import com.tasklife.routes.configureTaskRoutes
import com.tasklife.routes.configureAuthRoutes
import com.tasklife.routes.configureLabelRoutes
import com.tasklife.routes.configureUserRoutes
import com.tasklife.routes.configureAreaRoutes
import com.tasklife.routes.configureInsightsRoutes
import com.tasklife.scheduler.installReminderScheduler

fun main() {
    embeddedServer(
        Netty,
        port = 8080,
        host = "0.0.0.0"
    ) {
        module()
    }.start(wait = true)
}

fun Application.module() {
    install(CORS) {
        allowHost("localhost:8081", schemes = listOf("http"))
        allowHost("127.0.0.1:8081", schemes = listOf("http"))
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Accept)
    }

    routing {
        get("/") {
            call.respondText("TaskLife API en ejecucion")
        }

        get("/health") {
            call.respondText("TaskLife API en ejecucion")
        }

        get("/health/firebase") {
            val result = runCatching {
                FirebaseConfig.initialize()
            }

            if (result.isSuccess) {
                call.respondText("Firebase conectado")
            } else {
                call.respondText(
                    "Error al conectar Firebase: ${result.exceptionOrNull()?.message}",
                    status = io.ktor.http.HttpStatusCode.InternalServerError,
                )
            }
        }

        get("/openapi.json") {
            call.respondText(ApiDocumentation.openapiJson, ContentType.Application.Json)
        }

        route("/v1") {
            get("/health") {
                call.respondText("TaskLife API en ejecucion")
            }

            get("/health/firebase") {
                val result = runCatching {
                    FirebaseConfig.initialize()
                }

                if (result.isSuccess) {
                    call.respondText("Firebase conectado")
                } else {
                    call.respondText(
                        "Error al conectar Firebase: ${result.exceptionOrNull()?.message}",
                        status = io.ktor.http.HttpStatusCode.InternalServerError,
                    )
                }
            }

            get("/openapi.json") {
                call.respondText(ApiDocumentation.openapiJson, ContentType.Application.Json)
            }
        }
    }

    configureErrorHandling()
    configureSerialization()
    configureAuthRoutes()
    configureTaskRoutes()
    configureLabelRoutes()
    configureUserRoutes()
    configureAreaRoutes()
    configureInsightsRoutes()
    // Start reminder scheduler only if explicitly enabled via env var
    if (System.getenv("ENABLE_REMINDER_SCHEDULER") == "true") {
        installReminderScheduler(this, System.getenv("REMINDER_INTERVAL_SEC")?.toLongOrNull() ?: 60)
    }
}
