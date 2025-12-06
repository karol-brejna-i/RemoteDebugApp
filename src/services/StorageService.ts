/**
 * Storage Service
 * 
 * Handles localStorage persistence for settings and history.
 */

import type { AppSettings, ThemeColors } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const STORAGE_KEY = 'remotedebug_settings';

export class StorageService {
  /**
   * Load all settings from localStorage
   */
  loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
    
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save all settings to localStorage
   */
  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  /**
   * Save a single setting
   */
  saveSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    const settings = this.loadSettings();
    settings[key] = value;
    this.saveSettings(settings);
  }

  /**
   * Save last used address
   */
  saveLastAddress(address: string): void {
    this.saveSetting('lastAddress', address);
  }

  /**
   * Add address to history
   */
  addToHistory(address: string): void {
    const settings = this.loadSettings();
    
    // Remove if already exists
    const history = settings.addressHistory.filter(a => a !== address);
    
    // Add to front
    history.unshift(address);
    
    // Limit to 10 entries
    if (history.length > 10) {
      history.pop();
    }
    
    this.saveSetting('addressHistory', history);
  }

  /**
   * Save custom colors
   */
  saveColors(colors: ThemeColors): void {
    this.saveSetting('colors', colors);
  }

  /**
   * Reset all settings to defaults
   */
  resetSettings(): AppSettings {
    this.saveSettings(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Get last used address
   */
  getLastAddress(): string | null {
    const settings = this.loadSettings();
    return settings.lastAddress || null;
  }

  /**
   * Get command history
   */
  getCommandHistory(): string[] {
    try {
      const stored = localStorage.getItem('remotedebug_command_history');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load command history:', error);
    }
    return [];
  }

  /**
   * Save command history
   */
  saveCommandHistory(history: string[]): void {
    try {
      localStorage.setItem('remotedebug_command_history', JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save command history:', error);
    }
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('remotedebug_command_history');
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }
}
