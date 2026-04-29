package com.wook.kakaobot.ui

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.wook.kakaobot.databinding.ActivityScriptEditorBinding
import com.wook.kakaobot.engine.BotEngine

/**
 * 봇 스크립트 편집기.
 *
 * 기능:
 * - 스크립트 코드 직접 편집
 * - 저장 (내부저장소에 반영)
 * - 저장 + 리로드 (저장 후 즉시 봇 엔진에 반영)
 * - 파일 교체 (외부 .js/.txt 파일로 교체)
 * - 기본값 복원 (assets의 원본으로 되돌리기)
 */
class ScriptEditorActivity : AppCompatActivity() {

    private lateinit var binding: ActivityScriptEditorBinding
    private lateinit var botEngine: BotEngine
    private var hasUnsavedChanges = false
    private var originalContent = ""

    /** 파일 선택기 결과 처리 */
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.let { uri ->
                try {
                    var content = contentResolver.openInputStream(uri)
                        ?.bufferedReader(Charsets.UTF_8)
                        ?.readText() ?: ""

                    // UTF-8 BOM 제거 (﻿가 스크립트 앞에 붙으면 Rhino 파싱 오류 가능)
                    if (content.isNotEmpty() && content[0] == '﻿') {
                        content = content.substring(1)
                    }

                    if (content.isEmpty()) {
                        toast("빈 파일입니다")
                        return@let
                    }

                    if (!content.contains("function response(") &&
                        !content.contains("function response (")) {
                        AlertDialog.Builder(this)
                            .setTitle("경고")
                            .setMessage("response() 함수가 없는 파일입니다.\n봇이 정상 동작하지 않을 수 있습니다.\n\n그래도 교체하시겠습니까?")
                            .setPositiveButton("교체") { _, _ -> applyImportedContent(content) }
                            .setNegativeButton("취소", null)
                            .show()
                    } else {
                        applyImportedContent(content)
                    }
                } catch (e: Exception) {
                    toast("파일 읽기 실패: ${e.message}")
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityScriptEditorBinding.inflate(layoutInflater)
        setContentView(binding.root)

        botEngine = BotEngine.getInstance(this)

        loadCurrentScript()
        setupButtons()
        setupTextWatcher()
    }

    private fun loadCurrentScript() {
        botEngine.ensureScriptExists()
        val content = botEngine.getScriptContent()
        originalContent = content
        binding.etCode.setText(content)
        updateInfo(content)
        hasUnsavedChanges = false
    }

    private fun setupButtons() {
        // 뒤로가기
        binding.btnBack.setOnClickListener {
            handleBack()
        }

        // 저장
        binding.btnSave.setOnClickListener {
            saveScript()
        }

        // 파일 교체 (외부 파일 선택)
        binding.btnImportFile.setOnClickListener {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "*/*"
                putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(
                    "text/javascript",
                    "application/javascript",
                    "text/plain",
                    "application/octet-stream"
                ))
            }
            filePickerLauncher.launch(intent)
        }

        // 기본값 복원
        binding.btnResetDefault.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("기본값 복원")
                .setMessage("현재 편집 내용을 버리고\nassets의 원본 스크립트로 복원합니다.\n\n계속하시겠습니까?")
                .setPositiveButton("복원") { _, _ ->
                    if (botEngine.resetToDefault()) {
                        loadCurrentScript()
                        toast("기본값으로 복원됨")
                    } else {
                        toast("복원 실패")
                    }
                }
                .setNegativeButton("취소", null)
                .show()
        }

        // 저장 + 리로드
        binding.btnSaveAndReload.setOnClickListener {
            val content = binding.etCode.text.toString()
            if (botEngine.saveScriptContent(content)) {
                hasUnsavedChanges = false
                originalContent = content
                toast("저장 완료. 리로드 중...")

                Thread {
                    try {
                        val success = botEngine.reloadScript()
                        runOnUiThread {
                            if (success) {
                                toast("스크립트 리로드 성공!")
                            } else {
                                toast("리로드 실패! 코드를 확인하세요.")
                            }
                        }
                    } catch (e: Throwable) {
                        runOnUiThread {
                            toast("리로드 크래시: ${e.message}")
                        }
                    }
                }.start()
            } else {
                toast("저장 실패!")
            }
        }
    }

    private fun setupTextWatcher() {
        binding.etCode.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                hasUnsavedChanges = s.toString() != originalContent
                updateInfo(s.toString())
            }
        })
    }

    private fun saveScript() {
        val content = binding.etCode.text.toString()
        if (botEngine.saveScriptContent(content)) {
            hasUnsavedChanges = false
            originalContent = content
            toast("저장 완료!")
        } else {
            toast("저장 실패!")
        }
    }

    private fun applyImportedContent(content: String) {
        binding.etCode.setText(content)
        if (botEngine.replaceScriptFromContent(content)) {
            originalContent = content
            hasUnsavedChanges = false
            updateInfo(content)
            toast("파일 교체 완료! (${content.length} chars)")
        } else {
            toast("파일 교체 실패")
        }
    }

    private fun updateInfo(content: String) {
        val lines = content.count { it == '\n' } + 1
        val chars = content.length
        val modified = if (hasUnsavedChanges) " *" else ""
        binding.tvFileInfo.text = "bot_script.js$modified"
        binding.tvCharCount.text = "${lines}줄 / ${chars} chars"
    }

    private fun handleBack() {
        if (hasUnsavedChanges) {
            AlertDialog.Builder(this)
                .setTitle("저장하지 않은 변경사항")
                .setMessage("변경사항을 저장하시겠습니까?")
                .setPositiveButton("저장 후 나가기") { _, _ ->
                    saveScript()
                    finish()
                }
                .setNegativeButton("저장 안 함") { _, _ ->
                    finish()
                }
                .setNeutralButton("취소", null)
                .show()
        } else {
            finish()
        }
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        handleBack()
    }

    private fun toast(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }
}
