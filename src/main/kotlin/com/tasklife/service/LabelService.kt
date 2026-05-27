package com.tasklife.service

import com.tasklife.models.Label
import com.tasklife.models.NewLabel
import com.tasklife.repository.LabelRepository

class LabelService {

    private val repository = LabelRepository()

    fun list(userId: String): List<Label> = repository.getAll(userId)

    fun get(userId: String, labelId: String): Label? = repository.getById(userId, labelId)

    fun create(userId: String, label: NewLabel): Label = repository.create(userId, label)

    fun delete(userId: String, labelId: String): Boolean = repository.delete(userId, labelId)
}
