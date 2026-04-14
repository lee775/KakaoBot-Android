# KakaoBot - 카카오톡 자동응답 봇 (Android)

메신저봇(MessengerBot)과 동일한 방식으로 작동하는 카카오톡 자동응답 Android 앱.
JavaScript(Rhino 엔진)로 작성된 봇 스크립트를 실행하며, 앱 내에서 스크립트 편집 및 파일 교체가 가능합니다.

---

## 작동 원리

### 1. 카카오톡 메시지 감지 (NotificationListenerService)
- Android의 `NotificationListenerService`를 상속한 `KakaoNotificationListener`가 카카오톡(`com.kakao.talk`) 알림을 감지
- 알림에서 **방 이름**, **보낸 사람**, **메시지 내용**, **단톡 여부**를 추출

### 2. JavaScript 봇 스크립트 실행 (Mozilla Rhino)
- [Mozilla Rhino](https://github.com/nicest/nicest) JS 엔진 (v1.7.14, ES6 지원)으로 `bot_script.js`를 실행
- 스크립트의 `response(room, msg, sender, isGroupChat, replier, ImageDB, packageName)` 함수를 호출
- 메신저봇과 **동일한 함수 시그니처** 유지

### 3. 자동 응답 (RemoteInput)
- 카카오톡 알림의 `RemoteInput` 액션을 찾아 프로그래밍 방식으로 답장
- `replier.reply("메시지")` 호출 시 해당 채팅방에 메시지 전송

### 4. 브릿지 시스템
| 메신저봇 API | KakaoBot 구현 |
|---|---|
| `org.jsoup.Jsoup.connect(url)` | OkHttp 기반 `JsoupConnection` |
| `DataBase.getDataBase(key)` | Android SharedPreferences |
| `DataBase.setDataBase(key, val)` | Android SharedPreferences |
| `replier.reply(msg)` | `RemoteInput` + `PendingIntent` |

### 5. 앱 내 스크립트 편집기
- 코드 직접 편집 (모노스페이스 에디터)
- 저장 / 저장+리로드 (Rhino 엔진 즉시 반영)
- 외부 .js/.txt 파일로 교체
- 기본값 복원 (assets 원본)

---

## 프로젝트 구조

```
app/src/main/
├── assets/
│   └── bot_script.js          # 기본 봇 스크립트
├── java/com/wook/kakaobot/
│   ├── KakaoBotApp.kt         # Application (알림 채널)
│   ├── model/
│   │   └── ChatMessage.kt     # 메시지 데이터 클래스
│   ├── engine/
│   │   ├── BotEngine.kt       # Rhino JS 엔진 (로드/실행/편집)
│   │   ├── ScriptBridge.kt    # JS 브릿지 주입
│   │   ├── JsoupBridge.kt     # Jsoup → OkHttp 브릿지
│   │   ├── DataBaseBridge.kt  # DataBase → SharedPreferences
│   │   ├── Replier.kt         # RemoteInput 응답
│   │   └── JsReplier.kt       # JS에서 호출 가능한 Replier
│   ├── service/
│   │   ├── KakaoNotificationListener.kt  # 알림 감지
│   │   └── BotForegroundService.kt       # 포그라운드 서비스
│   └── ui/
│       ├── MainActivity.kt              # 메인 화면
│       └── ScriptEditorActivity.kt      # 스크립트 편집기
└── res/layout/
    ├── activity_main.xml
    └── activity_script_editor.xml
```

---

## 빌드 방법

### 필요 환경
- **Android Studio** Hedgehog (2023.1.1) 이상
- **JDK 17**
- **Android SDK 34** (compileSdk)

### 빌드 순서
1. 이 저장소를 클론합니다
   ```bash
   git clone https://github.com/lee775/KakaoBot-Android.git
   ```
2. **Android Studio**로 프로젝트를 엽니다
3. Gradle Sync가 완료될 때까지 대기
4. `Build > Build Bundle(s) / APK(s) > Build APK(s)` 클릭
5. APK 위치: `app/build/outputs/apk/debug/app-debug.apk`

### 스마트폰 설치
1. 빌드된 APK를 폰으로 전송
2. 설정 > 알 수 없는 출처 허용
3. APK 설치

---

## 사용법

### 초기 설정
1. 앱 실행
2. **"알림 권한 설정"** → 알림 접근 권한 허용
3. **"배터리 최적화 해제"** → 백그라운드 유지
4. **"스크립트 로드"** → 봇 스크립트 로드
5. **봇 활성화 토글** ON

### 스크립트 편집
1. **"스크립트 편집기 열기"** 버튼 클릭
2. 코드 수정 후 **"저장+리로드"** → 즉시 반영
3. 외부 파일 교체: **"파일 교체"** → .js/.txt 파일 선택

---

## 의존성

| 라이브러리 | 버전 | 용도 |
|---|---|---|
| Mozilla Rhino | 1.7.14 | JavaScript 실행 엔진 |
| OkHttp | 4.12.0 | HTTP 요청 (Jsoup 대체) |
| Gson | 2.10.1 | JSON 파싱 |
| Material Design 3 | latest | UI 컴포넌트 |
| AndroidX | latest | 호환성 라이브러리 |

---

## 라이선스

개인 사용 목적 프로젝트입니다.
