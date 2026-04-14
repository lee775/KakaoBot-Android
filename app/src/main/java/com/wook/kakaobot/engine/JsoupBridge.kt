package com.wook.kakaobot.engine

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
 * 이 패턴을 OkHttp로 동일하게 구현.
 */
class JsoupConnection(private val url: String) {

    private val headers = mutableMapOf<String, String>()
    private var timeoutMs: Int = 30000
    private var ignoreContentType: Boolean = false
    private var ignoreHttpErrors: Boolean = false

    fun header(name: String, value: String): JsoupConnection {
        headers[name] = value
        return this
    }

    fun ignoreContentType(ignore: Boolean): JsoupConnection {
        ignoreContentType = ignore
        return this
    }

    fun ignoreHttpErrors(ignore: Boolean): JsoupConnection {
        ignoreHttpErrors = ignore
        return this
    }

    fun timeout(millis: Int): JsoupConnection {
        timeoutMs = millis
        return this
    }

    fun execute(): JsoupResponse {
        val client = OkHttpClient.Builder()
            .connectTimeout(timeoutMs.toLong(), TimeUnit.MILLISECONDS)
            .readTimeout(timeoutMs.toLong(), TimeUnit.MILLISECONDS)
            .writeTimeout(timeoutMs.toLong(), TimeUnit.MILLISECONDS)
            .build()

        val requestBuilder = Request.Builder().url(url)
        headers.forEach { (name, value) ->
            requestBuilder.addHeader(name, value)
        }

        val request = requestBuilder.build()
        val response = client.newCall(request).execute()

        val statusCode = response.code
        val body = response.body?.string() ?: ""
        response.close()

        if (!ignoreHttpErrors && statusCode >= 400) {
            throw RuntimeException("HTTP error $statusCode for URL: $url")
        }

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
 * org.jsoup.Jsoup 정적 메서드 호환.
 */
class JsoupBridge {
    companion object {
        @JvmStatic
        fun connect(url: String): JsoupConnection {
            return JsoupConnection(url)
        }
    }
}
