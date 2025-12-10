/**
 * Message Codec Module
 * 
 * Provides abstraction layer for message encoding/decoding.
 * Import from this module to use codecs.
 */

// Interface and types
export type { 
  IMessageCodec, 
  DecodedMessages, 
  CommandType,
  CodecCapabilities,
  CodecControlEvent,
} from './MessageCodec';

// Implementations
export { RemoteDebugCodec } from './RemoteDebugCodec';

// Factory function to get codec by name
import type { IMessageCodec } from './MessageCodec';
import { RemoteDebugCodec } from './RemoteDebugCodec';

const codecs: Record<string, () => IMessageCodec> = {
  'remotedebug': () => new RemoteDebugCodec(),
  'default': () => new RemoteDebugCodec(),
};

/**
 * Create a codec instance by name
 * @param name Codec name (case-insensitive)
 * @returns Codec instance
 */
export function createCodec(name: string = 'default'): IMessageCodec {
  const factory = codecs[name.toLowerCase()] || codecs['default'];
  return factory();
}

/**
 * Register a custom codec
 * @param name Codec name
 * @param factory Factory function to create codec
 */
export function registerCodec(name: string, factory: () => IMessageCodec): void {
  codecs[name.toLowerCase()] = factory;
}
