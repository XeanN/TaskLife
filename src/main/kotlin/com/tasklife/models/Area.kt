package com.tasklife.models

import kotlinx.serialization.Serializable

@Serializable
data class Area(
    val id: String,
    val label: String,
    val color: String,
    val icon: String,
    val lib: String = "ionicons",
)

object AreaConstants {
    val AREAS = listOf(
        Area("work", "Trabajo", "#4A7FA5", "briefcase", "ionicons"),
        Area("education", "Educación", "#5BA4C8", "school", "ionicons"),
        Area("finance", "Finanzas", "#3AA88A", "bar-chart", "ionicons"),
        Area("health", "Bienestar", "#4DBF8A", "heart-outline", "ionicons"),
    )

    val PRIORITIES = listOf(
        mapOf("value" to "alta", "label" to "Alta", "color" to "#E53E3E"),
        mapOf("value" to "media", "label" to "Media", "color" to "#C58B00"),
        mapOf("value" to "baja", "label" to "Baja", "color" to "#38A169"),
    )
}
