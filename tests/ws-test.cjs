/**
 * WebSocket Test Script for RemoteDebug/WSTerm
 * 
 * Usage: node ws-test.js [ip_address] [port]
 * 
 * Example: node ws-test.js 192.168.0.218 8232
 */

const WebSocket = require('ws');

const IP = process.argv[2] || '192.168.0.218';
const PORT = process.argv[3] || 8232;
const WS_URL = `ws://${IP}:${PORT}`;

console.log('============================================');
console.log('WSTerm WebSocket Test (Node.js)');
console.log('============================================');
console.log(`Target: ${WS_URL}`);
console.log('');

// Test queue
const tests = [
  { cmd: '$app', desc: 'Handshake', wait: 500 },
  { cmd: '?', desc: 'Help command', wait: 1000 },
  { cmd: 'm', desc: 'Memory info', wait: 500 },
  { cmd: 'd', desc: 'Set level to Debug', wait: 500 },
  { cmd: 'status', desc: 'Status command', wait: 1000 },
];

let currentTest = 0;
let messageBuffer = [];

const ws = new WebSocket(WS_URL, ['arduino']);

ws.on('open', () => {
  console.log('✅ Connected!\n');
  runNextTest();
});

ws.on('message', (data) => {
  const msg = data.toString();
  messageBuffer.push(msg);
  
  // Parse and display
  const lines = msg.split('\n').filter(l => l.trim());
  for (const line of lines) {
    if (line.startsWith('$app:')) {
      console.log(`  📦 Protocol: ${line}`);
      parseProtocol(line);
    } else if (line.startsWith('*')) {
      console.log(`  📝 System: ${line}`);
    } else {
      console.log(`  💬 ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    }
  }
});

ws.on('error', (err) => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});

ws.on('close', () => {
  console.log('\n🔌 Disconnected');
  console.log('============================================');
  console.log('Tests complete');
  console.log('============================================');
});

function runNextTest() {
  if (currentTest >= tests.length) {
    console.log('\n--- All tests complete ---');
    ws.close();
    return;
  }

  const test = tests[currentTest];
  console.log(`\n--- Test ${currentTest + 1}: ${test.desc} ---`);
  console.log(`>>> Sending: ${test.cmd}`);
  
  messageBuffer = [];
  ws.send(test.cmd);
  
  setTimeout(() => {
    currentTest++;
    runNextTest();
  }, test.wait);
}

function parseProtocol(line) {
  const parts = line.substring(5).split(':');
  const type = parts[0];
  
  switch (type) {
    case 'I':
      console.log('      → Handshake acknowledged');
      break;
    case 'V':
      console.log(`      → Version: ${parts[1]}, Board: ${parts[2]}, Memory: ${parts[4]}`);
      break;
    case 'L':
      console.log(`      → Level: ${parts[1]}`);
      break;
    case 'M':
      console.log(`      → Memory: ${parts[1]}`);
      break;
  }
}
