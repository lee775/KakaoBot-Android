package com.wook.kakaobot.engine

import android.content.Context
import android.util.Log
import com.wook.kakaobot.model.ChatMessage
import org.mozilla.javascript.Context as RhinoContext
import org.mozilla.javascript.Function
import org.mozilla.javascript.ScriptableObject
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Rhino JavaScript 엔진을 사용하여 봇 스크립트를 실행하는 엔진.
 *
 * 스크립트 저장 구조:
 * - 최초 실행 시 assets/bot_script.js → 내부저장소/bot_script.js 복사
 * - 이후 항상 내부저장소에서 로드 (편집 내용 유지)
 * - 앱 내 편집기에서 수정 → 내부저장소에 저장 → 리로드
 */
class BotEngine private constructor(private val appContext: Context) {

    companion object {
        private const val TAG = "BotEngine"
        private const val SCRIPT_FILE = "bot_script.js"

        @Volatile
        private var instance: BotEngine? = null

        fun getInstance(context: Context): BotEngine {
            return instance ?: synchronized(this) {
                instance ?: BotEngine(context.applicationContext).also { instance = it }
            }
        }
    }

    private var scope: ScriptableObject? = null
    private var responseFunction: Function? = null
    private val executor: ExecutorService = Executors.newFixedThreadPool(4)

    var onLogReceived: ((String) -> Unit)? = null

    @Volatile
    var isLoaded = false
        private set

    /** 내부저장소의 스크립트 파일 경로 */
    private val scriptFile: File
        get() = File(appContext.filesDir, SCRIPT_FILE)

    /**
     * 내부저장소에 스크립트가 없으면 assets에서 복사한다.
     */
    fun ensureScriptExists() {
        if (!scriptFile.exists()) {
            log("최초 실행: assets → 내부저장소 복사")
            val content = loadFromAssets()
            if (content.isNotEmpty()) {
                scriptFile.writeText(content, Charsets.UTF_8)
            }
        }
    }

    /**
     * 스크립트를 로드하고 Rhino 엔진을 초기화한다.
     * 내부저장소의 bot_script.js를 읽어서 실행.
     */
    fun loadScript(): Boolean {
        ensureScriptExists()
        return try {
            val rhinoContext = RhinoContext.enter()
            rhinoContext.optimizationLevel = -1
            rhinoContext.languageVersion = RhinoContext.VERSION_ES6
            // Android에서 앱 클래스를 찾을 수 있도록 classLoader 설정
            rhinoContext.applicationClassLoader = appContext.classLoader

            scope = rhinoContext.initStandardObjects()
            ScriptBridge.inject(rhinoContext, scope!!, appContext)

            val script = getScriptContent()
            if (script.isEmpty()) {
                log("스크립트 파일이 비어있습니다")
                return false
            }

            rhinoContext.evaluateString(scope, script, SCRIPT_FILE, 1, null)

            val func = scope?.get("response", scope)
            if (func is Function) {
                responseFunction = func
                isLoaded = true
                log("스크립트 로드 완료 (${script.length} chars)")
                true
            } else {
                log("response() 함수를 찾을 수 없습니다")
                false
            }
        } catch (e: Throwable) {
            log("스크립트 로드 실패: ${e.javaClass.simpleName}: ${e.message}")
            Log.e(TAG, "Script load error", e)
            false
        } finally {
            try { RhinoContext.exit() } catch (_: Throwable) {}
        }
    }

    /**
     * 스크립트 테스트용 메시지 처리.
     * TestReplier를 사용하여 실제 카카오톡 전송 없이 응답을 캡처한다.
     */
    fun testMessage(
        room: String,
        message: String,
        sender: String,
        isGroupChat: Boolean,
        callback: (List<String>) -> Unit
    ) {
        if (!isLoaded || responseFunction == null) {
            callback(listOf("[오류] 스크립트가 로드되지 않았습니다. 먼저 스크립트를 로드하세요."))
            return
        }

        executor.execute {
            try {
                val rhinoContext = RhinoContext.enter()
                rhinoContext.optimizationLevel = -1
                rhinoContext.languageVersion = RhinoContext.VERSION_ES6
                rhinoContext.applicationClassLoader = appContext.classLoader

                val testReplier = TestReplier()
                val jsReplierObj = RhinoContext.javaToJS(testReplier, scope)
                val jsImageDB = rhinoContext.newObject(scope)

                val args = arrayOf<Any>(
                    room,
                    message,
                    sender,
                    isGroupChat,
                    jsReplierObj,
                    jsImageDB,
                    "com.kakao.talk"
                )

                responseFunction?.call(rhinoContext, scope, scope, args)

                // JS 내부 Thread로 비동기 실행되는 API 호출을 위해 잠시 대기
                Thread.sleep(3000)

                callback(testReplier.replies)

            } catch (e: Throwable) {
                log("테스트 메시지 처리 오류: ${e.javaClass.simpleName}: ${e.message}")
                Log.e(TAG, "Test message error", e)
                callback(listOf("[오류] ${e.javaClass.simpleName}: ${e.message}"))
            } finally {
                try { RhinoContext.exit() } catch (_: Throwable) {}
            }
        }
    }

    fun handleMessage(chatMessage: ChatMessage, replier: Replier) {
        if (!isLoaded || responseFunction == null) {
            log("스크립트가 로드되지 않았습니다")
            return
        }

        executor.execute {
            try {
                val rhinoContext = RhinoContext.enter()
                rhinoContext.optimizationLevel = -1
                rhinoContext.languageVersion = RhinoContext.VERSION_ES6
                rhinoContext.applicationClassLoader = appContext.classLoader

                val jsReplier = JsReplier(replier)
                val jsReplierObj = RhinoContext.javaToJS(jsReplier, scope)
                val jsImageDB = rhinoContext.newObject(scope)

                val args = arrayOf<Any>(
                    chatMessage.room,
                    chatMessage.message,
                    chatMessage.sender,
                    chatMessage.isGroupChat,
                    jsReplierObj,
                    jsImageDB,
                    chatMessage.packageName
                )

                responseFunction?.call(rhinoContext, scope, scope, args)

            } catch (e: Throwable) {
                log("메시지 처리 오류: ${e.javaClass.simpleName}: ${e.message}")
                Log.e(TAG, "Message handling error", e)
            } finally {
                try { RhinoContext.exit() } catch (_: Throwable) {}
            }
        }
    }

    /**
     * 내부저장소에서 스크립트 내용을 읽어온다.
     */
    fun getScriptContent(): String {
        return try {
            if (scriptFile.exists()) {
                scriptFile.readText(Charsets.UTF_8)
            } else {
                loadFromAssets()
            }
        } catch (e: Exception) {
            log("스크립트 읽기 실패: ${e.message}")
            ""
        }
    }

    /**
     * 스크립트 내용을 내부저장소에 저장한다.
     * 편집기에서 수정한 내용을 저장할 때 사용.
     */
    fun saveScriptContent(content: String): Boolean {
        return try {
            scriptFile.writeText(content, Charsets.UTF_8)
            log("스크립트 저장 완료 (${content.length} chars)")
            true
        } catch (e: Exception) {
            log("스크립트 저장 실패: ${e.message}")
            false
        }
    }

    /**
     * 외부 파일 내용으로 스크립트를 교체한다.
     */
    fun replaceScriptFromContent(content: String): Boolean {
        if (content.isEmpty()) {
            log("빈 파일은 교체할 수 없습니다")
            return false
        }
        return saveScriptContent(content)
    }

    /**
     * assets의 원본 스크립트로 초기화한다.
     */
    fun resetToDefault(): Boolean {
        val content = loadFromAssets()
        if (content.isEmpty()) {
            log("기본 스크립트를 찾을 수 없습니다")
            return false
        }
        return saveScriptContent(content)
    }

    fun reloadScript(): Boolean {
        isLoaded = false
        responseFunction = null
        scope = null
        return loadScript()
    }

    private fun loadFromAssets(): String {
        return try {
            val inputStream = appContext.assets.open(SCRIPT_FILE)
            val reader = BufferedReader(InputStreamReader(inputStream, "UTF-8"))
            val content = reader.readText()
            reader.close()
            content
        } catch (e: Exception) {
            log("assets 스크립트 읽기 실패: ${e.message}")
            ""
        }
    }

    private fun log(msg: String) {
        Log.d(TAG, msg)
        onLogReceived?.invoke(msg)
    }
}
