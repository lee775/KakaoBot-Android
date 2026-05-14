package com.wook.kakaobot.engine

import android.content.Context

/**
 * 봇 설정 영속화 (SharedPreferences 래퍼).
 * - bot_enabled: 사용자가 봇을 ON 상태로 둔 적이 있는지. 앱 재실행 시 자동 복원.
 */
object BotPrefs {

    private const val PREFS = "flomessenger_settings"
    private const val KEY_BOT_ENABLED = "bot_enabled"

    fun isBotEnabled(context: Context): Boolean =
        context.applicationContext
            .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getBoolean(KEY_BOT_ENABLED, false)

    fun setBotEnabled(context: Context, enabled: Boolean) {
        context.applicationContext
            .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putBoolean(KEY_BOT_ENABLED, enabled).apply()
    }
}
