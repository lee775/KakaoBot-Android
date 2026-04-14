package com.wook.kakaobot.ui

import android.os.Bundle
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.wook.kakaobot.databinding.ActivityScriptTestBinding
import com.wook.kakaobot.engine.BotEngine
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * 스크립트 동작을 테스트하는 화면.
 * 실제 카카오톡 메시지 없이 봇 응답을 확인할 수 있다.
 */
class ScriptTestActivity : AppCompatActivity() {

    private lateinit var binding: ActivityScriptTestBinding
    private lateinit var botEngine: BotEngine
    private val resultBuffer = StringBuilder()
    private val dateFormat = SimpleDateFormat("HH:mm:ss", Locale.KOREA)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityScriptTestBinding.inflate(layoutInflater)
        setContentView(binding.root)

        botEngine = BotEngine.getInstance(this)

        setupUI()
        updateScriptStatus()
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener { finish() }

        binding.btnClearResult.setOnClickListener {
            resultBuffer.clear()
            binding.tvResult.text = "결과가 초기화되었습니다.\n"
        }

        binding.btnSend.setOnClickListener { sendTestMessage() }

        // 엔터 키로 전송
        binding.etMessage.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEND) {
                sendTestMessage()
                true
            } else false
        }

        // 빠른 테스트 버튼
        binding.btnQuick1.setOnClickListener { quickSend("!도움말") }
        binding.btnQuick2.setOnClickListener { quickSend("!캐릭터") }
        binding.btnQuick3.setOnClickListener { quickSend("@@") }
        binding.btnQuick4.setOnClickListener { quickSend("!주간보스") }
    }

    private fun quickSend(message: String) {
        binding.etMessage.setText(message)
        sendTestMessage()
    }

    private fun sendTestMessage() {
        val message = binding.etMessage.text.toString().trim()
        if (message.isEmpty()) {
            Toast.makeText(this, "메시지를 입력하세요", Toast.LENGTH_SHORT).show()
            return
        }

        if (!botEngine.isLoaded) {
            appendResult("[시스템] 스크립트가 로드되지 않았습니다. 메인 화면에서 먼저 로드하세요.")
            return
        }

        val room = binding.etRoom.text.toString().ifEmpty { "테스트방" }
        val sender = binding.etSender.text.toString().ifEmpty { "테스터" }
        val isGroupChat = binding.cbGroupChat.isChecked

        // 입력 표시
        appendResult("[$sender] $message")
        appendResult("[대기중...] 응답을 기다리는 중...")

        // 전송 버튼 비활성화
        binding.btnSend.isEnabled = false
        binding.btnSend.text = "..."

        botEngine.testMessage(room, message, sender, isGroupChat) { replies ->
            runOnUiThread {
                // "대기중..." 줄 제거
                val waitingLine = "[대기중...] 응답을 기다리는 중..."
                val idx = resultBuffer.lastIndexOf(waitingLine)
                if (idx >= 0) {
                    resultBuffer.delete(idx, idx + waitingLine.length + 1)
                }

                if (replies.isEmpty()) {
                    appendResult("[봇] (응답 없음 - 해당 명령어에 매칭되지 않았거나 API 응답 대기 중)")
                } else {
                    for (reply in replies) {
                        appendResult("[봇] $reply")
                    }
                }

                appendResult("---")

                // 전송 버튼 복원
                binding.btnSend.isEnabled = true
                binding.btnSend.text = "전송"
            }
        }
    }

    private fun appendResult(text: String) {
        val timestamp = dateFormat.format(Date())
        resultBuffer.append("[$timestamp] $text\n")

        if (resultBuffer.length > 50000) {
            resultBuffer.delete(0, resultBuffer.length - 30000)
        }

        binding.tvResult.text = resultBuffer.toString()

        // 자동 스크롤
        binding.scrollResult.post {
            binding.scrollResult.fullScroll(android.view.View.FOCUS_DOWN)
        }
    }

    private fun updateScriptStatus() {
        binding.tvScriptStatus.text = if (botEngine.isLoaded) {
            "스크립트: 로드됨"
        } else {
            "스크립트: 미로드 (메인 화면에서 로드 필요)"
        }
    }

    override fun onResume() {
        super.onResume()
        updateScriptStatus()
    }
}
