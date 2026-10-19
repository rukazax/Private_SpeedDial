import subprocess,xml.etree.ElementTree as E
subprocess.run(['adb','shell','uiautomator','dump','/sdcard/v3-ui.xml'],capture_output=True,check=True)
s=subprocess.check_output(['adb','shell','cat','/sdcard/v3-ui.xml']).decode()
for n in E.fromstring(s).iter('node'):
 a=n.attrib
 if a.get('text') or a.get('resource-id') or a.get('content-desc'):print(a.get('text'),a.get('content-desc'),a.get('resource-id'),a.get('bounds'))
