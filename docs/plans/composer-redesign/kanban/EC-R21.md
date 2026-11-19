# EC-R21 — Voice-to-brief, protected localization, and reviewed learning

**Plan key:** `EC-R21` · **Predecessor:** `EC-R20` · **Initial status:** `blocked` · **Target:** `nonconformist-innovation`

## Exact vertical slice

### EC-R21 — Voice-to-brief, protected localization, and reviewed learning

**Depends on:** EC-R20. **Wave:** W4. **Features:** F14/F17/F18.

**UI work:** purpose-aware voice menu; proposed-clause tray; correction review; language/glossary segments; per-recipe feedback and version-diff approval.

**Behavior:** approved-only persistence, owner-bound spoken edits, exact-term/code protection, immutable translation source, feedback changes nothing until approval.

**Acceptance:** another chat never receives the spoken update; a locked clause survives; translation preserves literal tokens; feedback approval creates a reversible new version.

**Evidence:** local interaction fixtures and actual authorized microphone/provider validation as separate gates. **Do not:** create global personality/memory writes or run forbidden voice routes.

## Target, source and execution boundary — copy applies to this entire card

- Target cloud connection: `nonconformist-innovation`. This is not a local skill or the Windows `nous-agent` profile.
- The GitHub repository is the source of code and this handoff. Use the original Composer baseline `feea09c5f3d6eac8d1afcd7e158a680d9b7c75b0`, verified in the cloned history, in a separately approved cloud workspace. Do not implement from the rejected `feature/enchanted-workbench` UI.
- Windows paths in the historical spec describe evidence on the user's machine, NOT accessible cloud paths. Relative handoff references are under `docs/plans/composer-redesign/`; actual cloud workspace/assignee are explicitly bound during import.
- All cards are initially BLOCKED. Creation/import does not approve implementation, source cleanup, model calls or live installation. Do not unblock/dispatch successors yourself. EC-R05 is a human visual gate, not an automatic reviewer score.
- Provider/model restrictions retained from the approved planning request: `nous / tencent/hy4-flash:free`; no Codex, no delegation, no MoA/swarm/reviewer agent, no fallback, no model-judge goal loop. Verify the actual CLOUD assignee exists and its configured route matches. A connection name is not a profile name. If the cloud agent uses a different route, keep cards blocked and obtain the user's explicit routing decision; never create/change profiles to make the import work.
- Preserve original product provider support even though the implementing worker is restricted. Do not run forbidden providers or hard-pin the product itself to the worker model.
- Local commit required for each completed slice: after its required checks, stage only its scoped changes, commit before completing the card, and record the real SHA/parent/files in the finish receipt. Use `Zero2 <deadtrix21@users.noreply.github.com>` for this GitHub repository after verifying identity; do not change global identity. No empty success commits or unrelated staged work. Failed/incomplete slices stay blocked with partial work preserved. No pushes, runtime installation, restart, credential changes, external publishing, microphone activation, paid inference, new child tasks or destructive cleanup without separate approval. Do not touch the user's live Windows installation from a cloud worker.
- Start callback BEFORE edits: actual connection/profile/provider/model, task overrides, fallback none, delegation off, scope, baseline, predecessor commit and workspace. Finish callback BEFORE completion/blocking: changed files, exact checks/results, valid UI evidence, artifacts, actual slice commit SHA/parent/file list (or explicit blocked/no-op reason), failures/limits and next-card facts. Completing a slice without its required real scoped commit is forbidden.
- A partial stub, source-string assertion, fake output, untested screenshot or fixture is not proof of an actual backend/provider/microphone flow. Track source, local checks, rendered UI, live integration and user acceptance separately.


## Intended source/write areas

Extend the existing voice interaction flow with approval-bound brief updates; add protected localization and reviewed feedback using shared review/history. No second microphone stack or global memory writer.

## Concrete acceptance scenarios

- [ ] Given ordinary captions and a proposed brief update, when the call ends, retain only explicitly approved material under its original owner.
- [ ] Given translation or feedback, when processing, preserve protected code/literals and change no recipe/global memory until the user approves a specific versioned change.

## Required UI and product contracts — embedded, not optional reading

## 12. Voice, audio, and task interaction

### 12.1 One voice control, not several unrelated microphone buttons

Idle: Voice trigger with a small adjacent disclosure only where width permits. Clicking Voice starts the configured flow after required permission/readiness checks. The menu exposes purpose, interaction mode, provider, and devices.

Purpose and interaction are different:

- **Purpose:** Conversation; Dictate into this draft; Build a brief.
- **Interaction:** Continuous or push-to-talk.

Do not implement unavailable purposes as deceptive menu items. Existing Conversation remains working while new purposes are developed.

### 12.2 Active capsule

```text
[ Listening · 01:24 ] [ Mute ] [ Details ▾ ] [ End ]
```

The capsule replaces the idle Voice action. It does not push the editor sideways indefinitely. On narrow layouts, compact status plus Mute/End remain visible; Details contains secondary controls.

Status words: Connecting, Listening, Speaking, Muted, Reconnecting, Ending, Ended, Failed. A waveform is supplementary and tied to real audio level. Do not animate fake listening activity.

### 12.3 Captions and task tray

Captions are collapsed by default and explicitly temporary unless the user chooses to keep approved material. Show speaker separation and a bounded scroll region when expanded.

Existing chat-bound tool requests remain owned by their original session. A compact task card shows actual state, last request, result delivery, Stop, and Steer. Replace `window.prompt` steering with an inline labelled text field and Send steering / Cancel.

Switching chat does not retarget an active call or task. The UI may show a return-to-owning-chat action. Ending voice has explicit semantics for microphone, provider usage, and associated work; do not imply that closing the caption drawer stops anything.

### 12.4 Dictation and voice-to-brief additions

Dictation proposes text at a captured draft position. It must not overwrite typed text or submit. Build-a-brief groups spoken material into proposed goals, requirements, constraints, and open questions, with Approve / Edit / Discard.

Spoken corrections can update a proposed clause in place. Locked approved requirements require explicit review. Ordinary conversation must not automatically become permanent brief content.

### 12.5 Devices and permissions

Device menu shows selected microphone and speaker, system default, missing saved device, Refresh, and an explicit Test action. Device discovery may request microphone permission only from the user's explicit device-detection action.

Show the actual result of a microphone/speaker test and release temporary media. No automatic audio playback while merely opening Settings. Call settings changes apply to the next call unless the backend explicitly supports a safe live change.

### 12.6 Provider and billing truth

Keep supported existing voice providers and account ownership. Do not read or rewrite external OAuth files. Show route readiness separately from authenticated-call readiness. A detected CLI is not proof a call will authenticate.

The worker's Nous-only execution policy does not authorize testing another provider. It also does not authorize deleting existing product support for that provider. Keep product capability and agent execution policy separate.

---

### F14 — Voice Briefing and Spoken Corrections

**Job:** speak naturally and turn approved pieces into an organized brief.

**Entry:** Voice purpose → Build a brief.

**UI:** active capsule and a proposed-clause tray; corrections link to the clause they change.

**Behavior:** temporary captions stay temporary; only approved segments persist; all updates remain bound to the starting owner and brief revision.

**Proof:** switching chat cannot write spoken text into another draft; locked clauses are never silently replaced.

### F17 — Reviewed Personalization

**Job:** improve reusable work from deliberate feedback without a hidden self-modifying prompt system.

**Entry:** result → Save feedback; recipe → Review suggestions.

**UI:** specific feedback attached to a recipe/version and a proposed change diff.

**Behavior:** usage counts remain factual; suggested improvements need approval; no global profile/memory writes and no invented success rate.

**Proof:** feedback alone changes nothing; approval creates a new version with rollback.

### F18 — Language Desk

**Job:** localize instructions while preserving exact identifiers and project terminology.

**Entry:** selected text or brief → Language.

**UI:** source/target, protected glossary, per-segment proposal and selective acceptance.

**Behavior:** code, URLs, commands, locked terms, and source text are protected. UI language, output language, and voice language remain separate settings.

**Proof:** translating prose does not translate a command, rename a product identifier, or mutate the source version.

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
7. Batch material corrections. Record exact results, known gaps, and rollback/preservation facts. Do not run a delegated reviewer or repeatedly reopen cosmetic checks.
8. After required checks, review/stage ONLY this slice's changes and create its required local commit. Verify the actual SHA, parent, files and remaining working-tree state; include them in the finish receipt. No push/merge without approval, no empty ceremonial commit, and no unrelated dirty work in the slice commit. If blocked/incomplete, preserve partial work and report it instead of claiming a success commit.
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
