/**
 * Command Input Component
 * 
 * Input field for sending commands to the device.
 */

export interface CommandInputEvents {
  onCommand: (command: string) => void;
}

export class CommandInput {
  private container: HTMLElement;
  private events: CommandInputEvents;
  private input!: HTMLInputElement;
  
  // Command history
  private history: string[] = [];
  private historyIndex: number = -1;
  private maxHistory: number = 50;

  constructor(container: HTMLElement, events: CommandInputEvents) {
    this.container = container;
    this.events = events;
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="command-input">
        <span style="color: var(--text-secondary); font-family: var(--font-mono);">&gt;</span>
        <input 
          type="text" 
          class="command-input__field" 
          id="command-input"
          placeholder="Enter command (press Enter to send, ↑/↓ for history)"
          autocomplete="off"
          spellcheck="false"
        />
        <button class="btn btn--secondary" id="send-btn">Send</button>
      </div>
    `;

    this.input = this.container.querySelector('#command-input') as HTMLInputElement;
  }

  private bindEvents(): void {
    // Send on Enter
    this.input.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          this.sendCommand();
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          this.navigateHistory(-1);
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          this.navigateHistory(1);
          break;
      }
    });

    // Send button
    this.container.querySelector('#send-btn')?.addEventListener('click', () => {
      this.sendCommand();
    });
  }

  private sendCommand(): void {
    const command = this.input.value.trim();
    if (!command) return;

    // Add to history
    if (this.history[this.history.length - 1] !== command) {
      this.history.push(command);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }
    this.historyIndex = -1;

    // Send command
    this.events.onCommand(command);

    // Clear input
    this.input.value = '';
  }

  private navigateHistory(direction: number): void {
    if (this.history.length === 0) return;

    if (this.historyIndex === -1) {
      // Starting from current input
      if (direction < 0) {
        this.historyIndex = this.history.length - 1;
      } else {
        return; // Can't go forward from current
      }
    } else {
      this.historyIndex += direction;
      
      if (this.historyIndex < 0) {
        this.historyIndex = 0;
      } else if (this.historyIndex >= this.history.length) {
        this.historyIndex = -1;
        this.input.value = '';
        return;
      }
    }

    this.input.value = this.history[this.historyIndex];
    // Move cursor to end
    this.input.setSelectionRange(this.input.value.length, this.input.value.length);
  }

  /**
   * Focus the command input
   */
  focus(): void {
    this.input.focus();
  }

  /**
   * Set the command input value
   */
  setValue(value: string): void {
    this.input.value = value;
  }

  /**
   * Get the current value
   */
  getValue(): string {
    return this.input.value;
  }

  /**
   * Enable/disable the input
   */
  setEnabled(enabled: boolean): void {
    this.input.disabled = !enabled;
    (this.container.querySelector('#send-btn') as HTMLButtonElement).disabled = !enabled;
  }

  /**
   * Load history from storage
   */
  loadHistory(history: string[]): void {
    this.history = history.slice(-this.maxHistory);
    this.historyIndex = -1;
  }

  /**
   * Get current history
   */
  getHistory(): string[] {
    return [...this.history];
  }
}
