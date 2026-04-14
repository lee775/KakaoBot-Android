package com.wook.kakaobot.engine

import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

/**
 * 메신저봇 스크립트에서 사용하는 org.jsoup.Jsoup.connect() 호환 브릿지.
 *
 * 기존 JS 코드:
 *   org.jsoup.Jsoup.connect(url)
 *     .header("accept", "application/json")
 *     .header("x-nxopen-api-key", API_KEY)
 *     .ignoreContentType(true)
 *     .timeout(10000)
 *     .execute()
 *     .body();
 *
 * Rhino에서 호출 시 JS 타입 → Java 타입 변환 문제를 방지하기 위해
 * 모든 파라미터를 Object(Any)로 받아서 내부에서 변환.
 */
class JsoupConnection(private val url: String) {

    companion object {
        private const val TAG = "JsoupConnection"
        private val sharedClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    private val headers = mutableMapOf<String, String>()
    private var timeoutMs: Long = 30000L

    // Rhino: JS string → Java Object. toString()으로 안전 변환
    fun header(name: Any?, value: Any?): JsoupConnection {
        headers[name.toString()] = value.toString()
        return this
    }

    // Rhino: JS boolean true → Java Boolean 또는 Integer 1 등 다양한 타입 가능
    fun ignoreContentType(ignore: Any?): JsoupConnection {
        // 실제로는 사용하지 않지만 체이닝 호환을 위해 존재
        return this
    }

    fun ignoreHttpErrors(ignore: Any?): JsoupConnection {
        return this
    }

    // Rhino: JS number 10000 → Java Double 10000.0 으로 전달됨
    fun timeout(millis: Any?): JsoupConnection {
        timeoutMs = when (millis) {
            is Number -> millis.toLong()
            else -> millis.toString().toLongOrNull() ?: 30000L
        }
        return this
    }

    fun execute(): JsoupResponse {
        Log.d(TAG, "HTTP GET: $url")

        val client = if (timeoutMs != 30000L) {
            sharedClient.newBuilder()
                .connectTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .readTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .build()
        } else {
            sharedClient
        }

        val requestBuilder = Request.Builder().url(url)
        headers.forEach { (name, value) ->
            requestBuilder.addHeader(name, value)
        }

        val request = requestBuilder.build()
        val response = client.newCall(request).execute()

        val statusCode = response.code
        val body = response.body?.string() ?: ""
        response.close()

        Log.d(TAG, "HTTP $statusCode (${body.length} chars)")

        return JsoupResponse(body, statusCode)
    }
}

/**
 * Jsoup Response 호환 클래스.
 * .body() 와 .statusCode() 메서드 제공.
 */
class JsoupResponse(private val bodyText: String, private val code: Int) {
    fun body(): String = bodyText
    fun statusCode(): Int = code
}

/**
 * Rhino 스코프에 주입되는 팩토리 클래스.
 * JS에서 _JsoupFactory.connect(url)로 호출.
 * url을 Any로 받아서 Rhino 타입 변환 문제 방지.
 */
class JsoupFactory {
    fun connect(url: Any?): JsoupConnection {
        return JsoupConnection(url.toString())
    }
}
