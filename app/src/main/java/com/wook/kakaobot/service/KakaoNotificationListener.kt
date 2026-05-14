package com.wook.kakaobot.service

import android.app.Notification
import android.app.PendingIntent
import android.app.RemoteInput
import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.wook.kakaobot.engine.BotEngine
import com.wook.kakaobot.engine.BotPrefs
import com.wook.kakaobot.engine.Replier
import com.wook.kakaobot.model.ChatMessage

/**
 * 카카오톡 알림을 감지하여 메시지를 가로채는 서비스.
 *
 * 동작 원리:
 * 1. Android NotificationListenerService로 카카오톡 알림 수신
 * 2. 알림에서 room/sender/msg 파싱
 * 3. Rhino JS 엔진에 전달하여 response() 호출
 * 4. replier.reply() → RemoteInput으로 카카오톡에 답장
 */
class KakaoNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "KakaoListener"
        private const val KAKAO_PACKAGE = "com.kakao.talk"

        @Volatile var isEnabled = false
        var onLogReceived: ((String) -> Unit)? = null
    }

    private lateinit var botEngine: BotEngine

    override fun onCreate() {
        super.onCreate()
        botEngine = BotEngine.getInstance(applicationContext)

        // 영속화된 봇 활성화 상태 복원: 프로세스가 죽었다 살아나도 ON 유지
        val saved = BotPrefs.isBotEnabled(applicationContext)
        isEnabled = saved
        log("NotificationListener 시작됨 (복원: isEnabled=$saved)")

        // 봇이 ON 상태였으면 스크립트도 자동 로드
        if (saved && !botEngine.isLoaded) {
            Thread {
                try {
                    val ok = botEngine.loadScript()
                    log("자동 스크립트 로드: $ok")
                } catch (e: Throwable) {
                    log("자동 스크립트 로드 실패: ${e.javaClass.simpleName}: ${e.message}")
                }
            }.start()
        }
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (!isEnabled) return
        if (sbn.packageName != KAKAO_PACKAGE) return

        try {
            val notification = sbn.notification
            val extras = notification.extras

            val sender = extras.getString(Notification.EXTRA_TITLE) ?: return
            val message = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: return
            val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString()

            val isGroupChat = subText != null
            val room = if (isGroupChat) subText!! else sender

            val channelId = extractChannelId(sbn, notification)

            log("[$room] $sender: $message")

            val replyAction = findReplyAction(notification) ?: run {
                log("답장 액션을 찾을 수 없음")
                return
            }

            val replier = Replier(applicationContext, replyAction, sbn, channelId)

            val chatMessage = ChatMessage(
                room = room,
                sender = sender,
                message = message,
                isGroupChat = isGroupChat,
                packageName = sbn.packageName,
                channelId = channelId
            )

            botEngine.handleMessage(chatMessage, replier)

        } catch (e: Exception) {
            log("메시지 처리 오류: ${e.javaClass.simpleName}: ${e.message}")
            Log.e(TAG, "Error processing notification", e)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {}

    private fun findReplyAction(notification: Notification): Notification.Action? {
        notification.actions?.forEach { action ->
            if (action.remoteInputs?.isNotEmpty() == true) return action
        }
        return null
    }

    /**
     * 카카오톡 알림에서 channelId(Long) 추출.
     * sbn.tag → notification.extras → PendingIntent reflection 순으로 시도. 실패 시 0L.
     */
    private fun extractChannelId(sbn: StatusBarNotification, notification: Notification): Long {
        sbn.tag?.let { tag ->
            tag.toLongOrNull()?.let { return it }
            tag.split("|", "_", ":", "/").forEach { part ->
                part.toLongOrNull()?.let { if (it > 1000L) return it }
            }
        }
        val extras = notification.extras
        for (key in listOf("key_id", "chat_id", "chatId", "chatRoomId", "channelId")) {
            try {
                val v = extras.get(key) ?: continue
                when (v) {
                    is Long -> return v
                    is Number -> return v.toLong()
                    is String -> v.toLongOrNull()?.let { return it }
                    else -> {}
                }
            } catch (_: Exception) {}
        }
        val pi = notification.contentIntent
            ?: notification.actions?.firstOrNull()?.actionIntent ?: return 0L
        try {
            val getIntent = PendingIntent::class.java.getDeclaredMethod("getIntent")
            getIntent.isAccessible = true
            val intent = getIntent.invoke(pi) as? Intent
            intent?.extras?.let { ie ->
                for (key in listOf("key_id", "chat_id", "chatId", "chatRoomId", "channelId")) {
                    val v = ie.get(key) ?: continue
                    when (v) {
                        is Long -> return v
                        is Number -> return v.toLong()
                        is String -> v.toLongOrNull()?.let { return it }
                        else -> {}
                    }
                }
            }
        } catch (_: Throwable) {}
        return 0L
    }

    private fun log(msg: String) {
        Log.d(TAG, msg)
        onLogReceived?.invoke(msg)
    }
}
