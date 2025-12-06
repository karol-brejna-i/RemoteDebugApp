/**
 * Message Parser Service
 * 
 * Parses incoming messages from RemoteDebug device.
 */

import { 
  ParsedMessage, 
  ProtocolMessage, 
  DebugLevel,
  DEBUG_LEVEL_LETTERS 
} from '../types';

export class MessageParser {
  private messageIdCounter = 0;

  /**
   * Parse raw data from WebSocket
   * May contain multiple messages separated by newlines
   */
  parse(data: string): ParsedMessage[] {
    const lines = data.split('\n');
    const messages: ParsedMessage[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const message = this.parseLine(trimmed);
      if (message) {
        messages.push(message);
      }
    }

    return messages;
  }

  /**
   * Parse a single line
   */
  private parseLine(line: string): ParsedMessage | null {
    const id = `msg-${++this.messageIdCounter}`;
    const receivedAt = Date.now();

    // Protocol message ($app:...)
    if (line.startsWith('$app:')) {
      return {
        id,
        type: 'protocol',
        content: line,
        raw: line,
        receivedAt,
      };
    }

    // System message (starts with *)
    if (line.startsWith('*')) {
      return {
        id,
        type: 'system',
        content: line,
        raw: line,
        receivedAt,
      };
    }

    // Debug message with ANSI codes
    const ansiMatch = this.parseAnsiMessage(line);
    if (ansiMatch) {
      return {
        id,
        type: 'debug',
        level: ansiMatch.level,
        timestamp: ansiMatch.timestamp,
        function: ansiMatch.function,
        core: ansiMatch.core,
        content: ansiMatch.content,
        raw: line,
        receivedAt,
      };
    }

    // Plain debug message (no ANSI codes)
    const plainMatch = this.parsePlainMessage(line);
    if (plainMatch) {
      return {
        id,
        type: 'debug',
        level: plainMatch.level,
        timestamp: plainMatch.timestamp,
        function: plainMatch.function,
        core: plainMatch.core,
        content: plainMatch.content,
        raw: line,
        receivedAt,
      };
    }

    // Unknown format - still display it
    return {
      id,
      type: 'unknown',
      content: line,
      raw: line,
      receivedAt,
    };
  }

  /**
   * Parse message with ANSI escape codes
   * Format: [<ANSI>(<LEVEL> t:<ms>ms) (<func>)(<core>) <msg>[0m
   */
  private parseAnsiMessage(line: string): {
    level: DebugLevel;
    timestamp?: number;
    function?: string;
    core?: number;
    content: string;
  } | null {
    // Strip ANSI codes first
    const stripped = this.stripAnsiCodes(line);
    
    // Check if original had ANSI codes
    if (stripped === line) {
      return null; // No ANSI codes found
    }

    // Parse the stripped content
    return this.parsePlainMessage(stripped);
  }

  /**
   * Parse plain debug message (no ANSI)
   * Format: (<LEVEL> t:<ms>ms) (<func>)(<core>) <msg>
   */
  private parsePlainMessage(line: string): {
    level: DebugLevel;
    timestamp?: number;
    function?: string;
    core?: number;
    content: string;
  } | null {
    // Try to match: (V t:123ms) (funcName)(C0) message
    const regex = /^\(([VDIWE])\s+t:(\d+)ms\)\s+\((\w+)\)\(C(\d)\)\s+(.+)$/;
    const match = line.match(regex);

    if (match) {
      const [, levelChar, timestamp, func, core, content] = match;
      return {
        level: DEBUG_LEVEL_LETTERS[levelChar] || DebugLevel.Info,
        timestamp: parseInt(timestamp, 10),
        function: func,
        core: parseInt(core, 10),
        content: content,
      };
    }

    // Simpler format: (V) message or [V] message
    const simpleRegex = /^[\[(]([VDIWE])[\])]\s*(.+)$/;
    const simpleMatch = line.match(simpleRegex);

    if (simpleMatch) {
      const [, levelChar, content] = simpleMatch;
      return {
        level: DEBUG_LEVEL_LETTERS[levelChar] || DebugLevel.Info,
        content: content,
      };
    }

    return null;
  }

  /**
   * Parse protocol message ($app:...)
   */
  parseProtocol(raw: string): ProtocolMessage | null {
    if (!raw.startsWith('$app:')) {
      return null;
    }

    const parts = raw.substring(5).split(':');
    const type = parts[0] as 'I' | 'V' | 'L' | 'M';

    switch (type) {
      case 'I':
        // Handshake acknowledgment
        return { type: 'I', data: {}, raw };

      case 'V':
        // Version: $app:V:<ver>:<board>:<feat>:<mem>:<dbg>:<sil>
        // Example: $app:V:4.0.0:ESP32:M:217356u:D:N
        return {
          type: 'V',
          data: {
            version: parts[1] || '',
            board: parts[2] || '',
            features: parts[3] || '',
            memory: this.parseMemory(parts[4] || ''),
            debuggerEnabled: parts[5] === 'E',
            silenceMode: parts[6] === 'Y',
          },
          raw,
        };

      case 'L':
        // Level change: $app:L:<1-5> or $app:L:1-5
        const levelPart = parts[1] || '';
        // Handle both "2" and "1-5" format
        const level = parseInt(levelPart.split('-')[0], 10) || 3;
        return {
          type: 'L',
          data: { level },
          raw,
        };

      case 'M':
        // Memory: $app:M:<bytes>u:
        return {
          type: 'M',
          data: {
            memory: this.parseMemory(parts[1] || ''),
          },
          raw,
        };

      default:
        return null;
    }
  }

  /**
   * Strip ANSI escape codes from text
   */
  private stripAnsiCodes(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Parse memory value (e.g., "217356u" -> 217356)
   */
  private parseMemory(value: string): number {
    return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
  }

  /**
   * Get CSS class for ANSI color code
   */
  getColorClass(ansiCode: string): string {
    const colorMap: Record<string, string> = {
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

    return colorMap[ansiCode] || '';
  }
}
