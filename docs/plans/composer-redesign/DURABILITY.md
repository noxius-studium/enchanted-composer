# Durability — surviving Hermes host updates and host resets

<!-- CURRENT_EXECUTION_RULES:BEGIN -->
## Current operating policy

Read [CURRENT_EXECUTION_POLICY.md](CURRENT_EXECUTION_POLICY.md), [UPDATE_DURABILITY.md](UPDATE_DURABILITY.md), [SERVER_MIGRATION.md](SERVER_MIGRATION.md) and [TASK_TRACKING.md](TASK_TRACKING.md) FIRST. These supersede older per-slice permission/no-push/routing clauses. Subagents are allowed ONLY on `qwen/qwen4-max:free`. Work runs on the cloud; no local application builds. Existing used graphs must be resumed/restored, not re-imported. Commit -> push -> verify remote SHA, continue via START/FINISH/BLOCKED/REVIEW callbacks until done or genuine owner review; preserve all actual gates.
<!-- CURRENT_EXECUTION_RULES:END -->

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

The **git repository preserves source and pushed receipts**; an already-used Kanban board must be restored with its actual private state, not recreated as fresh tasks. Read `CURRENT_EXECUTION_POLICY.md`, `UPDATE_DURABILITY.md` and `SERVER_MIGRATION.md` before using older recovery instructions below.

1. **Everything material is committed and pushed**: handoff spec/manifest/card bodies, importer, slice source, evidence, receipts (local receipts are gitignored but their content — SHAs, checks, IDs — is duplicated into card metadata/comments, which live in the board DB and in the pushed commit history).
2. **Board snapshot (recommended before risky host changes):**
   `hermes kanban boards export enchanted-composer-redesign` → portable `.tar.gz`; restore on any host with `hermes kanban boards import <archive>`.
3. **Existing-board recovery versus fresh bootstrap:**
   - For migration/reset, restore the actual private board backup and verify task IDs, statuses, links, comments, runs and attachments. Discover actual new-host workspace/profile paths and rebind notification subscriptions; the supported transfer strips machine-local claims/subscriptions and excludes workspaces. Keep dispatch held until reconciliation is complete.
   - **Do not re-import an already-used graph with `import_kanban.py --apply`.** That helper deliberately requires blocked, zero-run tasks; idempotency keys alone do not restore completion, run history or pending owner review. Missing board state is a real recovery blocker, not permission to replay all tasks.
   - The repository importer remains available only for an explicitly authorized truly fresh board. Its default dry-run is safe integrity validation and needs only Python; applying requires the existing Hermes CLI/PyYAML and verified target values. It does not migrate an active board.
   - Preserve recorded route decisions and scoped source/receipts. Resume existing unfinished tasks on `redesign/w1-original-composer` with exact `qwen/qwen4-max:free` main/subagents, required commit -> push -> remote-SHA verification and callbacks. Respect the existing EC-R05 human gate.
4. **Slice continuity.** Each completed slice's commit SHA is recorded in its card metadata and finish receipt; the next slice starts from that exact commit. Never reset or replace a predecessor's commit. `git log` on the pushed branch is the authoritative work ledger.

## 3. What a Hermes update must never do to this system

- Delete or rewrite user prompt libraries, drafts, settings, voice accounts, or saved briefs.
- Trigger private-API fallbacks or DOM scraping to "keep working".
- Auto-unblock/dispatch Kanban cards, change routing, or start workers (import and updates are plan-only).
- Invalidate the baseline ancestry: `feea09c5f3d6eac8d1afcd7e158a680d9b7c75b0` must remain reachable in pushed history.

## 4. Post-update verification checklist (run on the cloud checkout)

```sh
# Handoff integrity helpers only; run on the CLOUD checkout.
python docs/plans/composer-redesign/import_kanban.py
python docs/plans/composer-redesign/test_import_kanban.py
python docs/plans/composer-redesign/test_execution_policy.py
# Product checks must remain a small serial risk-focused set using existing tools,
# subject to the actual build-only/resource permission. No local app builds,
# Docker, broad automatic test matrix, large installs or implied live acceptance.
```

Then open Settings ▸ Account & usage ▸ Host compatibility on the live desktop and Re-check. Any missing critical seam = report the exact seam, keep the plugin degraded-but-safe, and request the specific host change — do not invent a workaround.
