package com.wook.kakaobot.engine

import android.content.Context
import android.content.SharedPreferences

/**
 * 메신저봇의 DataBase.getDataBase() / DataBase.setDataBase() 호환 브릿지.
 * Android SharedPreferences를 사용하여 키-값 데이터를 영속적으로 저장.
 *
 * JS에서 사용:
 *   DataBase.getDataBase("wall_방이름")  → 저장된 문자열 반환
 *   DataBase.setDataBase("wall_방이름", jsonString) → 저장
 */
class DataBaseBridge(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("kakaobot_db", Context.MODE_PRIVATE)

    fun getDataBase(key: Any?): String {
        val k = key?.toString() ?: return ""
        return prefs.getString(k, "") ?: ""
    }

    fun setDataBase(key: Any?, value: Any?) {
        val k = key?.toString() ?: return
        val v = value?.toString() ?: ""
        prefs.edit().putString(k, v).apply()
    }
}
