# EC-R14 — Reference-to-spec visual brief tool

<!-- CURRENT_EXECUTION_RULES:BEGIN -->
# Current cloud execution policy — Enchanted Composer

This is the latest owner-directed execution policy. It supersedes older per-slice permission, local-only/no-push, old model, no-delegation and exhaustive-test clauses in copied planning text. Product requirements, approved architecture, genuine review gates, existing owner decisions and historical receipts remain intact.

## Cloud-only implementation and existing work

Implementation runs on the Hermes Cloud server, not the owner's local machine. This repository update changes handoff documents/helpers only; it does not authorize local app builds, installation, runtime changes or a new local worker. Discover actual cloud paths/profile/board; never paste historical Windows paths as cloud paths.

These plans have ALREADY been used. Resume the existing graph by stable manifest key and actual board task ID, preserving statuses, runs, links, comments, source commits and receipts. Never replay completed cards, manufacture replacement tasks or rerun the fresh blocked importer over a used board. Initial BLOCKED metadata describes fresh import only, not an instruction to reset current cards. Read SERVER_MIGRATION.md before moving the execution server.

## Continue until done or genuine owner review

Once a chain/wave is authorized, continue its already-linked eligible slices without routine 'may I continue?' questions. Finish the work or stop only for a genuine owner review, missing material decision/credential/access, exhausted safe recovery, or protected action. A cosmetic preference or arbitrary slice boundary is not a new permission round trip. Preserve an actual review gate; never self-approve it.

Composer's EC-R05 W1 visual review remains a REAL gate; the current implementation branch has an owner-review packet. Do not release EC-R06+ merely because this policy changed. EC-R22 remains final product/installation review. Continue automatically within approved waves and resume beyond review only after its actual approval. Source-complete fixtures are not rendered acceptance.

## Exact cloud route and permitted delegation

Main and EVERY delegated worker/reviewer must use exactly `qwen/qwen4-max:free`. Verify actual cloud provider/configuration, task pins, inherited/overridden child routes and START receipts. Preserve the already-confirmed provider; do not infer it from the model namespace. Delegation is permitted ONLY on that exact model. No alternate-model/provider fallback, Codex/external coding-agent substitution, unapproved MoA or different-model reviewer. Worker restrictions do not delete product provider capabilities or authorize product inference. Explicit rule: no fallback.

## Every commit must be pushed and verified

After each scoped commit: PUSH to the authorized non-main work branch and read back the exact remote branch SHA; it must match the committed checkpoint. Record full SHA, parent, author, paths, branch and remote verification before marking/advancing. Use personal GitHub author Zero2 <deadtrix21@users.noreply.github.com>. Do not force-push, amend another worker's work, reset dirty state, create empty ceremony commits or include unrelated changes. Preserve and push safe scoped partial work on a blocker when appropriate; do not claim acceptance.

Composer implementation branch: `redesign/w1-original-composer`; planning policy branch: `docs/composer-redesign-handoff`. Verify actual branch/remote and pull latest without overwriting another worker. A concurrent push is a coordination event, not permission to force. No main/tag/release/catalog push, merge, deployment, paid call, microphone activation, credential migration, live install, destructive cleanup or Hermes restart is authorized by this policy.

## Callbacks: required durable task tracking

Emit the following to the EXISTING task thread via supported Kanban comments/status tools, and preserve non-secret receipts in the repository. Read back the exact written comment/target before claiming delivery. Where appropriate commit+push receipt files with the slice; the task finish comment records the resulting full SHA without self-referential commit hacks.

- **CALLBACK START:** stable plan key, actual task/board/run IDs, absolute cloud workspace/repository/branch/start SHA, actual profile/provider/main/delegation model, scope, protected work, permissions and resource/test mode.
- **CALLBACK FINISH:** actual changed files, checks/results, build-only/source/fixture/live distinctions, full scoped commit/parent/author, pushed branch AND verified remote SHA, remaining dirty work, honest unresolved acceptance, next existing task or exact review gate.
- **CALLBACK BLOCKED:** exact failure/evidence/attempts, preserved partial state and pushed checkpoint where safe, required concrete input/authority. Resume that same task; no duplicate graph or automatic false completion.
- **CALLBACK REVIEW:** real artifact/commit, review packet/path, exact actions and expected outcomes, unverified live boundaries, what the owner's approval authorizes. Keep the actual gate in review/blocked as appropriate; do not silently continue past it.

Use event-driven completion callbacks and bounded heartbeats, not transcript/status polling loops. On notification read the reported task and its actual linked successor, check existing run/claim, then continue at most the eligible authorized next task. Do not double-dispatch a task the gateway already claimed. CALLBACK_SCHEMA.json defines the portable envelope; TASK_TRACKING.md indexes every stable card and currently available historical receipts. It is not a substitute for live board state.

## Resource and testing boundary

NO Docker, Compose, Testcontainers, Kubernetes, large image/toolchain/browser/model downloads, full service stacks, browser farms or parallel heavy builds. The larger cloud server does NOT silently waive these instructions. Use small serial, risk-focused existing checks and isolated SQLite/test doubles where appropriate. Preserve production database architecture; SQLite cannot certify another database's locking/JSON/migration/settlement behavior. Honour any more restrictive current build-only/owner-local-testing decision; don't resurrect an exhaustive archived suite. No local application build is part of this update. Report unverified app/runtime acceptance rather than fabricate it.

## Upgrade and migration durability

Read UPDATE_DURABILITY.md. Keep actual supported public SDK/API contracts, version/capability checks, data-preserving upgrades and portable pushed receipts. Never require another plugin's private implementation, Hermes source monkeypatches or a hard-coded server path to preserve product behavior. An arbitrary future breaking platform update cannot honestly be guaranteed compatible; implement supported compatibility, safe recoverability and explicit missing-capability reporting instead of silent data loss or fake operation.

Do not change actual cloud cards, subscriptions, dispatch or the live app merely by generating this policy. After server migration, explicitly rebind existing task/workspace/profile paths and notification subscriptions, verify them, then resume only the already-authorized work. Preserve genuine owner review and completed state.

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
<!-- CURRENT_EXECUTION_RULES:END -->

**Plan key:** `EC-R14` · **Predecessor:** `EC-R13` · **Initial status:** `blocked` · **Target:** `nonconformist-innovation`

## Exact vertical slice

### EC-R14 — Reference-to-spec visual brief tool

**Depends on:** EC-R13. **Wave:** W3. **Feature:** F02. **Surface:** S11.

**UI work:** real reference viewer, fit/zoom, accessible pins/regions, Keep/Change/Avoid, paired specification sections, wide split/narrow switch, component/state/icon detail.

**Behavior:** source-linked Observed/Proposed/Unknown; exact literal preservation; manual annotation offline; optional vision inference only with approved route/disclosure.

**Acceptance:** export an implementable design handoff using the supplied Prompt Studio references; proposed dimensions are labelled; unseen behavior is not invented.

**Evidence:** annotation-to-requirement cross-highlighting and reopened exported spec. **Do not:** use a local path as proof the image is embedded for a remote agent.

## Target, source and execution boundary — copy applies to this entire card

- Target cloud connection: `nonconformist-innovation`. This is not a local skill or the Windows `nous-agent` profile.
- The GitHub repository is the source of code and this handoff. Use the original Composer baseline `feea09c5f3d6eac8d1afcd7e158a680d9b7c75b0`, verified in the cloned history, in a separately approved cloud workspace. Do not implement from the rejected `feature/enchanted-workbench` UI.
- Windows paths in the historical spec describe evidence on the user's machine, NOT accessible cloud paths. Relative handoff references are under `docs/plans/composer-redesign/`; actual cloud workspace/assignee are explicitly bound during import.
- Fresh import starts BLOCKED; existing graphs retain their actual states. Preparation starts no workers. After chain authorization, continue eligible linked tasks until done, genuine review or a real blocker; never replay completed work.
- Current worker route: exactly qwen/qwen4-max:free for main and every permitted subagent, using the verified cloud provider. No alternate-model/provider fallback. CURRENT_EXECUTION_POLICY.md supersedes older worker restrictions; no profile reconfiguration to manufacture a match.
- Preserve original product provider support even though the implementing worker is restricted. Do not run forbidden providers or hard-pin the product itself to the worker model.
- Each scoped commit MUST be pushed to the authorized non-main branch, followed by exact remote-SHA read-back and a CALLBACK FINISH receipt before advancing. No empty commits, unrelated staging, force pushes, main/release/deployment or live-system changes.
- Required durable callbacks: CALLBACK START before edits, CALLBACK FINISH with real checks/commit/push/remote SHA, CALLBACK BLOCKED with preserved partial work, and CALLBACK REVIEW at actual owner gates. Verify delivery to the existing task and preserve receipts; no routine continuation prompt.
- A partial stub, source-string assertion, fake output, untested screenshot or fixture is not proof of an actual backend/provider/microphone flow. Track source, local checks, rendered UI, live integration and user acceptance separately.


## Intended source/write areas

Add a reference viewer/annotation/specification view using the attached real images. Keep normalized geometry and source evidence separate from authored proposed measurements. Do not install a graphics framework without approval.

## Concrete acceptance scenarios

- [ ] Given a real supplied screenshot, when region annotations are created and exported, preserve normalized coordinates and link the authored requirements to actual regions.
- [ ] Given an invisible state or an unmeasured dimension, when describing it, label it Proposed or Unknown rather than Observed.

## Required UI and product contracts — embedded, not optional reading

## 3. Reference critique: what to retain and surpass

### 3.1 Prompt Studio settings — visible facts

The supplied settings image shows:

- A titled dialog with a close icon and bottom Close button.
- A Questions model picker, described as suggesting answers and writing the final prompt.
- A separate Context model picker with an inheritance choice.
- A switch for reading conversation context when Studio opens.
- A note that context reading applies to existing conversations and not AI-off mode.
- A language picker with Follow Hermes.

**Retain the distinctions:** helper versus context roles, explicit inheritance, language choice, and a visible context-reading policy.

**Improve the presentation:** opaque work surfaces, tighter related-field grouping, searchable role-aware model selection, visible transmission scope, and explanations on demand rather than a tall stack of disconnected labels.

The screenshot shows wallpaper and underlying chat through the dialog. That visible transparency weakens reading contrast. We should not reproduce it merely because it belongs to the reference.

### 3.2 Prompt Studio question flow — visible facts

The supplied question image shows:

- A branch label and a compact change-count strip.
- The original request, truncated at the end.
- A context-read status containing a concrete provider/model and elapsed time.
- Model shortcuts labelled Opus, Astra, Sonnet, and Fable.
- A step indicator and outcome question.
- Outcome choices including Follow the brief, Working implementation, Analysis/recommendation, Review/diagnosis, Finished text, Data analysis, Executed workflow, Requested answer, and an AI-recommended Plan/roadmap.
- A separate recommendation explanation, with Discard and Another.
- Generate now, Back, Cancel, shortcuts, settings, and Auto / On request / Off AI controls.

**Useful:** the request stays visible, recommendations explain themselves, generation is explicit, and keyboard operation is treated as a real feature.

**Problems to improve:** long horizontal choice rows; shortcut badges competing with content; a recommendation repeated in both a choice and a large explanation box; ambiguous difference between detected and recommended outcomes; truncated original intent; and busy translucent surfaces.

The branch/change strip is visible, but the screenshot alone does not establish whether it belongs to Prompt Studio or host chrome. Do not duplicate it inside Composer without verifying ownership.

### 3.3 Exact translation into the new Composer

| Reference idea | New Composer treatment | Explicit boundary |
|---|---|---|
| Question ladder | Editable brief plus a short queue of genuinely unresolved questions | No mandatory eight-step interrogation |
| Many outcome chips | Searchable Deliverable picker with a short recommended list | No permanent full-width option wall |
| AI suggestion | One inline proposal with reason and Apply / Dismiss | Never overwrites a chosen value automatically |
| Model alias buttons | One role-aware model selector with optional user-defined shortcuts | No fixed provider branding or hard-coded model lineup |
| Session context reading | Source preview with manual/on-open policy and helper disclosure | Opening a workspace must not silently transmit conversation history |
| Generate now | Separate local Build brief and optional AI Improve actions | Building a brief and making a model call must not look identical |
| Shortcut badges | Tooltips, command search, and an optional shortcut reference | Do not print a keyboard legend on every option |
| Floating settings | Focused settings sheet with grouped role and privacy controls | No whole-screen translucent slab |

---

## 10. Context, evidence, requirements, and output

### 10.1 Context inspector

Each source row displays type icon, title, scope, selected excerpt, freshness, and inclusion control. Expanding a row reveals the exact text and provenance.

Possible explicit sources: selected conversation turns, pasted text, user-selected files, image references, and approved project snippets through real supported access.

Two independent disclosure controls:

1. Include this source in the final brief/handoff.
2. Allow this source to be sent to the helper for this operation.

Selecting the first does not imply the second. Default helper disclosure is off until the user selects or approves a policy. Do not represent best-effort secret detection as a guarantee.

### 10.2 Context capture and reusable packs

Capture is explicit: paste, drop, choose file, or choose conversation turns. No ambient clipboard watcher, screenshot collector, background repository index, or automatic whole-conversation upload.

A context pack is a named, versioned selection of sources. Existing briefs pin a snapshot. Refresh shows a diff; it never silently changes a saved brief or experiment. Unsupported file extraction explains what was read and what was not.

### 10.3 Evidence-linked editing

A requirement can link to a source passage or reference-image pin. Selecting the requirement highlights its evidence; selecting evidence shows which requirements depend on it.

If evidence disappears, mark the link as broken. Do not replace it with a plausible passage. A source mention is not proof that the system has read that source.

### 10.4 Requirements and Intent Locks

Use stable IDs for exact literals, prohibitions, output requirements, and assumptions. The editor shows short anchored markers; the inspector holds the detail.

- Exact lock: byte-exact identifier, command, URL, path, or phrase.
- Requirement: user-authored clause that must remain represented.
- Prohibition: explicit restriction such as “do not deploy.”
- Assumption: proposed but not approved material, kept separate.

Conflicts show both clauses and their source. The UI asks for an explicit decision and retains the decision log. Never “repair” a misspelled but intentionally supplied hostname silently.

### 10.5 Prompt Debugger

A compact issues list, not a percentage score. Groups: **Blocks application**, **Needs your decision**, **Suggestions**. Every finding has a concrete affected location, explanation, and appropriate action.

Useful checks: unresolved required variable, contradictory requested format, missing referenced attachment, omitted exact literal, requested execution beyond declared permission, and stale context. Heuristic ambiguity checks must say that they are suggestions.

### 10.6 Output contract

Choose Freeform, Markdown sections, Table, JSON, Agent handoff, or File manifest. Editing a contract previews structure, with illustrative placeholders clearly labelled.

For JSON: edit required keys, types, and optionality. For tables: columns and field types. For handoffs: Scope, Inputs, Constraints, Design, Steps, Acceptance, Unknowns.

Native structured-output enforcement is used only when the selected provider supports it. Otherwise state “Format instructions only; not provider-enforced.”

### 10.7 Real result canvas

Results are supplied by the user or captured from an explicitly run operation. Never display illustrative output as a real response. Support safe Markdown, raw text, tables, and JSON inspection. Imported HTML is inert, not executable.

A result is bound to its source brief version and route. When the brief changes, mark it stale rather than treating the result as current evidence. Clicking a missing section or failed field check goes to the actual output location.

---

### F02 — Reference-to-spec: design from images, not adjectives

**Job:** turn screenshots, sketches, or reference images into an implementable design brief.

**Entry:** add a selected image → Describe this design.

**UI:** reference viewer with fit/zoom and normalized region pins; paired specification editor for layout, components, tokens, interaction states, responsive rules, and icon treatment. On narrow surfaces switch Reference / Specification; do not shrink both.

**Behavior:** Keep / Change / Avoid annotations, Observed / Proposed / Unknown distinctions, exact source regions, manual annotation without inference, optional authorized vision interpretation.

**Proof:** export an agent-readable brief linked to source regions, with unmeasured values clearly proposed. Invisible states are requirements to design, not observations to invent.

## Shared hard rules — embedded in this card

## 5. Visual system, geometry, and responsive rules

All values in this section are **proposed targets** for review. Verify against the actual host scale and pane width during implementation.

### 5.1 Theme authority and non-negotiable color rules

**Hermes is the sole theme authority. Composer must not introduce its own palette, skin, accent choice, light/dark switch, or color-preference storage.** The user's clarification supersedes earlier wording about neutralizing a host theme.

- Use the running Hermes theme and native themed components for editor, menus, sheets, navigation, fields, buttons, selections, focus, warnings, errors, and success.
- Follow live theme changes, including light/dark, accent, contrast, and custom skins. No plugin reload may be required to apply a color change.
- Do not hard-code hex, RGB, HSL, named-color, or gradient values in implementation. Do not add an agent-selected fallback palette. `transparent` and `currentColor` are structural values, not permission to invent colors.
- Do not invent green-tinted surfaces or any other colored backgrounds. Equally, do not neutralize a green/accented surface intentionally supplied by the user's Hermes theme. **The chosen Hermes theme wins.**
- Use supported Hermes editor, elevated/popover, and dialog surfaces for readable working text. Do not add custom glass or wallpaper layers. If a host theme itself makes text illegible, report the exact host-theme issue instead of secretly repainting Composer.
- Accent identifies primary actions, selection, and focus according to host component vocabulary; it is not decoration for every inactive icon.
- Status and diff colors use verified Hermes semantic roles. Icon/text labels remain mandatory; no success/failure/change state may depend only on color.
- Keep any theme-role aliasing in one small documented boundary. Never override global Hermes variables or style unrelated host/plugin surfaces.
- Avoid nested border-boxes. Use spacing and host separators; a card is reserved for an independent item or selectable artifact.

### 5.2 Semantic token and component contract

**Specify color by its Hermes role, not a fixed color number.** Local role names below are aliases only; they do not define an independent palette. Verify the actual running SDK before naming background/status/diff variables.

| Composer role | Required Hermes authority | Binding rule |
|---|---|---|
| Editor ground | Native editor/work-surface component or verified background token | No separate painted editor theme |
| Toolbar / local navigation | Native chrome/secondary surface | Follow host surface and foreground together |
| Menu / popover / sheet | Native elevated/popover/dialog component | Inherit complete surface, border, and elevation treatment |
| Primary text | `--ui-text-primary`, where verified | Never replace with fixed white/black |
| Secondary text / idle icon | `--ui-text-secondary`, where verified | SVG inherits `currentColor` |
| Metadata / unavailable text | `--ui-text-tertiary`, where verified and readable | Do not dim an entire control with arbitrary opacity |
| Decorative separator | `--ui-stroke-secondary`, where verified | Not the sole indicator of an essential control boundary |
| Input boundary / caret / selection | Native field/editor component | Retain host focus, invalid, selection, and disabled treatment |
| Primary action | Host primary/accent Button variant | Inherit paired foreground, hover, pressed, disabled, and loading states together |
| Secondary action | Host secondary/ghost variant appropriate to the action | No custom hover fills or guessed foregrounds |
| Focus | Host focus ring/accent role | Visible outline/shape, not color alone; never suppress it |
| Selected row / active item | Host list/selection component state | Visual selected state matches accessible selected/pressed state |
| Warning / error / success | Verified host semantic status components/tokens | Keep the host's actual colors plus icon and readable text |
| Diff additions / deletions | Public Hermes review/diff semantic roles where supported | Never assume green/red or invent missing roles |
| Tooltip / scrollbar | Native host component/style | No independently colored tooltip/scrollbar theme |

If a needed role is missing, first use a native component that already supplies it. If neither component nor token is available, name the missing host seam and seek approval for the remedy. **A private fallback palette is not an acceptable shortcut.**

#### 5.2.1 Mandatory component states

| Component | Default | Hover / pressed | Focus / selected | Disabled / busy / error |
|---|---|---|---|---|
| Icon action | Host action style; inherited foreground | Host action state | Native ring; toggle has pressed semantics | Host disabled treatment; actual spinner; explicit failure text |
| Primary button | Host primary variant | Same variant's native states | Native focus, no custom glow | Native loading/disabled state; preserve action label |
| Secondary / ghost action | Matching host variant | Native hover/pressed surface | Native focus | Native unavailable treatment and reason |
| Field / editor | Host field/editor ground, border, text, caret | Host field state | Native ring and selection | Host invalid treatment plus message; loading never clears input |
| Palette / list result | Host list row | Host hover | Host active/selected treatment | Disabled reason or stable-layout skeleton |
| Inspector / sheet | Host surface and separator | No whole-panel hover effect | Focus stays on the actual control | Host alert/empty/loading treatment inside the surface |
| Change review | Host review text and diff roles | Native change navigation controls | Selected change has a labelled marker | Incompatible changes have an explicit explanation |

#### 5.2.2 Theme and contrast acceptance

1. Change between genuinely different Hermes skins, including light/dark, without reloading Composer. All surfaces and already-open overlays must update.
2. Change Hermes accent and verify action, selection, and focus states follow it without altering brief data or model settings.
3. Inspect computed styles, including portalled overlays, to prove colors come from Hermes tokens/components rather than a plugin palette.
4. Measure actual resolved pairs: normal text target at least 4.5:1; essential non-text boundaries/focus target at least 3:1. Token names alone are not contrast evidence.
5. If a custom Hermes theme fails contrast, report the exact role/pair. Do not silently replace it or claim whole-theme accessibility certification.
6. Include disabled controls, voice status, text selection, diff views, errors, and tooltips. The resting page alone is insufficient.
7. No private theme picker, color editor, accent selector, or independent theme persistence may be introduced by a future card without new approval.

### 5.3 Type, spacing, and controls

| Element | Proposed specification |
|---|---|
| Font | Existing Hermes UI font; no remote font dependency |
| Editor text | 14–15 CSS px equivalent, line height 1.55–1.65 |
| Ordinary labels | 13 px equivalent, medium weight |
| Metadata | 12 px equivalent; no essential 9–10 px interface text |
| Workspace title | 16–18 px equivalent; never a website hero |
| Body measure | Approximately 64–78 characters for prose, available width for code/tables |
| Spacing scale | 4, 8, 12, 16, 24, 32 CSS px equivalents |
| Compact button | 28–30 px target; 16 px glyph |
| Ordinary control | 34–36 px target; consistent field/button geometry |
| Touch/large-controls preference | At least 44 px interactive targets |
| Corners | 6 px controls; 8 px overlays; avoid pills around every object |
| Divider | One device-appropriate hairline, neutral |
| Focus | Clear 2 px equivalent outline with offset, not only color change |
| Dropdowns | Portal/top-layer behavior; never clipped by editor scrolling |

All type sizes must respect host zoom and user scaling. Do not hard-code physical pixels or use screenshot pixel dimensions as UI coordinates.

### 5.4 Geometry by available container width

Use **the Composer surface's container width**, not the monitor width.

| Available width | Composition |
|---|---|
| 1,200 px and above | 192–208 px local navigation; flexible editor; optional 288–320 px inspector |
| 900–1,199 px | 56 px local rail with labelled tooltips; editor; optional inspector up to 280 px if the editor retains usable width |
| 640–899 px | Editor dominates; navigation becomes one compact selector; inspector opens as a single dismissible sheet |
| Below 640 px | One surface at a time: Editor / Inspect / Preview through a labelled view control; sticky task footer; no side-by-side panels |
| Very short height | Condense header, allow content scrolling, preserve footer actions; do not hide Close or Cancel below the fold |

A user can pin the inspector on wide layouts. Auto-opening it must not steal text focus. On narrow layouts, returning from Inspect restores editor caret and scroll.

### 5.5 Expanded workspace wireframe

```text
┌ Compose  Library  Saved ─────────────────────────── Search actions  Settings ┐
│ Brief title / rename                 Saved on device      Return to chat  │
├───────────────┬──────────────────────────────────────┬────────────────────┤
│ Current brief │ Write the request                    │ Context            │
│ Sections      │                                      │ 3 included sources │
│               │ Dominant, comfortable editor         │                    │
│ Goal          │ with real source/requirement anchors │ Exact excerpts     │
│ Constraints   │                                      │ and disclosure     │
│ Deliverable   │ Inline assistance appears on intent  │                    │
│               │ rather than permanent decoration     │ Switch inspector ▾ │
│ Add section + │                                      │                    │
├───────────────┴──────────────────────────────────────┴────────────────────┤
│ 1 unresolved requirement   History          Preview brief   Apply to draft │
└───────────────────────────────────────────────────────────────────────────┘
```

This is a structural wireframe, not an approved screenshot. The section outline is hidden for short one-paragraph work. No empty left column is reserved just because the layout can display it.

### 5.6 Motion and material

- Hover/focus feedback: immediate to 120 ms.
- Inspector/sheet transitions: approximately 160–220 ms, interruptible.
- Review application: briefly mark changed ranges, then settle; never replay words character by character.
- Reduced motion: direct state changes; no moving waveform unless actual audio levels justify it.
- No ambient sparkles, parallax, gradient movement, page-entry choreography, or permanently pulsing AI indicators.

---

## 6. Icon redesign specification

### 6.1 What is changing

The old rail mixes a microphone component with Codicon notebook, bookmark, preview, sparkle, discard, redo, broadcast, and gear symbols. Several are reasonable individually, but the collection does not communicate a consistent Composer-specific vocabulary. In particular, Undo must not look like a destructive discard.

Use a small purpose-built **Composer line-icon family** for Composer-owned controls. Retain native Hermes send, attachments, model, stop, and other host icons unchanged.

### 6.2 Drawing contract

- Base viewBox: `0 0 24 24`; ordinary rendered glyph: 16 px, large: 20 px.
- Stroke: 1.75 units at base size, round caps and joins; optical adjustment allowed for 16 px.
- Live area: 3–21 on each axis; preserve optical padding.
- Single foreground using `currentColor`; no hard-coded gradient/fill palette.
- Filled shapes are limited to small status dots or clearly specified stop geometry.
- Maximum ordinary pictogram complexity: a few simple paths, not an illustration.
- Each icon must be distinguishable at 16 px in monochrome, not only in a large presentation grid.
- Match apparent size: a thin microphone stem must not make the glyph feel smaller than a square library.
- No emoji, icon fonts that depend on network fonts, or mixed heavy/light icon sets.
- Every interactive glyph has a visible tooltip and an accessible action name. SVG itself is decorative when the button supplies the name.
- Package through a local icon component/registry compatible with the actual plugin ESM loader. No new unavailable SDK import.

### 6.3 Exact icon catalogue

| ID | Action / name | Drawing specification | State / differentiation |
|---|---|---|---|
| I01 | Compose | Open right-angle writing frame; short diagonal pen entering at upper right | Distinct from Improve: no stars |
| I02 | Improve | Short diagonal wand with one four-point light mark at its upper tip | One mark only; not the generic multi-sparkle logo |
| I03 | Library | Two upright spines and one slightly angled spine, shared baseline | No notebook bookmark ambiguity |
| I04 | Voice | Rounded microphone capsule, U-shaped pickup, short stem | Native mic convention, visually matched to family |
| I05 | Voice muted | I04 with one clean diagonal strike | Keep capsule recognizable |
| I06 | Voice modes | Two short wave pairs separated by a vertical pause stroke | Used in labelled menu, not an unexplained second default mic button |
| I07 | Review changes | Two offset text columns and a short connector between corresponding lines | Not an eye; review means compare, not merely show |
| I08 | Undo | Left-turning arrow with one clear arrowhead | Never use discard/trash geometry |
| I09 | Redo | Mirrored I08 | Consistent stroke and baseline |
| I10 | Saved draft | Sheet corner with a small lower bookmark cut-in | Distinct from Library's spines |
| I11 | History | Open clock arc with backward arrow and two hands | Distinct from one-step Undo |
| I12 | Context | Two overlapping source sheets with a small link junction | Distinct from paperclip attachment |
| I13 | Requirement | Bracketed short text stroke with a small pin | User constraint, not a security guarantee |
| I14 | Lock literal | Small closed padlock | Locked value gets text label too |
| I15 | Output format | Four corner marks around two aligned text rows | No document-download confusion |
| I16 | Preview | Simple framed rectangle with a visible text line and small eye detail | Only for view; not Apply |
| I17 | Apply to draft | Sheet with a right-pointing arrow entering its text area | No send/paper-plane shape |
| I18 | Export | Tray baseline with arrow leaving upward | Local export, not external publication |
| I19 | Copy | Two overlapping rounded rectangles | Standard convention |
| I20 | Branch | One line splitting into two endpoint nodes | Versions, not provider routing |
| I21 | Workflow | Three connected small rounded blocks, one deliberate bend | No full graph illustration |
| I22 | Team plan | Two small heads above a shared bracket | Exported roles; does not imply agents running |
| I23 | Compare | Two equal panels with one central divider and paired short lines | Do not imply winner without evidence |
| I24 | Batch | Three stacked narrow sheets with a small row marker | Distinct from Library |
| I25 | Reference design | Image frame with one corner pin | Not a generic palette icon |
| I26 | Model route | Two small terminals connected by one solid line | Only one active route; no automatic-fallback implication |
| I27 | Settings | Three horizontal sliders with staggered knobs | Avoid another large gear among host gears |
| I28 | More | Three evenly spaced horizontal dots | Stable overflow trigger |
| I29 | Stop | Small solid square centred in the same optical box | Active work only; label names what stops |
| I30 | Close | Two diagonal strokes | Never means Stop a model call unless labelled so |
| I31 | Search | Circle and short diagonal handle | Standard convention |
| I32 | Block | Two interlocking rounded modules with a small gap | Reusable content, not a package installer |
| I33 | Evidence | Quotation marks above a thin source line | Indicates cited evidence, not truth certification |
| I34 | Feedback | Small comment outline with one check stroke | Reviewed feedback, not automatic rating |
| I35 | Language | Two compact speech/text forms separated by a small arrow | Label provides actual language names |
| I36 | Cost and usage | Small segmented meter with one tick | No currency symbol when price is unknown |

### 6.4 Mandatory icon states

Default, hover, focus-visible, pressed, disabled, busy, warning, and unavailable. Busy uses the existing host spinner next to a meaningful verb; it does not morph an icon into an unrelated symbol. Active voice gets an explicit text status and accessible mute/end actions.

### 6.5 First icon acceptance sheet

Before implementing all screens, render all icons at 16 and 20 px on neutral light and dark surfaces, with neighbouring host icons for comparison. Include real 28/36/44 px button targets and their tooltips. Ask the user to judge this sheet with the action rail, not as isolated decorative artwork. No raster generation is needed for these functional pictograms.

---

## 15. Interaction, accessibility, and copy contracts

### 15.1 Required states for every surface

First use, empty, ordinary content, long content, busy, cancellation, permission denied, unavailable capability, backend error, storage failure, stale owner/revision, narrow view, keyboard focus, and restore-after-reopen.

Each implementation card must name its meaningful subset. It cannot pass solely because its default screenshot renders.

### 15.2 Focus and keyboard

- Native Enter/send behavior is unchanged.
- Escape dismisses the topmost local overlay; it does not silently stop an active call or delete work.
- Tab is normal focus navigation unless an explicitly active completion owns it in the plugin editor.
- IME composition blocks completion acceptance and destructive shortcut handling.
- A modal traps focus; a nonmodal inspector does not. Closing returns focus to the origin.
- Roving focus and active-descendant semantics must match the visual selection.
- Disabled and unavailable controls expose a readable reason without requiring pointer hover.
- Provide keyboard alternatives to drag/reorder and region pinning.

### 15.3 Copy vocabulary

Use: Improve wording, Build brief, Apply to draft, Keep original, Save version, Return to chat, Include in delivery, Allow helper access, Unavailable, Not checked.

Avoid: Optimize everything, Perfect prompt, AI-safe, Fully verified, Success rate, Ready to deploy, Synced, or Published unless real evidence supports that exact claim.

Examples:

- “This uses your helper model. Two selected sources will be sent.”
- “The conversation changed. Your proposal is saved here; it has not been applied.”
- “This format is described in the prompt, not enforced by the selected provider.”
- “Microphone access was denied. Your draft is unchanged.”
- “Referenced file only. Its contents are not included in this export.”

### 15.4 Scrolling and resizing

One main content scroller per work surface. The inspector may scroll independently when necessary. Avoid a small scrolling textarea inside a scrolling card inside a scrolling page.

Primary actions remain visible at ordinary target sizes and short windows. Do not fix this by shrinking text. At 200% zoom, reconstruct the narrow composition and keep essential controls available.

### 15.5 Local versus model behavior

| Operation | Default nature | Disclosure |
|---|---|---|
| Browse/search saved material | Local lexical retrieval | No inference |
| Build approved brief / render preview | Local deterministic | No inference |
| Exact-literal/structural checks | Local deterministic | State limits clearly |
| Semantic rewrite / translation | Helper inference | Route, selected material, cancel |
| Interpret screenshot | Optional vision inference | Explicit image/source approval |
| Summarize long sources | Optional inference | Proposed summary, original retained |
| Run comparisons/batch | Explicit planned inference | Calls, route, limits, actual receipts |
| Start voice | Real media/provider connection | Permission, provider/billing, End |

“AI off” blocks generative calls and any other model inference. Do not quietly call embeddings and claim zero AI.

### 15.6 Performance targets, not fabricated measurements

Aim for immediate local button feedback; no network dependency for opening the rail, searching existing local prompts, or rendering a saved brief. Long-running work shows a cancellable state without blocking typing.

Before shipping, measure representative local datasets and record actual results. Design for existing legacy bounds of up to 64 collections, 400 prompts, and 12,000-character prompt bodies without silently lowering those limits. New large-scale storage limits must be explicit and justified.

---

## 16. Technical boundaries and data design

### 16.1 Existing architecture to preserve

- React through the host's `react` / `react/jsx-runtime` and verified `@hermes/plugin-sdk` exports.
- Technical package ID and storage namespace: `composer-enhancements`.
- Supported public Composer draft API only.
- Original OwnerRouter, model catalog, enhancement history, settings serialization/read-back, audio lease, and provider lifecycle responsibilities.
- Existing Python backend stays the owner of supported provider integration; do not migrate it to another plugin/core merely for convenience.
- Do not install a new UI framework, component kit, local model stack, database service, or graph engine without a demonstrated requirement and approval.

### 16.2 Suggested ownership model

A small composition root owns services for the existing session/profile boundaries. Views consume the same state rather than each implementing its own library, preview, or history controller.

Recommended entities: Brief, Requirement, SourceSnapshot, Recipe, BlockVersion, StyleVersion, DraftRevision, SavedWork, CandidateChangeSet, OutputContract, RunReceipt, DeliveryManifest.

These are data structures/modules, not separate microservices or mandatory class hierarchies. Prefer direct cohesive code over speculative adapters that only wrap one implementation.

### 16.3 Persistence scopes

| Data | Scope |
|---|---|
| Voice/account settings | Connection + profile; exact provider ownership retained |
| Native draft operations | Captured connection/profile/session-or-new-draft + revision |
| Named brief/work item | Explicit owner/project identity and stable local ID |
| Library/material | Existing compatible local scope; profile sharing only if explicitly supported |
| Temporary view state | Local view/work item; no global writes on mere render |
| Active voice/run | Captured owner and immutable session/run IDs |
| Model/context approval | Exact operation or explicitly chosen policy scope |

### 16.4 Legacy and rejected-build data

Do not silently normalize away unknown fields while reading old library records. Preserve stable IDs, collection ordering, tags, active selection, pending drafts, and relevant unknown fields through unrelated edits.

If the rejected build created new records, inventory them and offer export. Do not treat experimental data as an approved schema, but do not delete it with the runtime rollback either.

Additive migrations need a dry-run summary, backup, rollback, and a defined ownership/version boundary. An old backup renderer does not by itself guarantee every newly persisted field will be understood.

### 16.5 Host-seam discovery list

Before promising integration, prove the actual running SDK supports: selection access, additional editor annotations, docking/panes, global command registration, file selection/extraction, image display, save/download, provider capability metadata, and any cross-session surface needed.

For an absent seam: preserve the product job through the plugin-owned surface where possible and state the boundary. If the native integration is essential, request the specific host change; do not silently replace the requirement with an inferior fallback.

### 16.6 Security and execution

Treat imported prompt text, source documents, SVG references, response HTML, recipe packs, and generated plans as untrusted data. They cannot authorize tools, install code, expand file scope, change routing, or override the user's constraints.

Exports sanitize filenames and paths, reject traversal, and accurately state what they contain. A secret scanner is best effort; retain manual disclosure preview.

Do not weaken owner checks, add silent fallback providers, or use synthetic keyboard events to invoke core actions. Do not execute imported assertions/scripts in Compare or Batch.

---

## Ordered implementation and verification

1. Read this complete card, the canonical specification, predecessor finish receipt, applicable project rules and the actual files before editing. Preserve any partial work.
2. Confirm the write boundary and real SDK/API support. Do not invent endpoints, named imports or capabilities. Stop on a required missing seam rather than silently narrowing the requested workflow.
3. Implement the complete named user journey and every relevant state below, using the existing framework, host components and coherent existing owners. No unrelated rewrite or new infrastructure.
4. Regenerate the shipped desktop bundle with the repository's supported builder; never maintain a hand-edited generated file. Check actual host ESM exports.
5. Exercise a small high-value suite and the actual UI journey where permitted. Candidate baseline commands are `python scripts/build_desktop.py --check`, `python scripts/build_dashboard.py --check`, `node scripts/verify_desktop.mjs desktop/plugin.js`, `node --test tests/desktop/*.test.mjs tests/dashboard/*.test.mjs`, and the repository's Python/ruff checks. First select the verified project interpreter/environment; do not install packages just because a guessed command fails.
6. Capture meaningful wide/narrow/light/dark states and actual user-container geometry. State which checks used fixtures. A real provider/microphone test requires separate permission and route compliance.
7. Batch material corrections. Record exact results, known gaps, and rollback/preservation facts. Use delegated work/review only on the exact pinned Qwen model or repeatedly reopen cosmetic checks.
8. After required checks, review/stage ONLY this slice's changes and create its required local commit. Verify the actual SHA, parent, files and remaining working-tree state; include them in the finish receipt. Scoped branch push is required by the latest policy; no merge/deployment without approval, no empty ceremonial commit, and no unrelated dirty work in the slice commit. If blocked/incomplete, preserve partial work and report it instead of claiming a success commit.
9. Complete only this card's verified scope after that commit is recorded. Missing human approval or an essential unverified integration is an OPEN gate, not cosmetic polish.


## Completion receipt

- Actual route / exact task pins:
- Predecessor commit / verified start HEAD:
- Required slice commit SHA / parent / committed file list:
- Remaining working-tree status and preserved unrelated work:
- Tests and real results:
- Rendered surface/state captures:
- Actual provider/microphone/backend evidence (or NOT TESTED):
- Preserved legacy behavior and data:
- Open gates / blockers / limitations:
- Artifact paths and hashes:
- Next-card facts (not authorization to start it):
