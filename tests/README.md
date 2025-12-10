# WebSocket Test Scripts

Test utilities for the RemoteDebug WebSocket protocol.

## Prerequisites

### For Node.js scripts
```bash
npm install ws
```

### For Bash script
Install `websocat`:
```bash
# Using cargo
cargo install websocat

# On Ubuntu/Debian
apt install websocat

# On macOS
brew install websocat
```

## Scripts

### 1. `ws-test.sh` - Bash automated tests
Runs a sequence of commands and displays responses.

```bash
chmod +x ws-test.sh
./ws-test.sh 192.168.0.218 8232
```

### 2. `ws-test.cjs` - Node.js automated tests
Same as bash version but in Node.js.

```bash
node ws-test.cjs 192.168.0.218 8232
```

### 3. `ws-repl.cjs` - Interactive REPL
Interactive command-line interface for sending commands.

```bash
node ws-repl.cjs 192.168.0.218 8232
```

Type commands directly, see responses in real-time. Type `.help` for available commands.

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `$app` | Handshake - triggers version info |
| `?` | Show help |
| `v` | Set level: Verbose |
| `d` | Set level: Debug |
| `i` | Set level: Info |
| `w` | Set level: Warning |
| `e` | Set level: Error |
| `m` | Get memory info |
| `s` | Toggle silence mode |
| `c` | Toggle colors |
| `p` | Toggle profiler |
| `reset` | Reset device |
| `filter <text>` | Set message filter |
| `nofilter` | Clear filter |

## Protocol Messages

### Incoming (Device → App)

| Format | Description |
|--------|-------------|
| `$app:I` | Handshake acknowledgment |
| `$app:V:<ver>:<board>:<feat>:<mem>:<dbg>:<sil>` | Version info |
| `$app:L:<level>` | Current debug level |
| `$app:M:<bytes>u:` | Memory info |
| `* ...` | System message |
| `[<ANSI>](<LEVEL> t:<ms>ms) ...` | Debug message |

### Outgoing (App → Device)

Single characters or words, sent as plain text.
