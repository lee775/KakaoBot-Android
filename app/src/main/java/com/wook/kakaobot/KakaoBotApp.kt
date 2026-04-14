package com.wook.kakaobot

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class KakaoBotApp : Application() {

    companion object {
        const val CHANNEL_ID = "kakaobot_service"
        const val CHANNEL_NAME = "KakaoBot Service"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "KakaoBot 백그라운드 서비스"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}
