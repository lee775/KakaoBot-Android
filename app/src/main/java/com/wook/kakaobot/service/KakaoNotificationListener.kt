package com.wook.kakaobot.service

import android.app.Notification
import android.app.RemoteInput
import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.wook.kakaobot.engine.BotEngine
import com.wook.kakaobot.engine.Replier
import com.wook.kakaobot.model.ChatMessage

/**
 * 카카오톡 알림을 감지하여 메시지를 가로채는 서비스.
 * 메신저봇의 핵심 동작과 동일한 원리.
 *
 * 동작 원리:
 * 1. Android NotificationListenerService로 카카오톡 알림 수신
 * 2. 알림에서 room, sender, msg 파싱
 * 3. Rhino JS 엔진에 전달하여 response() 함수 호출
 * 4. replier.reply() → RemoteInput으로 카카오톡에 답장
 */
class KakaoNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "KakaoListener"
        private const val KAKAO_PACKAGE = "com.kakao.talk"

        // 봇 활성화 상태 (UI에서 제어)
        @Volatile
        var isEnabled = false

        // 로그 콜백 (UI에 로그 표시용)
        var onLogReceived: ((String) -> Unit)? = null
    }

    private lateinit var botEngine: BotEngine

    override fun onCreate() {
        super.onCreate()
        botEngine = BotEngine.getInstance(applicationContext)
        log("NotificationListener 시작됨")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (!isEnabled) return
        if (sbn.packageName != KAKAO_PACKAGE) return

        try {
            val notification = sbn.notification
            val extras = notification.extras

            // 메시지 정보 추출
            val sender = extras.getString(Notification.EXTRA_TITLE) ?: return
            val message = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: return
            val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString()

            // 그룹 채팅 여부: subText가 있으면 그룹채팅 (방 이름이 subText)
            val isGroupChat = subText != null
            val room = if (isGroupChat) subText!! else sender

            log("[$room] $sender: $message")

            // RemoteInput Action 찾기 (답장 기능)
            val replyAction = findReplyAction(notification) ?: run {
                log("답장 액션을 찾을 수 없음")
                return
            }

            // Replier 생성
            val replier = Replier(applicationContext, replyAction, sbn)

            // ChatMessage 생성
            val chatMessage = ChatMessage(
                room = room,
                sender = sender,
                message = message,
                isGroupChat = isGroupChat,
                packageName = sbn.packageName
            )

            // JS 엔진에서 response() 함수 실행
            botEngine.handleMessage(chatMessage, replier)

        } catch (e: Exception) {
            log("메시지 처리 오류: ${e.message}")
            Log.e(TAG, "Error processing notification", e)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // 알림이 제거될 때 (필요시 처리)
    }

    /**
     * 알림에서 답장 가능한 Action을 찾는다.
     * 카카오톡 알림의 RemoteInput이 있는 Action을 탐색.
     */
    private fun findReplyAction(notification: Notification): Notification.Action? {
        notification.actions?.forEach { action ->
            if (action.remoteInputs?.isNotEmpty() == true) {
                return action
            }
        }
        return null
    }

    private fun log(msg: String) {
        Log.d(TAG, msg)
        onLogReceived?.invoke(msg)
    }
}
