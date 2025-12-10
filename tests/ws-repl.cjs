/**
 * Interactive WebSocket REPL for RemoteDebug
 * 
 * Usage: node ws-repl.js [ip_address] [port]
 * 
 * Commands:
 *   Type any command to send to device
 *   .exit or .quit - Exit
 *   .help - Show this help
 */

const WebSocket = require('ws');
const readline = require('readline');

const IP = process.argv[2] || '192.168.0.218';
const PORT = process.argv[3] || 8232;
const WS_URL = `ws://${IP}:${PORT}`;

console.log('============================================');
console.log('WSTerm WebSocket REPL');
console.log('============================================');
console.log(`Connecting to: ${WS_URL}`);
console.log('Type .help for commands, .exit to quit\n');

const ws = new WebSocket(WS_URL, ['arduino']);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

ws.on('open', () => {
  console.log('✅ Connected!\n');
  
  // Auto-handshake
  ws.send('$app');
  
  rl.prompt();
});

ws.on('message', (data) => {
  const msg = data.toString();
  const lines = msg.split('\n').filter(l => l.trim());
  
  // Clear current line and print messages
  process.stdout.write('\r\x1b[K');
  
  for (const line of lines) {
    if (line.startsWith('$app:')) {
      console.log(`\x1b[36m${line}\x1b[0m`);  // Cyan for protocol
    } else if (line.startsWith('*')) {
      console.log(`\x1b[33m${line}\x1b[0m`);  // Yellow for system
    } else if (line.includes('[E]') || line.includes('Error')) {
      console.log(`\x1b[31m${line}\x1b[0m`);  // Red for errors
    } else if (line.includes('[W]') || line.includes('Warning')) {
      console.log(`\x1b[35m${line}\x1b[0m`);  // Magenta for warnings
    } else if (line.includes('[I]') || line.includes('Info')) {
      console.log(`\x1b[32m${line}\x1b[0m`);  // Green for info
    } else {
      console.log(line);
    }
  }
  
  rl.prompt();
});

ws.on('error', (err) => {
  console.error(`\n❌ Error: ${err.message}`);
  process.exit(1);
});

ws.on('close', () => {
  console.log('\n🔌 Disconnected');
  process.exit(0);
});

rl.on('line', (line) => {
  const cmd = line.trim();
  
  if (!cmd) {
    rl.prompt();
    return;
  }
  
  // Handle REPL commands
  if (cmd === '.exit' || cmd === '.quit') {
    ws.close();
    return;
  }
  
  if (cmd === '.help') {
    console.log(`
REPL Commands:
  .exit, .quit  - Exit the REPL
  .help         - Show this help

Device Commands:
  $app          - Handshake (auto-sent on connect)
  ?             - Show help
  v, d, i, w, e - Set debug level
  m             - Show memory info
  s             - Toggle silence mode
  c             - Toggle colors
  p             - Toggle profiler
  reset         - Reset the device
  filter <text> - Set filter
  nofilter      - Clear filter
  status        - Show status (device-specific)
  relay <cmd>   - Relay control (device-specific)
`);
    rl.prompt();
    return;
  }
  
  // Send to device
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(cmd);
  } else {
    console.log('❌ Not connected');
  }
  
  rl.prompt();
});

rl.on('close', () => {
  ws.close();
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n');
  ws.close();
});
