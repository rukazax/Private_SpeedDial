import subprocess,time,urllib.request
subprocess.run(['adb','shell','am','start','-n','su.econa.speeddial/.MainActivity'],check=True)
for i in range(100):
 p=subprocess.run(['adb','shell','pidof','su.econa.speeddial'],capture_output=True).stdout.decode().strip()
 if p:
  subprocess.run(['adb','forward','tcp:9223','localabstract:webview_devtools_remote_'+p],check=True)
  try:
   urllib.request.urlopen('http://127.0.0.1:9223/json').read();break
  except Exception:pass
 time.sleep(.2)
else:raise RuntimeError('WebView not ready')
time.sleep(.5)
