# WSTerm

**WebSocket Terminal for Remote Debugging of ESP32/ESP8266 Arduino Devices**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)

WSTerm is a modern, lightweight web-based terminal application for remotely debugging ESP32 and ESP8266 microcontrollers running the [RemoteDebug](https://github.com/JoaoLopesF/RemoteDebug) library.

![WSTerm Screenshot](docs/ui-Screenshot.png)

## ✨ Features

- **Real-time WebSocket Communication** - Connect to your ESP device over WiFi
- **Debug Level Filtering** - Filter messages by Verbose, Debug, Info, Warning, Error
- **ANSI Color Support** - Automatic parsing and display of colored output
- **Keyboard Shortcuts** - Quick access to common commands (V, D, I, W, E for levels)
- **Command History** - Navigate through previously sent commands
- **Dark/Light Themes** - Comfortable viewing in any environment
- **Responsive Design** - Works on desktop and mobile browsers
- **No Dependencies Runtime** - Pure TypeScript, no jQuery or heavy frameworks
- **Extensible Codec System** - Easily add support for custom protocols

## 🎯 Goals

This project is a complete rewrite of the original RemoteDebugApp with the following goals:

1. **Modern Stack** - TypeScript, Vite, ES Modules instead of obfuscated jQuery code
2. **Performance** - Efficient rendering with batched DOM updates
3. **Maintainability** - Clean, documented, modular codebase
4. **Extensibility** - Pluggable codec system for different protocols
5. **Lightweight** - Minimal bundle size, fast load times

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- An ESP32/ESP8266 running [RemoteDebug](https://github.com/JoaoLopesF/RemoteDebug)

### Installation

```bash
# Clone the repository
git clone https://github.com/karol-brejna-i/RemoteDebugApp.git
cd RemoteDebugApp

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser, enter your ESP device's IP address, and click Connect.

## 📦 Building

### Development Build

```bash
npm run dev
```

Starts Vite dev server with hot module replacement at http://localhost:3000.

### Production Build

```bash
npm run build
```

Creates optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## 🧪 Testing

### Automated Tests

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### WebSocket Protocol Tests

Test scripts are available in the `tests/` directory for testing the WebSocket protocol:

```bash
# Install ws package (if not already installed)
npm install

# Run automated protocol tests
node tests/ws-test.cjs 192.168.0.218 8232

# Interactive REPL for manual testing
node tests/ws-repl.cjs 192.168.0.218 8232
```

See [tests/README.md](tests/README.md) for more details.

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

## 📁 Project Structure

```
RemoteDebugApp/
├── src/
│   ├── components/      # UI components (App, Console, Header, etc.)
│   ├── services/        # Business logic
│   │   ├── codec/       # Message encoding/decoding (extensible)
│   │   ├── WebSocketService.ts
│   │   ├── StorageService.ts
│   │   └── ThemeService.ts
│   ├── styles/          # CSS stylesheets
│   ├── types/           # TypeScript type definitions
│   └── main.ts          # Application entry point
├── public/              # Static assets
├── tests/               # WebSocket protocol tests
├── docs/                # Documentation
├── legacy/              # Original app (for reference)
└── dist/                # Production build output
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Set level to Verbose |
| `D` | Set level to Debug |
| `I` | Set level to Info |
| `W` | Set level to Warning |
| `E` | Set level to Error |
| `C` | Clear console |
| `P` | Pause/resume output |
| `A` | Toggle auto-scroll |
| `?` | Send help command |
| `R` | Send reset command |
| `Esc` | Close settings panel |

## 🔌 Protocol

WSTerm communicates with the ESP device using the RemoteDebug WebSocket protocol:

- **Port**: 8232 (default)
- **Subprotocol**: `arduino`
- **Handshake**: Send `$app` to receive device info

See [docs/ANALYSIS_AND_IMPLEMENTATION_PLAN.md](docs/ANALYSIS_AND_IMPLEMENTATION_PLAN.md) for full protocol documentation.

## 🔧 Configuration

Settings are automatically saved to localStorage:

- Theme (dark/light/system)
- Font size
- Last connected address
- Auto-scroll preference
- Level colors

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [RemoteDebug](https://github.com/JoaoLopesF/RemoteDebug) - The Arduino library this app connects to
- Original RemoteDebugApp for protocol reference

---

**Note**: This is a complete rewrite (v2.0) of the original RemoteDebugApp. The legacy version is preserved in the `legacy/` directory for reference.
