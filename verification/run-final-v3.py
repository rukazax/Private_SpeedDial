import subprocess,json,hashlib
from pathlib import Path
node=str(Path.home()/'.local/opt/node-v24.21.0-linux-x64/bin/node')
for phase in ['home','extended-home','settings','extra']:
 subprocess.run([node,'verification/regression-v3.mjs',phase],check=True)
for name in ['run-sync-v3.mjs','run-advanced-sync-v3.mjs']:
 subprocess.run([node,'verification/'+name],check=True)
p=Path('dist/Private-SpeedDial-6.9.9-android.3.apk')
Path('verification/v3-tested-apk.json').write_text(json.dumps({'apk':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'build':'release; DEBUG_WEBVIEW=false; FLAG_SECURE'},indent=2))
