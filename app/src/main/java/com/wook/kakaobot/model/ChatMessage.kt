package com.wook.kakaobot.model

/**
 * 카카오톡 메시지 데이터 모델
 */
data class ChatMessage(
    val room: String,       // 채팅방 이름
    val sender: String,     // 보낸 사람
    val message: String,    // 메시지 내용
    val isGroupChat: Boolean, // 단체방 여부
    val packageName: String,  // 앱 패키지명
    val timestamp: Long = System.currentTimeMillis()
)
