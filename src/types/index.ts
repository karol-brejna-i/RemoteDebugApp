/**
 * Type definitions for RemoteDebugApp
 */

// ============================================================================
// Debug Levels
// ============================================================================

export enum DebugLevel {
  Verbose = 1,
  Debug = 2,
  Info = 3,
  Warning = 4,
  Error = 5,
}

export const DEBUG_LEVEL_NAMES: Record<DebugLevel, string> = {
  [DebugLevel.Verbose]: 'Verbose',
  [DebugLevel.Debug]: 'Debug',
  [DebugLevel.Info]: 'Info',
  [DebugLevel.Warning]: 'Warning',
  [DebugLevel.Error]: 'Error',
};

export const DEBUG_LEVEL_LETTERS: Record<string, DebugLevel> = {
  'V': DebugLevel.Verbose,
  'D': DebugLevel.Debug,
  'I': DebugLevel.Info,
  'W': DebugLevel.Warning,
  'E': DebugLevel.Error,
};

// ============================================================================
// Connection
// ============================================================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionInfo {
  state: ConnectionState;
  address: string;
  error?: string;
}

// ============================================================================
// Device Information
// ============================================================================

export interface DeviceInfo {
  board: string;
  firmware: string;
  library: string;
  freeHeap: number;
}

// ============================================================================
// Messages
// ============================================================================

export type MessageType = 
  | 'debug'      // Regular debug message
  | 'system'     // System message (starts with *)
  | 'protocol'   // Protocol message ($app:...)
  | 'unknown';   // Unknown format

export interface ParsedMessage {
  id: string;
  type: MessageType;
  level?: DebugLevel;
  timestamp?: number;
  function?: string;
  core?: number;
  content: string;
  raw: string;
  receivedAt: number;
}

export interface ProtocolMessage {
  type: 'I' | 'V' | 'L' | 'M';
  data: Record<string, unknown>;
  raw: string;
}

// ============================================================================
// Settings
// ============================================================================

export interface LevelColors {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}

export interface ThemeColors {
  verbose: string;
  debug: string;
  info: string;
  warning: string;
  error: string;
}

export type ThemeName = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeName;
  fontSize: number;
  colors: ThemeColors;
  levelColors: LevelColors;
  autoScroll: boolean;
  addressHistory: string[];
  lastAddress: string;
  port: number;
  autoReconnect: boolean;
  maxMessages: number;
  showTimestamps: boolean;
  showFunctionNames: boolean;
  showProfiler: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  fontSize: 13,
  colors: {
    verbose: '#6a9955',
    debug: '#4ec9b0',
    info: '#dcdcaa',
    warning: '#ce9178',
    error: '#f14c4c',
  },
  levelColors: {
    1: '#10b981',  // Verbose - green
    2: '#a78bfa',  // Debug - purple
    3: '#3b82f6',  // Info - blue
    4: '#f59e0b',  // Warning - amber
    5: '#ef4444',  // Error - red
  },
  autoScroll: true,
  addressHistory: [],
  lastAddress: '',
  port: 8232,
  autoReconnect: true,
  maxMessages: 5000,
  showTimestamps: true,
  showFunctionNames: true,
  showProfiler: false,
};

// ============================================================================
// Application State
// ============================================================================

export interface AppState {
  connection: ConnectionState;
  device: DeviceInfo | null;
  settings: AppSettings;
  ui: {
    silenceMode: boolean;
    autoScroll: boolean;
    profilerEnabled: boolean;
    filterText: string;
    settingsOpen: boolean;
  };
}

// ============================================================================
// Events
// ============================================================================

export type AppEventType = 
  | 'connection:change'
  | 'device:update'
  | 'message:received'
  | 'settings:change'
  | 'level:change';

export interface AppEvent<T = unknown> {
  type: AppEventType;
  data: T;
}
