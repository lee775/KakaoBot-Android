package com.wook.kakaobot.engine

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors
import kotlin.random.Random

/**
 * 메신저봇R MediaSender 클래스를 디컴파일 분석하여 포팅한 이미지 전송 브릿지.
 *
 * 핵심 동작 (Accessibility/Clipboard 사용 X):
 * 1) URL → /sdcard/Download/FloMessenger/media/ 임시 다운로드
 * 2) FileProvider.getUriForFile() → content:// URI
 * 3) Intent.ACTION_SEND_MULTIPLE + 카톡 비공개 extras:
 *    key_id = Long channelId / key_type = 1 / key_from_direct_share = true
 * 4) grantUriPermission("com.kakao.talk", uri, READ|WRITE)
 * 5) 앱 포어그라운드 강제 → 1초 뒤 PendingIntent 발사 → 3초 뒤 앱 복귀
 *
 * JS: MediaSender.send(channelId, url) / MediaSender.send(channelId, [url1, url2])
 */
class MediaSenderBridge(private val appContext: Context) {

    companion object {
        private const val TAG = "MediaSender"
        private const val FOREGROUND_DELAY_MS = 1000L
        private const val RETURN_TO_APP_DELAY_MS = 3000L
        private const val FILE_CLEANUP_DELAY_MS = 60000L
        private const val NETWORK_TIMEOUT_MS = 25000
        private const val KAKAO_PACKAGE = "com.kakao.talk"

        private val MIME_TYPE_MAP = mapOf(
            "jpg" to "image/jpeg", "jpeg" to "image/jpeg",
            "png" to "image/png", "gif" to "image/gif",
            "bmp" to "image/bmp", "webp" to "image/webp",
            "tif" to "image/tiff", "tiff" to "image/tiff", "svg" to "image/svg+xml",
            "mp4" to "video/mp4", "m4v" to "video/mp4", "avi" to "video/x-msvideo",
            "mov" to "video/quicktime", "wmv" to "video/x-ms-wmv",
            "mkv" to "video/x-matroska", "flv" to "video/x-flv",
            "webm" to "video/webm", "ogv" to "video/ogg",
            "mp3" to "audio/mpeg", "wav" to "audio/wav", "aac" to "audio/aac",
            "flac" to "audio/flac", "ogg" to "audio/ogg", "m4a" to "audio/mp4",
            "wma" to "audio/x-ms-wma", "opus" to "audio/opus"
        )
        private val CONTENT_TYPE_TO_EXT = mapOf(
            "image/jpeg" to "jpg", "image/jpg" to "jpg", "image/png" to "png",
            "image/gif" to "gif", "image/bmp" to "bmp", "image/webp" to "webp",
            "image/tiff" to "tiff", "image/svg+xml" to "svg",
            "video/mp4" to "mp4", "video/x-msvideo" to "avi",
            "video/quicktime" to "mov", "video/x-ms-wmv" to "wmv",
            "video/x-matroska" to "mkv", "video/x-flv" to "flv",
            "video/webm" to "webm", "video/ogg" to "ogv",
            "audio/mpeg" to "mp3", "audio/wav" to "wav", "audio/aac" to "aac",
            "audio/flac" to "flac", "audio/ogg" to "ogg", "audio/mp4" to "m4a",
            "audio/x-ms-wma" to "wma", "audio/opus" to "opus",
            "application/octet-stream" to "bin", "text/plain" to "txt"
        )
    }

    private data class CachedFile(val localPath: String, val mimeType: String)
    private data class FileData(
        val uri: Uri, val mimeType: String, val localPath: String, val isTemporary: Boolean
    )

    private val executor = Executors.newCachedThreadPool()
    private val downloadCache = mutableMapOf<String, CachedFile>()
    private val baseDirectory = File(
        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
        "FloMessenger/media"
    )
    private val fileProviderAuthority = "${appContext.packageName}.provider"
    private val mainHandler = Handler(Looper.getMainLooper())

    init { if (!baseDirectory.exists()) baseDirectory.mkdirs() }

    /** JS: MediaSender.send(channelId, url [, timeoutMs]) → Boolean */
    @JvmOverloads
    fun send(roomIdentifier: Any, mediaResource: Any, timeoutMs: Int = NETWORK_TIMEOUT_MS): Boolean {
        return try {
            val channelId = parseChannelId(roomIdentifier) ?: run {
                Log.e(TAG, "channelId 파싱 실패: $roomIdentifier"); return false
            }
            val paths = extractResourcePaths(mediaResource)
            if (paths.isEmpty()) { Log.e(TAG, "리소스 경로 비어있음"); return false }
            handleMultipleFiles(channelId, paths, timeoutMs)
        } catch (e: Exception) {
            Log.e(TAG, "send error: ${e.message}", e); false
        }
    }

    fun returnToAppNow(): Boolean = try { returnToApp(); true } catch (_: Exception) { false }
    fun getBaseDirectory(): String = baseDirectory.absolutePath
    fun getCacheSize(): Int = downloadCache.size
    fun getSupportedFormats(): Array<String> = MIME_TYPE_MAP.keys.toTypedArray()
    fun clearCache() {
        downloadCache.clear()
        baseDirectory.listFiles()?.forEach { if (it.isFile) try { it.delete() } catch (_: Exception) {} }
    }

    private fun handleMultipleFiles(channelId: Long, resourcePaths: List<String>, timeout: Int): Boolean {
        val futures = resourcePaths.map { p ->
            CompletableFuture.supplyAsync({ acquireFileData(p, timeout) }, executor)
        }
        val fileDataList = try { futures.mapNotNull { it.get() } }
            catch (e: Exception) { Log.e(TAG, "다운로드 실패: ${e.message}"); return false }
        if (fileDataList.isEmpty()) return false

        val uriList = ArrayList<Uri>(fileDataList.size)
        val tempPaths = mutableListOf<String>()
        for (fd in fileDataList) {
            uriList.add(fd.uri)
            if (fd.isTemporary) tempPaths.add(fd.localPath)
        }
        val intent = createMultipleSendIntent().apply {
            type = determineGroupMimeType(fileDataList)
            putParcelableArrayListExtra(Intent.EXTRA_STREAM, uriList)
            putExtra("key_id", channelId)
            putExtra("key_type", 1)
            putExtra("key_from_direct_share", true)
        }
        val ok = executeWithForegroundStrategy(intent, uriList)
        if (ok && tempPaths.isNotEmpty()) scheduleCleanup(tempPaths)
        return ok
    }

    private fun acquireFileData(resourcePath: String, timeout: Int): FileData? = try {
        if (resourcePath.startsWith("http://") || resourcePath.startsWith("https://"))
            downloadNetworkResource(resourcePath, timeout)
        else processLocalResource(resourcePath)
    } catch (e: Exception) { Log.e(TAG, "acquireFileData fail: ${e.message}"); null }

    private fun downloadNetworkResource(url: String, timeout: Int): FileData? {
        downloadCache[url]?.let { c ->
            val f = File(c.localPath)
            if (f.exists()) return FileData(createFileProviderUri(f), c.mimeType, c.localPath, false)
        }
        return try {
            val conn = URL(url).openConnection() as HttpURLConnection
            conn.connectTimeout = timeout
            conn.readTimeout = timeout
            conn.requestMethod = "GET"
            conn.setRequestProperty("User-Agent", "Mozilla/5.0")
            val ct = conn.contentType?.split(";")?.firstOrNull()?.trim()?.lowercase(Locale.ROOT)
            val (mime, ext) = determineTypeFromContentType(ct, url)
            val tempFile = createTemporaryFile(ext)
            conn.inputStream.use { input -> FileOutputStream(tempFile).use { input.copyTo(it) } }
            val fd = FileData(createFileProviderUri(tempFile), mime, tempFile.absolutePath, true)
            downloadCache[url] = CachedFile(tempFile.absolutePath, mime)
            fd
        } catch (e: Exception) { Log.e(TAG, "download fail [$url]: ${e.message}"); null }
    }

    private fun processLocalResource(filePath: String): FileData? {
        val f = File(filePath)
        if (!f.exists() || !f.canRead()) return null
        var ext = extractExtensionFromUrl(filePath)
        if (ext == "unknown") ext = "bin"
        return FileData(createFileProviderUri(f), getMimeTypeForExtension(ext), filePath, false)
    }

    private fun determineTypeFromContentType(contentType: String?, url: String): Pair<String, String> {
        if (contentType != null) CONTENT_TYPE_TO_EXT[contentType]?.let { return contentType to it }
        val urlExt = extractExtensionFromUrl(url)
        if (urlExt != "unknown") return getMimeTypeForExtension(urlExt) to urlExt
        return "application/octet-stream" to "bin"
    }

    private fun extractExtensionFromUrl(url: String): String {
        val dotIdx = url.lastIndexOf('.')
        val slashIdx = maxOf(url.lastIndexOf('/'), url.lastIndexOf('\\'))
        var queryIdx = url.indexOf('?', startIndex = dotIdx.coerceAtLeast(0))
        if (dotIdx <= slashIdx || dotIdx == -1) return "unknown"
        if (queryIdx == -1 || queryIdx <= dotIdx) queryIdx = url.length
        return url.substring(dotIdx + 1, queryIdx).lowercase(Locale.ROOT)
    }

    private fun getMimeTypeForExtension(ext: String): String =
        MIME_TYPE_MAP[ext.lowercase(Locale.ROOT)] ?: "application/octet-stream"

    private fun determineGroupMimeType(list: List<FileData>): String {
        val tops = list.map { it.mimeType.split("/").first() }.toSet()
        return when {
            tops.size == 1 && "image" in tops -> "image/*"
            tops.size == 1 && "video" in tops -> "video/*"
            else -> "*/*"
        }
    }

    private fun createMultipleSendIntent(): Intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
        setPackage(KAKAO_PACKAGE)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        addFlags(Intent.FLAG_ACTIVITY_MULTIPLE_TASK)
    }

    private fun createFileProviderUri(file: File): Uri = try {
        FileProvider.getUriForFile(appContext, fileProviderAuthority, file)
    } catch (e: Exception) {
        Log.w(TAG, "FileProvider 실패, file:// 폴백: ${e.message}")
        Uri.fromFile(file)
    }

    private fun createTemporaryFile(ext: String): File {
        val ts = System.currentTimeMillis()
        val rnd = Random.nextInt(10000, 99999)
        return File(baseDirectory, "media_${ts}_${rnd}.$ext")
    }

    private fun grantUriPermission(uri: Uri) {
        appContext.grantUriPermission(KAKAO_PACKAGE, uri,
            Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
    }

    private fun executeWithForegroundStrategy(intent: Intent, uriList: List<Uri>): Boolean = try {
        if (uriList.isEmpty()) false
        else {
            for (u in uriList) try { grantUriPermission(u) } catch (_: Exception) {}
            bringAppToForeground()
            mainHandler.postDelayed({
                try {
                    PendingIntent.getActivity(appContext, System.currentTimeMillis().toInt(), intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE).send()
                    scheduleReturnToApp()
                } catch (_: Exception) {
                    try { appContext.startActivity(intent); scheduleReturnToApp() }
                    catch (e2: Exception) { Log.e(TAG, "Intent 발사 실패: ${e2.message}") }
                }
            }, FOREGROUND_DELAY_MS)
            true
        }
    } catch (e: Exception) { Log.e(TAG, "executeWithForegroundStrategy: ${e.message}", e); false }

    private fun bringAppToForeground() {
        val launch = appContext.packageManager.getLaunchIntentForPackage(appContext.packageName) ?: return
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NO_HISTORY)
        try {
            PendingIntent.getActivity(appContext, System.currentTimeMillis().toInt(), launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE).send()
        } catch (_: Exception) {
            try { appContext.startActivity(launch) } catch (_: Exception) {}
        }
    }

    private fun scheduleReturnToApp() {
        mainHandler.postDelayed({ try { returnToApp() } catch (_: Exception) {} }, RETURN_TO_APP_DELAY_MS)
    }

    private fun returnToApp() {
        val launch = appContext.packageManager.getLaunchIntentForPackage(appContext.packageName) ?: return
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or
                Intent.FLAG_ACTIVITY_NO_HISTORY or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        try {
            PendingIntent.getActivity(appContext, System.currentTimeMillis().toInt(), launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE).send()
        } catch (_: Exception) {
            try { appContext.startActivity(launch) } catch (_: Exception) {}
        }
    }

    private fun scheduleCleanup(filePaths: List<String>) {
        executor.execute {
            try {
                Thread.sleep(FILE_CLEANUP_DELAY_MS)
                for (p in filePaths) try {
                    val f = File(p); if (f.exists()) f.delete()
                    downloadCache.entries.removeAll { it.value.localPath == p }
                } catch (_: Exception) {}
            } catch (_: InterruptedException) { Thread.currentThread().interrupt() }
        }
    }

    private fun parseChannelId(id: Any): Long? = when (id) {
        is Long -> id
        is Number -> id.toLong()
        is java.math.BigInteger -> id.toLong()
        is String -> id.toLongOrNull()
        else -> id.toString().toLongOrNull()
    }

    private fun extractResourcePaths(resource: Any): List<String> = when (resource) {
        is String -> listOf(resource)
        is Array<*> -> resource.filterIsInstance<String>()
        is Iterable<*> -> resource.filterIsInstance<String>()
        else -> try {
            val cls = resource.javaClass
            val getLength = cls.getMethod("getLength")
            val len = (getLength.invoke(resource) as Number).toInt()
            val getMethod = cls.getMethod("get", Int::class.javaPrimitiveType, Any::class.java)
            (0 until len).mapNotNull { i -> getMethod.invoke(resource, i, null) as? String }
        } catch (_: Exception) { listOf(resource.toString()) }
    }
}
