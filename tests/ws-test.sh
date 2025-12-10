#!/bin/bash
#
# WebSocket Test Script for RemoteDebug/WSTerm
# 
# Requires: websocat (install: cargo install websocat or apt install websocat)
#
# Usage: ./ws-test.sh <ip_address> [port]
#

IP="${1:-192.168.0.218}"
PORT="${2:-8232}"
WS_URL="ws://${IP}:${PORT}"

echo "============================================"
echo "WSTerm WebSocket Test"
echo "============================================"
echo "Target: ${WS_URL}"
echo ""

# Check if websocat is installed
if ! command -v websocat &> /dev/null; then
    echo "ERROR: websocat not found!"
    echo ""
    echo "Install options:"
    echo "  cargo install websocat"
    echo "  apt install websocat"
    echo "  brew install websocat"
    exit 1
fi

echo "Testing connection..."
echo ""

# Function to send command and wait for response
send_cmd() {
    local cmd="$1"
    local desc="$2"
    echo ">>> Sending: $cmd ($desc)"
    echo "$cmd" | timeout 3 websocat -n1 "${WS_URL}" --protocol arduino 2>/dev/null | head -20
    echo ""
}

# Test 1: Handshake
echo "--- Test 1: Handshake ---"
send_cmd '$app' "Initial handshake - should return \$app:I and \$app:V:..."

# Test 2: Help command
echo "--- Test 2: Help Command ---"
send_cmd '?' "Help - should return command list"

# Test 3: Memory info
echo "--- Test 3: Memory Info ---"
send_cmd 'm' "Memory - should return \$app:M:<bytes>u:"

# Test 4: Level change
echo "--- Test 4: Level Change ---"
send_cmd 'd' "Set level to Debug"

# Test 5: Status (if your device supports it)
echo "--- Test 5: Status Command ---"
send_cmd 'status' "Status - device-specific command"

echo "============================================"
echo "Tests complete"
echo "============================================"
