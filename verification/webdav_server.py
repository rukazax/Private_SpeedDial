"""Local mock WebDAV endpoint for Android sync verification, with fake credentials."""
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
import base64,json

output=Path(__file__).resolve().parent/'mock-cloud.json'
class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass
    def authorised(self):
        if self.headers.get('Authorization')!='Basic '+base64.b64encode(b'android-fixture:fixture').decode():
            self.send_response(401);self.end_headers();return False
        return True
    def do_GET(self):
        if not self.authorised():return
        if not output.exists():self.send_response(404);self.end_headers();return
        body=output.read_bytes();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    def do_PUT(self):
        if not self.authorised():return
        body=self.rfile.read(int(self.headers.get('Content-Length','0')));json.loads(body);output.write_bytes(body)
        self.send_response(201);self.end_headers()
    def do_PROPFIND(self):
        if not self.authorised():return
        self.send_response(207);self.end_headers()
ThreadingHTTPServer(('0.0.0.0',18765),Handler).serve_forever()
