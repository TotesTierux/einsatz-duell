package de.kartenduell.app;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Hülle für das HTML5-Spiel (assets/index.html).
 * - speichert Karten dauerhaft (localStorage)
 * - erlaubt Bild-Upload aus Galerie/Kamera für eigene Karten
 * - Zurück-Taste wird an das Spiel weitergereicht
 * - Export der Karten als JSON in den Download-Ordner
 */
public class MainActivity extends Activity {
    private static final int FILE_REQ = 42;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private Updater updater;
    private String pendingInvite;     // Raumcode aus einem Einladungslink
    private boolean pageReady = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(0xFF1B1035);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage für Karten & Deck
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);                    // System-Schriftgröße soll Layout nicht sprengen

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                try {
                    startActivityForResult(params.createIntent(), FILE_REQ);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        pendingInvite = inviteCode(getIntent());
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/index.html");
        // Version der App an das Spiel weitergeben (Anzeige im Menü)
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) {
                v.evaluateJavascript("window.APP_VERSION='" + BuildConfig.VERSION_NAME + "';var e=document.getElementById('appVer');if(e)e.textContent='Version '+window.APP_VERSION+' · 69 Effekte';", null);
                pageReady = true;
                deliverInvite();
            }
        });
        hideSystemBars();

        // Automatische Update-Prüfung kurz nach dem Start
        updater = new Updater(this);
        web.postDelayed(() -> updater.check(true), 2500);
    }

    /** Liest den Raumcode aus einsatzduell://join/CODE */
    private String inviteCode(Intent i) {
        if (i == null || i.getData() == null) return null;
        Uri u = i.getData();
        if (!"einsatzduell".equals(u.getScheme())) return null;
        String code = u.getLastPathSegment();
        if (code == null) return null;
        code = code.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        return code.length() == 5 ? code : null;
    }

    private void deliverInvite() {
        if (pendingInvite == null || !pageReady) return;
        final String code = pendingInvite;
        pendingInvite = null;
        web.postDelayed(() -> web.evaluateJavascript("window.openInvite && window.openInvite('" + code + "')", null), 600);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String code = inviteCode(intent);
        if (code != null) { pendingInvite = code; deliverInvite(); }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (updater != null) updater.onResume();
    }

    private void hideSystemBars() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == FILE_REQ && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCallback = null;
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.onAndroidBack ? window.onAndroidBack() : false", value -> {
            if (!"true".equals(value)) MainActivity.super.onBackPressed();
        });
    }

    /** Wird aus JavaScript als window.AndroidBridge aufgerufen */
    class Bridge {
        @JavascriptInterface
        public void share(String text) {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(i, "Einladung teilen"));
            });
        }

        @JavascriptInterface
        public void copy(String text) {
            runOnUiThread(() -> {
                android.content.ClipboardManager cm = (android.content.ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                if (cm != null) cm.setPrimaryClip(android.content.ClipData.newPlainText("Einladung", text));
            });
        }

        @JavascriptInterface
        public void checkUpdate() { runOnUiThread(() -> updater.check(false)); }

        @JavascriptInterface
        public String version() { return BuildConfig.VERSION_NAME; }

        @JavascriptInterface
        public void saveFile(String name, String content) {
            runOnUiThread(() -> {
                try {
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues v = new ContentValues();
                        v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                        v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                        v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                        Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                        try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                            os.write(content.getBytes(StandardCharsets.UTF_8));
                        }
                        Toast.makeText(MainActivity.this, "Gespeichert in Downloads: " + name, Toast.LENGTH_LONG).show();
                    } else {
                        Intent i = new Intent(Intent.ACTION_SEND);
                        i.setType("application/json");
                        i.putExtra(Intent.EXTRA_TEXT, content);
                        startActivity(Intent.createChooser(i, "Karten exportieren"));
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Export fehlgeschlagen: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }
    }
}
