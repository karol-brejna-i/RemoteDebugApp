/**
 * Toolbar Component
 * 
 * Contains level filters, text filter, and quick actions.
 */

import type { DebugLevel } from '../types';

const LEVEL_LABELS: Record<DebugLevel, string> = {
  1: 'V',  // Verbose
  2: 'D',  // Debug
  3: 'I',  // Info
  4: 'W',  // Warning
  5: 'E',  // Error
};

const LEVEL_NAMES: Record<DebugLevel, string> = {
  1: 'Verbose',
  2: 'Debug',
  3: 'Info',
  4: 'Warning',
  5: 'Error',
};

export interface ToolbarEvents {
  onLevelChange: (level: DebugLevel) => void;
  onFilterChange: (filter: string) => void;
  onPause: () => void;
  onAutoScrollToggle: () => void;
}

export interface ToolbarState {
  currentLevel: DebugLevel;
  filterText: string;
  isPaused: boolean;
  isAutoScroll: boolean;
}

export class Toolbar {
  private container: HTMLElement;
  private events: ToolbarEvents;
  private state: ToolbarState;

  private filterInput!: HTMLInputElement;
  private levelButtons!: Map<DebugLevel, HTMLButtonElement>;

  constructor(container: HTMLElement, events: ToolbarEvents, initialState: ToolbarState) {
    this.container = container;
    this.events = events;
    this.state = initialState;
    this.levelButtons = new Map();
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar__group">
          <span style="font-size: 12px; color: var(--text-secondary); margin-right: 4px;">Level:</span>
          <div class="level-filter" id="level-filter">
            ${([1, 2, 3, 4, 5] as DebugLevel[]).map(level => `
              <button 
                class="level-filter__btn level-filter__btn--${level} ${this.state.currentLevel === level ? 'level-filter__btn--active' : ''}"
                data-level="${level}"
                title="${LEVEL_NAMES[level]} (${level})"
              >
                ${LEVEL_LABELS[level]}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="toolbar__divider"></div>
        
        <div class="toolbar__group filter-input">
          <svg class="filter-input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            class="filter-input__field" 
            id="filter-input"
            placeholder="Filter messages... (Ctrl+F)"
            value="${this.state.filterText}"
          />
          <button class="filter-input__clear" id="filter-clear" style="display: ${this.state.filterText ? 'block' : 'none'};">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="toolbar__divider"></div>
        
        <div class="toolbar__group">
          <button class="btn btn--icon ${this.state.isPaused ? 'btn--active' : ''}" id="pause-btn" title="Pause output (P)">
            <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor">
              ${this.state.isPaused 
                ? '<path d="M8 5v14l11-7z"/>'
                : '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
              }
            </svg>
          </button>
          <button class="btn btn--icon ${this.state.isAutoScroll ? 'btn--active' : ''}" id="autoscroll-btn" title="Auto-scroll (A)">
            <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Cache references
    this.filterInput = this.container.querySelector('#filter-input') as HTMLInputElement;
    
    // Cache level buttons
    this.container.querySelectorAll('.level-filter__btn').forEach(btn => {
      const level = parseInt((btn as HTMLElement).dataset.level || '3') as DebugLevel;
      this.levelButtons.set(level, btn as HTMLButtonElement);
    });
  }

  private bindEvents(): void {
    // Level filter buttons
    this.container.querySelector('#level-filter')?.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.level-filter__btn');
      if (target) {
        const level = parseInt((target as HTMLElement).dataset.level || '3') as DebugLevel;
        this.events.onLevelChange(level);
      }
    });

    // Text filter
    this.filterInput.addEventListener('input', () => {
      const value = this.filterInput.value;
      this.events.onFilterChange(value);
      
      const clearBtn = this.container.querySelector('#filter-clear') as HTMLElement;
      clearBtn.style.display = value ? 'block' : 'none';
    });

    this.container.querySelector('#filter-clear')?.addEventListener('click', () => {
      this.filterInput.value = '';
      this.events.onFilterChange('');
      (this.container.querySelector('#filter-clear') as HTMLElement).style.display = 'none';
    });

    // Pause button
    this.container.querySelector('#pause-btn')?.addEventListener('click', () => {
      this.events.onPause();
    });

    // Auto-scroll button
    this.container.querySelector('#autoscroll-btn')?.addEventListener('click', () => {
      this.events.onAutoScrollToggle();
    });
  }

  /**
   * Update the current level display
   */
  setLevel(level: DebugLevel): void {
    this.state.currentLevel = level;
    
    this.levelButtons.forEach((btn, btnLevel) => {
      if (btnLevel === level) {
        btn.classList.add('level-filter__btn--active');
      } else {
        btn.classList.remove('level-filter__btn--active');
      }
    });
  }

  /**
   * Set filter text
   */
  setFilter(text: string): void {
    this.filterInput.value = text;
    this.state.filterText = text;
    
    const clearBtn = this.container.querySelector('#filter-clear') as HTMLElement;
    clearBtn.style.display = text ? 'block' : 'none';
  }

  /**
   * Update pause state
   */
  setPaused(paused: boolean): void {
    this.state.isPaused = paused;
    const btn = this.container.querySelector('#pause-btn') as HTMLButtonElement;
    
    if (paused) {
      btn.classList.add('btn--active');
      btn.innerHTML = `
        <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
    } else {
      btn.classList.remove('btn--active');
      btn.innerHTML = `
        <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `;
    }
  }

  /**
   * Update auto-scroll state
   */
  setAutoScroll(enabled: boolean): void {
    this.state.isAutoScroll = enabled;
    const btn = this.container.querySelector('#autoscroll-btn') as HTMLButtonElement;
    
    if (enabled) {
      btn.classList.add('btn--active');
    } else {
      btn.classList.remove('btn--active');
    }
  }

  /**
   * Focus the filter input
   */
  focusFilter(): void {
    this.filterInput.focus();
    this.filterInput.select();
  }
}
