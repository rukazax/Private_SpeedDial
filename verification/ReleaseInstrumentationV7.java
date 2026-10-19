package su.econa.speeddial.test;

import android.app.*;
import android.content.*;
import android.os.*;
import android.view.*;
import android.webkit.*;
import org.json.*;
import java.util.concurrent.*;

/** Verifies the exact signed delivery APK without exposing WebView debugging. */
public class ReleaseInstrumentationV7 extends Instrumentation {
    Activity activity;
    WebView web;
    WebView find(View v) {
        if(v instanceof WebView)return (WebView)v;
        if(v instanceof ViewGroup)for(int i=0;i<((ViewGroup)v).getChildCount();i++){WebView w=find(((ViewGroup)v).getChildAt(i));if(w!=null)return w;}
        return null;
    }
    String evaluate(String code) throws Exception {
        final String[] result={null};final CountDownLatch done=new CountDownLatch(1);
        runOnMainSync(()->web.evaluateJavascript(code,value->{result[0]=value;done.countDown();}));
        if(!done.await(10,TimeUnit.SECONDS))throw new Exception("WebView evaluation timeout");
        return result[0];
    }
    @Override public void onCreate(Bundle args){super.onCreate(args);start();}
    @Override public void onStart() {
        Bundle report=new Bundle();
        try {
            Intent launch=new Intent().setClassName("su.econa.speeddial","su.econa.speeddial.MainActivity").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity=startActivitySync(launch);
            runOnMainSync(()->web=find(activity.getWindow().getDecorView()));
            boolean ready=false;
            for(int i=0;i<120;i++){if("true".equals(evaluate("!!window._speedDial && _speedDial.tiles.length>=2"))){ready=true;break;}Thread.sleep(250);}
            if(!ready)throw new Exception("Home screen failed to initialise");
            evaluate("window.__releaseCheck='pending'; (async()=>{const d=await loadDataFromIDB(); const prior=!!d.notes.find(n=>n.id==='release-persistence'); const checks={secureOrigin:isSecureContext,noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,bookmarksLoaded:d.tiles.length>=2,persistenceFromPreviousRun:prior}; if(!prior){d.notes.push({id:'release-persistence',title:'Release verification',content:'Тест сохранения',createdAt:Date.now(),updatedAt:Date.now()});await saveDataToIDB(d);} checks.sqliteWrite=(await loadDataFromIDB()).notes.some(n=>n.id==='release-persistence');const large=await idbGet('backgrounds','release-large');checks.largeRecordFromPreviousRun=large?.text?.length===1400000;if(!large)await idbPut('backgrounds','release-large',{text:'Ж'.repeat(1400000)});checks.largeSqliteRead=(await idbGet('backgrounds','release-large')).text.length===1400000; const s=await chrome.runtime.sendMessage({action:'getSyncState'}); checks.nativeBackgroundMessaging=!!s; const h=await hashFolderPassword('release-fixture');checks.passwordHashing=await verifyFolderPassword('release-fixture',h)&&!await verifyFolderPassword('wrong',h); const p=await encryptData({text:'Android release'},'release-fixture');checks.cryptoRoundtrip=(await decryptData(p,'release-fixture')).text==='Android release';window.__releaseCheck=checks;})().catch(e=>window.__releaseCheck={error:e.message});");
            String json=null;
            for(int i=0;i<120;i++) {
                String value=evaluate("JSON.stringify(window.__releaseCheck)");
                if(value!=null&&!value.equals("null")) {
                    String decoded=(String)new JSONTokener(value).nextValue();
                    if(decoded.startsWith("{")){json=decoded;break;}
                }
                Thread.sleep(250);
            }
            if(json==null)throw new Exception("Release checks timed out");
            JSONObject checks=new JSONObject(json);
            for(String key:new String[]{"secureOrigin","noHorizontalOverflow","bookmarksLoaded","sqliteWrite","largeSqliteRead","nativeBackgroundMessaging","passwordHashing","cryptoRoundtrip"})if(!checks.optBoolean(key))throw new Exception("Failed "+key+": "+json);
            if ((activity.getWindow().getAttributes().flags & WindowManager.LayoutParams.FLAG_SECURE) == 0) throw new Exception("FLAG_SECURE missing");
            if ((activity.getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) throw new Exception("Delivery APK is debuggable");
            checks.put("secureFlag",true);checks.put("notDebuggable",true);json=checks.toString();
            final LinkedBlockingQueue<String> links = new LinkedBlockingQueue<>();
            ActivityMonitor monitor = new ActivityMonitor() {
                @Override public ActivityResult onStartActivity(Intent intent) {
                    if (Intent.ACTION_VIEW.equals(intent.getAction()) && ("https://github.com/rukazax/Private_SpeedDial".equals(intent.getDataString()) || "https://github.com/rukazax/Private_SpeedDial/releases/latest".equals(intent.getDataString()))) {
                        links.offer(intent.getDataString()); return new ActivityResult(Activity.RESULT_OK,null);
                    }
                    return null;
                }
            };
            addMonitor(monitor);
            if(!"true".equals(evaluate("document.getElementById('androidBrowserExtension').textContent===tui('projectDownloadExtension') && tui('projectDownloadExtension')!=='projectDownloadExtension'")))throw new Exception("Download menu label not translated");
            checks.put("downloadMenuLabelTranslated",true);
            evaluate("document.getElementById('androidBrowserExtension').click();true");
            if(!"https://github.com/rukazax/Private_SpeedDial/releases/latest".equals(links.poll(5,TimeUnit.SECONDS)))throw new Exception("Menu extension download page failed");
            checks.put("menuDownloadLinkOpensGitHubReleasePage",true);
            evaluate("AndroidHost.openUrl(chrome.runtime.getURL('options.html'));true");
            for(int i=0;i<80;i++){if("true".equals(evaluate("!!window._settingsPage")))break;Thread.sleep(100);}
            evaluate("document.querySelector('.support-header .browser-extension-link').click();true");
            if(links.poll(5,TimeUnit.SECONDS)==null)throw new Exception("Header extension link failed");
            evaluate("document.querySelector('footer .browser-extension-link').click();true");
            if(links.poll(5,TimeUnit.SECONDS)==null)throw new Exception("Footer extension link failed");
            final LinkedBlockingQueue<Intent> shares = new LinkedBlockingQueue<>();
            ActivityMonitor shareMonitor = new ActivityMonitor() {
                @Override public ActivityResult onStartActivity(Intent intent) {
                    if (Intent.ACTION_CHOOSER.equals(intent.getAction())) {shares.offer(intent);return new ActivityResult(Activity.RESULT_OK,null);}
                    return null;
                }
            };
            addMonitor(shareMonitor);
            for(int i=0;i<80;i++){if("true".equals(evaluate("!!document.getElementById('projectShare')")))break;Thread.sleep(100);}
            evaluate("document.getElementById('projectShare').click();true");
            Intent chooser=shares.poll(5,TimeUnit.SECONDS);
            if(chooser==null)throw new Exception("Share chooser not opened");
            Intent share=(Intent)chooser.getParcelableExtra(Intent.EXTRA_INTENT);
            if(share==null || !Intent.ACTION_SEND.equals(share.getAction()) || !"text/plain".equals(share.getType()) ||
                !"Private SpeedDial\nhttps://github.com/rukazax/Private_SpeedDial".equals(share.getStringExtra(Intent.EXTRA_TEXT)))throw new Exception("Invalid public share payload");
            checks.put("shareUsesNativeChooserAndPublicRepositoryOnly",true);removeMonitor(shareMonitor);
            if(!"\"6.10.1\"".equals(evaluate("chrome.runtime.getManifest().version")))throw new Exception("Wrong APK version");
            checks.put("releaseVersion6101",true);
            final LinkedBlockingQueue<String> updates = new LinkedBlockingQueue<>();
            ActivityMonitor updateMonitor = new ActivityMonitor() {
                @Override public ActivityResult onStartActivity(Intent intent) {
                    if(Intent.ACTION_VIEW.equals(intent.getAction()) && "https://github.com/rukazax/Private_SpeedDial/releases/download/v6.11.0/Private-SpeedDial-Android.apk".equals(intent.getDataString())) {
                        updates.offer(intent.getDataString());return new ActivityResult(Activity.RESULT_OK,null);
                    }
                    return null;
                }
            };
            addMonitor(updateMonitor);
            evaluate("window.__updateBackup='pending';(async()=>{window.__updateBackup=await chrome.storage.local.get('projectUpdateState');const P=SpeedDialProject,tag='v6.11.0',name=P.androidAsset;await chrome.storage.local.set({projectUpdateState:{lastAttemptAt:Date.now(),release:{tag,url:P.repository+'/releases/tag/'+tag,assets:{[name]:P.repository+'/releases/download/'+tag+'/'+name}}}});await chrome.storage.session.remove('projectUpdatePrompt');AndroidHost.home();})()");
            for(int i=0;i<120;i++){if("true".equals(evaluate("!!document.querySelector('.dialog-backdrop')")))break;Thread.sleep(100);}
            evaluate("document.querySelectorAll('.dialog-backdrop button')[1].click();true");
            if(updates.poll(5,TimeUnit.SECONDS)==null)throw new Exception("Update button failed to open exact APK");
            removeMonitor(updateMonitor);checks.put("updateButtonOpensTrustedApkExternalIntent",true);
            evaluate("(async()=>{await chrome.storage.local.set({projectUpdateState:{lastAttemptAt:Date.now()}});await chrome.storage.session.remove('projectUpdatePrompt');})()");
            evaluate("AndroidHost.openUrl(chrome.runtime.getURL('options.html'));true");
            for(int i=0;i<80;i++){if("true".equals(evaluate("!!window._settingsPage")))break;Thread.sleep(100);}
            removeMonitor(monitor);checks.put("allThreeGitHubLinksIssueExternalIntent",true);
            String originalLang=(String)new JSONTokener(evaluate("document.documentElement.lang")).nextValue();
            java.lang.reflect.Method nativeText=activity.getClass().getDeclaredMethod("tr",String.class);nativeText.setAccessible(true);
            for(String lang:new String[]{"en","ru","de","es","fr","it","pt","zh","ja","ko","tr","hi","ar"}) {
                evaluate("applyI18n('"+lang+"');true");
                for(String key:new String[]{"ok","cancel","fileSaved","fileSaveError","filePending","noLinkApp"}) {
                    String expected=(String)new JSONTokener(evaluate("translations['"+lang+"']['"+key+"']")).nextValue();
                    if(!expected.equals(nativeText.invoke(activity,key)))throw new Exception("Native translation failed: "+lang+" "+key);
                }
            }
            evaluate("applyI18n("+JSONObject.quote(originalLang)+");true");
            checks.put("nativeMessagesAll13Languages",true);json=checks.toString();
            report.putString("checks",json);report.putString("result","PASS");finish(0,report);
        }catch(Exception e){report.putString("result","FAIL");report.putString("error",e.toString());finish(1,report);}
    }
}
