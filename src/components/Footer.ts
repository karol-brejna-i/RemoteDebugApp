/**
 * Footer Component
 * 
 * Displays device info, message count, and keyboard shortcuts.
 */

import type { DeviceInfo } from '../types';

export class Footer {
  private container: HTMLElement;
  private messageCount: number = 0;
  private deviceInfo: DeviceInfo | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <footer class="footer">
        <div class="footer__left">
          <span class="footer__item" id="device-info">
            ${this.deviceInfo 
              ? `${this.deviceInfo.board} | ${this.deviceInfo.firmware}` 
              : 'No device connected'}
          </span>
          <span class="footer__item" id="message-count">
            ${this.messageCount} messages
          </span>
        </div>
        <div class="footer__right">
          <span class="footer__item">
            <kbd class="footer__kbd">V</kbd>/<kbd class="footer__kbd">D</kbd>/<kbd class="footer__kbd">I</kbd>/<kbd class="footer__kbd">W</kbd>/<kbd class="footer__kbd">E</kbd> Level
          </span>
          <span class="footer__item">
            <kbd class="footer__kbd">R</kbd> Reset
          </span>
          <span class="footer__item">
            <kbd class="footer__kbd">C</kbd> Clear
          </span>
          <span class="footer__item">
            <kbd class="footer__kbd">?</kbd> Help
          </span>
        </div>
      </footer>
    `;
  }

  /**
   * Update the device info display
   */
  setDeviceInfo(info: DeviceInfo | null): void {
    this.deviceInfo = info;
    const el = this.container.querySelector('#device-info');
    if (el) {
      el.textContent = info 
        ? `${info.board} | ${info.firmware}` 
        : 'No device connected';
    }
  }

  /**
   * Update the message count display
   */
  setMessageCount(count: number): void {
    this.messageCount = count;
    const el = this.container.querySelector('#message-count');
    if (el) {
      el.textContent = `${count.toLocaleString()} messages`;
    }
  }

  /**
   * Increment message count by one
   */
  incrementMessageCount(): void {
    this.setMessageCount(this.messageCount + 1);
  }

  /**
   * Reset message count to zero
   */
  resetMessageCount(): void {
    this.setMessageCount(0);
  }
}
