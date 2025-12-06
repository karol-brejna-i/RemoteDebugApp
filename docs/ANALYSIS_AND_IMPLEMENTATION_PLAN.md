# RemoteDebugApp - Analysis and Implementation Plan

## Table of Contents
1. [Project Overview](#project-overview)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Functionality Breakdown](#functionality-breakdown)
4. [Communication Protocol](#communication-protocol)
5. [Message Format Specification](#message-format-specification)
6. [UI Components and Layout](#ui-components-and-layout)
7. [New Implementation Plan](#new-implementation-plan)
8. [Technology Recommendations](#technology-recommendations)
9. [Migration Strategy](#migration-strategy)

### Related Documents
- [REQUIREMENTS.md](./REQUIREMENTS.md) - Formal requirements specification
- [FUTURE_IMPROVEMENTS.md](./FUTURE_IMPROVEMENTS.md) - Planned future enhancements
- [SSL_WSS_GUIDE.md](./SSL_WSS_GUIDE.md) - SSL/WSS configuration options

---

## 1. Project Overview

### Purpose
RemoteDebugApp is an HTML5 web application designed to debug Arduino (ESP8266/ESP32) devices remotely over WiFi. It connects to the Arduino board via WebSocket and provides a console-like interface for:
- Real-time debug message streaming
- Sending commands to the device
- Changing debug levels
- Monitoring device status (free memory, version, etc.)

### Current Version
- Version: 0.3.2 (2019-03-20)
- Author: Joao Lopes
- License: MIT

### Key Characteristics
- Pure HTML5/CSS3/JavaScript (client-side only)
- Uses WebSocket for real-time bidirectional communication
- Works locally (can be opened directly from disk)
- Communicates with RemoteDebug library v3+ on Arduino
- Uses HTTP (not HTTPS) due to Arduino WebSocket server limitations (no SSL/WSS support)

---

## 2. Current Architecture Analysis

### File Structure
```
RemoteDebugApp/
├── index.html              # Main HTML page
├── app.js                  # Main application logic (OBFUSCATED)
├── app-check.js            # Browser compatibility checks (partially obfuscated)
├── app-colors.css          # CSS variables for theming
├── app-core.css            # Core layout styles
├── app-console.css         # Console/table styling
├── app-buttons.css         # Button styling with icons
├── app-web.css             # Web-specific styles
├── app-mobile.css          # Mobile-specific styles
├── getversion.php          # Server-side version check (PHP)
├── assets/
│   ├── css/util.css        # Utility styles
│   └── js/
│       ├── console.js      # Debug console logging utilities
│       ├── util.js         # DOM utilities, cookies, toast/snackbar
│       ├── jquery.min.js   # jQuery library
│       ├── mousetrap.min.js # Keyboard shortcuts
│       ├── sweetalert2.min.js # Modal dialogs
│       └── ua-parser.min.js # User agent detection
├── materialize/            # Materialize CSS framework
│   ├── css/materialize.min.css
│   └── js/materialize.min.js
└── images/                 # UI icons and assets
```

### Dependencies (Current)
| Library | Version | Purpose |
|---------|---------|---------|
| jQuery | 3.x | DOM manipulation |
| Materialize CSS | 1.0.0 | UI framework (partially used) |
| Mousetrap.js | - | Keyboard shortcuts |
| SweetAlert2 | - | Modal dialogs/notifications |
| UA-Parser.js | - | Browser detection |

### Issues with Current Implementation
1. **Obfuscated Code**: Main `app.js` is obfuscated, making maintenance difficult
2. **Heavy Dependencies**: Uses multiple large libraries (jQuery, Materialize) but only uses small portions
3. **No Module System**: All code is global, no ES6 modules
4. **No Build Pipeline**: No bundling, minification process
5. **Dated Practices**: Uses older JavaScript patterns (var, callbacks)
6. **Limited Error Handling**: Basic try-catch, no structured error handling
7. **No TypeScript**: No type safety

---

## 3. Functionality Breakdown

### Core Features

#### 3.1 Connection Management
- **Connect/Disconnect**: WebSocket connection to Arduino board
- **Address Input**: IP address or mDNS hostname input with history (datalist)
- **Address Persistence**: Last address saved in cookies
- **Connection Status**: Visual indication of connection state
- **Auto-reconnection**: Periodic checks (every 60 seconds)

#### 3.2 Console Display
- **Message Rendering**: HTML table-based console
- **Color-Coded Messages**: Different colors for debug levels
- **ANSI Color Parsing**: Converts ANSI escape codes to CSS classes
- **Auto-scroll**: Optional automatic scrolling to latest messages
- **Clear Console**: Clear all messages

#### 3.3 Debug Level Control
- **5 Debug Levels**: Verbose, Debug, Info, Warning, Error
- **Level Selection**: Buttons to change current debug level
- **Visual Indication**: Active level highlighted with border

#### 3.4 Commands
| Command Key | Action | Description |
|-------------|--------|-------------|
| `v` | Verbose | Set level to Verbose |
| `d` | Debug | Set level to Debug |
| `i` | Info | Set level to Info |
| `w` | Warning | Set level to Warning |
| `e` | Error | Set level to Error |
| `s` | Silence | Toggle silence mode |
| `?` | Help | Show help |
| `m` | Memory | Refresh memory info |
| `ns` | No Stop | Continue execution |
| `reset` | Reset | Reset the board |
| `f [text]` | Filter | Set message filter |
| `nf` | No Filter | Clear filter |

#### 3.5 Additional Features
- **Fullscreen Mode**: Toggle fullscreen display
- **Font Size Adjustment**: Increase/decrease console font
- **Copy to Clipboard**: Copy console content
- **Keyboard Shortcuts**: Command+/Ctrl+ number keys for levels
- **Toast Notifications**: Status messages using SweetAlert2
- **Version Checking**: Periodic check for new versions
- **Debugger Mode**: Toggle debugger (when RemoteDebugger is installed)
- **Profiler Display**: Shows timing between debug messages (color-coded)

#### 3.6 Device Information Display
- **Board Name**: Connected board identifier
- **Free Memory**: Available memory on device
- **RemoteDebug Version**: Library version on device
- **Features**: Icons showing available features (functions, debugger)

---

## 4. Communication Protocol

### WebSocket Connection

#### Connection Setup
```javascript
// Protocol: 'arduino' (custom WebSocket subprotocol)
ws = new WebSocket("ws://<address>:8232", ["arduino"]);
ws.binaryType = "arraybuffer";
```

#### Connection Parameters
- **Default Port**: 8232
- **Protocol**: Custom WebSocket with 'arduino' subprotocol
- **Binary Type**: ArrayBuffer

### Connection Flow
```
1. User enters IP/mDNS address
2. App constructs WebSocket URL: ws://<address>:8232
3. WebSocket connection established
4. App sends "I" command to request initial info
5. Arduino responds with version info
6. App receives streaming debug messages
7. User can send commands back
```

### Event Handlers
```javascript
ws.onopen    // Connection established
ws.onmessage // Receive data from Arduino
ws.onerror   // Handle errors
ws.onclose   // Handle disconnection
```

---

## 5. Message Format Specification

> **Note:** This section has been verified against real WebSocket traffic captured on 2025-12-06
> from RemoteDebug v4.0.0 running on ESP32.

### Incoming Messages (Arduino → App)

#### 5.1 Protocol Messages (App-Specific)
Messages starting with `$app:` prefix - these are control/status messages:

**Format:** `$app:<TYPE>:<FIELD1>:<FIELD2>:...`

**Message Types:**

| Type | Format | Example | Description |
|------|--------|---------|-------------|
| `I` | `$app:I` | `$app:I` | Initial handshake acknowledgment |
| `V` | `$app:V:<ver>:<board>:<feat>:<mem>:<dbg>:<sil>` | `$app:V:4.0.0:ESP32:M:217356u:D:N` | Version/device info |
| `L` | `$app:L:<1-5>` | `$app:L:2` or `$app:L:1-5` | Current debug level changed |
| `M` | `$app:M:<bytes>u:` | `$app:M:217716u:` | Memory info (response to `m` command) |

**Version Message Fields:**
```
$app:V:4.0.0:ESP32:M:217356u:D:N
       │     │     │ │       │ └── Silence mode: N=off, Y=on
       │     │     │ │       └── Debugger: D=disabled, E=enabled
       │     │     │ └── Memory (bytes, 'u' suffix = unsigned)
       │     │     └── Features: M=basic, E=extended (debugger)
       │     └── Board type
       └── RemoteDebug version
```

**Debug Level Values:**
| Value | Level |
|-------|-------|
| 1 | Verbose |
| 2 | Debug |
| 3 | Info |
| 4 | Warning |
| 5 | Error |

#### 5.2 Regular Debug Messages
Plain text, optionally with ANSI color codes for formatting:

**Format with colors enabled:**
```
[<ANSI_CODE>](<LEVEL> t:<timestamp>ms) (<function>)(<core>) <message>[0m
```

**Example:**
```
[1;33m(I t:1389111ms) (executeCommand)(C1) executeCommand: help[0m
```
- `[1;33m` - ANSI color code (yellow = Info)
- `I` - Level indicator (I=Info, W=Warning, D=Debug, V=Verbose, E=Error)
- `t:1389111ms` - Timestamp in milliseconds since boot
- `executeCommand` - Function name that generated the message
- `C1` - CPU Core ID (ESP32 specific)
- Message text follows

**ANSI Color Codes Used:**
| Code | Level | CSS Class |
|------|-------|-----------|
| `[0m` | Reset | (clear formatting) |
| `[1;32m` | Verbose/Debug (bright green) | `tc_verb` / `tc_debug` |
| `[1;33m` | Info (yellow) | `tc_info` |
| `[1;36m` | Warning (cyan) | `tc_warn` |
| `[1;31m` | Error (bright red) | `tc_error` |
| `[0;30m[42m` | Profiler - fast (green bg) | `tc_prof_g` |
| `[0;30m[43m` | Profiler - medium (yellow bg) | `tc_prof_y` |
| `[0;30m[45m` | Profiler - slow (magenta bg) | `tc_prof_o` |
| `[0;30m[41m` | Profiler - very slow (red bg) | `tc_prof_r` |

#### 5.3 System Messages
Plain text messages from RemoteDebug system (no ANSI codes):

```
* Debug: Command received: ?
* Debug level set to Debug
* Show colors: On
* Free Heap RAM: 217592
*** Remote debug - over telnet - for ESP32 - version 4.0.0
```

These are informational and should be displayed as-is.

**Common System Message Patterns (verified):**
```
* Debug: Command received: <cmd>         # Echo of received command
* Debug level set to <Level>             # Level change confirmation
* Show colors: On|Off                    # Colors toggle confirmation  
* Free Heap RAM: <bytes>                 # Memory info
* Debug: Filter active: <string>         # Filter enabled confirmation
* Debug: Filter disabled                 # Filter disabled confirmation
* Reset ...                              # Reset sequence start
* Closing client connection ...          # Pre-reset message
* Resetting the ESP32 ...                # Final reset message before disconnect
*** Remote debug - over telnet - ...     # Help header
* Host name: <name> IP:<ip> Mac address:<mac>  # Device info in help
```

### Outgoing Messages (App → Arduino)

#### Initial Handshake
| Command | Description |
|---------|-------------|
| `$app` | App identification - triggers `$app:I` response and version info |

#### Single-Character Commands
| Command | Description |
|---------|-------------|
| `v` | Set level: Verbose |
| `d` | Set level: Debug |
| `i` | Set level: Info |
| `w` | Set level: Warning |
| `e` | Set level: Error |
| `s` | Toggle silence mode |
| `?` | Show help |
| `m` | Get memory info |
| `l` | Show current debug level |
| `t` | Show time (millis) |
| `c` | Toggle colors on/off |
| `p` | Toggle profiler |
| `q` | Quit (close connection) |

#### Multi-Character Commands
| Command | Format | Description |
|---------|--------|-------------|
| Help | `help` | Same as `?` |
| Filter Set | `filter <string>` | Set filter pattern |
| Filter Clear | `nofilter` | Clear filter |
| Reset | `reset` | Reset the ESP32 (triggers disconnect) |
| Timeout | `timeout <sec>` | Set connection timeout (0=disabled) |
| Profiler min | `p <min>` | Show profiler only if time >= min ms |
| Profiler level | `P time` | Set debug level to profiler |
| Custom | `<any text>` | User-defined command (project-specific) |

#### Reset Sequence (Observed)
```
1. App sends: "reset"
2. Arduino responds:
   - "* Debug: Command received: reset"
   - "* Reset ..."
   - "* Closing client connection ..."
   - "* Resetting the ESP32 ..."
3. WebSocket connection closes
4. ESP32 reboots
5. App must reconnect and send "$app" handshake again
```

#### Observed Command Flow
```
1. App connects via WebSocket
2. App sends: "$app"
3. Arduino responds:
   - "$app:I"           (handshake ack)
   - ""                  (empty line)
   - "$app:V:4.0.0:..."  (version info)
   - "$app:L:1"          (current level)
4. App sends commands, Arduino responds with debug output
5. Level changes trigger "$app:L:<n>" messages
```

### Complete RemoteDebug Help Reference (v4.0.0)

This is the complete help output captured from RemoteDebug v4.0.0:

```
*** Remote debug - over telnet - for ESP32 - version 4.0.0
* Host name: <hostname> IP:<ip> Mac address:<mac>
* Free Heap RAM: <bytes>
* ESP SDK version: <version>
******************************************************
* Commands:
    ? or help -> display these help of commands
    q -> quit (close this connection)
    m -> display memory available
    v -> set debug level to verbose
    d -> set debug level to debug
    i -> set debug level to info
    w -> set debug level to warning
    e -> set debug level to errors
    s -> set debug silence on/off
    l -> show debug level
    t -> show time (millis)
    timeout -> set connection timeout (sec, 0 = disabled)
    profiler:
      p      -> show time between actual and last message (in millis)
      p min  -> show only if time is this minimal
      P time -> set debug level to profiler
    c -> show colors
    filter:
          filter <string> -> show only debugs with this
          nofilter        -> disable the filter
    reset -> reset the ESP32

    * Project commands:
    [User-defined commands appear here]

* Please type the command and press enter to execute.(? or h for this help)
***
```

---

## 6. UI Components and Layout

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                   │
│ ┌─────────┬───────────────────────────┬───────────────┐ │
│ │  Logo   │  Board Info | Memory | Ver │ [Address][Con]│ │
│ └─────────┴───────────────────────────┴───────────────┘ │
├─────────────────────────────────────────────────────────┤
│ CONTENT (Console)                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │  Debug messages displayed here as HTML table rows   │ │
│ │                                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ FOOTER                                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [AutoScroll][Silence][Debugger] | [V][D][I][W][E]   │ │
│ │ [___Send Input___][Send][Filter]| [A+][A-][Clr][Cp] │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Button Groups

#### Control Buttons (Row 1, Left)
- Auto scroll toggle
- Silence mode toggle
- Debugger toggle
- Help
- Reset

#### Level Buttons (Row 1, Right)
- V - Verbose
- D - Debug
- I - Info
- W - Warning
- E - Error

#### Input Area (Row 2, Left)
- Text input with datalist
- Send button
- Filter toggle button

#### Utility Buttons (Row 2, Right)
- Font size up (A+)
- Font size down (A-)
- Clear console
- Copy to clipboard
- Converter (links to GitHub)
- Settings (placeholder)

---

## 7. New Implementation Plan

### Phase 1: Project Setup
1. **Initialize Modern Project Structure**
   ```
   src/
   ├── index.html
   ├── main.ts
   ├── styles/
   │   ├── main.css
   │   ├── variables.css
   │   ├── console.css
   │   └── buttons.css
   ├── components/
   │   ├── Console.ts
   │   ├── Header.ts
   │   ├── Footer.ts
   │   └── ConnectionPanel.ts
   ├── services/
   │   ├── WebSocketService.ts
   │   ├── MessageParser.ts
   │   └── StorageService.ts
   ├── utils/
   │   ├── ansi-parser.ts
   │   ├── keyboard.ts
   │   └── dom.ts
   └── types/
       └── index.ts
   ```

2. **Configure Build Tools**
   - Vite or esbuild for bundling
   - TypeScript for type safety
   - PostCSS for CSS processing

### Phase 2: Core Implementation

#### 2.1 Type Definitions
```typescript
// types/index.ts
interface DeviceInfo {
  board: string;
  version: string;
  memory: number;
  features: 'E' | 'M' | '';
  debuggerEnabled: boolean;
  silenceMode: boolean;
  debugLevel: DebugLevel;
}

enum DebugLevel {
  Verbose = 1,
  Debug = 2,
  Info = 3,
  Warning = 4,
  Error = 5
}

enum MessageType {
  Debug = 'debug',
  Version = 'version',
  Debugger = 'debugger',
  Level = 'level',
  Silence = 'silence',
  Memory = 'memory'
}

interface ParsedMessage {
  type: MessageType;
  content: string;
  cssClass?: string;
  raw: string;
}

interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  address: string;
  error?: string;
}
```

#### 2.2 WebSocket Service
```typescript
// services/WebSocketService.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private readonly port = 8232;
  
  connect(address: string): Promise<void>;
  disconnect(): void;
  send(command: string): void;
  
  onMessage: (handler: (data: string) => void) => void;
  onConnect: (handler: () => void) => void;
  onDisconnect: (handler: () => void) => void;
  onError: (handler: (error: Error) => void) => void;
}
```

#### 2.3 Message Parser
```typescript
// services/MessageParser.ts
class MessageParser {
  parse(rawMessage: string): ParsedMessage[];
  parseANSI(text: string): { text: string; cssClass: string }[];
  parseProtocol(text: string): ProtocolMessage | null;
}
```

### Phase 3: UI Components

#### 3.1 Component Architecture (Vanilla TypeScript)
```typescript
// components/Console.ts
class Console {
  private container: HTMLElement;
  private autoScroll: boolean = true;
  
  constructor(container: HTMLElement);
  appendMessage(message: ParsedMessage): void;
  clear(): void;
  setAutoScroll(enabled: boolean): void;
  copyToClipboard(): Promise<void>;
  scrollToBottom(): void;
}
```

#### 3.2 State Management
Simple reactive state without framework:
```typescript
// services/StateService.ts
class StateService {
  private state: AppState;
  private listeners: Map<string, Function[]>;
  
  getState(): AppState;
  setState(partial: Partial<AppState>): void;
  subscribe(key: keyof AppState, handler: Function): void;
}
```

### Phase 4: Features Implementation

#### Priority Order
1. WebSocket connection/disconnection
2. Message receiving and parsing
3. Console rendering with colors
4. Send commands
5. Debug level switching
6. Auto-scroll toggle
7. Silence mode
8. Memory refresh
9. Clipboard copy
10. Keyboard shortcuts
11. Font size adjustment
12. Filter functionality
13. Fullscreen mode
14. Toast notifications
15. **Dark/Light theme toggle**
16. **Customizable colors per log level**
17. Version checking (optional for local use)

### Phase 5: Theming System

#### 5.1 Theme Architecture
```typescript
// services/ThemeService.ts
interface ThemeColors {
  background: string;
  foreground: string;
  verbose: string;
  debug: string;
  info: string;
  warning: string;
  error: string;
  profilerFast: string;
  profilerMedium: string;
  profilerSlow: string;
  profilerVerySlow: string;
}

interface Theme {
  name: 'light' | 'dark' | 'custom';
  colors: ThemeColors;
}

class ThemeService {
  private currentTheme: Theme;
  
  setTheme(theme: 'light' | 'dark'): void;
  setCustomColor(level: keyof ThemeColors, color: string): void;
  getTheme(): Theme;
  applyTheme(): void;  // Updates CSS variables
  persistTheme(): void; // Save to localStorage
}
```

#### 5.2 CSS Variables for Theming
```css
/* Default (light) theme */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #212121;
  --text-secondary: #757575;
  
  /* Log level colors - customizable */
  --color-verbose: rgb(60, 179, 113);
  --color-debug: rgb(0, 128, 0);
  --color-info: rgb(218, 165, 32);
  --color-warning: rgb(238, 64, 0);
  --color-error: rgb(255, 0, 0);
}

/* Dark theme */
[data-theme="dark"] {
  --bg-primary: #1e1e1e;
  --bg-secondary: #2d2d2d;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  
  /* Adjusted for dark background */
  --color-verbose: rgb(80, 200, 130);
  --color-debug: rgb(50, 180, 50);
  --color-info: rgb(255, 200, 50);
  --color-warning: rgb(255, 140, 50);
  --color-error: rgb(255, 100, 100);
}
```

#### 5.3 Settings UI
```
┌─────────────────────────────────────┐
│ Settings                        [X] │
├─────────────────────────────────────┤
│ Theme: [Light ▼] / [Dark ▼]        │
│                                     │
│ Log Level Colors:                   │
│   Verbose: [■ #3CB371] [Reset]     │
│   Debug:   [■ #008000] [Reset]     │
│   Info:    [■ #DAA520] [Reset]     │
│   Warning: [■ #EE4000] [Reset]     │
│   Error:   [■ #FF0000] [Reset]     │
│                                     │
│ [Reset All to Defaults]             │
└─────────────────────────────────────┘
```

---

## 8. Technology Recommendations

### Recommended Stack

| Category | Technology | Justification |
|----------|------------|---------------|
| **Language** | TypeScript 5.x | Type safety, better IDE support, modern features |
| **Build Tool** | Vite | Fast dev server, optimized builds, native ES modules |
| **CSS** | Vanilla CSS + CSS Variables | No framework bloat, native features sufficient |
| **Testing** | Vitest | Fast, Vite-native testing |
| **Linting** | ESLint + Prettier | Code quality |

### Libraries to Remove
- ❌ jQuery → Use native DOM APIs
- ❌ Materialize → Custom minimal CSS
- ❌ SweetAlert2 → Native notifications or minimal toast
- ❌ UA-Parser → navigator.userAgent (if needed)

### Libraries to Keep/Replace
- Mousetrap → **Keep** (small, focused) OR native keyboard events

### New Minimal Dependencies
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Performance Optimizations
1. **Virtual Scrolling**: For console with many messages
2. **Message Batching**: Buffer and render in batches
3. **Efficient DOM Updates**: DocumentFragment, innerHTML batching
4. **CSS Containment**: Use `contain` property for console
5. **Debounced Scroll**: Debounce auto-scroll checks

---

## 9. Migration Strategy

### Step 1: Create New Project
```bash
npm create vite@latest remotedebug-app -- --template vanilla-ts
cd remotedebug-app
npm install
```

### Step 2: Implement Core (Week 1)
- TypeScript setup
- WebSocket service
- Message parser
- Basic console rendering

### Step 3: UI Implementation (Week 2)
- HTML structure
- CSS styling (port existing styles)
- Button functionality
- Keyboard shortcuts

### Step 4: Advanced Features (Week 3)
- Filter functionality
- Fullscreen mode
- Toast notifications
- Settings persistence

### Step 5: Testing & Polish (Week 4)
- Unit tests for parser
- Integration tests for WebSocket
- Cross-browser testing
- Performance optimization

### Step 6: Documentation
- User documentation
- API documentation
- Contribution guidelines

---

## Appendix A: Protocol Message Reference (Verified)

```javascript
// Protocol messages start with "$app:"
const PROTOCOL_PREFIX = '$app:';

const PROTOCOL_MESSAGES = {
  // Incoming (Arduino → App)
  'I': 'Initial handshake acknowledgment',
  'V': 'Version info: $app:V:<ver>:<board>:<feat>:<mem>:<dbg>:<sil>',
  'L': 'Debug level: $app:L:<1-5>',
  
  // Outgoing (App → Arduino)
  '$app': 'Initial handshake request'
};

const DEBUG_LEVELS = {
  1: 'Verbose',
  2: 'Debug', 
  3: 'Info',
  4: 'Warning',
  5: 'Error'
};
```

## Appendix B: ANSI Color Code Reference (Verified)

```javascript
// ANSI codes observed in real traffic
const ANSI_CODES = {
  // Reset
  '[0m': 'reset',
  
  // Debug Levels (observed)
  '[1;32m': 'verbose',     // Bright green
  '[1;33m': 'info',        // Yellow  
  '[1;36m': 'warning',     // Cyan
  '[1;31m': 'error',       // Bright red
  
  // Profiler (background colors)
  '[0;30m[42m': 'profiler-green',  // Fast (< threshold)
  '[0;30m[43m': 'profiler-yellow', // Medium
  '[0;30m[45m': 'profiler-magenta',// Slow
  '[0;30m[41m': 'profiler-red',    // Very slow
};

// Debug message format regex
const DEBUG_MSG_REGEX = /^\[[\d;]+m\(([VDIWE])\s+t:(\d+)ms\)\s+\((\w+)\)\(C(\d)\)\s+(.+)$/;
// Groups: 1=level, 2=timestamp, 3=function, 4=core, 5=message
```

## Appendix B: CSS Color Variables

```css
:root {
  /* Content */
  --content-color: #212121;
  --disabled-color: #708090;
  
  /* Debug Levels */
  --verbose-color: rgb(60, 179, 113);
  --debug-color: rgb(0, 128, 0);
  --info-color: rgb(218, 165, 32);
  --warning-color: rgb(238, 64, 0);
  --error-color: rgb(255, 0, 0);
  
  /* Profiler */
  --profiler-green-bg: var(--debug-color);
  --profiler-yellow-bg: var(--info-color);
  --profiler-orange-bg: #CDCD00;
  --profiler-red-bg: var(--warning-color);
}
```

## Appendix C: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + K | Connect/Disconnect |
| Cmd/Ctrl + 0 | Silence toggle |
| Cmd/Ctrl + 1 | Level: Verbose |
| Cmd/Ctrl + 2 | Level: Debug |
| Cmd/Ctrl + 3 | Level: Info |
| Cmd/Ctrl + 4 | Level: Warning |
| Cmd/Ctrl + 5 | Level: Error |
| Cmd/Ctrl + 7 | Clear console |
| Cmd/Ctrl + E | Debugger toggle |
| Enter (in input) | Send command |

---

*Document created: December 6, 2025*
*For: RemoteDebugApp modernization project*
