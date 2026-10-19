import subprocess
from pathlib import Path
for i in range(2):
 subprocess.run(['adb','shell','am','force-stop','su.econa.speeddial'],check=True)
 r=subprocess.run(['adb','shell','am','instrument','-w','su.econa.speeddial.test/su.econa.speeddial.test.ReleaseInstrumentationV6'],capture_output=True,text=True)
 Path('verification/v6-release-'+('first' if i==0 else 'restart')+'.txt').write_text(r.stdout+r.stderr)
 print(r.stdout)
 if r.returncode or 'result=PASS' not in r.stdout:raise RuntimeError('Release verification failed')
 if i==1 and ('"largeRecordFromPreviousRun":true' not in r.stdout or '"persistenceFromPreviousRun":true' not in r.stdout):raise RuntimeError('Persistence verification failed')
