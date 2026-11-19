# Enchanted Composer — detailed cloud Kanban handoff

**Destination:** `nonconformist-innovation` · **Source:** the GitHub repository · **Status:** plan-only, blocked by default.

This is the NEW redesign plan, not the earlier 21 completed workbench cards. Do not reopen or replay those old cards, clear an existing board, or build on the rejected UI.

## Import model

- The canonical specification is [SPECIFICATION.md](SPECIFICATION.md).
- Each card below is self-contained: its slice, actual embedded UI rules, theme/state contracts, write areas, concrete acceptance, callback protocol and permission boundaries are inside its body.
- `manifest.json` contains the exact ordering, file hashes, task pins and idempotency keys.
- The importer defaults to a local dry-run. `--apply` creates every card BLOCKED and reads every exact target back. It never dispatches/unblocks workers.
- Once a slice is separately authorized to run, it must create its own scoped local commit after required checks and record the actual SHA before completion. No automatic implementation pushes, no empty commits, no unrelated staged work.
- Importing does not approve the design or implementation. A cloud assignee must be explicitly verified. The old local `nous-agent` name is not automatically a cloud profile.
- User-approved worker route remains `nous / tencent/hy4-flash:free`, no Codex, no delegation, no fallback. If that conflicts with the actual cloud agent route, keep the plan blocked and ask for the routing decision rather than substitute.
- Code arrives through GitHub. Windows-only paths in historical evidence must not be used as cloud workspace paths.

## GitHub readiness

Commit this directory together with the appropriate source/history in the intended repository. The preserved baseline commit must be reachable in the pushed GitHub history; this package does not assert that has happened. Do not publish the rejected dirty worktree as the new baseline.

Reference images are copied under `references/` and contain user-supplied interface/chat imagery. Review them before putting them in a public repository. No credentials, OAuth files, runtime settings, or source archives are bundled here.

## Import and verify

1. Clone/read the intended GitHub repository on the cloud agent.
2. Run `python docs/plans/composer-redesign/import_kanban.py` to validate all card files and print the dry-run plan. This needs no authentication or model call.
3. Inspect the actual cloud profile and workspace. For a real import, supply explicit `--board`, `--assignee`, `--workspace`, `--profile-config`, `--confirm-target nonconformist-innovation`, and `--apply`.
4. The importer checks profile routing, baseline ancestry, all payload hashes, exact parent chain, persisted body hashes/status/assignee/model/provider, and absence of runs. It writes a local import receipt, not a Git commit.
5. Read back the board: all cards blocked, no workers started. Report exact board/card IDs. Only a subsequent user authorization may release selected cards.

**Do not invent the absolute cloud workspace or profile-config path in the command.** Discover them on the actual target. The importer does not create a workspace/profile or alter routing to satisfy its checks.

## Card sequence

- [EC-R00 — Preserve, retire the rejected build, and prepare the approved original baseline](kanban/EC-R00.md) · after `none`
- [EC-R01 — Interaction inventory, visual brief, and host-seam confirmation](kanban/EC-R01.md) · after `EC-R00`
- [EC-R02 — Redesign the icon family and the native action rail](kanban/EC-R02.md) · after `EC-R01`
- [EC-R03 — Build Improve, selective review, and safe enhancement history](kanban/EC-R03.md) · after `EC-R02`
- [EC-R04 — Build one complete writing-centred Compose journey](kanban/EC-R04.md) · after `EC-R03`
- [EC-R05 — W1 visual review and correction gate](kanban/EC-R05.md) · after `EC-R04`
- [EC-R06 — Complete library browsing, editing, recipes, and collection management](kanban/EC-R06.md) · after `EC-R05`
- [EC-R07 — Complete saved drafts, versions, branches, and resume](kanban/EC-R07.md) · after `EC-R06`
- [EC-R08 — Replace the settings shell and redesign all existing configuration controls](kanban/EC-R08.md) · after `EC-R07`
- [EC-R09 — Redesign active voice, captions, task steering, and audio devices](kanban/EC-R09.md) · after `EC-R08`
- [EC-R10 — Finish cross-surface keyboard, theme, narrow layout, and continuity](kanban/EC-R10.md) · after `EC-R09`
- [EC-R11 — Context Lens, explicit capture, budget, and evidence links](kanban/EC-R11.md) · after `EC-R10`
- [EC-R12 — Intent Map, exact locks, assumptions, and Prompt Debugger](kanban/EC-R12.md) · after `EC-R11`
- [EC-R13 — Output contracts, real result inspection, and targeted answer repair](kanban/EC-R13.md) · after `EC-R12`
- [EC-R14 — Reference-to-spec visual brief tool](kanban/EC-R14.md) · after `EC-R13`
- [EC-R15 — Handoff compiler, delivery formats, attachment manifest, and readiness](kanban/EC-R15.md) · after `EC-R14`
- [EC-R16 — Versioned blocks, styles, context packs, and project kits](kanban/EC-R16.md) · after `EC-R15`
- [EC-R17 — Destination dialect preview and capability-aware helper plans](kanban/EC-R17.md) · after `EC-R16`
- [EC-R18 — Workflow and role-specific agent handoff planning](kanban/EC-R18.md) · after `EC-R17`
- [EC-R19 — Bounded batch execution and controlled workflow runner](kanban/EC-R19.md) · after `EC-R18`
- [EC-R20 — Compare and evidence-linked experiment notebook](kanban/EC-R20.md) · after `EC-R19`
- [EC-R21 — Voice-to-brief, protected localization, and reviewed learning](kanban/EC-R21.md) · after `EC-R20`
- [EC-R22 — Whole-product parity, visual finish, packaging, and acceptance handoff](kanban/EC-R22.md) · after `EC-R21`

## Message to give the cloud agent

> Read `docs/plans/composer-redesign/KANBAN.md`, `SPECIFICATION.md`, and `manifest.json` in the GitHub repository. This is a plan/import request only, not permission to implement. Verify the actual cloud profile/route and original Composer baseline. Validate the self-contained card files, then import them into the requested cloud board as BLOCKED with their exact predecessor chain and pins. Do not substitute the old local board or local Windows workspace. Preserve existing cards. Report exact created IDs and read-back checks, including zero active runs. Stop for any missing board/profile/model/baseline permission rather than guessing. Do not start work, send another agent, change routing, install, restore or delete anything.
