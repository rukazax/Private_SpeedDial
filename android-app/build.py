#!/usr/bin/env python3
"""Offline APK build using the Android SDK installed on this workstation."""
from pathlib import Path
import os, re, shutil, subprocess, secrets, zipfile, argparse

root = Path(__file__).resolve().parent
workspace = root.parent
sdk = Path(os.environ.get('ANDROID_HOME', str(Path.home() / 'Android/Sdk')))
tools = sdk / 'build-tools/36.0.0'
android = sdk / 'platforms/android-35/android.jar'
jdk = Path(os.environ.get('JAVA_HOME', str(Path.home() / '.local/opt/jdk-17')))
os.environ['PATH'] = str(jdk/'bin') + os.pathsep + os.environ['PATH']
parser = argparse.ArgumentParser()
parser.add_argument('--debug-webview', action='store_true')
args = parser.parse_args()

def run(*cmd):
    subprocess.run([str(x) for x in cmd], check=True)

src = root / 'web'
node=os.environ.get('NODE') or shutil.which('node') or str(Path.home()/'.local/opt/node-v24.21.0-linux-x64/bin/node')
for source in list(src.rglob('*.js'))+list(root.glob('*.js')):
    run(node,'--check',source)
dst = root / 'assets/www'
if dst.exists(): shutil.rmtree(dst)
shutil.copytree(src, dst, dirs_exist_ok=True)
def adapt_idb(text):
    # Resolve writes only after a durable transaction commits, not request success.
    text = text.replace("db.transaction(storeName, 'readwrite')", "db.transaction(storeName, 'readwrite', { durability: 'strict' })")
    text = text.replace('req.onsuccess = () => resolve(true);', "tx.oncomplete = () => resolve(true);\n        tx.onabort = () => reject(tx.error || new Error('Database transaction aborted'));")
    return text
(dst/'idb.js').write_text(adapt_idb((src/'idb.js').read_text()))
for name in ['newtab.html', 'options.html', 'privacy.html']:
    p = dst/name
    s = p.read_text().replace('<head>', '<head>\n<script src="android-bridge.js"></script>')
    s = s.replace('</head>', '<link rel="stylesheet" href="android-mobile.css">\n</head>')
    s = s.replace('<script src="currency.js"></script>', '')
    s = s.replace('<script src="idb.js"></script>', '<script src="idb.js"></script>\n<script src="android-storage.js"></script>')
    s = s.replace('</body>', '<script src="android-layout.js"></script>\n<script src="android-mobile.js"></script>\n</body>')
    p.write_text(s)
for source, target in [('bridge.js','android-bridge.js'),('mobile.css','android-mobile.css'),('mobile.js','android-mobile.js'),('layout.js','android-layout.js'),('storage.js','android-storage.js')]:
    shutil.copyfile(root/source,dst/target)
s = (src/'background.js').read_text()
s = re.sub(r'importScripts\((.*?)\);', lambda m:'\n'.join(adapt_idb((src/path).read_text())+'\n'+(root/'storage.js').read_text() if path=='idb.js' else (src/path).read_text() for path in re.findall(r"'([^']+)'",m.group(1)) if path!='currency.js'), s, count=1, flags=re.S)
(dst/'android-background.js').write_text(s)
(dst/'android-background-start.js').write_text('__startBackground().catch(e=>console.error("Android bootstrap: "+e.message));')
(dst/'android-background.html').write_text('<!doctype html><html><head><meta charset="utf-8"><script src="android-bridge.js"></script></head><body><script src="android-background.js"></script><script src="android-background-start.js"></script></body></html>')
shutil.rmtree(dst/'background')
(dst/'background.js').unlink()
(dst/'parser-worker.js').unlink()
if (dst/'icons').exists(): shutil.rmtree(dst/'icons')

build = root/'build'
if build.exists(): shutil.rmtree(build)
(build/'classes').mkdir(parents=True)
(build/'dex').mkdir()
java = (root/'src/su/econa/speeddial/MainActivity.java').read_text()
java = java.replace('static final boolean DEBUG_WEBVIEW = false', 'static final boolean DEBUG_WEBVIEW = '+str(args.debug_webview).lower())
if args.debug_webview:
    java = java.replace('getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);', '// Secure flag omitted in local verification build only.')
(build/'MainActivity.java').write_text(java)
libs=sorted((root/'libs').glob('*.jar'))
classpath=os.pathsep.join(str(p) for p in [android,*libs])
run(jdk/'bin/javac', '-encoding','UTF-8','--release','8','-classpath',classpath,'-d',build/'classes',build/'MainActivity.java')
with zipfile.ZipFile(build/'classes.jar','w') as z:
    for p in (build/'classes').rglob('*.class'): z.write(p,p.relative_to(build/'classes'))
run(tools/'d8','--lib',android,'--min-api','26','--output',build/'dex',build/'classes.jar',*libs)
run(tools/'aapt2','compile','--dir',root/'res','-o',build/'resources.zip')
run(tools/'aapt2','link','-o',build/'unsigned.apk','--manifest',root/'AndroidManifest.xml','-I',android,'-A',root/'assets',build/'resources.zip')
with zipfile.ZipFile(build/'unsigned.apk','a',compression=zipfile.ZIP_DEFLATED) as z:
    for p in (build/'dex').glob('*.dex'): z.write(p,p.name)
    names=set(z.namelist())
    for lib in libs:
        with zipfile.ZipFile(lib) as source:
            for name in source.namelist():
                if name.endswith('/') or name.endswith('.class'): continue
                if name.startswith('META-INF/'):
                    if 'LICENSE' in name or 'NOTICE' in name:
                        target='META-INF/licenses/'+lib.stem+'-'+Path(name).name
                    else: continue
                else: target=name
                if target not in names: z.writestr(target,source.read(name));names.add(target)
run(tools/'zipalign','-f','-p','4',build/'unsigned.apk',build/'aligned.apk')

sign = Path.home()/'.config/private-speeddial-android/signing'
sign.mkdir(parents=True,exist_ok=True);sign.chmod(0o700)
password = sign/'password.txt'; key = sign/'app.p12'
if not password.exists():
    password.write_text(secrets.token_urlsafe(40)); password.chmod(0o600)
if not key.exists():
    run(jdk/'bin/keytool','-genkeypair','-keystore',key,'-storetype','PKCS12','-storepass:file',password,'-alias','speeddial','-keyalg','RSA','-keysize','3072','-validity','10000','-dname','CN=Private SpeedDial Android, O=ECONA')
    key.chmod(0o600)
out=workspace/'dist/Private-SpeedDial-Android.apk';out.parent.mkdir(exist_ok=True)
run(tools/'apksigner','sign','--ks',key,'--ks-pass','file:'+str(password),'--out',out,build/'aligned.apk')
run(tools/'apksigner','verify','--verbose',out)
print('APK:',out)
