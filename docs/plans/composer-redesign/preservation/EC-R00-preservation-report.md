# EC-R00 — Preservation report and approved baseline preparation

**Card:** EC-R00 (`t_84c3abf2`, board `enchanted-composer-redesign`) · **Wave:** W1 preflight
**Executed by:** cloud profile `default` on connection `nonconformist-innovation` (self-execution; self-delegation authorized by user 2026-11-19)
**Route:** `nous / qwen/qwen4-max:free` (final user decision 2026-11-19, superseding the handoff's `tencent/hy4-flash:free`); fallback none; MoA none; Codex/external agents forbidden
**Workspace:** `/workspace/hermes/repos/enchanted-composer` · **Slice parent commit:** `ab801c14b75ca91fd35371bf25b4f7d773607e34` (routing-decision record)
**Scope boundary:** preservation/preflight only. No product code edited, no live restore/install, no deletion, no push, no Windows-runtime access.

## 1. Baseline verification (spec §2.1)

| Check | Result |
|---|---|
| Baseline commit `feea09c5f3d6eac8d1afcd7e158a680d9b7c75b0` exists in cloned history | PASS (`git cat-file -t` → commit; subject: "fix: preserve current Composer skill-catalog compatibility") |
| Original renderer SHA-256 at baseline (`git show feea09c:desktop/plugin.js`) | PASS — `188726c5b0b35ac4a0965b3ba84c0e6b9adf69d52c1e4c630391aebf8511d9b9`, byte-exact match to SPECIFICATION.md §2.1 |
| Baseline is ancestor of workspace HEAD | PASS (`git merge-base --is-ancestor`) |
| Baseline reachable in pushed GitHub history | PASS — remote `docs/composer-redesign-handoff` = `d58ae86433e824b055455c9bfccd2bdcc278c33a`, direct child of `feea09c` |
| Public skill-catalog compatibility fix preserved | PASS — the fix IS the baseline commit; no regression possible without rewriting history (not done) |

## 2. Source purity since baseline

`git diff --name-status feea09c HEAD` shows **additions only under `docs/plans/`** (36 files: START_HERE, KANBAN, SPECIFICATION, manifest, importer + tests, 23 card bodies, 4 reference images, git metadata). **Zero product-code changes** since the preserved baseline. The rejected workbench UI is not present in this checkout's history.

## 3. Runtime / package metadata snapshot (cloud)

- `plugin.yaml`: name `composer-enhancements`, version `0.2.7`, manifest_version 2, api_version 1, kind `backend`, requires_hermes `>=0.21.5`, author Zero2.
- `pyproject.toml`: version `0.2.7`.
- Workspace branch at slice start: `docs/composer-redesign-handoff`, HEAD `ab801c1` (handoff `d58ae86` + routing-decision record).
- **No live Composer installation exists on this cloud host** — this is a source checkout only. The user's live installation and runtime state are on the Windows machine and were not touched, inspected, or restored.

## 4. Rejected-build inventory and preservation status

GitHub remote branch inventory (`git ls-remote --heads origin`, read-only):

| Remote branch | SHA | Disposition |
|---|---|---|
| `main` | `b91e684c78d8a43a5346339a5091a1109424a28c` | preserved, untouched |
| `docs/composer-redesign-handoff` | `d58ae86433e824b055455c9bfccd2bdcc278c33a` | handoff branch; baseline reachable through it |
| `feat/composer-experience` | `6ef40ede324bda49f3d10ebadd1c8ce6da714aea` | preserved, untouched (not the approved baseline) |
| `Deadtrix21-patch-1` | `03492fb921b75c109a1e7ab95372252574221f0c` | preserved, untouched |

**`feature/enchanted-workbench` is NOT on the GitHub remote**, and neither is `baseline/composer-20261118`. Per spec §2.2–2.3 the rejected worktree (with uncommitted work), the preserved Windows baseline worktree, and the pre-install backup directory exist **only on the user's Windows machine**:

- `C:/A-Software-Engineer/Worktrees/Enchanted-Composer/enchanted-workbench` (rejected; uncommitted work)
- `C:/A-Software-Engineer/Worktrees/Enchanted-Composer/baseline-installed-20261118`
- `C:/A-Software-Engineer/Projects-Hermes/Enchanted-Composer-Backups/20261119-071821-workbench-install`

**Cloud limitation (honest, not fabricated):** these Windows-only artifacts cannot be archived, hashed, or verified from this host. Their preservation remains the user's Windows-side recovery path. Nothing was deleted anywhere; no cloud action touches them. If the user later pushes the rejected branch or uploads the backup archives, they can be inventoried read-only in a follow-up — that is a separate authorization, not part of this slice.

## 5. New implementation workspace prepared

- New branch **`redesign/w1-original-composer`** created at the EC-R00 slice commit (this report's commit; parent `ab801c1`) and checked out in the cloud workspace. Previously unused (absent locally and on the remote).
- Ancestry verified: `feea09c` (original baseline) → `d58ae86` (handoff docs) → `ab801c1` (routing record) → slice commit. The branch therefore starts from the approved original baseline **plus the handoff specification** (docs-only additions), satisfying both "from the original baseline" and "workers must read the spec".
- No worktree reset, no clean, no forced branch movement; existing branches and history untouched.
- Next slice (EC-R01) starts from the recorded slice commit on this branch.

## 6. Preservation distinction: code vs user data vs runtime

| Layer | Status |
|---|---|
| Code | All git history and all four remote branches intact; baseline renderer hash verified; rejected code NOT destroyed (Windows-side; never pushed) and NOT used as a base |
| User data | Prompt libraries, drafts, settings, voice accounts live in the Windows runtime/profile storage. No cloud-side copy exists in this checkout; nothing read, migrated, normalized, or deleted. Owner-bound data contracts remain for later cards |
| Runtime | No cloud installation exists; no restore/install/restart performed; Windows live installation untouched |

## 7. Feature-parity checklist (verified in baseline source, not assumed)

Nine configurable Composer actions — control IDs present in baseline `desktop/src/90-settings-ui.js` (Composer bar customization):
`voice` (live voice), `voice-mode`, `prompt-library`, `draft-shelf`, `review` (review enhancement), `enhance` (immediate Enhance), `undo`, `redo`, `settings` — **9/9 present**.

Six settings areas — all present in baseline `desktop/src/90-settings-ui.js`: Enhancement, Prompts, Composer bar, Voice, Audio, Account & usage — **6/6 present**.

Behavioral anchors confirmed in baseline `desktop/src/95-composer-actions.js`: VoiceStatusPill (start/mute/end, PTT + continuous), VoiceInteractionModeChooser (guarded active-call mode change; chained voice honestly disabled), ComposerPromptMenu (search/favorites/recents/insert/use), ComposerDraftShelf (owner-bound save), ComposerEnhancementReviewPanel (Apply selected / Apply all / Keep original), `undoEnhancement`/`redoEnhancement` (owner-captured, stored-output redo), VoiceTaskInspector (Stop/Steer). Baseline module inventory: 22 files under `desktop/src/` (00-runtime … 99-register), matching spec §2.5 source authority.

## 8. Checks actually run (lean, documentation-only slice)

1. `git cat-file -t feea09c…` → commit.
2. `git show feea09c:desktop/plugin.js | sha256sum` → exact match to spec §2.1.
3. `git merge-base --is-ancestor feea09c HEAD` → pass (repeated for the new branch).
4. `git diff --name-status feea09c HEAD` → docs-only additions.
5. `git ls-remote --heads origin` → inventory above (read-only).
6. Baseline source greps for the 9 action IDs and 6 settings areas → all present.
7. Handoff validator: `import_kanban.py` dry-run (23 cards, hashes verified, writes 0) and `test_import_kanban.py` → 3/3 OK (after the recorded routing-decision fixture update).

No product build/test suite was run: this slice changes documentation only and must not alter product code. Actual UI/build checks belong to EC-R01+.

## 9. Limitations and open gates

- Windows-only evidence (backups, rejected worktree, pre-install renderer) is inaccessible from the cloud; recorded as a limitation, never fabricated.
- No live-provider, microphone, or installation acceptance is claimed (separate gates, separate authorizations).
- Host-seam verification against the actual running SDK is EC-R01's job, not claimed here.
- Completion state for this card: **source/preflight done · local checks passed · rendered UI n/a · live integration n/a · user acceptance pending** (the preservation report is available for user review).

## 10. Commit record

This report is the slice's committed payload. Author `Zero2 <deadtrix21@users.noreply.github.com>` (repo-local identity; global identity unchanged). Parent `ab801c14b75ca91fd35371bf25b4f7d773607e34`. The actual slice SHA, parent, and changed-file list are recorded in the card's finish receipt and completion metadata (a report cannot contain its own commit's SHA). No push was made; local-only completion contract honored.
