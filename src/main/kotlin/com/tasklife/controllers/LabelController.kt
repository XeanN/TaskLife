package com.tasklife.controllers

import com.tasklife.models.Label
import com.tasklife.models.NewLabel
import com.tasklife.service.LabelService

class LabelController {

    private val service = LabelService()

    fun list(userId: String): List<Label> = service.list(userId)

    fun get(userId: String, labelId: String): Label? = service.get(userId, labelId)

    fun create(userId: String, label: NewLabel): Label = service.create(userId, label)

    fun delete(userId: String, labelId: String): Boolean = service.delete(userId, labelId)
}
