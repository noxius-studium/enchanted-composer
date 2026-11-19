# Durability — surviving Hermes host updates and host resets

User requirement (2026-11-19): *"even if hermes updates our system should be durable, our systems should still work."* This document is the contract and the recovery procedure. `tests/desktop/host-durability.test.mjs` enforces it in CI.

## 1. Plugin durability across Hermes Desktop updates

- **Public seams only.** The bundle imports nothing but `@hermes/plugin-sdk`, `react`, `react/jsx-runtime` (enforced by `scripts/verify_desktop.mjs` and the durability tests). Draft access uses only `host.composer.getDraft/setDraft/insertText`; no DOM scraping, no `execCommand`, no private core events, no `prompt.submit`.
- **Fail closed, visibly.** `03-host-compat.js` probes every required seam at registration (`hostCompatibility`). If a host update removes one, the plugin registers an explicit "needs a Hermes Desktop update" notice listing the exact missing seams, keeps settings/diagnostics reachable, and does **not** register draft-dependent actions. User data is never touched or "repaired".
- **Version floor.** `plugin.yaml` `requires_hermes: ">=0.21.5"` mirrors `PLUGIN_REQUIRES_HERMES` in the runtime contract; a test asserts they stay equal.
- **Diagnostics.** Settings ▸ Account & usage ▸ **Host compatibility** shows contract version, every seam's availability, optional browser seams (guarded fallbacks), and a Re-check action — the first place to look after any Hermes update.
- **Versioned, validated storage.** Prompt library (`LIBRARY_VERSION`, v1→v2→v3 migration), briefs (`BRIEF_VERSION`, `validateBrief` on every load/open), settings (wire mapping + `DEFAULT_SETTINGS` merge + `migrateRendererVoiceDefaults`), rail/visibility/apply-mode preferences (normalized with safe defaults). Unknown fields are preserved or defaulted — never silently normalized away, never crash-on-read.
- **Guarded writes.** Every draft mutation goes through `ComposerDraftAdapter.replace`/`compareAndReplace`: exact current-draft check, acknowledged write, read-back verification, owner-surface drift refusal. A misbehaving host cannot silently lose text.
- **Optional browser APIs are guarded.** `ResizeObserver` (overflow tiers, inline height) and `navigator.clipboard` (copy proposal) degrade to honest fallbacks when absent.

## 2. Plan-state durability across host resets / new cloud hosts

The **git repository is the source of truth**; the Kanban board is reconstructible.

1. **Everything material is committed and pushed**: handoff spec/manifest/card bodies, importer, slice source, evidence, receipts (local receipts are gitignored but their content — SHAs, checks, IDs — is duplicated into card metadata/comments, which live in the board DB and in the pushed commit history).
2. **Board snapshot (recommended before risky host changes):**
   `hermes kanban boards export enchanted-composer-redesign` → portable `.tar.gz`; restore on any host with `hermes kanban boards import <archive>`.
3. **Rebuild from the repo (no snapshot needed):**
   - Clone `noxius-studium/enchanted-composer`, checkout `redesign/w1-original-composer` (baseline `feea09c…` ancestry verified by the importer).
   - Dry-run: `python docs/plans/composer-redesign/import_kanban.py` (needs PyYAML; pure-python copy acceptable).
   - Apply with discovered target values: `--board … --assignee <actual profile> --workspace <abs repo path> --profile-config <actual config> --confirm-target nonconformist-innovation --apply`.
   - **Idempotency keys** (`enchanted-composer-redesign-v2:EC-R##`) make re-import safe against duplicates; the importer reads every card back (blocked status, pins, body hash, parent chain, zero runs) and writes a fresh receipt.
   - Routing decisions are recorded in the importer comments, manifest, and each card's "Verified import binding" section — re-apply the same decision or obtain a new one; never change routing silently to make checks pass.
4. **Slice continuity.** Each completed slice's commit SHA is recorded in its card metadata and finish receipt; the next slice starts from that exact commit. Never reset or replace a predecessor's commit. `git log` on the pushed branch is the authoritative work ledger.

## 3. What a Hermes update must never do to this system

- Delete or rewrite user prompt libraries, drafts, settings, voice accounts, or saved briefs.
- Trigger private-API fallbacks or DOM scraping to "keep working".
- Auto-unblock/dispatch Kanban cards, change routing, or start workers (import and updates are plan-only).
- Invalidate the baseline ancestry: `feea09c5f3d6eac8d1afcd7e158a680d9b7c75b0` must remain reachable in pushed history.

## 4. Post-update verification checklist (run on the cloud checkout)

```sh
node --test tests/desktop/*.test.mjs tests/dashboard/*.test.mjs
node scripts/verify_desktop.mjs desktop/plugin.js
uv run python scripts/build_desktop.py --check
uv run python scripts/build_dashboard.py --check
uv run python -m pytest -q
uv run python -m ruff check dashboard tests scripts
python docs/plans/composer-redesign/import_kanban.py   # dry-run integrity
```

Then open Settings ▸ Account & usage ▸ Host compatibility on the live desktop and Re-check. Any missing critical seam = report the exact seam, keep the plugin degraded-but-safe, and request the specific host change — do not invent a workaround.
