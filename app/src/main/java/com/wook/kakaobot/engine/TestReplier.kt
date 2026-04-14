package com.wook.kakaobot.engine

import android.util.Log

/**
 * 스크립트 테스트용 Replier.
 * 실제 카카오톡 전송 대신 응답 텍스트를 리스트에 저장한다.
 * Rhino 엔진에서 replier.reply("텍스트") 형태로 호출 가능.
 */
class TestReplier {

    companion object {
        private const val TAG = "TestReplier"
    }

    val replies = mutableListOf<String>()

    fun reply(text: Any?): Boolean {
        val message = text?.toString() ?: return false
        Log.d(TAG, "Test reply: $message")
        replies.add(message)
        return true
    }
}
