package com.example

import com.tasklife.module
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.get
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ServerTest {

    @Test
    fun `server root returns OK`() = testApplication {
        application {
            module()
        }

        val response = client.get("/")
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("TaskLife API en ejecucion", response.body<String>())
    }

    @Test
    fun `health endpoints return OK`() = testApplication {
        application {
            module()
        }

        val health = client.get("/health")
        assertEquals(HttpStatusCode.OK, health.status)
        assertEquals("TaskLife API en ejecucion", health.body<String>())

        val firebaseHealth = client.get("/health/firebase")
        assertTrue(firebaseHealth.status == HttpStatusCode.OK || firebaseHealth.status == HttpStatusCode.InternalServerError)
    }

    @Test
    fun `openapi document is exposed`() = testApplication {
        application {
            module()
        }

        val response = client.get("/openapi.json")
        assertEquals(HttpStatusCode.OK, response.status)
        assertTrue(response.body<String>().contains("/users/{userId}/stats"))
    }

    @Test
    fun `auth firebase rejects empty token`() = testApplication {
        application {
            module()
        }

        val response = client.post("/auth/firebase") {
            headers.append(HttpHeaders.ContentType, ContentType.Application.Json.toString())
            setBody("{\"idToken\":\"\"}")
        }

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }
}
