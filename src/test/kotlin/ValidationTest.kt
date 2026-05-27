package com.example

import com.tasklife.models.NewTask
import com.tasklife.models.TaskReminder
import com.tasklife.support.Validation
import kotlin.test.Test
import kotlin.test.assertEquals

class ValidationTest {

    @Test
    fun `validate new task accepts valid payload`() {
        val error = Validation.validateNewTask(
            NewTask(
                title = "Test",
                areaId = "work",
                dueDate = null,
                priority = "media",
                reminders = listOf(TaskReminder(offsetMs = 3600000)),
            )
        )

        assertEquals(null, error)
    }

    @Test
    fun `validate new task rejects invalid priority`() {
        val error = Validation.validateNewTask(
            NewTask(
                title = "Test",
                areaId = "work",
                priority = "urgente",
            )
        )

        assertEquals("La prioridad no es valida", error)
    }
}