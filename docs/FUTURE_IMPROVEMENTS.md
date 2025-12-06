# Future Improvements

This document outlines potential enhancements for RemoteDebugApp beyond the initial reimplementation. These features are organized by priority and complexity.

---

## Priority 1: High Value, Medium Effort

### 1.1 Session Recording & Playback
Record entire debug sessions for later analysis and sharing.

**Features:**
- Start/stop recording button
- Export session to JSON file
- Import and replay recorded sessions
- Playback controls (play, pause, speed)
- Share session files with team members
- Export to CSV for spreadsheet analysis

**Use Cases:**
- Debugging intermittent issues
- Sharing bug reports with exact reproduction
- Training and documentation
- Post-mortem analysis

---

### 1.2 Enhanced Filtering & Search

Powerful filtering capabilities beyond simple string matching.

**Features:**
- Regex-based filtering
- Multiple simultaneous filters (include AND exclude)
- Filter by log level (e.g., show Warning + Error only)
- Full-text search across message history
- Highlight matching terms in results
- Filter presets (save frequently used filters)
- Quick filter from context menu (right-click → "Filter by this")

**UI Suggestions:**
```
┌─────────────────────────────────────────────┐
│ Filter: [________________] [+] [-] [Regex]  │
│ Levels: [V] [D] [I] [W] [E]  ← toggleable   │
│ Exclude: [________________]                  │
└─────────────────────────────────────────────┘
```

---

### 1.3 Command History & Favorites

Improved command input experience.

**Features:**
- Command history with up/down arrow navigation
- Persistent history across sessions
- Save favorite/frequent commands
- Command aliases (e.g., "st" → "status")
- Quick command palette (Cmd+P style popup)
- Recent commands dropdown

---

### 1.4 Connection Address History

Remember and quickly reconnect to previously used devices.

**Features:**
- Dropdown showing recently used IP addresses/hostnames
- Persistent address history across browser sessions
- Optional device nicknames (e.g., "Kitchen ESP32" → 192.168.1.45)
- Auto-suggest while typing in address field
- Remove individual entries from history
- Clear all history option
- Last successful connection shown as default

**UI Suggestions:**
```
┌───────────────────────────────────────┐
│ [192.168.1.100         ▼] [Connect]  │
├───────────────────────────────────────┤
│ Recent:                               │
│   192.168.1.100  (Kitchen ESP32)     │
│   bramator.local                      │
│   192.168.1.45   (Garage sensor)     │
│   [Clear history]                     │
└───────────────────────────────────────┘
```

---

## Priority 2: Medium Value, Medium Effort

### 2.1 Metrics Dashboard

Visual representation of device state over time.

**Metrics to Track:**
- Memory usage graph (line chart over time)
- Message rate (messages/second)
- Connection uptime
- Level distribution (pie chart: % Verbose, Debug, etc.)
- CPU core utilization (ESP32 dual-core)
- WiFi signal strength (if available from device)

**Implementation Notes:**
- Use lightweight charting (Chart.js or custom canvas)
- Configurable time window (last 1min, 5min, 30min)
- Export metrics data

---

### 2.2 Multi-Device Support

Connect to and monitor multiple ESP32 devices simultaneously.

**Features:**
- Tabbed interface (one tab per device)
- Device discovery via mDNS browser
- Device nicknames/aliases
- Unified view option (all devices in one console, color-coded)
- Quick device switcher (Cmd+1, Cmd+2, etc.)

**Challenges:**
- Managing multiple WebSocket connections
- UI complexity
- Memory usage with many connections

---

### 2.3 Message Parsing Enhancements

Smarter message display and organization.

**Features:**
- JSON pretty-printing for JSON payloads
- Collapsible long messages
- Message grouping (by function, by core, by time window)
- Timestamp column (sortable)
- Relative timestamps ("2s ago", "1m ago")
- Line numbers
- Message diff highlighting (show what changed)

---

## Priority 3: Nice to Have

### 3.1 Notifications & Alerts

Proactive monitoring capabilities.

**Features:**
- Desktop notifications for errors
- Sound alerts for specific patterns
- Custom alert rules: "notify when 'crash' appears"
- Error count badge in browser tab
- Email/webhook notifications (requires server component)

---

### 3.2 Export & Integration

Better interoperability with other tools.

**Features:**
- Export to file (TXT, JSON, CSV, HTML)
- Copy selection as markdown table
- Copy with ANSI codes (for terminal paste)
- Direct paste to GitHub issues (formatted)
- Webhook on specific events (requires server)

---

### 3.3 Connection Resilience

Robust connection handling.

**Features:**
- Auto-reconnect with exponential backoff
- Connection quality indicator (latency, packet loss)
- Offline message queue (buffer commands while disconnected)
- Last known state persistence
- Connection timeout configuration
- Heartbeat/ping monitoring

---

### 3.4 PWA Support

Progressive Web App capabilities.

**Features:**
- Install as desktop/mobile app
- Offline capability (for viewing recorded sessions)
- Push notifications
- App icon and splash screen
- Works without internet (local ESP32 only)

---

### 3.5 Accessibility Improvements

Make the app usable by everyone.

**Features:**
- Screen reader support (ARIA labels)
- High contrast mode
- Keyboard-only navigation
- Configurable font sizes
- Dyslexia-friendly font option

---

## Implementation Complexity Matrix

| Feature | Value | Effort | Dependencies |
|---------|-------|--------|--------------|
| Session Recording | High | Medium | Storage service |
| Enhanced Filtering | High | Medium | Message parser |
| Command History | Medium | Low | Storage service |
| Metrics Dashboard | Medium | High | Charting library |
| Multi-Device | High | High | Major refactor |
| Message Parsing | Medium | Medium | Parser updates |
| Notifications | Medium | Low | Native APIs |
| Export Options | Medium | Low | None |
| Connection Resilience | High | Medium | WebSocket service |
| PWA Support | Low | Medium | Service worker |
| Accessibility | Medium | Medium | UI updates |

---

## Community Requested Features

*This section will be populated based on user feedback and GitHub issues.*

---

## Rejected/Deferred Ideas

| Idea | Reason |
|------|--------|
| Cloud sync | Adds server dependency, complexity |
| Plugin system | Over-engineering for current scope |
| Multiple protocols | Focus on RemoteDebug first |
| Built-in OTA updates | Outside app scope |

---

*Document created: December 6, 2025*
*Last updated: December 6, 2025*
