# Privacy and security

Renderer storage contains only prompt library and non-secret settings. It never retains OAuth/API credentials, bearer tokens, Codex auth data, SDP, raw provider payloads, or raw bridge traffic. Backend capability and diagnostic routes return bounded public receipts only.

Codex OAuth remains owned by the official Codex CLI. Enchanted Composer never reads, refreshes, backs up, logs out, or writes the CLI's OAuth files. Subscription voice starts `codex app-server`, which uses its own authentication internally and reports only bounded protocol results. Users authenticate separately with `codex login`.

The plugin has no telemetry and no self-update path. It stores bounded local voice activity in a hashed connection/profile directory and reads only the exact captured profile's bounded `SOUL.md` identity. API keys and bridge secrets are read from backend environment/secret scope and never sent to the renderer.

Voice transcript is plugin-owned temporary state and clears when a call begins or ends. Ordinary transcript text never enters the draft or Hermes chat. Only filtered explicit delegation may become a focused-chat turn, bound to a captured owner route. The owner cannot silently change if the user switches focus.

Provider choice, billing lane, and bridge endpoint are explicit per call. Blank configured credential states fail closed and no backend/provider/billing fallback is attempted.
