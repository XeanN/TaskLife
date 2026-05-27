package com.tasklife.controllers

import com.tasklife.models.Area
import com.tasklife.service.AreaService

class AreaController {

    private val service = AreaService()

    fun listAll(): List<Area> = service.listAll()

    fun getById(areaId: String): Area? = service.getById(areaId)

    fun getPriorities(): List<Map<String, String>> = service.getPriorities()
}
