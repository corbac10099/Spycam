import http.server
import socketserver
import json
import urllib.request
import urllib.error
import urllib.parse
from http import HTTPStatus
import os

PORT = 3000
DIRECTORY = "d:/tracker_valo"

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, TRN-Api-Key, Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def load_server_config(self):
        config_path = os.path.join(DIRECTORY, 'server_config.json')
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def save_server_config(self, config):
        config_path = os.path.join(DIRECTORY, 'server_config.json')
        try:
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print("Error saving config:", e)
            return False

    def load_matches_database(self):
        db_path = os.path.join(DIRECTORY, 'matches_database.json')
        if os.path.exists(db_path):
            try:
                with open(db_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def save_matches_database(self, data):
        db_path = os.path.join(DIRECTORY, 'matches_database.json')
        try:
            current = self.load_matches_database()
            player_key = str(data.get('player_key') or 'gr4phø#0001').lower()
            if 'profiles' not in current:
                current['profiles'] = {}

            profile_entry = current['profiles'].get(player_key, {})
            existing_matches = profile_entry.get('matches', [])
            new_matches = data.get('matches', [])

            match_map = {}
            for m in existing_matches:
                m_id = m.get('id')
                if m_id:
                    match_map[m_id] = m

            for m in new_matches:
                m_id = m.get('id')
                if m_id:
                    match_map[m_id] = {**match_map.get(m_id, {}), **m}

            merged_matches = list(match_map.values())
            merged_matches.sort(key=lambda x: str(x.get('date', '')), reverse=True)

            updated_profile = {**profile_entry, **data, 'matches': merged_matches}
            current['profiles'][player_key] = updated_profile

            with open(db_path, 'w', encoding='utf-8') as f:
                json.dump(current, f, indent=2, ensure_ascii=False)
            return updated_profile
        except Exception as e:
            print("Error merging matches database:", e)
            return None

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        query = parsed_path.query

        if path == '/api/config':
            config = self.load_server_config()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(config).encode('utf-8'))
        elif path == '/api/matches-history':
            params = urllib.parse.parse_qs(query)
            player_key = params.get('player', ['gr4phø#0001'])[0].lower()
            db = self.load_matches_database()
            profile = db.get('profiles', {}).get(player_key, {})
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(profile).encode('utf-8'))
        elif path.startswith('/api/henrik/'):
            self.handle_proxy(
                prefix='/api/henrik/',
                target_base='https://api.henrikdev.xyz/valorant/',
                header_key='Authorization',
                config_key='henrikKey',
                path=path,
                query=query
            )
        elif path.startswith('/api/tracker/'):
            self.handle_proxy(
                prefix='/api/tracker/',
                target_base='https://api.tracker.gg/api/v2/valorant/standard/',
                header_key='TRN-Api-Key',
                config_key='trackerggKey',
                path=path,
                query=query
            )
        else:
            super().do_GET()

    def handle_proxy(self, prefix, target_base, header_key, config_key, path, query):
        sub_path = path[len(prefix):]
        
        decoded_path = urllib.parse.unquote(sub_path)
        encoded_path = urllib.parse.quote(decoded_path, safe='/')
        
        target_url = target_base + encoded_path
        if query:
            target_url += '?' + query

        req = urllib.request.Request(target_url)
        
        header_val = self.headers.get(header_key)
        if not header_val:
            config = self.load_server_config()
            header_val = config.get(config_key)

        if header_val:
            req.add_header(header_key, header_val)
        
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

        try:
            print(f"Proxying request to: {target_url} (Key present: {bool(header_val)})")
            with urllib.request.urlopen(req, timeout=15) as response:
                content = response.read()
                self.send_response(response.status)
                self.send_header('Content-Type', response.headers.get('Content-Type', 'application/json'))
                self.end_headers()
                self.wfile.write(content)
        except urllib.error.HTTPError as e:
            print(f"HTTPError: {e.code} - {e.reason}")
            try:
                error_body = e.read().decode('utf-8')
                self.send_error_json(e.code, error_body)
            except:
                self.send_error_json(e.code, str(e))
        except Exception as e:
            print(f"Exception: {str(e)}")
            self.send_error_json(500, str(e))

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/api/matches-history':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                body = self.rfile.read(content_length)
                try:
                    data = json.loads(body)
                    updated = self.save_matches_database(data)
                    if updated is not None:
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps(updated).encode('utf-8'))
                        print(f"Matches database updated! Total matches: {len(updated.get('matches', []))}")
                    else:
                        self.send_error_json(500, "Failed to save matches database")
                except Exception as e:
                    self.send_error_json(400, f"Invalid JSON: {e}")
            else:
                self.send_error_json(400, "Empty body")
        elif parsed_path.path == '/api/config':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                body = self.rfile.read(content_length)
                try:
                    data = json.loads(body)
                    if self.save_server_config(data):
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(b'{"status": "success"}')
                        print("Server config saved successfully:", data)
                    else:
                        self.send_error_json(500, "Failed to save config")
                except Exception as e:
                    self.send_error_json(400, f"Invalid JSON: {e}")
            else:
                self.send_error_json(400, "Empty body")
        elif parsed_path.path == '/api/save-feedback':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                body = self.rfile.read(content_length)
                try:
                    data = json.loads(body)
                    with open(os.path.join(DIRECTORY, 'feedback_data.json'), 'a') as f:
                        f.write(json.dumps(data) + '\n')
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(b'{"status": "success"}')
                    print("Feedback saved successfully")
                except Exception as e:
                    self.send_error_json(400, "Invalid JSON or save error")
            else:
                self.send_error_json(400, "Empty body")
        else:
            self.send_error_json(404, "Not Found")

    def send_error_json(self, code, message):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        error_resp = {"error": message}
        self.wfile.write(json.dumps(error_resp).encode('utf-8'))

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()
