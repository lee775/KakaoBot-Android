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

    /**
     * 현재 채팅방 channelId를 String으로 반환.
     * Long을 그대로 JS number로 넘기면 2^53 초과 값(카톡 channelId)에서
     * 정밀도가 깨지므로 반드시 문자열로 전달한다.
     */
    fun getChannelId(): String = replier.channelId.toString()
}
