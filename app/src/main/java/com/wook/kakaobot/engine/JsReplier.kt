package com.wook.kakaobot.engine

import android.util.Log

/**
 * JavaScript에서 replier.reply("텍스트") 형태로 호출할 수 있도록
 * Replier를 래핑하는 클래스.
 *
 * Rhino 엔진이 이 클래스의 public 메서드를 JS에서 직접 호출할 수 있다.
 */
class JsReplier(private val replier: Replier) {

    companion object {
        private const val TAG = "JsReplier"
    }

    /**
     * JS에서 replier.reply("메시지") 로 호출됨.
     * 메신저봇의 replier.reply()와 동일한 인터페이스.
     */
    fun reply(text: Any?): Boolean {
        val message = text?.toString() ?: return false
        Log.d(TAG, "Reply: $message")
        return replier.reply(message)
    }
}
