/**
 * Message Codec Interface
 * 
 * Abstraction layer for encoding/decoding messages.
 * Implement this interface to support different protocols or message formats.
 */

import type { ParsedMessage, ProtocolMessage, DebugLevel } from '../../types';

/**
 * Decoded result from incoming raw data
 */
export interface DecodedMessages {
  /** Parsed debug/system messages for display */
  messages: ParsedMessage[];
  /** Protocol messages for app control */
  protocolMessages: ProtocolMessage[];
}

/**
 * Device command types that can be encoded
 */
export type CommandType = 
  | { type: 'level'; level: DebugLevel }
  | { type: 'handshake' }
  | { type: 'help' }
  | { type: 'memory' }
  | { type: 'reset' }
  | { type: 'silence' }
  | { type: 'colors'; enabled?: boolean }
  | { type: 'profiler'; enabled?: boolean }
  | { type: 'filter'; pattern: string }
  | { type: 'clearFilter' }
  | { type: 'raw'; command: string };

/**
 * Message Codec Interface
 * 
 * Implementations handle the specifics of encoding commands
 * and decoding incoming messages for a particular protocol.
 */
export interface IMessageCodec {
  /**
   * Codec identifier for logging/debugging
   */
  readonly name: string;

  /**
   * Decode raw data received from the device
   * @param data Raw string data from WebSocket
   * @returns Decoded messages ready for display/processing
   */
  decode(data: string): DecodedMessages;

  /**
   * Encode a command to send to the device
   * @param command Structured command to encode
   * @returns Raw string to send via WebSocket
   */
  encode(command: CommandType): string;

  /**
   * Strip formatting codes (ANSI, etc.) from text
   * @param text Text that may contain formatting codes
   * @returns Clean text without formatting
   */
  stripFormatting(text: string): string;

  /**
   * Get CSS class for a formatting code (for display)
   * @param code The formatting code (e.g., ANSI code)
   * @returns CSS class name or empty string
   */
  getFormattingClass(code: string): string;
}
