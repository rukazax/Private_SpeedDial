#!/usr/bin/env python3
"""Keep unpacked extension and Android assets independently usable."""
from pathlib import Path
import sys
root = Path(__file__).resolve().parent.parent
for source in (root / 'shared').glob('project*'):
    for target in [root / 'extension' / source.name, root / 'android-app/web' / source.name]:
        if '--check' in sys.argv:
            if not target.exists() or target.read_bytes() != source.read_bytes():
                raise SystemExit(f'Out of date: {target.relative_to(root)}')
        else:
            target.write_bytes(source.read_bytes())
