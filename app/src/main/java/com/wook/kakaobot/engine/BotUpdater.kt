package com.wook.kakaobot.engine

import android.content.Context
import android.util.Log
import java.net.HttpURLConnection
import java.net.URL

/**
 * 원격 URL에서 스크립트를 가져와 내부저장소 bot_script.js 로 저장하고 BotEngine을 reload.
 *
 * JS 사용: BotUpdate.applyRemote("https://raw.githubusercontent.com/...")
 * 반환 문자열을 그대로 카톡에 reply 하면 됨.
 *
 * 네트워크 호출이므로 반드시 java.lang.Thread 안에서 호출할 것.
 */
class BotUpdater(private val appContext: Context) {

    companion object {
        private const val TAG = "BotUpdater"
        private const val TIMEOUT_MS = 15000
        private const val MIN_SCRIPT_LENGTH = 1000 // 너무 짧은 응답(에러 페이지 등) 거부
    }

    fun applyRemote(url: String): String {
        return try {
            Log.d(TAG, "fetch: $url")
            val conn = URL(url).openConnection() as HttpURLConnection
            conn.connectTimeout = TIMEOUT_MS
            conn.readTimeout = TIMEOUT_MS
            conn.requestMethod = "GET"
            conn.setRequestProperty("User-Agent", "Mozilla/5.0")
            conn.setRequestProperty("Accept", "text/plain, */*")

            val code = conn.responseCode
            if (code !in 200..299) {
                conn.disconnect()
                return "❌ 업데이트 실패: HTTP $code"
            }

            val raw = conn.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
            conn.disconnect()

            // UTF-8 BOM 제거
            val content = if (raw.isNotEmpty() && raw[0] == '﻿') raw.substring(1) else raw

            if (content.length < MIN_SCRIPT_LENGTH) {
                return "❌ 업데이트 실패: 받은 내용이 너무 짧음 (${content.length} chars)"
            }

            val engine = BotEngine.getInstance(appContext)
            val saved = engine.saveScriptContent(content)
            if (!saved) return "❌ 업데이트 실패: 파일 저장 오류"

            val reloaded = engine.reloadScript()
            if (!reloaded) return "❌ 업데이트 실패: 스크립트 리로드 오류 (구문 오류 가능성)"

            "✅ 업데이트 완료 (${content.length} chars)"
        } catch (e: Exception) {
            Log.e(TAG, "applyRemote error: ${e.message}", e)
            "❌ 업데이트 실패: ${e.javaClass.simpleName}: ${e.message}"
        }
    }
}
