/**
 * RemoteDebug Codec
 * 
 * Encodes/decodes messages for the RemoteDebug protocol used by ESP32/ESP8266.
 * Protocol specification: See docs/ANALYSIS_AND_IMPLEMENTATION_PLAN.md
 */

import type { ParsedMessage, DebugLevel, DeviceInfo } from '../../types';
import { DEBUG_LEVEL_LETTERS } from '../../types';
import type { IMessageCodec, DecodedMessages, CommandType, CodecCapabilities, CodecControlEvent } from './MessageCodec';

/**
 * Level letter to command mapping
 */
const LEVEL_COMMANDS: Record<DebugLevel, string> = {
  1: 'v',  // Verbose
  2: 'd',  // Debug
  3: 'i',  // Info
  4: 'w',  // Warning
  5: 'e',  // Error
};

/**
 * ANSI color code to CSS class mapping
 */
const ANSI_TO_CSS: Record<string, string> = {
  '[0m': '',
  '[1;32m': 'msg-verbose',
  '[1;33m': 'msg-info',
  '[1;36m': 'msg-warning',
  '[1;31m': 'msg-error',
  '[0;30m[42m': 'msg-profiler-fast',
  '[0;30m[43m': 'msg-profiler-medium',
  '[0;30m[45m': 'msg-profiler-slow',
  '[0;30m[41m': 'msg-profiler-very-slow',
};

export class RemoteDebugCodec implements IMessageCodec {
  readonly name = 'RemoteDebug';
  readonly capabilities: CodecCapabilities = {
    levels: true,
    reset: true,
    filters: true,
    profiler: true,
    colors: true,
    handshakeRequired: true,
    defaultPort: 8232,
  };
  
  private messageIdCounter = 0;

  /**
   * Decode raw WebSocket data into messages
   */
  decode(data: string): DecodedMessages {
    const lines = data.split('\n');
    const messages: ParsedMessage[] = [];
    const controlEvents: CodecControlEvent[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check for protocol message
      if (trimmed.startsWith('$app:')) {
        const event = this.decodeProtocolMessage(trimmed);
        if (event) {
          controlEvents.push(event);
        }
        // Also add as a regular message for logging purposes
        messages.push(this.createMessage('protocol', trimmed, trimmed));
        continue;
      }

      const message = this.decodeLine(trimmed);
      if (message) {
        messages.push(message);
      }
    }

    return { messages, controlEvents };
  }

  /**
   * Encode a command to send to the device
   */
  encode(command: CommandType): string {
    switch (command.type) {
      case 'level':
        return LEVEL_COMMANDS[command.level] || 'i';
      
      case 'handshake':
        return '$app';
      
      case 'help':
        return '?';
      
      case 'memory':
        return 'm';
      
      case 'reset':
        return 'reset';
      
      case 'silence':
        return 's';
      
      case 'colors':
        return 'c';
      
      case 'profiler':
        return 'p';
      
      case 'filter':
        return `filter ${command.pattern}`;
      
      case 'clearFilter':
        return 'nofilter';
      
      case 'raw':
        return command.command;
      
      default:
        // Exhaustive check
        const _exhaustive: never = command;
        return String(_exhaustive);
    }
  }

  /**
   * Strip ANSI formatting codes from text
   */
  stripFormatting(text: string): string {
    // Strip real ANSI escape codes
    // eslint-disable-next-line no-control-regex
    let result = text.replace(/\x1b\[[0-9;]*m/g, '');
    
    // Strip literal bracket codes like [1;33m or [0m
    result = result.replace(/\[[0-9;]*m/g, '');
    
    return result;
  }

  /**
   * Get CSS class for an ANSI formatting code
   */
  getFormattingClass(code: string): string {
    return ANSI_TO_CSS[code] || '';
  }

  // ─────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────

  private createMessage(
    type: ParsedMessage['type'],
    content: string,
    raw: string,
    extra?: Partial<ParsedMessage>
  ): ParsedMessage {
    return {
      id: `msg-${++this.messageIdCounter}`,
      type,
      content,
      raw,
      receivedAt: Date.now(),
      ...extra,
    };
  }

  /**
   * Decode a single line into a ParsedMessage
   */
  private decodeLine(line: string): ParsedMessage | null {
    // System message (starts with *)
    if (line.startsWith('*')) {
      return this.createMessage('system', line, line);
    }

    // Try to parse as debug message (with or without ANSI)
    const debugInfo = this.parseDebugMessage(line);
    if (debugInfo) {
      return this.createMessage('debug', debugInfo.content, line, {
        level: debugInfo.level,
        timestamp: debugInfo.timestamp,
        function: debugInfo.function,
        core: debugInfo.core,
      });
    }

    // Unknown format - display with formatting stripped
    return this.createMessage('unknown', this.stripFormatting(line), line);
  }

  /**
   * Parse debug message content
   * Handles both ANSI-formatted and plain messages
   */
  private parseDebugMessage(line: string): {
    level: DebugLevel;
    timestamp?: number;
    function?: string;
    core?: number;
    content: string;
  } | null {
    // Strip ANSI codes first
    const stripped = this.stripFormatting(line);

    // Format 1: HH:MM:SS.mmm [L] (func) (Cn) message
    // Example: 00:23:04.086 [I] (executeCommand) (C1) executeCommand: status
    const clockRegex = /^(\d{2}:\d{2}:\d{2}\.\d{3})\s+\[([VDIWE])\]\s+\((\w+)\)\s+\(C(\d)\)\s+(.+)$/;
    let match = stripped.match(clockRegex);
    
    if (match) {
      return {
        level: DEBUG_LEVEL_LETTERS[match[2]] || 3,
        timestamp: this.parseClockTime(match[1]),
        function: match[3],
        core: parseInt(match[4], 10),
        content: match[5],
      };
    }

    // Format 2: (L t:123ms) (funcName)(Cn) message (original RemoteDebug format)
    const fullRegex = /^\(([VDIWE])\s+t:(\d+)ms\)\s+\((\w+)\)\(C(\d)\)\s+(.+)$/;
    match = stripped.match(fullRegex);
    
    if (match) {
      return {
        level: DEBUG_LEVEL_LETTERS[match[1]] || 3,
        timestamp: parseInt(match[2], 10),
        function: match[3],
        core: parseInt(match[4], 10),
        content: match[5],
      };
    }

    // Format 3: (L t:123ms p:^456ms) (funcName)(Cn) message (with profiler)
    // Example: (D t:3676992ms p:^85246ms) (loop)(C1) Button pressed!
    const profilerRegex = /^\(([VDIWE])\s+t:(\d+)ms\s+p:\^(\d+)ms\)\s+\((\w+)\)\(C(\d)\)\s+(.+)$/;
    match = stripped.match(profilerRegex);
    
    if (match) {
      return {
        level: DEBUG_LEVEL_LETTERS[match[1]] || 3,
        timestamp: parseInt(match[2], 10),
        function: match[4],
        core: parseInt(match[5], 10),
        content: match[6],
      };
    }

    // Format 4: (L t:123ms) message (no function/core)
    const timestampRegex = /^\(([VDIWE])\s+t:(\d+)ms\)\s+(.+)$/;
    match = stripped.match(timestampRegex);

    if (match) {
      return {
        level: DEBUG_LEVEL_LETTERS[match[1]] || 3,
        timestamp: parseInt(match[2], 10),
        content: match[3],
      };
    }

    // Format 5: [L] message or (L) message (simple level prefix)
    const basicRegex = /^[\[(]([VDIWE])[\])]\s*(.+)$/;
    match = stripped.match(basicRegex);

    if (match) {
      return {
        level: DEBUG_LEVEL_LETTERS[match[1]] || 3,
        content: match[2],
      };
    }

    return null;
  }

  /**
   * Parse clock time format (HH:MM:SS.mmm) to milliseconds
   */
  private parseClockTime(time: string): number {
    const [hours, minutes, rest] = time.split(':');
    const [seconds, millis] = rest.split('.');
    return (
      parseInt(hours, 10) * 3600000 +
      parseInt(minutes, 10) * 60000 +
      parseInt(seconds, 10) * 1000 +
      parseInt(millis, 10)
    );
  }

  /**
   * Decode protocol message ($app:...)
   */
  private decodeProtocolMessage(raw: string): CodecControlEvent | null {
    if (!raw.startsWith('$app:')) {
      return null;
    }

    const parts = raw.substring(5).split(':');
    const type = parts[0] as 'I' | 'V' | 'L' | 'M';

    switch (type) {
      case 'I':
        // Handshake acknowledgment
        return { type: 'handshakeAck' };

      case 'V':
        // Version: $app:V:<ver>:<board>:<feat>:<mem>:<dbg>:<sil>
        return {
          type: 'deviceInfo',
          info: this.buildDeviceInfo(parts),
        };

      case 'L':
        // Level change: $app:L:<1-5>
        const levelPart = parts[1] || '';
        const level = parseInt(levelPart.split('-')[0], 10) || 3;
        return {
          type: 'levelChanged',
          level,
        };

      case 'M':
        // Memory: $app:M:<bytes>u:
        return {
          type: 'memory',
          freeHeap: this.parseMemory(parts[1] || ''),
        };

      default:
        return null;
    }
  }

  /**
   * Parse memory value (e.g., "217356u" -> 217356)
   */
  private parseMemory(value: string): number {
    return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
  }

  private buildDeviceInfo(parts: string[]): DeviceInfo {
    const version = parts[1] || '';
    const board = parts[2] || 'Unknown';
    const memory = this.parseMemory(parts[4] || '');

    return {
      board,
      firmware: version || 'Unknown',
      library: `RemoteDebug ${version}`.trim(),
      freeHeap: memory,
    };
  }
}
