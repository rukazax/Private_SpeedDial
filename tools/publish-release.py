#!/usr/bin/env python3
"""Publish the reviewed current commit and validated release artifacts via GitHub CLI.
Requires the owner's normal gh auth login; never reads or embeds a token itself.
"""
from pathlib import Path
import subprocess,json,os,shutil,tempfile,hashlib,urllib.request
root=Path(__file__).resolve().parent.parent
os.chdir(root)
gh=os.environ.get('GH') or shutil.which('gh')
if not gh:raise SystemExit('Install GitHub CLI and run: gh auth login --hostname github.com --git-protocol https --web')
def run(*cmd,capture=False):
 r=subprocess.run([str(c) for c in cmd],check=True,text=True,capture_output=capture)
 return r.stdout.strip() if capture else None
owner='rukazax';repo=owner+'/Private_SpeedDial'
version=json.loads((root/'extension/manifest.json').read_text())['version'];tag='v'+version
auth=subprocess.run([gh,'api','user','--jq','.login'],capture_output=True,text=True)
if auth.returncode:raise SystemExit('GitHub login is incomplete. Finish gh auth login as rukazax, then rerun this script.')
if auth.stdout.strip()!=owner:raise SystemExit('Authenticate as the repository owner rukazax.')
if run('git','status','--porcelain',capture=True):raise SystemExit('Commit the reviewed changes before publication.')
sha=run('git','rev-parse','HEAD',capture=True)
run('python3','tools/sync-shared.py','--check')
run('python3','tools/package-release.py')
run('git','archive','--format=zip','--prefix=Private_SpeedDial/','-o','dist/Private-SpeedDial-Source.zip','HEAD')
run('python3','tools/package-release.py','--checksums-only')
artifacts=[root/'dist'/name for name in ['Private-SpeedDial-Android.apk','Private-SpeedDial-Extension.zip','Private-SpeedDial-Source.zip','SHA256SUMS.txt']]
if not all(p.is_file() for p in artifacts):raise SystemExit('Build and verify the release APK first.')
verified=json.loads((root/('docs/verification-'+version+'.json')).read_text())
for name,checksum in verified['artifacts'].items():
 if hashlib.sha256((root/'dist'/name).read_bytes()).hexdigest()!=checksum:raise SystemExit('Artifact differs from the committed verification report: '+name)
probe=subprocess.run([gh,'api','repos/'+repo],capture_output=True,text=True)
if probe.returncode:
 if '404' not in probe.stderr:raise SystemExit('Unable to check repository: '+probe.stderr)
 run(gh,'repo','create',repo,'--public','--description','Private SpeedDial: Chrome extension and Android app with bookmarks, notes, encrypted cloud sync and GitHub updates')
else:
 info=json.loads(probe.stdout)
 if info.get('private'):raise SystemExit('An existing private repository requires review; refusing to change its visibility.')
run('git','push','origin','main')
run(gh,'repo','edit',repo,'--description','Private SpeedDial: Chrome extension and Android app with bookmarks, notes, encrypted cloud sync and GitHub updates','--homepage','https://github.com/'+repo+'/releases/latest','--enable-issues')
# Existing published releases are never silently replaced.
existing=subprocess.run([gh,'release','view',tag,'--repo',repo,'--json','isDraft'],capture_output=True,text=True)
if existing.returncode==0:
 if not json.loads(existing.stdout)['isDraft']:raise SystemExit('Release already published; verify it instead of overwriting assets.')
 run(gh,'release','upload',tag,'--repo',repo,'--clobber',*artifacts)
else:
 run(gh,'release','create',tag,'--repo',repo,'--target',sha,'--draft','--title','Private SpeedDial '+version+' — Android + Chrome','--notes-file','docs/RELEASE-'+version+'.md',*artifacts)
with tempfile.TemporaryDirectory(prefix='speeddial-release-check-') as directory:
 run(gh,'release','download',tag,'--repo',repo,'--dir',directory)
 for expected in artifacts:
  actual=Path(directory)/expected.name
  if not actual.exists() or hashlib.sha256(actual.read_bytes()).digest()!=hashlib.sha256(expected.read_bytes()).digest():raise SystemExit('Uploaded asset mismatch: '+expected.name)
run(gh,'release','edit',tag,'--repo',repo,'--draft=false','--latest')
request=urllib.request.Request('https://api.github.com/repos/'+repo+'/releases/latest',headers={'Accept':'application/vnd.github+json'})
with urllib.request.urlopen(request,timeout=30) as response:latest=json.load(response)
if latest['tag_name']!=tag or latest.get('draft') or latest.get('prerelease'):raise SystemExit('Public latest release verification failed.')
for expected in artifacts:
 url='https://github.com/'+repo+'/releases/latest/download/'+expected.name
 with urllib.request.urlopen(url,timeout=60) as response:digest=hashlib.sha256(response.read()).digest()
 if digest!=hashlib.sha256(expected.read_bytes()).digest():raise SystemExit('Public download mismatch: '+expected.name)
print('Published and verified: https://github.com/'+repo)
print('Release: https://github.com/'+repo+'/releases/tag/'+tag)
