package com.wook.kakaobot.ui

import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.text.method.ScrollingMovementMethod
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.wook.kakaobot.databinding.ActivityMainBinding
import com.wook.kakaobot.engine.BotEngine
import com.wook.kakaobot.service.BotForegroundService
import com.wook.kakaobot.service.KakaoNotificationListener
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * 메인 화면.
 * - 봇 ON/OFF 토글
 * - 스크립트 로드/리로드
 * - 실시간 로그 표시
 * - 알림 접근 권한 설정
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var botEngine: BotEngine
    private val logBuffer = StringBuilder()
    private val dateFormat = SimpleDateFormat("HH:mm:ss", Locale.KOREA)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        botEngine = BotEngine.getInstance(this)

        setupUI()
        setupLogCallback()
        checkPermissions()
    }

    private fun setupUI() {
        // 로그 스크롤 가능하게
        binding.tvLog.movementMethod = ScrollingMovementMethod()

        // 봇 ON/OFF 토글
        binding.switchBot.setOnCheckedChangeListener { _, isChecked ->
            KakaoNotificationListener.isEnabled = isChecked
            if (isChecked) {
                startBotService()
                appendLog("봇 활성화됨")
            } else {
                stopBotService()
                appendLog("봇 비활성화됨")
            }
            updateStatus()
        }

        // 스크립트 로드 버튼
        binding.btnLoadScript.setOnClickListener {
            appendLog("스크립트 로드 중...")
            Thread {
                try {
                    val success = botEngine.loadScript()
                    runOnUiThread {
                        if (success) {
                            appendLog("스크립트 로드 성공!")
                        } else {
                            appendLog("스크립트 로드 실패! 로그를 확인하세요.")
                        }
                        updateStatus()
                    }
                } catch (e: Throwable) {
                    runOnUiThread {
                        appendLog("스크립트 로드 크래시: ${e.javaClass.simpleName}: ${e.message}")
                    }
                }
            }.start()
        }

        // 스크립트 리로드 버튼
        binding.btnReloadScript.setOnClickListener {
            appendLog("스크립트 리로드 중...")
            Thread {
                try {
                    val success = botEngine.reloadScript()
                    runOnUiThread {
                        if (success) {
                            appendLog("스크립트 리로드 성공!")
                        } else {
                            appendLog("스크립트 리로드 실패!")
                        }
                        updateStatus()
                    }
                } catch (e: Throwable) {
                    runOnUiThread {
                        appendLog("리로드 크래시: ${e.javaClass.simpleName}: ${e.message}")
                    }
                }
            }.start()
        }

        // 알림 접근 권한 설정 버튼
        binding.btnNotificationPermission.setOnClickListener {
            openNotificationListenerSettings()
        }

        // 배터리 최적화 해제 버튼
        binding.btnBatteryOptimization.setOnClickListener {
            requestIgnoreBatteryOptimization()
        }

        // 스크립트 편집기 버튼
        binding.btnEditScript.setOnClickListener {
            startActivity(Intent(this, ScriptEditorActivity::class.java))
        }

        // 로그 초기화 버튼
        binding.btnClearLog.setOnClickListener {
            logBuffer.clear()
            binding.tvLog.text = ""
        }

        updateStatus()
    }

    private fun setupLogCallback() {
        val logCallback: (String) -> Unit = { msg ->
            runOnUiThread { appendLog(msg) }
        }

        botEngine.onLogReceived = logCallback
        KakaoNotificationListener.onLogReceived = logCallback
    }

    private fun appendLog(msg: String) {
        val timestamp = dateFormat.format(Date())
        val line = "[$timestamp] $msg\n"
        logBuffer.append(line)

        // 로그가 너무 길어지면 앞부분 제거
        if (logBuffer.length > 50000) {
            logBuffer.delete(0, logBuffer.length - 30000)
        }

        binding.tvLog.text = logBuffer.toString()

        // 자동 스크롤
        val scrollAmount = binding.tvLog.layout?.let {
            it.getLineTop(binding.tvLog.lineCount) - binding.tvLog.height
        } ?: 0
        if (scrollAmount > 0) {
            binding.tvLog.scrollTo(0, scrollAmount)
        }
    }

    private fun updateStatus() {
        val isListenerEnabled = isNotificationListenerEnabled()
        val isScriptLoaded = botEngine.isLoaded
        val isBotEnabled = KakaoNotificationListener.isEnabled

        binding.tvStatusListener.text = "알림 리스너: ${if (isListenerEnabled) "ON" else "OFF"}"
        binding.tvStatusScript.text = "스크립트: ${if (isScriptLoaded) "로드됨" else "미로드"}"
        binding.tvStatusBot.text = "봇 상태: ${if (isBotEnabled) "활성" else "비활성"}"
    }

    private fun checkPermissions() {
        if (!isNotificationListenerEnabled()) {
            appendLog("알림 접근 권한이 필요합니다. '알림 권한 설정' 버튼을 눌러주세요.")
        }
    }

    private fun isNotificationListenerEnabled(): Boolean {
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        return flat?.contains(ComponentName(this, KakaoNotificationListener::class.java).flattenToString()) == true
    }

    private fun openNotificationListenerSettings() {
        try {
            startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"))
        } catch (e: Exception) {
            Toast.makeText(this, "설정 화면을 열 수 없습니다", Toast.LENGTH_SHORT).show()
        }
    }

    private fun requestIgnoreBatteryOptimization() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = getSystemService(PowerManager::class.java)
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:$packageName")
                }
                startActivity(intent)
            } else {
                Toast.makeText(this, "이미 배터리 최적화가 해제되어 있습니다", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun startBotService() {
        val intent = Intent(this, BotForegroundService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    private fun stopBotService() {
        stopService(Intent(this, BotForegroundService::class.java))
    }

    override fun onResume() {
        super.onResume()
        updateStatus()
    }
}
