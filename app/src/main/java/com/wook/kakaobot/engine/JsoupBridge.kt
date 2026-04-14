package com.wook.kakaobot.engine

import android.util.Log
import org.jsoup.Jsoup

/**
 * Rhino 스코프에 주입되는 팩토리 클래스.
 * JS에서 _JsoupFactory.connect(url)로 호출하면
 * 실제 Jsoup 라이브러리의 Connection 객체를 반환한다.
 *
 * 이후 .header(), .ignoreContentType(), .timeout(), .execute(), .body() 등
 * 모든 메서드 호출은 실제 Jsoup 라이브러리가 직접 처리한다.
 *
 * url 파라미터만 Any?로 받아서 Rhino 타입 변환 문제를 방지하고,
 * 나머지는 Jsoup의 원본 타입 시그니처(String, boolean, int)를
 * Rhino가 자동으로 매칭한다.
 */
class JsoupFactory {

    companion object {
        private const val TAG = "JsoupFactory"
    }

    fun connect(url: Any?): org.jsoup.Connection {
        val urlStr = url.toString()
        Log.d(TAG, "connect: $urlStr")
        return Jsoup.connect(urlStr)
    }
}
