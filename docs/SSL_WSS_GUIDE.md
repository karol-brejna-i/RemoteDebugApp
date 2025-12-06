# SSL/WSS Configuration Guide

This document explains the SSL/WSS options and limitations when using RemoteDebugApp with ESP32/ESP8266 devices.

---

## Overview

RemoteDebugApp communicates with Arduino devices over WebSocket. The security of this connection depends on both the **web app hosting** and the **device capabilities**.

| App Hosting | Device Protocol | Works? | Notes |
|-------------|-----------------|--------|-------|
| `file://` (local) | `ws://` | ✅ Yes | No SSL context applies |
| `http://` | `ws://` | ✅ Yes | Both unencrypted |
| `https://` | `ws://` | ❌ No | Mixed content blocked |
| `https://` | `wss://` | ✅ Yes | Both encrypted |
| `http://` | `wss://` | ✅ Yes | Unusual but works |

---

## The Mixed Content Problem

Modern browsers block **mixed content** - loading insecure resources (HTTP/WS) from a secure page (HTTPS).

```
HTTPS page → WS connection = ❌ BLOCKED
HTTPS page → WSS connection = ✅ ALLOWED
```

This means:
- If you host RemoteDebugApp on HTTPS (GitHub Pages, Netlify, etc.), you **cannot** connect to a plain WebSocket server on the ESP32.
- The ESP32 must support WSS (WebSocket Secure) for HTTPS-hosted apps to work.

---

## Solution Options

### Option 1: Use HTTP Hosting (Simplest)

Host the app on HTTP instead of HTTPS.

**Pros:**
- Works immediately with existing ESP32 code
- No changes to Arduino firmware needed

**Cons:**
- Many hosting providers force HTTPS
- No encryption (acceptable on local network)
- Some browser features require HTTPS

**Implementation:**
- Self-host on local HTTP server
- Use `python -m http.server 8080`
- Access via `http://localhost:8080`

---

### Option 2: Use Local File (Recommended for Local Use)

Open `index.html` directly from the filesystem.

**Pros:**
- No server needed
- Works offline
- No mixed content restrictions

**Cons:**
- Can't use some PWA features
- Harder to update (manual download)

**Implementation:**
- Download the `dist/` folder
- Open `dist/index.html` in browser
- Bookmark for easy access

---

### Option 3: Enable WSS on ESP32 (Full Security)

Configure the ESP32 to serve WebSocket over TLS.

**Pros:**
- True end-to-end encryption
- Works with HTTPS-hosted app
- Secure even on public networks

**Cons:**
- Increased CPU load on ESP32
- Requires certificate management
- More complex setup
- Slight latency increase

**Implementation (ESP32):**

```cpp
#include <WiFiClientSecure.h>
#include <WebSocketsServer.h>

// Self-signed certificate (for development)
const char* ssl_cert = R"(
-----BEGIN CERTIFICATE-----
MIICxjCCAa6gAwIBAgIJAJn2...
-----END CERTIFICATE-----
)";

const char* ssl_key = R"(
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQE...
-----END PRIVATE KEY-----
)";

WebSocketsServerSecure wsServer(8232);

void setup() {
  // ... WiFi setup ...
  
  wsServer.beginSSL(ssl_cert, ssl_key);
  wsServer.onEvent(webSocketEvent);
}
```

**Certificate Options:**
1. **Self-signed**: Easy but requires browser exception
2. **Let's Encrypt**: Free, trusted, but needs domain name
3. **mDNS + local CA**: For advanced local setups

---

### Option 4: WebSocket Proxy (Best for Hosted Apps)

Run a proxy server that accepts WSS and forwards to WS.

```
Browser ──WSS──► Proxy Server ──WS──► ESP32
(HTTPS)          (your server)        (local network)
```

**Pros:**
- ESP32 code unchanged
- App works from HTTPS
- Proxy can add features (logging, auth)

**Cons:**
- Requires running a server
- ESP32 must be reachable from proxy
- Added latency

**Implementation (Node.js Proxy):**

```javascript
// proxy-server.js
const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');

const server = https.createServer({
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (clientWs, req) => {
  // Extract target ESP32 address from URL
  const targetUrl = new URL(req.url, 'wss://localhost');
  const espAddress = targetUrl.searchParams.get('target');
  
  // Connect to ESP32
  const espWs = new WebSocket(`ws://${espAddress}:8232`, ['arduino']);
  
  // Relay messages both ways
  clientWs.on('message', data => espWs.send(data));
  espWs.on('message', data => clientWs.send(data));
  
  // Handle disconnections
  clientWs.on('close', () => espWs.close());
  espWs.on('close', () => clientWs.close());
});

server.listen(8443);
console.log('WSS Proxy running on port 8443');
```

**App Configuration:**
```javascript
// Instead of connecting directly:
// ws://192.168.1.100:8232

// Connect via proxy:
// wss://your-proxy.com:8443/?target=192.168.1.100
```

---

### Option 5: Browser Extension (Advanced)

A browser extension can bypass mixed content restrictions.

**Pros:**
- No ESP32 changes
- Works with any HTTPS host

**Cons:**
- Requires extension installation
- Per-browser development
- Security review needed

**Not recommended** for general distribution.

---

## Comparison Matrix

| Option | ESP32 Changes | Server Needed | Security | Complexity |
|--------|---------------|---------------|----------|------------|
| HTTP Hosting | None | HTTP only | None | Low |
| Local File | None | None | N/A | Lowest |
| WSS on ESP32 | Firmware update | None | Full | Medium |
| WSS Proxy | None | Yes | Partial* | High |
| Browser Ext | None | None | None | High |

*Proxy: encrypted browser↔proxy, unencrypted proxy↔ESP32

---

## Recommendations by Use Case

### Home/Lab Use (Same Network)
→ **Option 2: Local File** or **Option 1: HTTP Hosting**

No encryption needed on trusted local network. Simplest setup.

### Remote Access (Over Internet)
→ **Option 4: WSS Proxy** with VPN

ESP32 should not be directly exposed to internet. Use VPN + proxy.

### Maximum Security (Sensitive Data)
→ **Option 3: WSS on ESP32**

Full end-to-end encryption. Worth the complexity for sensitive applications.

### Hosted Demo/Public App
→ **Option 4: WSS Proxy**

Required for HTTPS hosting without ESP32 firmware changes.

---

## Browser Behavior Reference

### Chrome
- Blocks mixed content by default
- No override for WebSocket mixed content
- `--allow-insecure-localhost` flag for localhost only

### Firefox
- Blocks mixed content by default
- Shield icon allows temporary override (per-site)
- `network.websocket.allowInsecureFromHTTPS` in about:config

### Safari
- Strictly blocks mixed content
- No easy override

### Edge (Chromium)
- Same behavior as Chrome

---

## Testing SSL/WSS Locally

### Generate Self-Signed Certificate

```bash
# Generate private key and certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

# For ESP32 (smaller key for memory constraints)
openssl req -x509 -newkey rsa:2048 -keyout esp_key.pem -out esp_cert.pem -days 365 -nodes
```

### Test with Local HTTPS Server

```bash
# Python (requires ssl module)
python -c "
import http.server, ssl
server = http.server.HTTPServer(('localhost', 8443), http.server.SimpleHTTPRequestHandler)
server.socket = ssl.wrap_socket(server.socket, certfile='cert.pem', keyfile='key.pem', server_side=True)
server.serve_forever()
"
```

### Trust Self-Signed Certificate

1. Open `https://localhost:8443` in browser
2. Accept the security warning
3. Certificate will be trusted for session

For permanent trust, add to system certificate store.

---

## Future Considerations

### WebTransport (Experimental)
A new API that may eventually replace WebSocket with better security model. Not yet widely supported.

### ESP32-S3 / ESP32-C3
Newer chips have better crypto acceleration, making WSS more practical.

### Matter Protocol
IoT standard with built-in security. Different architecture than RemoteDebug.

---

*Document created: December 6, 2025*
*For: RemoteDebugApp SSL/WSS configuration*
