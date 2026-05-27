package com.tasklife.support

import com.tasklife.models.AreaConstants
import com.tasklife.models.NewTask
import com.tasklife.models.TaskUpdate
import java.time.Instant

object Validation {
    private val allowedPriorities = AreaConstants.PRIORITIES.map { it["value"] as String }.toSet()

    fun validateNewTask(task: NewTask): String? {
        if (task.title.isBlank()) return "El titulo es obligatorio"
        if (task.areaId.isBlank()) return "El areaId es obligatorio"
        if (task.priority !in allowedPriorities) return "La prioridad no es valida"
        if (task.dueDate != null && !isValidInstant(task.dueDate)) return "La fecha dueDate no es valida"
        if (task.reminders.any { it.offsetMs < 0 }) return "Los recordatorios no pueden tener offset negativo"
        return null
    }

    fun validateTaskUpdate(task: TaskUpdate): String? {
        if (task.title != null && task.title.isBlank()) return "El titulo no puede estar vacio"
        if (task.priority != null && task.priority !in allowedPriorities) return "La prioridad no es valida"
        if (task.dueDate != null && !isValidInstant(task.dueDate)) return "La fecha dueDate no es valida"
        if (task.reminders != null && task.reminders.any { it.offsetMs < 0 }) return "Los recordatorios no pueden tener offset negativo"
        return null
    }

    fun validatePagination(limit: Int?, offset: Int?): String? {
        if (limit != null && (limit < 1 || limit > 100)) return "limit debe estar entre 1 y 100"
        if (offset != null && offset < 0) return "offset no puede ser negativo"
        return null
    }

    private fun isValidInstant(value: String): Boolean = runCatching { Instant.parse(value) }.isSuccess
}
