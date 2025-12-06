/**
 * Settings Panel Component
 * 
 * Slide-out panel for app settings including theme and color customization.
 */

import type { AppSettings, DebugLevel } from '../types';

const LEVEL_NAMES: Record<DebugLevel, string> = {
  1: 'Verbose',
  2: 'Debug',
  3: 'Info',
  4: 'Warning',
  5: 'Error',
};

export interface SettingsPanelEvents {
  onClose: () => void;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onReset: () => void;
}

export class SettingsPanel {
  private container: HTMLElement;
  private events: SettingsPanelEvents;
  private settings: AppSettings;
  private isOpen: boolean = false;

  constructor(container: HTMLElement, events: SettingsPanelEvents, settings: AppSettings) {
    this.container = container;
    this.events = events;
    this.settings = settings;
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="panel-overlay" id="panel-overlay"></div>
      <aside class="panel" id="settings-panel">
        <div class="panel__header">
          <h2 class="panel__title">Settings</h2>
          <button class="panel__close" id="panel-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="panel__content">
          <!-- Display Settings -->
          <section class="panel__section">
            <h3 class="panel__section-title">Display</h3>
            
            <label class="toggle">
              <span class="toggle__label">Show timestamps</span>
              <input type="checkbox" id="setting-timestamps" ${this.settings.showTimestamps ? 'checked' : ''}>
              <span class="toggle__switch"></span>
            </label>
            
            <label class="toggle" style="margin-top: 12px;">
              <span class="toggle__label">Show function names</span>
              <input type="checkbox" id="setting-functions" ${this.settings.showFunctionNames ? 'checked' : ''}>
              <span class="toggle__switch"></span>
            </label>
            
            <label class="toggle" style="margin-top: 12px;">
              <span class="toggle__label">Show profiler info</span>
              <input type="checkbox" id="setting-profiler" ${this.settings.showProfiler ? 'checked' : ''}>
              <span class="toggle__switch"></span>
            </label>
            
            <label class="toggle" style="margin-top: 12px;">
              <span class="toggle__label">Auto-scroll</span>
              <input type="checkbox" id="setting-autoscroll" ${this.settings.autoScroll ? 'checked' : ''}>
              <span class="toggle__switch"></span>
            </label>
          </section>
          
          <!-- Level Colors -->
          <section class="panel__section">
            <h3 class="panel__section-title">Level Colors</h3>
            
            ${([1, 2, 3, 4, 5] as DebugLevel[]).map(level => `
              <div class="color-picker" style="margin-bottom: 8px;">
                <input 
                  type="color" 
                  class="color-picker__swatch" 
                  id="color-level-${level}"
                  value="${this.settings.levelColors[level]}"
                >
                <span style="flex: 1; color: var(--text-primary);">${LEVEL_NAMES[level]}</span>
                <span class="color-picker__value" id="color-value-${level}">${this.settings.levelColors[level]}</span>
              </div>
            `).join('')}
            
            <button class="btn btn--secondary" id="reset-colors" style="margin-top: 8px; width: 100%;">
              Reset to Defaults
            </button>
          </section>
          
          <!-- Connection -->
          <section class="panel__section">
            <h3 class="panel__section-title">Connection</h3>
            
            <div class="form-group">
              <label class="form-label" for="setting-port">WebSocket Port</label>
              <input 
                type="number" 
                class="form-input" 
                id="setting-port"
                value="${this.settings.port}"
                min="1"
                max="65535"
              >
            </div>
            
            <label class="toggle">
              <span class="toggle__label">Auto-reconnect</span>
              <input type="checkbox" id="setting-reconnect" ${this.settings.autoReconnect ? 'checked' : ''}>
              <span class="toggle__switch"></span>
            </label>
          </section>
          
          <!-- Data -->
          <section class="panel__section">
            <h3 class="panel__section-title">Data</h3>
            
            <div class="form-group">
              <label class="form-label" for="setting-maxmessages">Max messages in memory</label>
              <input 
                type="number" 
                class="form-input" 
                id="setting-maxmessages"
                value="${this.settings.maxMessages}"
                min="100"
                max="100000"
                step="100"
              >
            </div>
            
            <button class="btn btn--danger" id="clear-storage" style="width: 100%;">
              Clear All Saved Data
            </button>
          </section>
          
          <!-- About -->
          <section class="panel__section">
            <h3 class="panel__section-title">About</h3>
            <p style="font-size: 13px; color: var(--text-secondary);">
              <span style="color: var(--brand-accent);">WS</span>Term v2.0.0<br>
              WebSocket Terminal for RemoteDebug library.<br><br>
              <a href="https://github.com/JoaoLopesF/RemoteDebug" target="_blank" rel="noopener" style="color: var(--brand-accent);">
                RemoteDebug on GitHub
              </a>
            </p>
          </section>
        </div>
      </aside>
    `;
  }

  private bindEvents(): void {
    // Close button
    this.container.querySelector('#panel-close')?.addEventListener('click', () => {
      this.close();
    });

    // Overlay click
    this.container.querySelector('#panel-overlay')?.addEventListener('click', () => {
      this.close();
    });

    // Toggle settings
    const toggles = ['timestamps', 'functions', 'profiler', 'autoscroll', 'reconnect'];
    toggles.forEach(name => {
      this.container.querySelector(`#setting-${name}`)?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        const settingMap: Record<string, keyof AppSettings> = {
          'timestamps': 'showTimestamps',
          'functions': 'showFunctionNames',
          'profiler': 'showProfiler',
          'autoscroll': 'autoScroll',
          'reconnect': 'autoReconnect',
        };
        this.events.onSettingsChange({ [settingMap[name]]: checked });
      });
    });

    // Color pickers
    ([1, 2, 3, 4, 5] as DebugLevel[]).forEach(level => {
      this.container.querySelector(`#color-level-${level}`)?.addEventListener('input', (e) => {
        const color = (e.target as HTMLInputElement).value;
        const valueEl = this.container.querySelector(`#color-value-${level}`);
        if (valueEl) valueEl.textContent = color;
        
        const newColors = { ...this.settings.levelColors, [level]: color };
        this.events.onSettingsChange({ levelColors: newColors });
      });
    });

    // Reset colors
    this.container.querySelector('#reset-colors')?.addEventListener('click', () => {
      this.events.onReset();
    });

    // Port change
    this.container.querySelector('#setting-port')?.addEventListener('change', (e) => {
      const port = parseInt((e.target as HTMLInputElement).value);
      if (port >= 1 && port <= 65535) {
        this.events.onSettingsChange({ port });
      }
    });

    // Max messages change
    this.container.querySelector('#setting-maxmessages')?.addEventListener('change', (e) => {
      const maxMessages = parseInt((e.target as HTMLInputElement).value);
      if (maxMessages >= 100 && maxMessages <= 100000) {
        this.events.onSettingsChange({ maxMessages });
      }
    });

    // Clear storage
    this.container.querySelector('#clear-storage')?.addEventListener('click', () => {
      if (confirm('This will clear all saved settings and history. Continue?')) {
        localStorage.clear();
        window.location.reload();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Open the settings panel
   */
  open(): void {
    this.isOpen = true;
    this.container.querySelector('#panel-overlay')?.classList.add('panel-overlay--open');
    this.container.querySelector('#settings-panel')?.classList.add('panel--open');
  }

  /**
   * Close the settings panel
   */
  close(): void {
    this.isOpen = false;
    this.container.querySelector('#panel-overlay')?.classList.remove('panel-overlay--open');
    this.container.querySelector('#settings-panel')?.classList.remove('panel--open');
    this.events.onClose();
  }

  /**
   * Toggle the panel open/closed
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Update settings display
   */
  updateSettings(settings: AppSettings): void {
    this.settings = settings;
    
    // Update toggles
    (this.container.querySelector('#setting-timestamps') as HTMLInputElement).checked = settings.showTimestamps;
    (this.container.querySelector('#setting-functions') as HTMLInputElement).checked = settings.showFunctionNames;
    (this.container.querySelector('#setting-profiler') as HTMLInputElement).checked = settings.showProfiler;
    (this.container.querySelector('#setting-autoscroll') as HTMLInputElement).checked = settings.autoScroll;
    (this.container.querySelector('#setting-reconnect') as HTMLInputElement).checked = settings.autoReconnect;
    
    // Update colors
    ([1, 2, 3, 4, 5] as DebugLevel[]).forEach(level => {
      const color = settings.levelColors[level];
      (this.container.querySelector(`#color-level-${level}`) as HTMLInputElement).value = color;
      const valueEl = this.container.querySelector(`#color-value-${level}`);
      if (valueEl) valueEl.textContent = color;
    });
    
    // Update port
    (this.container.querySelector('#setting-port') as HTMLInputElement).value = String(settings.port);
    
    // Update max messages
    (this.container.querySelector('#setting-maxmessages') as HTMLInputElement).value = String(settings.maxMessages);
  }
}
