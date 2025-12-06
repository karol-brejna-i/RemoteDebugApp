# RemoteDebugApp - UI/UX Design Specification

This document defines the user interface design for the new RemoteDebugApp implementation.

---

## 1. Design Principles

### 1.1 Core Principles
- **Focus on Content**: Console output is the primary element - maximize its visibility
- **Reduce Cognitive Load**: Group related controls, hide advanced options
- **Consistency**: Follow established patterns from VS Code, Chrome DevTools
- **Accessibility**: Sufficient contrast, keyboard navigable, screen reader friendly
- **Performance**: Render efficiently even with high message volume

### 1.2 Design Goals
- Modern, professional appearance
- Dark theme default (easier on eyes for long sessions)
- Light theme option
- Familiar to users of terminal applications
- Mobile-responsive (tablet-friendly, phone-usable)

---

## 2. Color System

### 2.1 Theme: Dark (Default)

```css
/* Background layers */
--bg-primary: #1e1e1e;      /* Main background */
--bg-secondary: #252526;    /* Header/footer */
--bg-tertiary: #2d2d2d;     /* Cards, panels */
--bg-hover: #3c3c3c;        /* Hover states */
--bg-active: #094771;       /* Active/selected */

/* Text */
--text-primary: #cccccc;    /* Main text */
--text-secondary: #8c8c8c;  /* Secondary/muted */
--text-bright: #ffffff;     /* Emphasis */
--text-disabled: #5c5c5c;   /* Disabled state */

/* Borders */
--border-default: #3c3c3c;
--border-active: #007acc;

/* Status colors */
--status-connected: #4ec9b0;
--status-disconnected: #6c6c6c;
--status-connecting: #dcdcaa;
--status-error: #f14c4c;
```

### 2.2 Theme: Light

```css
/* Background layers */
--bg-primary: #ffffff;
--bg-secondary: #f3f3f3;
--bg-tertiary: #e8e8e8;
--bg-hover: #e0e0e0;
--bg-active: #cce5ff;

/* Text */
--text-primary: #333333;
--text-secondary: #666666;
--text-bright: #000000;
--text-disabled: #a0a0a0;

/* Borders */
--border-default: #d4d4d4;
--border-active: #007acc;
```

### 2.3 Debug Level Colors

Optimized for both dark and light backgrounds:

| Level | Dark Theme | Light Theme | Meaning |
|-------|------------|-------------|---------|
| Verbose | `#6a9955` | `#22863a` | Muted green |
| Debug | `#4ec9b0` | `#0a7d8c` | Teal/cyan |
| Info | `#dcdcaa` | `#b08800` | Yellow/gold |
| Warning | `#ce9178` | `#e36209` | Orange |
| Error | `#f14c4c` | `#cb2431` | Red |

### 2.4 Profiler Colors (Background)

| Speed | Color | Usage |
|-------|-------|-------|
| Fast (< 10ms) | `#2d5a2d` | Green tint |
| Medium (10-100ms) | `#5a5a2d` | Yellow tint |
| Slow (100-500ms) | `#5a4a2d` | Orange tint |
| Very Slow (> 500ms) | `#5a2d2d` | Red tint |

---

## 3. Typography

### 3.1 Font Stack

```css
/* UI elements */
--font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
           Oxygen, Ubuntu, Cantarell, sans-serif;

/* Console output */
--font-mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', 
             'Cascadia Code', Consolas, monospace;
```

### 3.2 Font Sizes

| Element | Size | Weight |
|---------|------|--------|
| Console text | 13px (adjustable 10-18px) | 400 |
| UI labels | 12px | 400 |
| Buttons | 12px | 500 |
| Header info | 12px | 400 |
| Status text | 11px | 400 |

### 3.3 Line Height

- Console: 1.4 (for readability)
- UI elements: 1.2

---

## 4. Layout Structure

### 4.1 Desktop Layout (≥ 768px)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (48px height)                                            │
│ ┌────────┬──────────────────────────────┬────────────────────┐  │
│ │ Logo   │ Device Info                   │ Connection         │  │
│ │ 🔌     │ ESP32 • 217 KB • v4.0.0      │ [address  ][●]     │  │
│ └────────┴──────────────────────────────┴────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ TOOLBAR (36px height)                                           │
│ ┌────────────────────────┬──────────────────┬────────────────┐  │
│ │ Levels: [V][D][I][W][E]│ [🔇][📜][⏱️]    │ [🔍 Filter... ]│  │
│ └────────────────────────┴──────────────────┴────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ CONSOLE (flex: 1, fills remaining space)                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▸ 12:45:01.234 [I] (main)(C1) Starting application...      │ │
│ │ ▸ 12:45:01.456 [D] (wifi)(C0) Connecting to network...     │ │
│ │ ▸ 12:45:02.789 [I] (wifi)(C0) Connected: 192.168.1.100     │ │
│ │ ▸ 12:45:03.012 [W] (sensor)(C1) Temperature high: 45°C     │ │
│ │ ▸ 12:45:03.234 [E] (mqtt)(C0) Connection failed: timeout   │ │
│ │                                                             │ │
│ │                                                             │ │
│ │                                                    [scroll] │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ INPUT BAR (44px height)                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Command input...                              ][Send][⚙️] │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Mobile Layout (< 768px)

```
┌─────────────────────────────────┐
│ HEADER (compact)                │
│ 🔌 ESP32       [192.168...][●] │
├─────────────────────────────────┤
│ CONSOLE                         │
│ (full width, scrollable)        │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│ TOOLBAR (horizontal scroll)     │
│ [V][D][I][W][E] [🔇][📜] [⚙️] │
├─────────────────────────────────┤
│ INPUT                           │
│ [Command...            ][Send] │
└─────────────────────────────────┘
```

### 4.3 Layout Dimensions

| Element | Desktop | Mobile |
|---------|---------|--------|
| Header height | 48px | 40px |
| Toolbar height | 36px | 44px (touch) |
| Input bar height | 44px | 48px (touch) |
| Console | flex: 1 | flex: 1 |
| Min width | 320px | 320px |
| Ideal width | 1024px+ | 100% |

---

## 5. Component Design

### 5.1 Header

```
┌─────────────────────────────────────────────────────────────┐
│ 🔌  │ ESP32 • 217,356 bytes free • RemoteDebug v4.0.0  │●│ │
│     │ bramator.local                                    │  │
└─────────────────────────────────────────────────────────────┘
     │                    │                               │
     │                    │                               └── Connection status dot
     │                    │                                   ● Green = connected
     │                    │                                   ○ Gray = disconnected  
     │                    │                                   ◐ Yellow = connecting
     │                    │                                   ● Red = error
     │                    └── Device info (shown when connected)
     └── Logo/branding (clickable → help/about)

Connection area (right side):
┌──────────────────────────────────┐
│ [192.168.1.100    ▼] [Connect] │  ← Disconnected state
│ [bramator.local   ▼] [Discon.] │  ← Connected state  
└──────────────────────────────────┘
```

### 5.2 Toolbar

```
┌───────────────────────────────────────────────────────────────────────┐
│ Debug Level          │ Toggles           │ Filter                     │
│ [V][D][I][W][E]     │ [🔇][📜][⏱️]      │ [🔍 Filter messages...  ] │
└───────────────────────────────────────────────────────────────────────┘
```

**Debug Level Buttons:**
- Compact square buttons with single letter
- Active level has accent border/background
- Tooltip shows full name + keyboard shortcut
- Click sends level command AND updates UI optimistically

**Toggle Buttons:**
- 🔇 Silence mode (mutes output from device)
- 📜 Auto-scroll (on by default)
- ⏱️ Profiler (shows timing between messages)

**Filter Input:**
- Inline search box
- Filters console in real-time (client-side)
- Clear button (×) when text present
- Optional: regex toggle

### 5.3 Console

```
┌─────────────────────────────────────────────────────────────────────┐
│ ▸ 12:45:01.234 [I] (main)(C1) Starting application...              │
│ ▸ 12:45:01.456 [D] (wifi)(C0) Connecting to network "HomeWifi"...  │
│ ▸ 12:45:02.789 [I] (wifi)(C0) Connected: 192.168.1.100             │
│ ▸ 12:45:03.012 [W] (sensor)(C1) Temperature reading high: 45°C     │
│ ▸ 12:45:03.234 [E] (mqtt)(C0) Connection failed: timeout after 5s  │
│   └─ Retry scheduled in 10 seconds                                  │
│ * Debug: Command received: status                                   │
│ ▸ 12:45:04.567 [V] (debug)(C1) Status requested by remote client   │
└─────────────────────────────────────────────────────────────────────┘
```

**Message Row Structure:**
```
[▸] [timestamp] [level] (function)(core) message
 │       │         │         │       │      │
 │       │         │         │       │      └── Message content
 │       │         │         │       └── CPU core (ESP32)
 │       │         │         └── Function name
 │       │         └── Level badge [V][D][I][W][E]
 │       └── Optional timestamp (from device or local)
 └── Expand arrow (for multi-line/wrapped messages)
```

**System Messages:**
```
* Debug: Command received: help      ← Gray/muted color, no level badge
*** Remote debug - version 4.0.0     ← Emphasized (header style)
```

### 5.4 Input Bar

```
┌─────────────────────────────────────────────────────────────────────┐
│ [> Type command...                                   ][Send][⚙️]   │
└─────────────────────────────────────────────────────────────────────┘
     │                                                    │     │
     │                                                    │     └── Settings menu
     │                                                    └── Send button (or Enter)
     └── Command input with history (↑↓ arrows)
```

**Settings Menu (dropdown/modal):**
```
┌─────────────────────────────┐
│ ⚙️ Settings                 │
├─────────────────────────────┤
│ Theme: [Dark ▼]             │
│                             │
│ Font Size: [—][13px][+]     │
│                             │
│ Colors:                     │
│   Verbose [■] Debug [■]     │
│   Info [■] Warning [■]      │
│   Error [■]                 │
├─────────────────────────────┤
│ [Clear Console]             │
│ [Copy to Clipboard]         │
│ [Reset Device]              │
├─────────────────────────────┤
│ [Keyboard Shortcuts]        │
│ [About]                     │
└─────────────────────────────┘
```

---

## 6. Interactive States

### 6.1 Buttons

| State | Style |
|-------|-------|
| Default | `bg-tertiary`, subtle border |
| Hover | `bg-hover`, cursor pointer |
| Active/Pressed | `bg-active`, slight scale down |
| Selected (toggle on) | Accent border, filled background |
| Disabled | 50% opacity, no pointer events |
| Focus | Accent outline (keyboard nav) |

### 6.2 Connection Status

| State | Indicator | Input State |
|-------|-----------|-------------|
| Disconnected | ○ Gray dot | Enabled, "Connect" button |
| Connecting | ◐ Yellow pulse | Disabled, "Connecting..." |
| Connected | ● Green dot | Disabled (shows address), "Disconnect" |
| Error | ● Red dot | Enabled, shows error tooltip |

### 6.3 Console Auto-scroll

| Condition | Behavior |
|-----------|----------|
| User at bottom | Auto-scroll enabled, new messages scroll into view |
| User scrolled up | Auto-scroll paused, "↓ New messages" badge appears |
| User clicks badge | Scroll to bottom, resume auto-scroll |
| Toggle button off | Never auto-scroll |

---

## 7. Responsive Behavior

### 7.1 Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 480px | Stack everything, larger touch targets |
| Tablet | 480-768px | Compact header, scrollable toolbar |
| Desktop | 768-1200px | Full layout |
| Wide | > 1200px | Max-width container, centered |

### 7.2 Mobile Adaptations

- Header: Hide device details, show on tap
- Toolbar: Horizontal scroll, larger buttons (44px touch targets)
- Console: Full width, slightly larger font
- Input: Sticky at bottom, full width
- Settings: Full-screen modal instead of dropdown

---

## 8. Animations & Transitions

### 8.1 Timing

```css
--transition-fast: 100ms ease-out;    /* Hover states */
--transition-normal: 200ms ease-out;  /* Panel open/close */
--transition-slow: 300ms ease-out;    /* Theme switch */
```

### 8.2 Animations

| Element | Animation |
|---------|-----------|
| New message | Fade in (100ms) |
| Connection status | Pulse when connecting |
| Button press | Scale 0.95 (50ms) |
| Settings panel | Slide down (200ms) |
| Toast notification | Slide in from right, auto-dismiss |

---

## 9. Accessibility

### 9.1 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate between controls |
| Enter | Activate button / send command |
| Escape | Close modal / clear filter |
| ↑↓ | Command history (when in input) |
| Ctrl+1-5 | Set debug level |
| Ctrl+L | Focus filter input |
| Ctrl+K | Toggle connection |

### 9.2 Screen Reader

- All buttons have `aria-label`
- Console uses `role="log"` with `aria-live="polite"`
- Status changes announced
- Level buttons are `role="radiogroup"`

### 9.3 Visual

- Minimum contrast ratio 4.5:1
- Focus indicators visible
- No color-only information (icons + color)
- Respects `prefers-reduced-motion`

---

## 10. Icons

Using simple, recognizable icons (SVG or emoji fallback):

| Function | Icon | Emoji Fallback |
|----------|------|----------------|
| Connect | plug | 🔌 |
| Disconnect | plug-off | ⏏️ |
| Silence | volume-off | 🔇 |
| Auto-scroll | scroll | 📜 |
| Profiler | clock | ⏱️ |
| Filter | search | 🔍 |
| Settings | gear | ⚙️ |
| Clear | trash | 🗑️ |
| Copy | clipboard | 📋 |
| Help | question | ❓ |
| Reset | refresh-cw | 🔄 |
| Send | arrow-right | ➤ |
| Theme | sun/moon | ☀️/🌙 |

Recommended icon set: **Lucide** (free, MIT license, consistent style)

---

## 11. Mockups Reference

### 11.1 Dark Theme - Connected State
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔌  ESP32 • 217 KB free • v4.0.0          [bramator.local ▼][●]    │
├─────────────────────────────────────────────────────────────────────┤
│ [V][D][I][W][E]  │  🔇 📜 ⏱️  │  🔍 Filter...              │ 🗑️ 📋 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  12:45:01 [I] (main)(C1) Application started                       │
│  12:45:02 [D] (wifi)(C0) SSID: HomeNetwork RSSI: -45               │
│  12:45:03 [I] (mqtt)(C1) Connected to broker                       │
│  12:45:04 [W] (temp)(C0) Sensor reading: 42°C (threshold: 40)      │
│  12:45:05 [E] (gpio)(C1) Pin 4 read error                          │
│  * Free Heap RAM: 217356                                            │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ > status                                                    [⚙️]   │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.2 Light Theme - Disconnected State
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔌  RemoteDebug                           [192.168.1.   ▼][Connect]│
├─────────────────────────────────────────────────────────────────────┤
│ [V][D][I][W][E]  │  🔇 📜 ⏱️  │  🔍 Filter...              │ 🗑️ 📋 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                                                                     │
│            Enter device IP address and click Connect                │
│                                                                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ > _                                                         [⚙️]   │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Document created: December 6, 2025*
*For: RemoteDebugApp modernization project*
