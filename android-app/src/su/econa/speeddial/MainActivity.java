package su.econa.speeddial;

import android.app.*;
import android.os.*;
import android.content.*;
import android.net.Uri;
import android.webkit.*;
import android.view.*;
import android.widget.*;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.hardware.display.DisplayManager;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import org.json.*;
import java.io.*;
import java.net.*;
import okhttp3.*;
import java.util.*;
import java.util.concurrent.*;

/** Trusted bundled pages only. External URLs always leave the bridged WebViews. */
public class MainActivity extends Activity {
    static final boolean DEBUG_WEBVIEW = false;
    static final String ORIGIN = "https://appassets.androidplatform.net/";
    WebView ui, bg;
    LinearLayout root;
    boolean ready;
    String sharedText;
    ValueCallback<Uri[]> fileCallback;
    byte[] exportBytes;
    String exportName;
    final ExecutorService io = Executors.newFixedThreadPool(4);
    final Map<String, Call> connections = new ConcurrentHashMap<>();
    final OkHttpClient client = new OkHttpClient.Builder().followRedirects(false).followSslRedirects(false).connectTimeout(15,TimeUnit.SECONDS).readTimeout(30,TimeUnit.SECONDS).build();
    final Map<String, String> session = new HashMap<>();
    final List<String> pendingMessages = new ArrayList<>();
    SharedPreferences prefs;
    SQLiteDatabase database;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        prefs = getSharedPreferences("extension", MODE_PRIVATE);
        database=openOrCreateDatabase("speeddial.sqlite",MODE_PRIVATE,null);
        database.execSQL("CREATE TABLE IF NOT EXISTS items (store TEXT NOT NULL, k TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(store,k))");
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
        root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(0xff101720);
        root.setFitsSystemWindows(true);
        setContentView(root);
        bg = createWebView(true); ui = createWebView(false);
        root.addView(ui, new LinearLayout.LayoutParams(-1, -1));
        // Detached background engine lives for this activity; no perpetual background service.
        bg.loadUrl(ORIGIN + "android-background.html");
        ui.loadDataWithBaseURL(ORIGIN, "<body style='background:#101720;color:#eee;font:18px sans-serif;padding:24px'>Private SpeedDial…</body>", "text/html", "UTF-8", null);
        readShare(getIntent());
        WebView.setWebContentsDebuggingEnabled(DEBUG_WEBVIEW);
    }

    WebView createWebView(boolean background) {
        WebView w = new WebView(this);
        w.setBackgroundColor(0xff101720);
        WebSettings s = w.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false); s.setAllowContentAccess(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSupportMultipleWindows(false); s.setJavaScriptCanOpenWindowsAutomatically(false);
        w.addJavascriptInterface(new Bridge(w, background), "AndroidHost");
        w.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (!"appassets.androidplatform.net".equals(u.getHost())) return null;
                String path = u.getPath().substring(1);
                if (path.contains("..") || path.contains("\\") || path.isEmpty()) return denied();
                try {
                    String mime = path.endsWith(".js") ? "application/javascript" : path.endsWith(".css") ? "text/css" : path.endsWith(".html") ? "text/html" : path.endsWith(".json") ? "application/json" : path.endsWith(".png") ? "image/png" : "image/jpeg";
                    Map<String,String> headers = new HashMap<>();
                    headers.put("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: http: data: blob:; connect-src 'self' https: http: data: blob:; worker-src 'self' blob:; object-src 'none'; frame-src 'none'; base-uri 'self'");
                    return new WebResourceResponse(mime, "UTF-8", 200, "OK", headers, getAssets().open("www/" + path));
                } catch(Exception e) { return denied(); }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                String url = r.getUrl().toString();
                if (isInternal(url) && !background) return false;
                open(url); return true;
            }
        });
        w.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage m) {
                if (DEBUG_WEBVIEW && m.messageLevel() == ConsoleMessage.MessageLevel.ERROR) android.util.Log.e("SpeedDialJS", m.sourceId() + ":" + m.lineNumber() + " " + m.message());
                return true;
            }
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                String[] types = p.getAcceptTypes();
                if (types != null && types.length == 1 && types[0].contains("/") && !types[0].contains(",")) i.setType(types[0]);
                i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                try { startActivityForResult(i, 10); } catch(Exception e) { cb.onReceiveValue(null); fileCallback = null; }
                return true;
            }
            @Override public boolean onJsAlert(WebView v, String url, String message, JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton(tr("ok"), (d,x)->result.confirm()).setOnCancelListener(d->result.cancel()).show(); return true;
            }
            @Override public boolean onJsConfirm(WebView v, String url, String message, JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton(tr("ok"), (d,x)->result.confirm()).setNegativeButton(tr("cancel"), (d,x)->result.cancel()).setOnCancelListener(d->result.cancel()).show(); return true;
            }
        });
        return w;
    }
    WebResourceResponse denied() { return new WebResourceResponse("text/plain", "UTF-8", 404, "Not found", Collections.emptyMap(), new ByteArrayInputStream(new byte[0])); }
    boolean isInternal(String url) {
        try { Uri u = Uri.parse(url); return "https".equals(u.getScheme()) && "appassets.androidplatform.net".equals(u.getHost()) && (u.getPort() == -1 || u.getPort() == 443); } catch(Exception e) { return false; }
    }
    void js(WebView w, String code) { runOnUiThread(()-> { if (!isFinishing()) w.evaluateJavascript(code, null); }); }
    void open(String url) {
        runOnUiThread(()-> {
            if (isInternal(url)) { if (ready) ui.loadUrl(url); return; }
            Uri uri = Uri.parse(url); String scheme = uri.getScheme();
            if (!Arrays.asList("http", "https", "mailto", "tel").contains(scheme)) return;
            try { startActivity(new Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE)); }
            catch(ActivityNotFoundException e) { Toast.makeText(this, tr("noLinkApp"), Toast.LENGTH_LONG).show(); }
        });
    }
    @Override public void onNewIntent(Intent i) { super.onNewIntent(i); setIntent(i); readShare(i); if (ready) showHome(); }
    void readShare(Intent i) { if (Intent.ACTION_SEND.equals(i.getAction())) sharedText = i.getStringExtra(Intent.EXTRA_TEXT); }
    void showHome() {
        String url = ORIGIN + "newtab.html";
        if (sharedText != null) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("https?://[^\\s]+", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(sharedText);
            if (m.find()) url += "?addTile=" + Uri.encode(m.group());
            sharedText = null;
        }
        ui.loadUrl(url);
    }
    String tr(String key) {
        try { return new JSONObject(prefs.getString("androidUiTranslations", "{}")).optString(key, key); }
        catch(JSONException e) { return key; }
    }
    @Override public void onBackPressed() {
        final boolean onHome = ui.getUrl() != null && ui.getUrl().contains("newtab.html");
        ui.evaluateJavascript("window.androidBack ? androidBack() : false", value -> {
            if (!"true".equals(value)) { if (onHome) super.onBackPressed(); else showHome(); }
        });
    }
    @Override protected void onActivityResult(int req, int result, Intent data) {
        super.onActivityResult(req, result, data);
        if (req == 10 && fileCallback != null) {
            Uri[] uris = null;
            if (result == RESULT_OK && data != null) {
                if (data.getClipData() != null) { ClipData c = data.getClipData(); uris = new Uri[c.getItemCount()]; for(int i=0;i<uris.length;i++) uris[i]=c.getItemAt(i).getUri(); }
                else if (data.getData() != null) uris = new Uri[]{data.getData()};
            }
            fileCallback.onReceiveValue(uris); fileCallback = null;
        }
        if (req == 11 && exportBytes != null) {
            final byte[] bytes = exportBytes; exportBytes = null;
            if (result == RESULT_OK && data != null && data.getData() != null) {
                final Uri uri=data.getData(); io.execute(()-> {
                    try(OutputStream out=getContentResolver().openOutputStream(uri, "wt")) { out.write(bytes); runOnUiThread(()->Toast.makeText(this,tr("fileSaved"),Toast.LENGTH_SHORT).show()); }
                    catch(Exception e) { runOnUiThread(()->Toast.makeText(this,tr("fileSaveError"),Toast.LENGTH_LONG).show()); }
                });
            }
        }
    }
    @Override protected void onDestroy() { ui.destroy(); bg.destroy(); io.shutdownNow(); for(Call c:connections.values()) c.cancel(); super.onDestroy(); }

    class Bridge {
        final WebView view; final boolean background;
        Bridge(WebView w, boolean b) { view=w; background=b; }
        String savedPayload(String store,String key) {
            int length;
            try(Cursor cursor=database.rawQuery("SELECT length(payload) FROM items WHERE store=? AND k=?",new String[]{store,key})) {
                if(!cursor.moveToFirst())return null;length=cursor.getInt(0);
            }
            StringBuilder text=new StringBuilder(length);
            for(int offset=1;offset<=length;offset+=131072) {
                try(Cursor cursor=database.rawQuery("SELECT substr(payload,?,131072) FROM items WHERE store=? AND k=?",new String[]{String.valueOf(offset),store,key})) {if(cursor.moveToFirst())text.append(cursor.getString(0));}
            }
            return text.toString();
        }
        @JavascriptInterface public String databaseGet(String store,String key) {
            synchronized(database) {
                try {String text=savedPayload(store,key);JSONObject result=new JSONObject();result.put("found",text!=null);if(text!=null)result.put("value",new JSONTokener(text).nextValue());return result.toString();}
                catch(JSONException e){throw new IllegalStateException("Invalid saved data");}
            }
        }
        void writeDatabase(String store,String key,String json,boolean onlyMissing) {
            try{new JSONTokener(json).nextValue();}catch(JSONException e){throw new IllegalArgumentException("Invalid data");}
            synchronized(database) {
                database.beginTransaction();
                try{database.execSQL((onlyMissing?"INSERT OR IGNORE":"INSERT OR REPLACE")+" INTO items(store,k,payload) VALUES(?,?,?)",new Object[]{store,key,json});database.setTransactionSuccessful();}
                finally{database.endTransaction();}
            }
        }
        @JavascriptInterface public void databasePut(String store,String key,String json){writeDatabase(store,key,json,false);}
        @JavascriptInterface public void databaseImport(String store,String key,String json){writeDatabase(store,key,json,true);}
        @JavascriptInterface public String databaseAll(String store) {
            synchronized(database) {
                try(Cursor cursor=database.rawQuery("SELECT k FROM items WHERE store=?",new String[]{store})) {
                    JSONObject result=new JSONObject();while(cursor.moveToNext()){String key=cursor.getString(0);result.put(key,new JSONTokener(savedPayload(store,key)).nextValue());}return result.toString();
                }catch(JSONException e){throw new IllegalStateException("Invalid saved data");}
            }
        }
        @JavascriptInterface public void setUiTranslations(String json) {
            try { new JSONObject(json); if (!json.equals(prefs.getString("androidUiTranslations", ""))) prefs.edit().putString("androidUiTranslations", json).commit(); }
            catch(JSONException e) { throw new IllegalArgumentException("Invalid translations"); }
        }
        @JavascriptInterface public String storage(String area) { synchronized(session) { return area.equals("session") ? session.getOrDefault(area,"{}") : prefs.getString(area,"{}"); } }
        @JavascriptInterface public void store(String area, String value, String changes) {
            String actualChanges;
            synchronized(session) {
                try {
                    JSONObject all = new JSONObject(area.equals("session") ? session.getOrDefault(area,"{}") : prefs.getString(area,"{}"));
                    JSONObject delta = new JSONObject(changes), actual = new JSONObject();
                    for(Iterator<String> it=delta.keys();it.hasNext();) {
                        String k=it.next(); JSONObject entry=delta.getJSONObject(k), change=new JSONObject();
                        if(all.has(k))change.put("oldValue",all.get(k));
                        if(entry.has("newValue")){all.put(k,entry.get("newValue"));change.put("newValue",entry.get("newValue"));} else all.remove(k);
                        actual.put(k,change);
                    }
                    String merged=all.toString();
                    if (area.equals("session")) session.put(area,merged); else if(!prefs.edit().putString(area,merged).commit())throw new IllegalStateException("Storage write failed");
                    actualChanges=actual.toString();
                } catch(JSONException e) { throw new IllegalArgumentException("Invalid storage data"); }
            }
            String code="window.__storageChanged && __storageChanged("+actualChanges+","+JSONObject.quote(area)+")";
            js(ui,code); js(bg,code);
        }
        @JavascriptInterface public void message(String id, String message) {
            String code="__receiveMessage("+JSONObject.quote(id)+","+message+")";
            runOnUiThread(()-> { if(ready) bg.evaluateJavascript(code,null); else pendingMessages.add(code); });
        }
        @JavascriptInterface public void reply(String id, String result) { js(ui,"__nativeReply("+JSONObject.quote(id)+","+result+")"); }
        @JavascriptInterface public void notifyUI(String message) { js(ui,"window.__notify && __notify("+message+")"); }
        @JavascriptInterface public void shareApp(String title) {
            runOnUiThread(() -> {
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_SUBJECT, "Private SpeedDial");
                intent.putExtra(Intent.EXTRA_TEXT, "Private SpeedDial\nhttps://github.com/rukazax/Private_SpeedDial");
                startActivity(Intent.createChooser(intent, title));
            });
        }
        @JavascriptInterface public void openUrl(String url) { open(url); }
        @JavascriptInterface public String currentUrl() { return ORIGIN+"newtab.html"; }
        @JavascriptInterface public int primaryScreenWidth() {
            DisplayManager manager=(DisplayManager)getSystemService(DISPLAY_SERVICE);
            Display display=manager.getDisplay(Display.DEFAULT_DISPLAY);
            DisplayMetrics metrics=new DisplayMetrics();
            if(display!=null)display.getRealMetrics(metrics);else metrics.setTo(getResources().getDisplayMetrics());
            int observed=Math.max(1,Math.round(Math.min(metrics.widthPixels,metrics.heightPixels)/metrics.density));
            int stored=prefs.getInt("coverWidthDp",0);
            if(stored==0)stored=observed>=600?360:observed;
            int reference=Math.min(stored,observed);
            if(reference!=prefs.getInt("coverWidthDp",0))prefs.edit().putInt("coverWidthDp",reference).commit();
            return reference;
        }
        @JavascriptInterface public void reloadUI() { runOnUiThread(()->ui.reload()); }
        @JavascriptInterface public void home() { runOnUiThread(()->showHome()); }
        @JavascriptInterface public void backgroundReady() { runOnUiThread(()-> { ready=true; showHome(); for(String c:pendingMessages) bg.evaluateJavascript(c,null); pendingMessages.clear(); }); }
        @JavascriptInterface public void download(String filename, String mime, String b64) {
            if (background) return;
            runOnUiThread(()-> {
                if (exportBytes != null) { Toast.makeText(MainActivity.this,tr("filePending"),Toast.LENGTH_SHORT).show(); return; }
                try {
                    exportBytes=Base64.decode(b64,Base64.DEFAULT); exportName=filename.replaceAll("[/\\\\]","_");
                    Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(mime.isEmpty()?"application/octet-stream":mime).putExtra(Intent.EXTRA_TITLE,exportName);
                    startActivityForResult(intent,11);
                } catch(Exception e) { exportBytes=null; }
            });
        }
        @JavascriptInterface public void cancelHttp(String id) { Call c=connections.remove(id);if(c!=null)c.cancel(); }
        @JavascriptInterface public void http(String id,String request) {
            io.execute(()-> {
                JSONObject result=new JSONObject();
                try {
                    JSONObject r=new JSONObject(request);URL url=new URL(r.getString("url"));
                    if(!Arrays.asList("http","https").contains(url.getProtocol()))throw new IOException("Unsupported protocol");
                    String method=r.optString("method","GET");JSONObject headers=r.optJSONObject("headers");
                    byte[] body=r.isNull("body")?null:Base64.decode(r.optString("body"),Base64.DEFAULT);
                    for(int redirect=0;redirect<6;redirect++) {
                        Request.Builder builder=new Request.Builder().url(url);
                        if(headers!=null)for(Iterator<String> it=headers.keys();it.hasNext();) {String k=it.next();if(!k.equalsIgnoreCase("host")&&!k.equalsIgnoreCase("content-length"))builder.header(k,headers.getString(k));}
                        RequestBody payload=Arrays.asList("GET","HEAD").contains(method)?null:RequestBody.create(body==null?new byte[0]:body,(MediaType)null);
                        builder.method(method,payload);
                        Call call=client.newCall(builder.build());connections.put(id,call);
                        try(Response response=call.execute()) {
                            int status=response.code();String location=response.header("Location");
                            if(Arrays.asList(301,302,303,307,308).contains(status)&&location!=null) {
                                if(r.optString("redirect").equals("error"))throw new IOException("Redirect not permitted");
                                URL next=new URL(url,location);
                                if(!Arrays.asList("https","http").contains(next.getProtocol())||(url.getProtocol().equals("https")&&next.getProtocol().equals("http")))throw new IOException("Unsafe redirect");
                                if(!url.getHost().equalsIgnoreCase(next.getHost())||url.getPort()!=next.getPort()||!url.getProtocol().equals(next.getProtocol()))if(headers!=null)for(String k:new String[]{"Authorization","authorization","Cookie","cookie"})headers.remove(k);
                                if(status==303||((status==301||status==302)&&method.equals("POST"))){method="GET";body=null;}
                                url=next;continue;
                            }
                            ByteArrayOutputStream bytes=new ByteArrayOutputStream();
                            if(response.body()!=null)try(InputStream stream=response.body().byteStream()) {byte[] buf=new byte[16384];int n;while((n=stream.read(buf))!=-1){bytes.write(buf,0,n);if(bytes.size()>64*1024*1024)throw new IOException("Response exceeds 64 MB");}}
                            JSONObject h=new JSONObject();for(String k:response.headers().names())h.put(k,String.join(", ",response.headers(k)));
                            result.put("status",status);result.put("headers",h);result.put("body",Base64.encodeToString(bytes.toByteArray(),Base64.NO_WRAP));result.put("url",url.toString());break;
                        }
                    }
                    if(!result.has("status"))throw new IOException("Too many redirects");
                }catch(Exception e){try{result.put("error",e instanceof java.net.SocketTimeoutException?"Network timeout":"Network request failed ("+e.getClass().getSimpleName()+")");}catch(Exception ignored){}}
                finally{connections.remove(id);}
                js(view,"__httpReply("+JSONObject.quote(id)+","+result.toString()+")");
            });
        }
    }
}
