import { describe, it, expect } from 'vitest';
import { RemoteDebugCodec } from '../RemoteDebugCodec';
import { DebugLevel } from '../../../types';

describe('RemoteDebugCodec', () => {
  const codec = new RemoteDebugCodec();

  it('exposes capabilities', () => {
    expect(codec.capabilities).toMatchObject({
      levels: true,
      reset: true,
      filters: true,
      profiler: true,
      colors: true,
      handshakeRequired: true,
      defaultPort: 8232,
    });
  });

  it('decodes protocol messages into control events', () => {
    const input = '$app:V:1.2.3:ESP32::217356u:E:Y\n$app:L:4\n$app:M:12345u:';
    const { controlEvents, messages } = codec.decode(input);

    const deviceInfo = controlEvents.find((e) => e.type === 'deviceInfo');
    const levelChanged = controlEvents.find((e) => e.type === 'levelChanged');
    const memory = controlEvents.find((e) => e.type === 'memory');

    expect(deviceInfo).toBeDefined();
    expect(deviceInfo && deviceInfo.type === 'deviceInfo' && deviceInfo.info).toMatchObject({
      board: 'ESP32',
      firmware: '1.2.3',
      library: 'RemoteDebug 1.2.3',
      freeHeap: 217356,
    });

    expect(levelChanged).toEqual({ type: 'levelChanged', level: DebugLevel.Warning });
    expect(memory).toEqual({ type: 'memory', freeHeap: 12345 });

    // protocol lines still get surfaced as protocol messages for logging
    expect(messages.some((m) => m.type === 'protocol')).toBe(true);
  });

  it('parses debug lines alongside control events', () => {
    const input = '00:00:01.000 [I] (loop) (C1) Hello world\n$app:L:2';
    const { messages, controlEvents } = codec.decode(input);

    const debugMsg = messages.find((m) => m.type === 'debug');
    expect(debugMsg?.content).toContain('Hello world');
    expect(debugMsg?.level).toBe(DebugLevel.Info);

    const levelChanged = controlEvents.find((e) => e.type === 'levelChanged');
    expect(levelChanged).toEqual({ type: 'levelChanged', level: DebugLevel.Debug });
  });
});
