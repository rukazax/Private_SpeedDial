from pathlib import Path
import subprocess,os,zipfile,shutil
root=Path(__file__).resolve().parent
sdk=Path.home()/'Android/Sdk'; tools=sdk/'build-tools/36.0.0'; android=sdk/'platforms/android-35/android.jar'
jdk=Path.home()/'.local/opt/jdk-17';os.environ['PATH']=str(jdk/'bin')+':'+os.environ['PATH']
build=root/'test-build'
if build.exists():shutil.rmtree(build)
(build/'classes').mkdir(parents=True);(build/'dex').mkdir()
def run(*args):subprocess.run([str(x) for x in args],check=True)
run(jdk/'bin/javac','--release','8','-encoding','UTF-8','-classpath',android,'-d',build/'classes',root/('ReleaseInstrumentationV7.java' if os.environ.get('SPEEDDIAL_TEST_TAG')=='v7' else 'ReleaseInstrumentationV6.java' if os.environ.get('SPEEDDIAL_TEST_TAG')=='v6' else 'ReleaseInstrumentationV5.java' if os.environ.get('SPEEDDIAL_TEST_TAG')=='v5' else 'ReleaseInstrumentation.java'))
with zipfile.ZipFile(build/'classes.jar','w')as z:
 for p in (build/'classes').rglob('*.class'):z.write(p,p.relative_to(build/'classes'))
run(tools/'d8','--lib',android,'--min-api','26','--output',build/'dex',build/'classes.jar')
manifest=root/'AndroidManifest.xml'
if os.environ.get('SPEEDDIAL_TEST_TAG') in ['v5','v6','v7']:
 manifest=build/'AndroidManifest.xml';manifest.write_text((root/'AndroidManifest.xml').read_text().replace('.test.ReleaseInstrumentation', '.test.ReleaseInstrumentation'+os.environ['SPEEDDIAL_TEST_TAG'].upper()))
run(tools/'aapt2','link','-o',build/'test-unsigned.apk','--manifest',manifest,'-I',android)
with zipfile.ZipFile(build/'test-unsigned.apk','a',compression=zipfile.ZIP_DEFLATED)as z:
 for p in (build/'dex').glob('*.dex'):z.write(p,p.name)
run(tools/'zipalign','-f','-p','4',build/'test-unsigned.apk',build/'test-aligned.apk')
sign=Path.home()/'.config/private-speeddial-android/signing'
run(tools/'apksigner','sign','--ks',sign/'app.p12','--ks-pass','file:'+str(sign/'password.txt'),'--out',build/'test.apk',build/'test-aligned.apk')
print(build/'test.apk')
