# WSTerm — WebSocket terminal for ESP32
## Design Specification & UI System Document

---

## 1. Overview

WSTerm is a modern WebSocket-powered terminal interface for ESP32 devices.  
The tool provides a real-time log viewer, filtering system, and device status panel within a clean, responsive, dark-themed web interface.

This document defines the brand identity, UI design, component structure, and WebSocket communication model used by WSTerm.

---

## 2. Branding

### 2.1 Name
**WSTerm**

### 2.2 Tagline
**WebSocket terminal for ESP32**

### 2.3 Logo Concept
A minimalist terminal window outline containing:
- a command caret `>_` on the left  
- a two-circle “link” icon representing WebSocket connectivity on the right  

```
┌────────────┐  WSTerm
│ >_   ⦿⦿    │  WebSocket terminal for ESP32
└────────────┘
```

### 2.4 Wordmark
- “WS” — accent color (cyan)  
- “Term” — white or soft gray  

### 2.5 Color Palette

| Usage | Color |
|-------|--------|
| Accent | `#38BDF8` |
| App bar background | `#101218` |
| Console background | `#050609` |
| Panel background | `#0B0F1A` |
| Primary text | `#E5E7EB` |
| Muted text | `#9CA3AF` |
| Border | `#1F2937` |

---

## 3. Typography

### 3.1 Fonts
- **Base UI:** Inter or system UI sans-serif  
- **Console:** JetBrains Mono, Fira Code, or monospace fallback  

### 3.2 Text Styles

| Token | Usage | Size | Weight |
|--------|--------|-------|---------|
| Title | App name | 18px | 600 |
| Subtitle | Section headers | 13px | 600 |
| Body | General UI text | 13px | 400 |
| Mono | Console text | 13px | 400 |
| Caption | Timestamps | 11px | 400 |

---

## 4. Layout System

### 4.1 Top App Bar
- Height: 56px  
- Background: `#101218`  
- Three sections: left (logo), center (status badges), right (actions)  

**Status badges include:**  
- Connection state  
- Free RAM  
- WSTerm version  

**Actions:**  
- Disconnect  
- Fullscreen  

---

### 4.2 Main Console Area
A large scrollable panel with a modern log viewer.

- Background: `#050609`
- Padding: 16px
- Monospaced font

#### Console Header
- Auto-scroll toggle  
- Search field ("Filter logs…")  
- Optional profile selector  

#### Log Entry Format

```
12:34.567   [INFO]   System initialized
```

#### Level Colors

| Level | Text | Background |
|--------|--------|--------------|
| TRACE | `#9CA3AF` | none |
| DEBUG | `#38BDF8` | rgba(56,189,248,0.12) |
| INFO | `#22C55E` | rgba(34,197,94,0.12) |
| WARN | `#EAB308` | rgba(250,204,21,0.16) |
| ERROR | `#F97373` | rgba(248,113,113,0.16) |

---

### 4.3 Right Panel (Filters & Device Info)
- Width: 260px  
- Background: `#0B0F1A`  
- Three sections:
  1. Log levels toggles  
  2. Filters  
  3. Device info (memory, uptime, metadata)

---

### 4.4 Bottom Toolbar

Left tools:
- Pause / Resume  
- Clear  
- Copy all  
- Export (.txt / .json)  

Right tools:
- Font size controls  
- Theme toggle  
- Settings  

---

## 5. Responsiveness

- **Large screens (>1024px):** Right panel always visible  
- **Tablets (768–1024px):** Right panel collapses to overlay  
- **Mobile (<768px):** Simplified top bar + rearranged toolbar  

---

## 6. Interaction & States

### Hover
- Buttons brighten  
- Level pills emphasize borders  

### Active
- Slight scale-down (0.97)

### Disconnected Mode
- Status badge turns red  
- Console shows banner with reconnect button  

---

## 7. WebSocket Communication Model

WSTerm uses WebSockets exclusively for real-time communication.

### 7.1 Endpoint
```
ws://<device-ip>:<port>/ws
```

### 7.2 Messages from ESP32 → Browser

```json
{
  "type": "log",
  "level": "INFO",
  "timestamp": 1713371912398,
  "message": "System initialized"
}
```

Other message types:
- `status`
- `event`

### 7.3 Messages from Browser → ESP32

```json
{
  "type": "command",
  "command": "restart"
}
```

Or configuration updates:

```json
{
  "type": "config",
  "autoScroll": true,
  "levels": ["DEBUG", "INFO", "ERROR"]
}
```

### 7.4 Keepalive
- Ping/pong every 30s  
- Auto-reconnect recommended  

---

## 8. Component Architecture

```
App
 ├─ AppBar
 ├─ Console
 │   ├─ ConsoleHeader
 │   ├─ LogList
 │   └─ LogEntry
 ├─ SidePanel
 │   ├─ Levels
 │   ├─ Filters
 │   └─ DeviceInfo
 └─ BottomToolbar
```

---

## 9. Future Enhancements

- Multi-device tabs  
- Command palette  
- Syntax-highlighted structured logs  
- Log bookmarking  
- Notes/annotations  

---

This concludes the design specification for **WSTerm – WebSocket terminal for ESP32**.


---

## 10. Logo SVG (Embeddable)

Below is an example SVG implementation of the **WSTerm** logo.  
You can embed it directly in HTML or reference it as a separate `.svg` file.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="80" viewBox="0 0 280 80" role="img" aria-labelledby="title desc">
  <title id="title">WSTerm Logo</title>
  <desc id="desc">Logo showing a terminal window with a caret and linked circles, next to the WSTerm wordmark.</desc>
  <!-- Terminal window -->
  <rect x="10" y="10" rx="8" ry="8" width="150" height="60" fill="#050609" stroke="#38BDF8" stroke-width="2" />
  <!-- Caret -->
  <text x="30" y="48" fill="#E5E7EB" font-family="JetBrains Mono, monospace" font-size="20">&gt;_</text>
  <!-- WebSocket link circles -->
  <circle cx="130" cy="32" r="6" fill="#38BDF8" />
  <circle cx="145" cy="46" r="6" fill="#38BDF8" />
  <!-- Wordmark -->
  <text x="170" y="48" font-family="Inter, system-ui, sans-serif" font-size="22">
    <tspan fill="#38BDF8">WS</tspan>
    <tspan fill="#E5E7EB">Term</tspan>
  </text>
</svg>
```

You can also save this SVG as a standalone file (e.g. `WSTerm_logo.svg`) and reference it in HTML:

```html
<img src="WSTerm_logo.svg" alt="WSTerm - WebSocket terminal for ESP32" />
```


```svg
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60">
  <rect x="2" y="7" width="76" height="46" rx="8" ry="8"
        fill="#050609" stroke="#38BDF8" stroke-width="2"/>
  <text x="12" y="37" fill="#E5E7EB"
        font-family="JetBrains Mono, monospace" font-size="18">&gt;_</text>
  <circle cx="50" cy="25" r="5" fill="#38BDF8"/>
  <circle cx="60" cy="35" r="5" fill="#38BDF8"/>
  <text x="95" y="40" font-family="Inter, system-ui" font-size="26">
    <tspan fill="#38BDF8">WS</tspan><tspan fill="#E5E7EB">Term</tspan>
  </text>
</svg>
```I
