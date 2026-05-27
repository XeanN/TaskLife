package com.tasklife.models

import kotlinx.serialization.Serializable

@Serializable
data class Label(
    val id: String,
    val name: String,
    val color: String,
    val userId: String,
)

@Serializable
data class NewLabel(
    val name: String,
    val color: String,
    val userId: String,
)

object LabelColors {
    val COLORS = listOf(
        "#3B82F6", // azul
        "#10B981", // verde
        "#8B5CF6", // morado
        "#F59E0B", // amarillo
        "#EF4444", // rojo
        "#EC4899", // rosa
        "#06B6D4", // cyan
        "#F97316", // naranja
        "#6B7280", // gris
        "#14B8A6", // teal
    )
}
