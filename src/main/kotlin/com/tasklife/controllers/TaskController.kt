package com.tasklife.controllers

import com.tasklife.models.NewTask
import com.tasklife.models.Task
import com.tasklife.models.TaskUpdate
import com.tasklife.service.TaskService

class TaskController(
    private val service: TaskService = TaskService(),
) {

    fun list(userId: String, areaId: String, limit: Int? = null, offset: Int? = null): List<Task> =
        service.list(userId, areaId, limit, offset)

    fun get(userId: String, areaId: String, taskId: String): Task? =
        service.getById(userId, areaId, taskId)

    fun create(userId: String, areaId: String, task: NewTask): Task =
        service.create(userId, areaId, task)

    fun update(userId: String, areaId: String, taskId: String, task: TaskUpdate): Task? =
        service.update(userId, areaId, taskId, task)

    fun delete(userId: String, areaId: String, taskId: String): Boolean =
        service.delete(userId, areaId, taskId)
}
