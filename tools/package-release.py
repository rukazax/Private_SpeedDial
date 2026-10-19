#!/usr/bin/env python3
"""Package only the extension sources and known public release artifacts."""
from pathlib import Path
import argparse,hashlib,json,zipfile
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--checksums-only',action='store_true');args=parser.parse_args()
out=root/'dist';out.mkdir(exist_ok=True)
if not args.checksums_only:
    assert json.loads((root/'extension/manifest.json').read_text())['version']=='6.10.0'
    with zipfile.ZipFile(out/'Private-SpeedDial-Extension.zip','w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for source in sorted((root/'extension').rglob('*')):
            if source.is_file():z.write(source,source.relative_to(root/'extension'))
names=['Private-SpeedDial-Android.apk','Private-SpeedDial-Extension.zip','Private-SpeedDial-Source.zip']
lines=[]
for name in names:
    p=out/name
    if p.exists():lines.append(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+name)
(out/'SHA256SUMS.txt').write_text('\n'.join(lines)+'\n')
print('\n'.join(lines))
