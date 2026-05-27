package com.tasklife.service

import com.tasklife.models.NewTask
import com.tasklife.models.Task
import com.tasklife.models.TaskUpdate
import com.tasklife.repository.TaskRepository

class TaskService(
    private val repository: TaskRepository = TaskRepository(),
) {

    fun list(userId: String, areaId: String, limit: Int? = null, offset: Int? = null): List<Task> =
        repository.getAll(userId, areaId, limit, offset)

    fun getById(userId: String, areaId: String, taskId: String): Task? =
        repository.getById(userId, areaId, taskId)

    fun create(userId: String, areaId: String, task: NewTask): Task =
        repository.save(userId, areaId, task)

    fun update(userId: String, areaId: String, taskId: String, changes: TaskUpdate): Task? =
        repository.update(userId, areaId, taskId, changes)

    fun delete(userId: String, areaId: String, taskId: String): Boolean =
        repository.delete(userId, areaId, taskId)
}
