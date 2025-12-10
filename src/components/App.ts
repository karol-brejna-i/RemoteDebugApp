/**
 * App Component - Main Application Controller
 * 
 * Coordinates all services and UI components.
 */

import { WebSocketService } from '../services/WebSocketService';
import { createCodec, type IMessageCodec } from '../services/codec';
import { StorageService } from '../services/StorageService';
import { ThemeService } from '../services/ThemeService';
import { Console } from './Console';
import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { Footer } from './Footer';
import { CommandInput } from './CommandInput';
import { SettingsPanel } from './SettingsPanel';
import type { 
  AppSettings, 
  ConnectionState, 
  DeviceInfo, 
  ParsedMessage,
  DebugLevel,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';
import type { CodecControlEvent } from '../services/codec';

export class App {
  private container: HTMLElement;
  
  // Services
  private ws: WebSocketService;
  private codec: IMessageCodec;
  private storage: StorageService;
  private theme: ThemeService;
  
  // Components
  private header!: Header;
  private toolbar!: Toolbar;
  private console!: Console;
  private commandInput!: CommandInput;
  private footer!: Footer;
  private settingsPanel!: SettingsPanel;

  // State
  private connectionState: ConnectionState = 'disconnected';
  private currentLevel: DebugLevel = 3;
  private device: DeviceInfo | null = null;
  private settings: AppSettings;
  private isPaused: boolean = false;
  private messageCount: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Initialize services and settings
    this.storage = new StorageService();
    this.settings = this.storage.loadSettings();
    this.ws = new WebSocketService();
    this.codec = this.resolveCodec();
    this.theme = new ThemeService();

    // Apply saved theme
    this.theme.setTheme(this.settings.theme);
    this.debug('app.init');
  }

  /**
   * Resolve codec based on URL query (?codec=name) with fallback to default
   */
  private resolveCodec() {
    const params = new URLSearchParams(window.location.search);
    const paramName = params.get('codec');
    const chosen = (paramName || this.settings.codecName || 'remotedebug').toLowerCase();

    // Persist if changed
    if (chosen !== this.settings.codecName) {
      this.settings.codecName = chosen;
      this.storage.saveSettings(this.settings);
    }

    this.debug('codec.select', { codecName: chosen, source: paramName ? 'query' : 'settings' });
    return createCodec(chosen);
  }

  /**
   * Initialize the application
   */
  init(): void {
    this.createLayout();
    this.initComponents();
    this.bindWebSocketEvents();
    this.bindKeyboardShortcuts();
    this.restoreState();
    
    console.log('WSTerm v2.0 initialized');
  }

  /**
   * Create the main layout structure
   */
  private createLayout(): void {
    this.container.innerHTML = `
      <div id="header-container"></div>
      <div id="toolbar-container"></div>
      <div id="console-container" class="console"></div>
      <div id="command-container"></div>
      <div id="footer-container"></div>
      <div id="settings-container"></div>
    `;
  }

  /**
   * Initialize all UI components
   */
  private initComponents(): void {
    this.debug('ui.init-components');
    // Header
    this.header = new Header(
      this.container.querySelector('#header-container')!,
      {
        onConnect: (ip) => this.connect(ip),
        onDisconnect: () => this.disconnect(),
        onClear: () => this.clearConsole(),
        onToggleSettings: () => this.settingsPanel.toggle(),
        onToggleTheme: () => this.toggleTheme(),
      }
    );

    // Toolbar
    this.toolbar = new Toolbar(
      this.container.querySelector('#toolbar-container')!,
      {
        onLevelChange: (level) => this.setLevel(level),
        onFilterChange: (filter) => this.console.setFilter(filter),
        onPause: () => this.togglePause(),
        onAutoScrollToggle: () => this.toggleAutoScroll(),
      },
      {
        currentLevel: this.currentLevel,
        filterText: '',
        isPaused: false,
        isAutoScroll: this.settings.autoScroll,
      }
    );

    // Console
    this.console = new Console(
      this.container.querySelector('#console-container')!
    );

    // Command Input
    this.commandInput = new CommandInput(
      this.container.querySelector('#command-container')!,
      {
        onCommand: (cmd) => this.sendCommand(cmd),
      }
    );

    // Footer
    this.footer = new Footer(
      this.container.querySelector('#footer-container')!
    );

    // Settings Panel
    this.settingsPanel = new SettingsPanel(
      this.container.querySelector('#settings-container')!,
      {
        onClose: () => {},
        onSettingsChange: (changes) => this.updateSettings(changes),
        onReset: () => this.resetSettings(),
      },
      this.settings
    );

    // Set initial state
    this.commandInput.setEnabled(false);
    this.applyLevelColors();
  }

  /**
   * Bind WebSocket events
   */
  private bindWebSocketEvents(): void {
    this.ws.onConnect(() => {
      this.connectionState = 'connected';
      this.header.updateConnectionState('connected');
      this.commandInput.setEnabled(true);
      this.console.appendSystemMessage(`Connected to ${this.header.getIp()}`);
      
      // Send handshake if required by codec
      if (this.codec.capabilities.handshakeRequired) {
        const handshake = this.codec.encode({ type: 'handshake' });
        this.ws.send(handshake);
      }
    });

    this.ws.onDisconnect(() => {
      this.connectionState = 'disconnected';
      this.header.updateConnectionState('disconnected');
      this.commandInput.setEnabled(false);
      this.device = null;
      this.footer.setDeviceInfo(null);
      this.console.appendSystemMessage('Disconnected');
    });

    this.ws.onMessage((data) => {
      this.handleMessage(data);
    });

    this.ws.onError((error) => {
      this.connectionState = 'error';
      this.header.updateConnectionState('error');
      this.console.appendSystemMessage(`Connection error: ${error}`);
    });
  }

  /**
   * Handle incoming message from device
   */
  private handleMessage(data: string): void {
    if (this.isPaused) {
      return;
    }

    const { messages, controlEvents } = this.codec.decode(data);
    
    // Handle control events first
    for (const event of controlEvents) {
      this.handleControlEvent(event);
    }
    
    // Display regular messages
    for (const msg of messages) {
      // Skip protocol messages in display (already handled above)
      if (msg.type === 'protocol') {
        continue;
      }
      
      // Only show messages at or above current level
      if (msg.level && msg.level >= this.currentLevel) {
        this.console.appendMessage(msg);
        this.messageCount++;
        this.footer.setMessageCount(this.messageCount);
      } else if (!msg.level) {
        // Show messages without level (system messages, unknown format)
        this.console.appendMessage(msg);
        this.messageCount++;
        this.footer.setMessageCount(this.messageCount);
      }
    }
  }

  /**
   * Handle protocol messages ($app:...)
   */
  private handleControlEvent(event: CodecControlEvent): void {
    switch (event.type) {
      case 'deviceInfo':
        this.device = event.info;
        this.footer.setDeviceInfo(this.device);
        break;
      case 'levelChanged':
        if (event.level >= 1 && event.level <= 5) {
          this.currentLevel = event.level;
          this.toolbar.setLevel(event.level);
        }
        break;
      case 'memory':
        if (this.device) {
          this.device.freeHeap = event.freeHeap;
          this.footer.setDeviceInfo(this.device);
        }
        break;
      case 'handshakeAck':
        // No-op for now; reserved for future connection state updates
        break;
    }
  }

  /**
   * Bind keyboard shortcuts
   */
  private bindKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Level shortcuts
      if (e.key === 'v' || e.key === 'V') {
        this.debug('shortcut.level', { key: e.key });
        this.setLevel(1);
        return;
      }
      if (e.key === 'd' || e.key === 'D') {
        this.debug('shortcut.level', { key: e.key });
        this.setLevel(2);
        return;
      }
      if (e.key === 'i' || e.key === 'I') {
        this.debug('shortcut.level', { key: e.key });
        this.setLevel(3);
        return;
      }
      if (e.key === 'w' || e.key === 'W') {
        this.debug('shortcut.level', { key: e.key });
        this.setLevel(4);
        return;
      }
      if (e.key === 'e' || e.key === 'E') {
        this.debug('shortcut.level', { key: e.key });
        this.setLevel(5);
        return;
      }

      // Other shortcuts
      switch (e.key) {
        case 'c':
        case 'C':
          this.debug('shortcut.clear', { key: e.key });
          this.clearConsole();
          break;
        case '?':
          this.debug('shortcut.help', { key: e.key });
          this.sendCommand('?');
          break;
        case 'r':
        case 'R':
          this.debug('shortcut.reset', { key: e.key });
          this.requestResetConfirmation();
          break;
        case 'p':
        case 'P':
          this.debug('shortcut.pause', { key: e.key });
          this.togglePause();
          break;
        case 'a':
        case 'A':
          this.debug('shortcut.autoscroll', { key: e.key });
          this.toggleAutoScroll();
          break;
        case 'Escape':
          this.debug('shortcut.close-settings', { key: e.key });
          this.settingsPanel.close();
          break;
      }

      // Ctrl+L - clear console
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        this.debug('shortcut.clear', { key: 'Ctrl+L' });
        this.clearConsole();
      }

      // Ctrl+F - focus filter
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        this.debug('shortcut.focus-filter', { key: 'Ctrl+F' });
        this.toolbar.focusFilter();
      }
    });
  }

  /**
   * Connect to device
   */
  private connect(ip: string): void {
    if (!ip) {
      this.console.appendSystemMessage('Please enter device IP address');
      return;
    }

    this.connectionState = 'connecting';
    this.header.updateConnectionState('connecting');
    
    this.ws.connect(ip, this.settings.port);
    this.storage.saveLastAddress(ip);
  }

  /**
   * Disconnect from device
   */
  private disconnect(): void {
    this.ws.disconnect();
  }

  /**
   * Send command to device
   */
  private sendCommand(command: string): void {
    if (this.connectionState !== 'connected') {
      this.console.appendSystemMessage('Not connected to device');
      return;
    }

    this.debug('command.send', { command });
    // Encode using codec (raw command pass-through)
    const encoded = this.codec.encode({ type: 'raw', command });
    this.ws.send(encoded);
    this.console.appendSystemMessage(`> ${command}`);
  }

  /**
   * Set debug level on device
   */
  private setLevel(level: DebugLevel): void {
    this.currentLevel = level;
    this.debug('level.set', { level });
    this.toolbar.setLevel(level);
    if (!this.codec.capabilities.levels) {
      this.console.appendSystemMessage('Current protocol does not support level changes');
      return;
    }
    
    if (this.connectionState === 'connected') {
      // Encode level command using codec
      const encoded = this.codec.encode({ type: 'level', level });
      this.ws.send(encoded);
    }
  }

  /**
   * Clear console
   */
  private clearConsole(): void {
    this.console.clear();
    this.messageCount = 0;
    this.footer.setMessageCount(0);
  }

  /**
   * Toggle pause
   */
  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.debug('pause.toggle', { paused: this.isPaused });
    this.toolbar.setPaused(this.isPaused);
    this.console.appendSystemMessage(this.isPaused ? 'Output paused' : 'Output resumed');
  }

  /**
   * Toggle auto-scroll
   */
  private toggleAutoScroll(): void {
    this.settings.autoScroll = !this.settings.autoScroll;
    this.debug('autoscroll.toggle', { enabled: this.settings.autoScroll });
    this.toolbar.setAutoScroll(this.settings.autoScroll);
    this.console.setAutoScroll(this.settings.autoScroll);
    this.storage.saveSettings(this.settings);
  }

  /**
   * Confirm before sending reset command to avoid accidental device reboot
   */
  private requestResetConfirmation(): void {
    if (this.connectionState !== 'connected') {
      this.console.appendSystemMessage('Not connected to device');
      return;
    }
    if (!this.codec.capabilities.reset) {
      this.console.appendSystemMessage('Current protocol does not support reset command');
      return;
    }

    const confirmed = window.confirm('This will reboot the device. Send reset command?');
    if (!confirmed) {
      this.debug('reset.cancelled');
      this.console.appendSystemMessage('Reset cancelled');
      return;
    }

    this.debug('reset.confirmed');
    this.sendCommand('reset');
  }

  /**
   * Toggle theme
   */
  private toggleTheme(): void {
    const newTheme = this.settings.theme === 'dark' ? 'light' : 'dark';
    this.debug('theme.toggle', { theme: newTheme });
    this.settings.theme = newTheme;
    this.theme.setTheme(newTheme);
    this.storage.saveSettings(this.settings);
  }

  /**
   * Update settings
   */
  private updateSettings(changes: Partial<AppSettings>): void {
    this.debug('settings.update', { changes });
    this.settings = { ...this.settings, ...changes };
    this.storage.saveSettings(this.settings);
    
    // Apply level colors if changed
    if (changes.levelColors) {
      this.applyLevelColors();
    }
    
    // Apply auto-scroll if changed
    if (changes.autoScroll !== undefined) {
      this.console.setAutoScroll(changes.autoScroll);
      this.toolbar.setAutoScroll(changes.autoScroll);
    }
  }

  /**
   * Reset settings to defaults
   */
  private resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.storage.saveSettings(this.settings);
    this.settingsPanel.updateSettings(this.settings);
    this.applyLevelColors();
  }

  /**
   * Apply custom level colors to CSS variables
   */
  private applyLevelColors(): void {
    const root = document.documentElement;
    root.style.setProperty('--color-verbose', this.settings.levelColors[1]);
    root.style.setProperty('--color-debug', this.settings.levelColors[2]);
    root.style.setProperty('--color-info', this.settings.levelColors[3]);
    root.style.setProperty('--color-warning', this.settings.levelColors[4]);
    root.style.setProperty('--color-error', this.settings.levelColors[5]);
  }

  /**
   * Restore previous state
   */
  private restoreState(): void {
    const lastAddress = this.storage.getLastAddress();
    if (lastAddress) {
      this.header.setIp(lastAddress);
    }

    // Load command history
    const history = this.storage.getCommandHistory();
    if (history.length > 0) {
      this.commandInput.loadHistory(history);
    }
  }

  /**
   * Lightweight debug logger; enabled only in development builds to reduce noise in production.
   */
  private debug(event: string, data?: Record<string, unknown>): void {
    if (!import.meta.env.DEV) return;
    if (data) {
      console.debug(`[WSTerm] ${event}`, data);
    } else {
      console.debug(`[WSTerm] ${event}`);
    }
  }
}
