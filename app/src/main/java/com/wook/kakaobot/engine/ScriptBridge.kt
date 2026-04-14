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

        // Jsoup 팩토리 주입 (Packages 대신 직접 주입)
        val jsoupFactory = JsoupFactory()
        val jsoupObj = RhinoContext.javaToJS(jsoupFactory, scope)
        ScriptableObject.putProperty(scope, "_JsoupFactory", jsoupObj)

        // 브릿지 JavaScript 코드 실행
        val bridgeScript = """
            // ============================================
            // ES2017+ 폴리필 (Rhino ES6 모드 호환)
            // ============================================
            if (!String.prototype.padStart) {
                String.prototype.padStart = function(targetLength, padString) {
                    var s = String(this);
                    padString = (typeof padString !== 'undefined') ? String(padString) : ' ';
                    if (s.length >= targetLength) return s;
                    var pad = '';
                    var needed = targetLength - s.length;
                    while (pad.length < needed) {
                        pad += padString;
                    }
                    return pad.substring(0, needed) + s;
                };
            }
            if (!String.prototype.padEnd) {
                String.prototype.padEnd = function(targetLength, padString) {
                    var s = String(this);
                    padString = (typeof padString !== 'undefined') ? String(padString) : ' ';
                    if (s.length >= targetLength) return s;
                    var pad = '';
                    var needed = targetLength - s.length;
                    while (pad.length < needed) {
                        pad += padString;
                    }
                    return s + pad.substring(0, needed);
                };
            }
            if (!Array.prototype.includes) {
                Array.prototype.includes = function(search, fromIndex) {
                    var len = this.length >>> 0;
                    if (len === 0) return false;
                    var n = fromIndex | 0;
                    var k = Math.max(n >= 0 ? n : len + n, 0);
                    while (k < len) {
                        if (this[k] === search || (search !== search && this[k] !== this[k])) return true;
                        k++;
                    }
                    return false;
                };
            }
            if (!Object.entries) {
                Object.entries = function(obj) {
                    var keys = Object.keys(obj);
                    var result = [];
                    for (var i = 0; i < keys.length; i++) {
                        result.push([keys[i], obj[keys[i]]]);
                    }
                    return result;
                };
            }
            if (!Object.values) {
                Object.values = function(obj) {
                    var keys = Object.keys(obj);
                    var result = [];
                    for (var i = 0; i < keys.length; i++) {
                        result.push(obj[keys[i]]);
                    }
                    return result;
                };
            }

            // ============================================
            // org.jsoup.Jsoup 호환 브릿지
            // ============================================
            var org = org || {};
            org.jsoup = org.jsoup || {};
            org.jsoup.Jsoup = {
                connect: function(url) {
                    return _JsoupFactory.connect(String(url));
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

            java.lang.System.out.println("[Bridge] 브릿지 스크립트 주입 완료 (polyfill + Jsoup + Api + DataBase)");
        """.trimIndent()

        rhinoContext.evaluateString(scope, bridgeScript, "bridge.js", 1, null)
        Log.d(TAG, "브릿지 스크립트 주입 완료")
    }
}
