/**
 * Header Component
 * 
 * Contains branding, connection form, and action buttons.
 */

import type { ConnectionState } from '../types';

export interface HeaderEvents {
  onConnect: (ip: string) => void;
  onDisconnect: () => void;
  onClear: () => void;
  onToggleSettings: () => void;
  onToggleTheme: () => void;
}

export class Header {
  private container: HTMLElement;
  private events: HeaderEvents;
  
  private ipInput!: HTMLInputElement;
  private connectBtn!: HTMLButtonElement;
  private disconnectBtn!: HTMLButtonElement;
  private statusDot!: HTMLElement;
  private statusText!: HTMLElement;

  constructor(container: HTMLElement, events: HeaderEvents) {
    this.container = container;
    this.events = events;
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.container.innerHTML = `
      <header class="header">
        <div class="header__logo">
          <img src="./assets/WSTerm_icon.svg" alt="WSTerm" class="header__logo-icon">
          <span class="header__title"><span class="header__title--accent">WS</span>Term</span>
        </div>
        
        <form class="header__connection" autocomplete="off">
          <input 
            type="text" 
            class="header__input" 
            id="ip-input"
            placeholder="Enter device IP (e.g., 192.168.1.100)"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit" class="btn btn--primary" id="connect-btn">
            Connect
          </button>
          <button type="button" class="btn btn--danger" id="disconnect-btn" style="display: none;">
            Disconnect
          </button>
        </form>
        
        <div class="header__status" id="connection-status">
          <span class="header__status-dot" id="status-dot"></span>
          <span id="status-text">Disconnected</span>
        </div>
        
        <div class="header__actions">
          <button class="btn btn--icon" id="clear-btn" title="Clear console (Ctrl+L)">
            <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
          <button class="btn btn--icon" id="settings-btn" title="Settings">
            <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
          <button class="btn btn--icon theme-toggle" id="theme-btn" title="Toggle theme">
            <svg class="btn__icon theme-toggle__icon theme-toggle__icon--dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
            <svg class="btn__icon theme-toggle__icon theme-toggle__icon--light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
        </div>
      </header>
    `;

    // Cache DOM references
    this.ipInput = this.container.querySelector('#ip-input') as HTMLInputElement;
    this.connectBtn = this.container.querySelector('#connect-btn') as HTMLButtonElement;
    this.disconnectBtn = this.container.querySelector('#disconnect-btn') as HTMLButtonElement;
    this.statusDot = this.container.querySelector('#status-dot') as HTMLElement;
    this.statusText = this.container.querySelector('#status-text') as HTMLElement;
  }

  private bindEvents(): void {
    const form = this.container.querySelector('.header__connection') as HTMLFormElement;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ip = this.ipInput.value.trim();
      if (ip) {
        this.events.onConnect(ip);
      }
    });

    this.disconnectBtn.addEventListener('click', () => {
      this.events.onDisconnect();
    });

    this.container.querySelector('#clear-btn')?.addEventListener('click', () => {
      this.events.onClear();
    });

    this.container.querySelector('#settings-btn')?.addEventListener('click', () => {
      this.events.onToggleSettings();
    });

    this.container.querySelector('#theme-btn')?.addEventListener('click', () => {
      this.events.onToggleTheme();
    });
  }

  /**
   * Set the IP address in the input field
   */
  setIp(ip: string): void {
    this.ipInput.value = ip;
  }

  /**
   * Get the current IP address from input
   */
  getIp(): string {
    return this.ipInput.value.trim();
  }

  /**
   * Update connection state UI
   */
  updateConnectionState(state: ConnectionState): void {
    // Update status dot
    this.statusDot.className = 'header__status-dot';
    
    switch (state) {
      case 'disconnected':
        this.statusText.textContent = 'Disconnected';
        this.connectBtn.style.display = '';
        this.disconnectBtn.style.display = 'none';
        this.ipInput.disabled = false;
        this.connectBtn.disabled = false;
        break;
        
      case 'connecting':
        this.statusDot.classList.add('header__status-dot--connecting');
        this.statusText.textContent = 'Connecting...';
        this.connectBtn.style.display = '';
        this.disconnectBtn.style.display = 'none';
        this.ipInput.disabled = true;
        this.connectBtn.disabled = true;
        break;
        
      case 'connected':
        this.statusDot.classList.add('header__status-dot--connected');
        this.statusText.textContent = 'Connected';
        this.connectBtn.style.display = 'none';
        this.disconnectBtn.style.display = '';
        this.ipInput.disabled = true;
        break;
        
      case 'error':
        this.statusDot.classList.add('header__status-dot--error');
        this.statusText.textContent = 'Connection failed';
        this.connectBtn.style.display = '';
        this.disconnectBtn.style.display = 'none';
        this.ipInput.disabled = false;
        this.connectBtn.disabled = false;
        break;
    }
  }

  /**
   * Focus the IP input field
   */
  focusInput(): void {
    this.ipInput.focus();
    this.ipInput.select();
  }
}
