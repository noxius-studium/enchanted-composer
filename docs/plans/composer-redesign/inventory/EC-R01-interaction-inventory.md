# EC-R01 — Interaction inventory, visual brief, and host-seam confirmation

**Card:** EC-R01 (`t_1f598056`) · **Predecessor commit:** `988e861b5e11ad268cb40d860199d8b88b8a0a1f` (EC-R00)
**Branch:** `redesign/w1-original-composer` · **Baseline:** `feea09c5f3d6eac8d1afcd7e158a680d9b7c75b0` (ancestor verified)
**Route:** `nous / qwen/qwen4-max:free` · self-delegation authorized · no fallback/MoA/Codex/external agents
**Authority:** SPECIFICATION.md (hash-pinned in manifest.json); every claim below is tied to baseline source or marked proposed.

## 1. Verified green baseline (before any redesign change)

Run at HEAD `988e861` on this cloud host, 2026-11-19:

| Check (CI contract from `.github/workflows/ci.yml`) | Result |
|---|---|
| `node --test tests/desktop/*.test.mjs tests/dashboard/*.test.mjs` | **92 pass, 0 fail** |
| `node scripts/verify_desktop.mjs desktop/plugin.js` | desktop runtime verified |
| `uv run python scripts/build_desktop.py --check` | OK (bundle fresh) |
| `uv run python scripts/build_dashboard.py --check` | OK |
| `uv run python -m pytest -q` | **44 passed** |
| `uv run python -m ruff check dashboard tests scripts` | All checks passed |

Tooling note: `uv` was absent on this host; installed to `~/.local/bin` (uv 0.13.9) and `uv sync --locked --extra test` created the repo `.venv`. Node v26.12.1 (built-in test runner) needs no install. These are the required lean checks for every later slice.

## 2. Build and contract rules (must hold for every slice)

- `desktop/plugin.js` is a **concatenation** of the 22 ordered fragments in `desktop/src/` (`scripts/build_desktop.py`, `PARTS` tuple). The sorted glob of `desktop/src/*.js` must equal `PARTS` exactly — a new fragment requires a `PARTS` entry in its sort position; never edit `plugin.js` directly.
- Fragments carry marker comments (`/* COMPOSER_ACTIONS_START */`, `/* OWNER_ROUTER_START */`, …) that tests slice with `between()`; preserve existing markers when refactoring.
- `verify_desktop.mjs` enforces: imports only `@hermes/plugin-sdk`, `react`, `react/jsx-runtime`; `COMPOSER_AREAS.*` contributions only `actions|top`; public draft API tokens present (`composer.getDraft/setDraft/insertText`); no `composer-rich-input`, `execCommand`, `prompt.submit`; Live Voice run routes `/v1/run/start|status|stop|steer` present; `node --check` syntax.
- Tests are contract/regression checks (source assertions + `new Function` evaluation with a stub SDK env, `tests/desktop/runtime-helper.mjs`). Per spec §17.4 they do **not** establish a usable design; visual acceptance is separate (§9 below). Preserve them and add targeted owner/revision/selective-change/migration tests as slices land.
- Theme authority: baseline already uses host tokens (`--ui-text-tertiary`, `--chrome-action-hover`, `--ui-stroke-secondary`, `--ui-bg-elevated`, `--ui-control-active-background`, `--composer-control-size`). Redesign keeps Hermes as sole theme authority (spec §5.1); no hard-coded colors.

## 3. Registration seams (verified in `99-register.js`)

| Contribution | Area | Order | Baseline content |
|---|---|---|---|
| `voice-transcript` | `COMPOSER_AREAS.top` | 10 | VoiceTranscriptPanel (captions + diagnostics, owner-gated) |
| `voice-task-inspector` | `COMPOSER_AREAS.top` | 11 | VoiceTaskInspector (Stop / Steer via `window.prompt`) |
| `enhancement-review` | `COMPOSER_AREAS.top` | 11 | ComposerEnhancementReviewPanel |
| `actions` | `COMPOSER_AREAS.actions` | 10 | ComposerActions rail (9 visibility-controlled actions) |
| `route` / `legacy-route` | `ROUTES_AREA` | 25 | EnchantedComposerPage at `/enchanted-composer` and `/composer-enhancements` |
| `sidebar-nav` | `SIDEBAR_NAV_AREA` | 25 | label "Enchanted Composer", codicon `sparkle` |

Context API verified: `ctx.register`, `ctx.onDispose`, `ctx.storage.get/set/remove`, `ctx.rest(path,{method,body,timeoutMs})`. The inline preparation panel (spec §7.0) maps to a `COMPOSER_AREAS.top` contribution — the same seam the transcript/review panels already use; its actual available geometry must be verified on the live host (proposed, §5).

## 4. Screen / state map (baseline source → spec surfaces)

| Surface | Baseline implementation | Verified states / behavior |
|---|---|---|
| S01 rail | `ComposerActions` (95-composer-actions.js) | 9 controls via `COMPOSER_CONTROL_DEFINITIONS` ids: `voice, voice-mode, prompt-library, draft-shelf, review, enhance, undo, redo, settings`; visibility persisted (`COMPOSER_CONTROL_STORAGE_KEY`); busy enhance spinner; undo/redo disabled from `history.canUndo/canRedo`; `ACTION_CLASS` uses `--composer-control-size` |
| S02 popovers | `ComposerPromptMenu`, `VoiceInteractionModeChooser` | prompt search/favorites/recents/Use-for-Enhance/Insert, keyboard ↑↓/Enter/Esc with focus return to trigger; voice mode continuous/push-to-talk, guarded while active, chained honestly disabled ("requires a public Hermes seam") |
| S03 workspace | `EnchantedComposerPage` (90-settings-ui.js), routed | settings-centric page today; writing-centred Compose journey is NEW (EC-R04) |
| S04 review | `ComposerEnhancementReviewPanel` + `EnhancementReview` (55) | modes `whole`/`groups`; per-group checkboxes; Apply selected / Apply all / Keep original; owner-captured apply |
| S05 library | prompt popup + Prompts settings area | multi-library, create/rename, prompt CRUD, JSON import, stable IDs, transfer without ID change |
| S06 saved | `DraftShelfStore` (45-draft-shelf.js) | owner-bound **save only**; browse/preview/restore incomplete (spec §2.5) → EC-R07 |
| S07 voice | `VoiceStatusPill`, `VoiceTranscriptPanel`, `VoiceTaskInspector`, `LiveVoiceSessionController` (80) | states idle/connecting/live/reconnecting/ending/error + muted/PTT-pressed; explicit End ("stops provider usage"); captions temporary; bounded transcript (240 records / 60 rendered); steering via `window.prompt` → replace with inline form (EC-R09) |
| S08 settings | `EnchantedComposerPage` + `ComposerSettingsStore` (85) | 6 areas: Enhancement, Prompts, Composer bar, Voice, Audio, Account & usage; debounced serialized per-owner writes; PUT `/v1/settings` then read-back `/v1/settings/read` before success; failures retained for retry |
| S09–S11 | absent | NEW surfaces (context inspector, delivery sheet, advanced tools) — EC-R11+ |

Voice lifecycle anchors (80/74/76): WebRTC `oai-events` lane + optional Composer Bridge (`composer-bridge-v1`, `webm-opus-v1`, proof route); fatal/nonfatal explicit events; 10s reconnect window; stop releases media locally even when remote cleanup fails; retry preserves owner/provider and never replays delegated tasks. `DelegationBridge` (30): one active + one queued (10-min expiry), `/v1/runs` with captured `storedSessionId`, polls immutable run ID, writes results into the bound chat, never `prompt.submit`.

## 5. Host-seam confirmation (verified vs proposed vs absent)

**Verified in baseline source + tests (safe to build on):**

| Seam | Evidence |
|---|---|
| Owner capture/routing | `OwnerRouter` (10): `api.state.focusedSessionId/focusedStoredSessionId/focusedSessionOwner.get()`, `api.profileRoutes()`, `api.requestProfile(route,method,params)`, `api.openSession`, owner-routed `session.create`/`session.title`; fail-closed on ambiguous descriptors |
| Public draft API | `api.composer.getDraft/setDraft/insertText` (Promise, stored-session or `new` draft, acknowledged writes); no DOM scraping |
| Model catalog | `requestProfile(owner,'model.options',{explicit_only:true})` → normalized provider/model/capability (reasoning flags) |
| Notifications / navigation | `host.notify({kind,message})`, `host.navigate` |
| Plugin storage / REST / registration | §3 |
| SDK components | `Button, Popover/PopoverContent/PopoverTrigger, RowButton, Tabs/TabsList/TabsTrigger, Codicon, icons` (Mic/MicOff/X used); areas constants |
| Backend REST (owner-bound) | `/v1/enhance`, `/v1/settings` (PUT) + `/v1/settings/read`, `/v1/capabilities`, `/v1/voice/options`, `/v1/codex/status`, `/v1/usage/read` (+`/v1/usage`), `/v1/run/start|status|stop|steer`, `/v1/talk/start|command|result|close|health`, `/v1/live/bridge-proof`; backend reads `/v1/skills` + `/v1/toolsets` before negotiation |

**Proposed by spec, NOT verified on a live host from this cloud checkout (mark Unknown until proven):**

- Native editor **selection access** and editor annotations → absent in baseline. Disposition per spec §7.4: selection operations work in the **plugin-owned workspace editor only**; state the limitation; no DOM scraping.
- **Inline panel geometry** above the native input (max 300px / 40% pane, ~180px usable) → top-area seam exists; actual available height/width unverified → EC-R04 must measure on the live host or offer the expanded path explicitly.
- **Docking/panes** beyond routed page; **global command registration**; **file selection/extraction**; **image display**; **save/download**; **provider capability metadata** beyond `model.options`; **cross-session surfaces** → no baseline usage. Disposition per spec §16.5: preserve the product job through plugin-owned surfaces (workspace editor, context paste/drop, local export via browser download where the host permits, labelled limitations); request specific host changes only where essential.
- The actual `@hermes/plugin-sdk` package is **not present on this cloud host** (host runtime lives in the user's desktop app; `/opt/hermes/hermes_cli/web_dist` contains no SDK source). Seam verification above is source+test evidence from the preserved baseline, which is the approved authority; live-host confirmation remains a user-desktop gate.

## 6. Old icon inventory (input to EC-R02, verified usage)

`icons.Mic` (×3), `icons.MicOff`, `icons.X` (SDK); Codicon `notebook` (library), `bookmark` (draft shelf), `search`, `check` (×3), `chevron-down` (×2), `radio-tower`/`broadcast` (voice mode), `sparkle` (sidebar nav + enhance busy). Spec §6.1 critique confirmed: mixed family, Undo must not look destructive. New family: spec §6.3 I01–I36, drawing contract §6.2 (24 viewBox, 1.75 stroke, currentColor, 16/20px legibility), packaged as a local icon registry compatible with the fragment loader (no new SDK imports).

## 7. Visual brief (region proportions, spec §5 targets — proposed, verify at implementation)

- ≥1200px: 192–208px local nav · flexible editor · optional 288–320px inspector
- 900–1199px: 56px labelled rail · editor · inspector ≤280px if editor keeps usable width
- 640–899px: editor dominant · nav = one compact selector · inspector = dismissible sheet
- <640px: one surface at a time (Editor/Inspect/Preview) · sticky task footer
- Type: editor 14–15px/1.55–1.65; labels 13px; metadata 12px; controls 28–30px compact / 34–36px ordinary / ≥44px large-controls; corners 6px controls / 8px overlays; focus 2px outline; spacing 4/8/12/16/24/32.
- Editor is the main object; at most one inspector; advanced tools are deliberate views, never permanent feature tabs (spec §4.3, §17.3 rejection list).

## 8. Old action → redesigned entry (spec §7.2, source-confirmed)

Live voice → I04 capsule (S07) · Voice mode → Voice menu/More (guarded) · Prompt library → I03 Library (S05) · Draft Shelf → Save draft + Saved browser (S06, EC-R07) · Review enhancement → Improve ▸ Review changes (S04) · Immediate Enhance → Improve primary per saved preference (default review for new users) · Undo/Redo → I08/I09 history controls (stored output, no inference) · Settings → More ▸ Composer settings + workspace utility I27 (S08). Default rail: `[Library][Compose][Improve ▾][Voice][More]` + native Send untouched; narrow overflow per spec §7.1.

## 9. Visual evidence strategy (honest gates)

No desktop host runs in this cloud container. Evidence plan: (a) required lean checks (§1) every slice; (b) **labelled harness fixtures** for geometry/visual review — render components with the existing stub-SDK pattern or a browser harness, explicitly marked "fixture render, not live-host acceptance" (spec §17.2 allows fixtures for geometry only); (c) live-host rendered acceptance, microphone/provider acceptance, and installation remain **separate open gates** on the user's desktop. EC-R05 produces the review packet; the user pre-authorized continuation (2026-11-19) but visual acceptance is never claimed on their behalf.

## 10. Unresolved decisions / explicit limitations

1. Inline panel usable-size contract unverified on live host → EC-R04 measures or falls back to expanded path explicitly.
2. Native selection seam absent → plugin-owned editor only for selection ops (limitation stated in UI).
3. Chained voice stays honestly unavailable (no public seam).
4. Windows-only rejected-worktree/backups inaccessible from cloud (EC-R00 §4).
5. SDK package not inspectable on this host → seams verified from preserved baseline source/tests; live confirmation deferred.
6. `window.prompt` steering exists in baseline → replaced by inline labelled form in EC-R09 (spec §12.3).
7. No feature removed: every old action/area above has a redesigned home (§8); parity re-checked at EC-R22.
