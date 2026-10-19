import subprocess,json,hashlib,os
from pathlib import Path
node=str(Path.home()/'.local/opt/node-v24.21.0-linux-x64/bin/node');env={**os.environ,'SPEEDDIAL_TEST_TAG':'v4'}
for phase in ['home','extended-home','settings','extra']:
 subprocess.run([node,'verification/regression-v3.mjs',phase],check=True,env=env)
for name in ['run-sync-v3.mjs','run-advanced-sync-v3.mjs','menu-v4.mjs']:
 subprocess.run([node,'verification/'+name],check=True,env=env)
p=Path('dist/Private-SpeedDial-6.9.9-android.4.apk')
Path('verification/v4-tested-apk.json').write_text(json.dumps({'apk':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'build':'release; DEBUG_WEBVIEW=false; FLAG_SECURE'},indent=2))
