package com.tasklife.service

import com.tasklife.models.Area
import com.tasklife.repository.AreaRepository

class AreaService {

    private val repository = AreaRepository()

    fun listAll(): List<Area> = repository.getAll()

    fun getById(areaId: String): Area? = repository.getById(areaId)

    fun getPriorities(): List<Map<String, String>> = repository.getPriorities()
}
