package com.wook.kakaobot.engine

import android.content.Context
import android.util.Log
import org.mozilla.javascript.Context as RhinoContext
import org.mozilla.javascript.ScriptableObject

/**
 * JavaScript 스크립트 실행 전에 주입되는 브릿지 스크립트.
 * 메신저봇 환경의 Java 클래스들을 OkHttp 기반으로 대체하는 shim 코드.
 *
 * 기존 메신저봇 스크립트가 사용하는 패턴:
 * - org.jsoup.Jsoup.connect(url).header(...).execute().body()
 * - new java.lang.Thread(function() { ... })
 * - Api.sendMessage(room, message)
 * - JSON.parse(...)
 *
 * 이 모든 것을 Android 네이티브로 브릿지.
 */
object ScriptBridge {

    private const val TAG = "ScriptBridge"

    /**
     * Rhino 스코프에 브릿지 코드를 주입한다.
     */
    fun inject(rhinoContext: RhinoContext, scope: ScriptableObject, appContext: Context) {
        // DataBase 브릿지 주입 (벽지 기능에서 사용)
        val dbBridge = DataBaseBridge(appContext)
        val dbObj = RhinoContext.javaToJS(dbBridge, scope)
        ScriptableObject.putProperty(scope, "DataBase", dbObj)

        // 브릿지 JavaScript 코드 실행
        val bridgeScript = """
            // ============================================
            // org.jsoup.Jsoup 호환 브릿지
            // ============================================
            var org = org || {};
            org.jsoup = org.jsoup || {};
            org.jsoup.Jsoup = {
                connect: function(url) {
                    return new Packages.com.wook.kakaobot.engine.JsoupConnection(String(url));
                }
            };

            // ============================================
            // Api 객체 (능동적 메시지 발송)
            // ============================================
            var Api = Api || {};
            Api.sendMessage = function(room, message) {
                java.lang.System.out.println("[Api.sendMessage] room=" + room + ", msg=" + message);
            };

            // ============================================
            // DataBase 브릿지 (SharedPreferences 기반)
            // ============================================
            // DataBase 객체는 Kotlin에서 주입됨 (DataBaseBridge)
            // DataBase.getDataBase(key) / DataBase.setDataBase(key, value)

        """.trimIndent()

        rhinoContext.evaluateString(scope, bridgeScript, "bridge.js", 1, null)
        Log.d(TAG, "브릿지 스크립트 주입 완료")
    }
}
