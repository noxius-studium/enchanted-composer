# Update durability — Enchanted Composer

## Preserve existing implementation and review state

The pulled `redesign/w1-original-composer` branch already contains EC-X01's `desktop/src/03-host-compat.js`, `tests/desktop/host-durability.test.mjs` and `DURABILITY.md`. Extend those owners; do not reset source, recreate the card, or claim this documentation update implements or tests runtime durability. EC-R05 remains an actual W1 owner-review gate.

## Product requirements

1. Keep Composer's implementations and state in its unified package. Use supported public SDK/React/dependencies, not private Hermes imports, source monkeypatches, raw internal bridges, DOM scraping or another plugin supplying its provider implementation.
2. One compatibility adapter declares minimum host version AND actual capabilities: draft read/write/insert, owner/focus, profile requests/routing, persistence, panes/settings/commands and optional voice/browser. Probe before referencing optional exports: a missing ESM named export can abort registration before a later host probe runs. Preserve the current shim and address that separate linkage boundary explicitly.
3. Missing optional capabilities leave safe supported functions available with accurate status. Missing critical draft/ownership capability disables unsafe writes, preserves data and exposes exact diagnostics; never scrape the editor or remove owner checks just to appear functional.
4. Preserve host themes, native controls and captured draft/session/profile ownership. Update/reload cannot auto-send/apply, switch sessions, activate microphones or discard text. Fence late asynchronous replies from old activations and dispose listeners/timers without deleting saved work.
5. Version prompt libraries, drafts/briefs, settings, history and account references. Validate migrations, preserve unknown fields/raw legacy records and support explicit backup/rollback. Initialization or an unrelated setting write must not silently rewrite legacy data. Don't persist opaque runtime handles or secrets in task evidence.
6. Use small CLOUD current/next/optional-seam-absent fixtures plus owner-drift and reload/disposal scenarios with existing tooling. Honour no-Docker/build-only limits. Fixtures do not establish compatibility with arbitrary unreleased breaking hosts, actual packaged UI, provider calls or microphones. No local Hermes/Electron build.
7. Keep `requires_hermes`, capability claims, generated bundles and package contents aligned with observed SDK support. Preserve the last compatible artifact; expose an accurate needed version/capability. No automatic host upgrade, live install, restart or release publication.

## Execution-state durability

Stable manifest keys, actual task/board/run IDs, dependency graph, callbacks, receipts and owner-review state must survive agent updates/server migration through pushed evidence PLUS a consistent private board backup. Git is not a backup of auth or all board state. Never reconstruct an already-used graph with the fresh blocked/zero-run importer. The actual graph must be restored/read back, and notification subscriptions re-established; see SERVER_MIGRATION.md.

Keep source history and unfinished work intact. Record actual SDK/version/capability evidence, data preservation/rollback, cleanup and source/generated-package integrity separately from live acceptance. Every scoped commit requires push and exact remote-SHA verification before advancing. No blanket promise about arbitrary future breaking updates: support, recovery and honest diagnostics are the contract.
