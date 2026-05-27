package com.tasklife.config

object ApiDocumentation {
    val openapiJson: String = """
        {
          "openapi": "3.0.3",
          "info": {
            "title": "TaskLife API",
            "version": "1.0.0",
            "description": "Contrato base del backend TaskLife."
          },
          "servers": [
            { "url": "/" },
            { "url": "/v1" }
          ],
          "paths": {
            "/health": { "get": { "responses": { "200": { "description": "OK" } } } },
            "/health/firebase": { "get": { "responses": { "200": { "description": "OK" } } } },
            "/users/{userId}/areas/{areaId}/tasks": {
              "get": { "summary": "List tasks" },
              "post": { "summary": "Create task" }
            },
            "/users/{userId}/stats": { "get": { "summary": "Task stats" } },
            "/users/{userId}/weekly-report": { "get": { "summary": "Weekly report" } },
            "/users/{userId}/reminders/due": { "get": { "summary": "Due reminders" } }
          }
        }
    """.trimIndent()
}
