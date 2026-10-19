#!/usr/bin/env python3
from pathlib import Path
import json,re,subprocess,os
root=Path(__file__).resolve().parent.parent
subprocess.run(['python3',str(root/'tools/sync-shared.py'),'--check'],check=True)
for folder in ['extension','android-app/web']:
 for p in (root/folder).rglob('*'):
  if p.suffix in ['.html','.js','.css','.json']:
   text=p.read_text()
   assert not re.search(r'https?://(?:[\w-]+\.)?econa\.su',text),p
manifest=json.loads((root/'extension/manifest.json').read_text())
assert manifest['version']=='6.10.0'
assert manifest['homepage_url']=='https://github.com/rukazax/Private_SpeedDial'
for p in list((root/'extension').rglob('*.js'))+list((root/'android-app/web').rglob('*.js'))+list((root/'android-app').glob('*.js')):
 subprocess.run([os.environ.get('NODE','node'),'--check',str(p)],check=True)
print('Source checks passed: shared copies, project URLs, version, JavaScript syntax.')
