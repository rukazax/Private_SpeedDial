from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from email.parser import BytesParser
from email.policy import default
from pathlib import Path
import json,threading,time

files={};requests=[];lock=threading.Lock()
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def respond(self,status=200,value=None,headers=None):
  body=b'' if value is None else value if isinstance(value,bytes) else json.dumps(value,ensure_ascii=False).encode()
  self.send_response(status)
  for k,v in (headers or {}).items():self.send_header(k,v)
  self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers()
  try:self.wfile.write(body)
  except (BrokenPipeError,ConnectionResetError):pass
 def handle_request(self):
  u=urlparse(self.path);path=u.path;query=parse_qs(u.query)
  body=self.rfile.read(int(self.headers.get('Content-Length','0')))
  with lock:requests.append({'method':self.command,'path':path,'bodyBytes':len(body)})
  if path=='/control/reset':
   with lock:files.clear();requests.clear()
   return self.respond(200,{'ok':True})
  if path=='/control/stats':return self.respond(200,{'requests':requests,'files':files})
  if path.startswith('/status/'):return self.respond(int(path.split('/')[2]),{'error':'fixture'})
  if path.startswith('/invalid-json'):return self.respond(200,b'{broken')
  if path=='/slow':time.sleep(2);return self.respond(200,{'done':True})
  if path=='/redirect-auth':return self.respond(302,None,{'Location':'http://10.0.2.2:18767/echo-auth'})
  if path=='/echo-auth':return self.respond(200,{'authorization':self.headers.get('Authorization')})
  if self.command in ['PROPFIND','MKCOL']:return self.respond(207 if self.command=='PROPFIND' else 201)
  if path.startswith('/provider/'):
   _,_,service,host,*tail=path.split('/');endpoint='/'+ '/'.join(tail);key='provider:'+service
   if self.headers.get('Authorization','').endswith('invalid'):return self.respond(401,{'error':'bad token'})
   if service=='pcloud':
    if endpoint=='/createfolder':return self.respond(200,{'result':0})
    if endpoint=='/getfilelink':return self.respond(200,{'result':0,'hosts':['signed.mock.local'],'path':'/get'} if key in files else {'result':2002})
   if service=='yandex' and host=='cloud-api.yandex.net':
    if endpoint.endswith('/upload'):return self.respond(200,{'href':'https://signed.mock.local/put'})
    if endpoint.endswith('/download'):return self.respond(200,{'href':'https://signed.mock.local/get'}) if key in files else self.respond(404)
    return self.respond(201 if self.command=='PUT' else 200,{'type':'dir'})
   upload=self.command=='PUT' or endpoint.endswith('/upload') or endpoint=='/uploadfile' or (service=='box' and host=='upload.box.com')
   if upload:
    if 'multipart/form-data' in self.headers.get('Content-Type',''):
     mail=BytesParser(policy=default).parsebytes(('Content-Type: '+self.headers['Content-Type']+'\r\nMIME-Version: 1.0\r\n\r\n').encode()+body)
     body=next(p.get_payload(decode=True) for p in mail.iter_parts() if p.get_param('name',header='Content-Disposition')=='file')
    files[key]=json.loads(body);return self.respond(200,{'result':0,'id':'fixture'})
   return self.respond(200,files[key]) if key in files else self.respond(409 if service=='dropbox' else 404)
  if path.startswith('/sync/'):
   if self.headers.get('Authorization')!='Basic YW5kcm9pZC1maXh0dXJlOmZpeHR1cmU=':return self.respond(401)
   if self.command=='PUT':files[path]=json.loads(body);return self.respond(201)
   return self.respond(200,files[path]) if path in files else self.respond(404)
  return self.respond(404)
 do_GET=handle_request;do_POST=handle_request;do_PUT=handle_request;do_PROPFIND=handle_request;do_MKCOL=handle_request;do_DELETE=handle_request

for port in [18766,18767]:
 server=ThreadingHTTPServer(('127.0.0.1',port),Handler)
 threading.Thread(target=server.serve_forever,daemon=True).start()
print('Fixture endpoints ready',flush=True)
threading.Event().wait()
