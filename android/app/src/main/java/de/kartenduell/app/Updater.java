package de.kartenduell.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Automatische Updates ohne Play Store:
 * 1. Beim Start wird version.json von der GitHub-Seite geladen.
 * 2. Ist dort ein höherer versionCode eingetragen, erscheint ein Dialog.
 * 3. „Jetzt aktualisieren“ lädt die neue APK herunter und öffnet die Installation.
 *    Weil jede Version mit demselben Schlüssel signiert ist, bleibt der Spielstand erhalten.
 */
class Updater {
    private static final String APK_NAME = "EinsatzDuell-update.apk";
    private final Activity act;
    private long downloadId = -1;
    private String pendingApkUrl;

    Updater(Activity act) { this.act = act; }

    /** silent = beim App-Start (keine Meldung, wenn alles aktuell ist) */
    void check(boolean silent) {
        new Thread(() -> {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(BuildConfig.UPDATE_URL + "?t=" + System.currentTimeMillis()).openConnection();
                c.setConnectTimeout(8000); c.setReadTimeout(8000); c.setUseCaches(false);
                StringBuilder sb = new StringBuilder();
                try (BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8))) {
                    String line; while ((line = r.readLine()) != null) sb.append(line);
                }
                JSONObject j = new JSONObject(sb.toString());
                int remote = j.optInt("versionCode", 0);
                String name = j.optString("versionName", "?");
                String apk = j.optString("apk", "");
                String notes = j.optString("notes", "");
                act.runOnUiThread(() -> {
                    if (remote > BuildConfig.VERSION_CODE && !apk.isEmpty()) offer(name, notes, apk);
                    else if (!silent) Toast.makeText(act, "Du hast die neueste Version (" + BuildConfig.VERSION_NAME + ")", Toast.LENGTH_LONG).show();
                });
            } catch (Exception e) {
                if (!silent) act.runOnUiThread(() -> Toast.makeText(act, "Update-Prüfung nicht möglich – bist du online?", Toast.LENGTH_LONG).show());
            }
        }).start();
    }

    private void offer(String name, String notes, String apk) {
        if (act.isFinishing()) return;
        String msg = "Version " + name + " ist da (du hast " + BuildConfig.VERSION_NAME + ")."
                + (notes.isEmpty() ? "" : "\n\nNeu:\n" + notes)
                + "\n\nDein Spielstand bleibt erhalten.";
        new AlertDialog.Builder(act)
                .setTitle("🚨 Update verfügbar")
                .setMessage(msg)
                .setPositiveButton("Jetzt aktualisieren", (d, w) -> startDownload(apk))
                .setNegativeButton("Später", null)
                .show();
    }

    private void startDownload(String apkUrl) {
        // Android 8+: Erlaubnis „Unbekannte Apps installieren“ für diese App nötig
        if (Build.VERSION.SDK_INT >= 26 && !act.getPackageManager().canRequestPackageInstalls()) {
            pendingApkUrl = apkUrl;
            Toast.makeText(act, "Bitte „Aus dieser Quelle zulassen“ aktivieren und zurückkehren.", Toast.LENGTH_LONG).show();
            act.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + act.getPackageName())));
            return;
        }
        File old = new File(act.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), APK_NAME);
        if (old.exists()) old.delete();
        DownloadManager dm = (DownloadManager) act.getSystemService(Context.DOWNLOAD_SERVICE);
        DownloadManager.Request req = new DownloadManager.Request(Uri.parse(apkUrl))
                .setTitle("Einsatz-Duell Update")
                .setDescription("Neue Version wird geladen …")
                .setMimeType("application/vnd.android.package-archive")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalFilesDir(act, Environment.DIRECTORY_DOWNLOADS, APK_NAME);
        downloadId = dm.enqueue(req);
        Toast.makeText(act, "Update wird geladen …", Toast.LENGTH_SHORT).show();

        BroadcastReceiver done = new BroadcastReceiver() {
            @Override public void onReceive(Context ctx, Intent intent) {
                long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (id != downloadId) return;
                try { act.unregisterReceiver(this); } catch (Exception ignored) {}
                Uri uri = dm.getUriForDownloadedFile(id);
                if (uri == null) { Toast.makeText(act, "Download fehlgeschlagen", Toast.LENGTH_LONG).show(); return; }
                Intent install = new Intent(Intent.ACTION_VIEW);
                install.setDataAndType(uri, "application/vnd.android.package-archive");
                install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                act.startActivity(install);
            }
        };
        IntentFilter f = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= 33) act.registerReceiver(done, f, Context.RECEIVER_EXPORTED);
        else act.registerReceiver(done, f);
    }

    /** Nach Rückkehr aus den Einstellungen den Download fortsetzen */
    void onResume() {
        if (pendingApkUrl != null && Build.VERSION.SDK_INT >= 26 && act.getPackageManager().canRequestPackageInstalls()) {
            String u = pendingApkUrl; pendingApkUrl = null; startDownload(u);
        }
    }
}
