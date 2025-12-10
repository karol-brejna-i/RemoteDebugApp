# Protocol Swapping Improvements

This document outlines changes to make WSTerm truly pluggable for different wire protocols and message formats.

## Goals (In Progress)
- Swap codecs without touching app UI code.
- Surface protocol capabilities (e.g., reset support) so UI enables only what is available.
- Route protocol-specific parsing into codecs; the app consumes generic control events.
- Keep a clear template for adding new codecs.

## Proposed Architecture (Drafted)
- **Codec interface**: Extend `IMessageCodec` with metadata and a control-event stream. Codec emits `controlEvents` (e.g., `levelChanged`, `deviceInfo`, `memoryUpdate`, `connectionInfo`, `notification`).
- **Capabilities**: Add a `capabilities` object (e.g., `levels`, `reset`, `filters`, `profiler`, `colors`, `handshakeRequired`, `defaultPort`). UI uses this to show/hide controls and guard shortcuts.
- **Commands**: Keep a minimal shared command union plus `encodeRaw`; allow codecs to expose `supportedCommands` or internally reject unsupported commands.
- **Factory**: `createCodec(name)` stays; add `registerCodec`. Allow selection via settings or query param, default to `remotedebug`.
- **App wiring**: `App` listens to codec `controlEvents` instead of parsing protocol messages. Codec handles `$app:*` (or other protocol) and emits events; App updates toolbar/footer/levels accordingly.
- **Formatting**: Keep `stripFormatting`/`getFormattingClass` per codec.
- **Docs & template**: Provide a small “template codec” example to guide new protocol implementations.

## Implementation Steps (Progress)
1) **Interface update**
   - Add `CodecCapabilities` and `CodecControlEvent` types.
   - Extend `IMessageCodec` with `capabilities`, `decode` returning `{ messages, controlEvents }`, and keep formatting helpers.

   ✅ Done in code.

2) **RemoteDebug codec update**
   - Move `$app:*` parsing to emit control events.
   - Populate `capabilities` (levels, reset, filters, profiler, colors, handshakeRequired, defaultPort=8232).

   ✅ Done in code.

3) **App refactor**
   - `App` subscribes to `controlEvents` returned from decode instead of a protocol-specific handler.
   - Gate UI actions/shortcuts based on `capabilities` (e.g., disable reset if unsupported).
   - Allow codec selection (setting or query param; default `remotedebug`).

   ✅ Progress: control events + gating landed. Codec selection via query param and persisted in settings (`codecName`, default `remotedebug`). UI selector still not present.

4) **Tests**
   - Unit test `RemoteDebugCodec` control events and capabilities.
   - Test App (or a thin controller) reacts to `levelChanged` and `deviceInfo` events without protocol coupling.

   ✅ Added codec control-event/capabilities tests. App-level test still TODO.

## Notes (Ongoing)
- Keep debug logging gated to `import.meta.env.DEV`.
- If a command is not supported, prefer a clear console/system message instead of silent failure.
- Avoid breaking existing behavior; ensure defaults match current RemoteDebug behavior.
