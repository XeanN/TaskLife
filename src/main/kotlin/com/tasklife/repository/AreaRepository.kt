package com.tasklife.repository

import com.tasklife.models.Area
import com.tasklife.models.AreaConstants

class AreaRepository {

    fun getAll(): List<Area> = AreaConstants.AREAS

    fun getById(areaId: String): Area? = AreaConstants.AREAS.find { it.id == areaId }

    fun getPriorities(): List<Map<String, String>> = AreaConstants.PRIORITIES.map {
        mapOf(
            "value" to (it["value"] as? String ?: ""),
            "label" to (it["label"] as? String ?: ""),
            "color" to (it["color"] as? String ?: ""),
        )
    }
}
