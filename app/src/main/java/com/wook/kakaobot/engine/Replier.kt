package com.wook.kakaobot.engine

import android.app.Notification
import android.app.RemoteInput
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.service.notification.StatusBarNotification
import android.util.Log

/**
 * 카카오톡에 답장을 보내는 핵심 클래스.
 * Android의 RemoteInput(알림 답장) 기능을 사용하여
 * 프로그래밍적으로 카카오톡 메시지를 전송한다.
 *
 * 이것이 메신저봇의 replier.reply()와 동일한 역할.
 */
class Replier(
    private val context: Context,
    private val replyAction: Notification.Action,
    private val sbn: StatusBarNotification
) {
    companion object {
        private const val TAG = "Replier"
    }

    /**
     * 카카오톡 채팅방에 메시지를 전송한다.
     * RemoteInput을 통해 알림의 "답장" 기능을 프로그래밍적으로 실행.
     */
    fun reply(text: String): Boolean {
        return try {
            val remoteInputs = replyAction.remoteInputs ?: return false
            if (remoteInputs.isEmpty()) return false

            val intent = Intent()
            val bundle = Bundle()

            // 모든 RemoteInput에 텍스트 설정
            for (remoteInput in remoteInputs) {
                bundle.putCharSequence(remoteInput.resultKey, text)
            }
            RemoteInput.addResultsToIntent(remoteInputs, intent, bundle)

            // PendingIntent 실행 → 카카오톡에 답장 전송
            replyAction.actionIntent.send(context, 0, intent)

            Log.d(TAG, "답장 전송 성공: $text")
            true
        } catch (e: Exception) {
            Log.e(TAG, "답장 전송 실패: ${e.message}", e)
            false
        }
    }
}
