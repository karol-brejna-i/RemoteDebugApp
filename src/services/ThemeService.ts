/**
 * Theme Service
 * 
 * Handles theme switching and custom color application.
 */

import type { ThemeName, ThemeColors } from '../types';

export class ThemeService {
  private currentTheme: ThemeName = 'dark';

  /**
   * Set the theme
   */
  setTheme(theme: ThemeName): void {
    this.currentTheme = theme;
    
    let effectiveTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    } else {
      effectiveTheme = theme;
    }
    
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    
    // Listen for system theme changes if using system preference
    if (theme === 'system') {
      this.setupSystemThemeListener();
    }
  }

  /**
   * Get current theme
   */
  getTheme(): ThemeName {
    return this.currentTheme;
  }

  /**
   * Set custom colors for debug levels
   */
  setCustomColors(colors: ThemeColors): void {
    const root = document.documentElement;
    
    root.style.setProperty('--color-verbose', colors.verbose);
    root.style.setProperty('--color-debug', colors.debug);
    root.style.setProperty('--color-info', colors.info);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
  }

  /**
   * Set a single custom color
   */
  setCustomColor(level: keyof ThemeColors, color: string): void {
    document.documentElement.style.setProperty(`--color-${level}`, color);
  }

  /**
   * Reset colors to theme defaults
   */
  resetColors(): void {
    const root = document.documentElement;
    
    // Remove custom properties to fall back to CSS defaults
    root.style.removeProperty('--color-verbose');
    root.style.removeProperty('--color-debug');
    root.style.removeProperty('--color-info');
    root.style.removeProperty('--color-warning');
    root.style.removeProperty('--color-error');
  }

  /**
   * Setup listener for system theme changes
   */
  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme === 'system') {
        document.documentElement.setAttribute(
          'data-theme', 
          e.matches ? 'dark' : 'light'
        );
      }
    });
  }
}
