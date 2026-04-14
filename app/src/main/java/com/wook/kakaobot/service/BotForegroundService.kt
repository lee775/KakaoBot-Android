package com.wook.kakaobot.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.wook.kakaobot.KakaoBotApp
import com.wook.kakaobot.R
import com.wook.kakaobot.ui.MainActivity

/**
 * 봇이 백그라운드에서 꺼지지 않도록 유지하는 Foreground Service.
 * Android 8.0+ 에서는 백그라운드 서비스가 OS에 의해 종료될 수 있으므로
 * Foreground Service로 상시 알림을 표시하여 프로세스를 유지한다.
 */
class BotForegroundService : Service() {

    companion object {
        private const val NOTIFICATION_ID = 1001
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY // OS가 종료해도 자동 재시작
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, KakaoBotApp.CHANNEL_ID)
            .setContentTitle("KakaoBot 실행 중")
            .setContentText("카카오톡 메시지를 감지하고 있습니다")
            .setSmallIcon(R.drawable.ic_bot)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }
}
