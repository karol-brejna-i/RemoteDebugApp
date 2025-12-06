/**
 * RemoteDebugApp - WebSocket Communication Inspector (Fixed Version)
 * 
 * Logs all WebSocket traffic to the browser console.
 * Commands available:
 *   __debugHelpers.summary()         - Show capture summary
 *   __debugHelpers.analyzeMessages() - Analyze message types
 *   __debugHelpers.downloadCapture() - Download as JSON file
 *   __debugHelpers.clear()           - Clear captured data
 */

(function() {
    'use strict';
    
    console.log('%c[DEBUG-HOOKS] WebSocket interceptor loaded!', 'color: #00ff00; font-weight: bold;');
    
    // Store for captured messages
    window.__debugCapture = {
        sent: [],
        received: [],
        connections: [],
        startTime: Date.now()
    };
    
    // Save original WebSocket
    const OriginalWebSocket = window.WebSocket;
    
    // Replace WebSocket with a simple wrapper that returns the real WebSocket
    // but adds event listeners for logging
    window.WebSocket = function(url, protocols) {
        console.log('%c[WS] Creating WebSocket connection', 'color: #ffcc00; font-weight: bold;');
        console.log('  URL:', url);
        console.log('  Protocols:', protocols);
        
        // Create actual WebSocket (handle optional protocols)
        const ws = protocols !== undefined 
            ? new OriginalWebSocket(url, protocols) 
            : new OriginalWebSocket(url);
        
        // Store connection info
        const connectionInfo = {
            url: url,
            protocols: protocols,
            createdAt: new Date().toISOString(),
            state: 'connecting'
        };
        window.__debugCapture.connections.push(connectionInfo);
        
        // Add logging listeners (non-intrusive - just adds listeners)
        ws.addEventListener('open', function(event) {
            console.log('%c[WS] Connection OPENED', 'color: #00ff00; font-weight: bold;');
            connectionInfo.state = 'open';
            connectionInfo.openedAt = new Date().toISOString();
        });
        
        ws.addEventListener('message', function(event) {
            const timestamp = Date.now() - window.__debugCapture.startTime;
            const data = event.data;
            
            // Escape non-printable characters for display
            let displayData = data;
            if (typeof data === 'string') {
                displayData = data.replace(/\x1b/g, '\\x1b');
            }
            
            console.log('%c[WS ←] RECEIVED @ ' + timestamp + 'ms', 'color: #00ccff; font-weight: bold;');
            console.log('  Data:', displayData);
            
            // Store for later analysis
            window.__debugCapture.received.push({
                timestamp: timestamp,
                data: data,
                escaped: displayData
            });
        });
        
        ws.addEventListener('error', function(event) {
            console.log('%c[WS] ERROR', 'color: #ff0000; font-weight: bold;', event);
            connectionInfo.state = 'error';
        });
        
        ws.addEventListener('close', function(event) {
            console.log('%c[WS] Connection CLOSED (code: ' + event.code + ')', 'color: #ff6600; font-weight: bold;');
            connectionInfo.state = 'closed';
            connectionInfo.closedAt = new Date().toISOString();
        });
        
        // Wrap the send method to log outgoing messages
        const originalSend = ws.send.bind(ws);
        ws.send = function(data) {
            const timestamp = Date.now() - window.__debugCapture.startTime;
            console.log('%c[WS →] SENT @ ' + timestamp + 'ms: ' + JSON.stringify(data), 'color: #ff00ff; font-weight: bold;');
            window.__debugCapture.sent.push({ timestamp: timestamp, data: data });
            return originalSend(data);
        };
        
        // Return the actual WebSocket (not a wrapper)
        return ws;
    };
    
    // Copy static properties from original WebSocket
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
    
    // Helper functions
    window.__debugHelpers = {
        summary: function() {
            console.log('%c=== WebSocket Capture Summary ===', 'color: #00ff00; font-weight: bold;');
            console.log('Connections:', window.__debugCapture.connections);
            console.log('Sent (' + window.__debugCapture.sent.length + '):');
            console.table(window.__debugCapture.sent);
            console.log('Received (' + window.__debugCapture.received.length + '):');
            console.table(window.__debugCapture.received.slice(-30));
        },
        
        analyzeMessages: function() {
            const protocol = [], debug = [];
            window.__debugCapture.received.forEach(function(msg) {
                if (typeof msg.data === 'string' && msg.data.indexOf('\x1b[0m\x1b[0;37m:') !== -1) {
                    const match = msg.data.match(/:([A-Z]):/);
                    protocol.push({ type: match ? match[1] : '?', ts: msg.timestamp, data: msg.escaped.substring(0, 80) });
                } else {
                    debug.push({ ts: msg.timestamp, data: (msg.escaped || '').substring(0, 60) });
                }
            });
            console.log('%cProtocol messages:', 'color: #ff9900; font-weight: bold;');
            console.table(protocol);
            console.log('%cDebug messages (last 20):', 'color: #00ff00; font-weight: bold;');
            console.table(debug.slice(-20));
            return { protocol: protocol, debug: debug };
        },
        
        downloadCapture: function() {
            var data = JSON.stringify(window.__debugCapture, null, 2);
            var blob = new Blob([data], { type: 'application/json' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'ws-capture-' + Date.now() + '.json';
            a.click();
        },
        
        getCapture: function() { return window.__debugCapture; },
        
        clear: function() {
            window.__debugCapture.sent = [];
            window.__debugCapture.received = [];
            window.__debugCapture.startTime = Date.now();
            console.log('%c[DEBUG] Cleared', 'color: #ffcc00;');
        }
    };
    
    console.log('%c[DEBUG-HOOKS] Ready! Use __debugHelpers.summary() to see captured data', 'color: #00ff00;');
})();
