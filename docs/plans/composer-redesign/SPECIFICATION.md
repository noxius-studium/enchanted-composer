# Enchanted Composer — redesign from the original Composer

**Status: REVIEW DRAFT — not approved for implementation, installation, deletion, or Kanban dispatch.**

**Requested deliverable:** one readable Markdown document specifying the product, every important interface surface, redesigned icons, substantial new workflows, and detailed future Kanban cards.

**Working title:** Enchanted Composer. This is not a rename or a separate product.

> **The proposition:** turn an unfinished thought into a precise, well-supported request without making writing feel like operating an administration console. Keep ordinary chat simple. Reveal serious tools when the work calls for them.

---

## Read this first

1. **Start again from the old Composer**, not from the rejected workbench's screen structure.
2. **Preserve the old Composer's useful behavior and data.** Redesigning is not permission to remove voice, model choice, prompt libraries, review, history, or customization.
3. **Reject the feature-tab architecture.** A capability is not automatically a destination, toolbar button, panel, or settings category.
4. **Make the editor the main object.** Context, constraints, suggestions, and results support it instead of competing with it.
5. **Make it ambitious through better workflows.** Traceable requirements, reversible transformations, reference-led design briefs, reusable building blocks, provider-aware delivery, and controlled experiments belong in one system.
6. **Review this document before anything else.** No implementation, restore, cleanup, new branch, install, or new Kanban creation is authorized by this draft.

### What changes immediately after eventual approval?

The first implementation deliverable is a **working visual slice of the original Composer with the redesigned action rail, icon family, Improve review, and one complete Compose journey**. It is reviewed outside the live installation before the larger roadmap proceeds. It is not another giant build installed before anyone has judged it.

### What this document does not claim

- It is not a rendered or approved visual design.
- Proposed dimensions are design targets, not measurements of the reference screenshots.
- Proposed features are not claims that Hermes already exposes the required APIs.
- It does not claim market leadership, perfect intent preservation, proven usability, or measured performance.
- Completing an implementation card does not establish that live AI, microphone, accessibility, or provider integration has passed acceptance.

---

## Contents

1. [Approval and preservation boundaries](#1-approval-and-preservation-boundaries)
2. [Evidence and the exact restart point](#2-evidence-and-the-exact-restart-point)
3. [Reference critique: what to retain and surpass](#3-reference-critique-what-to-retain-and-surpass)
4. [Product direction and information architecture](#4-product-direction-and-information-architecture)
5. [Visual system, geometry, and responsive rules](#5-visual-system-geometry-and-responsive-rules)
6. [Icon redesign specification](#6-icon-redesign-specification)
7. [Everyday Composer and every existing action](#7-everyday-composer-and-every-existing-action)
8. [Compose workspace and guided brief building](#8-compose-workspace-and-guided-brief-building)
9. [Improve, selection editing, and change review](#9-improve-selection-editing-and-change-review)
10. [Context, evidence, requirements, and output](#10-context-evidence-requirements-and-output)
11. [Library, reusable material, and saved work](#11-library-reusable-material-and-saved-work)
12. [Voice, audio, and task interaction](#12-voice-audio-and-task-interaction)
13. [Settings and every configuration surface](#13-settings-and-every-configuration-surface)
14. [Major future-facing workflows](#14-major-future-facing-workflows)
15. [Interaction, accessibility, and copy contracts](#15-interaction-accessibility-and-copy-contracts)
16. [Technical boundaries and data design](#16-technical-boundaries-and-data-design)
17. [Release sequence and visual acceptance](#17-release-sequence-and-visual-acceptance)
18. [Detailed Kanban drafts — do not create yet](#18-detailed-kanban-drafts--do-not-create-yet)
19. [Agent execution contract and handoff](#19-agent-execution-contract-and-handoff)
20. [Approval checklist](#20-approval-checklist)

---

## 1. Approval and preservation boundaries

### 1.1 What the user's instruction means

“Work on the old composer and nuke this” establishes the replacement direction. The accompanying instruction, “first need this all in an md ... before anything else,” means **do not perform that replacement or deletion yet**.

After approval, the rejected workbench must stop being the implementation authority. That does not require destroying the only copy of experimental work. Preserve an archive, retire its live payload deliberately, and start the replacement from the verified original baseline.

### 1.2 Authorized for this draft

- Read supplied screenshots, preserved source, documentation, and backup evidence.
- Write this Markdown outside the source and runtime directories.
- Check this document for completeness, contradictory specifications, and broken internal references.

### 1.3 Not authorized by drafting

- Restore or replace the current installed Composer.
- Delete the rejected worktree, its files, backups, commits, or Kanban history.
- Create, edit, dispatch, reopen, or delete Kanban cards.
- Run paid generation, change account/provider settings, start a microphone, or dispatch another agent.
- Restart Hermes, push commits, publish packages, or remove Prompt Studio.

### 1.4 Future restore and rebuild procedure

After explicit approval of that action:

1. Record the installed package and managed renderer hashes and preserve the current state.
2. Restore the verified old renderer and matching package as a coherent pair, not whichever files happen to look old.
3. Preserve prompt libraries, pending settings, drafts, credentials, session history, and user visibility choices.
4. Establish the new implementation workspace from the original baseline commit below. Do not reset a dirty rejected worktree in place.
5. Archive the rejected implementation read-only. Its code may be studied as experimental evidence but must not become the new layout or component architecture by inertia.
6. Prove old behavior still works, then build the approved replacement in the separate workspace.

**No mass deletion or irreversible cleanup is part of the first restore.**

---

## 2. Evidence and the exact restart point

### 2.1 Verified original source

- Repository: `C:/A-Software-Engineer/Projects-Hermes/Enchanted-Composer`
- Preserved original worktree: `C:/A-Software-Engineer/Worktrees/Enchanted-Composer/baseline-installed-20261118`
- Branch: `baseline/composer-20261118`
- Baseline commit: `feea09c5f3d6eac8d1afcd7e158a680d9b7c75b0`
- Baseline includes the public skill-discovery compatibility fix; do not regress it.
- Original renderer SHA-256: `188726c5b0b35ac4a0965b3ba84c0e6b9adf69d52c1e4c630391aebf8511d9b9`
- The preserved baseline `desktop/plugin.js` and the pre-install renderer backup were verified byte-identical while preparing this draft.

### 2.2 Recoverable pre-install state

Backup directory:

`C:/A-Software-Engineer/Projects-Hermes/Enchanted-Composer-Backups/20261119-071821-workbench-install`

Relevant files:

- `renderer-before-install.js`
- `renderer-package-marker.json`
- `installed-package-before-install.zip`
- `source-worktree-before-install.zip`
- `SHA256SUMS.txt`
- `installation-receipt.json`

The original installed package archive contains 95 file entries. Its package metadata was older than the preserved baseline even though the renderer matched; use the recorded source reconciliation rather than blindly replacing newer compatibility work with older metadata.

### 2.3 Rejected implementation — preserve, do not build on its UI

- Worktree: `C:/A-Software-Engineer/Worktrees/Enchanted-Composer/enchanted-workbench`
- Branch: `feature/enchanted-workbench`
- It contains uncommitted implementation work in addition to the handoff commit.
- Its many panels and feature-stage navigation are specifically rejected.
- Earlier “done” cards and source tests are historical implementation evidence, **not approval of this design**.

### 2.4 Screenshots actually examined

**Reference A — Prompt Studio settings:**

`C:/Users/JSuic/HermesHome/cache/documents/native-inputs/bad7037fc94c97ed166697f387d859e64e7e598de01a30728d6859a242a61190/dashboard_20261119_073852_721654ab_image_7a630a.png`

**Reference B — Prompt Studio question flow:**

`C:/Users/JSuic/HermesHome/cache/documents/native-inputs/6a5a2bf6b2e7748eb4c2d4d4f3c1e449f11cc51d2ba85026e24d84901cf13a90/dashboard_20261119_073852_06f3818f_composer_2026-11-19_07-37-09-773_8b321d.png`

These are user-supplied reference material, not redistribution assets. If another agent cannot access these machine-local files, attach copies to its approved handoff before it starts visual work.

### 2.5 Old Composer behavior inspected in source

The original exposes nine configurable Composer actions: live voice, voice mode, prompt library, draft shelf, review enhancement, immediate Enhance, undo, redo, and settings.

Its routed page contains six configuration areas: Enhancement, Prompts, Composer bar, Voice, Audio, and Account & usage. It already includes owner-bound draft operations, reviewed enhancement groups, multi-library storage, local prompt search, favorites/recents, settings-save verification, voice lifecycle handling, and usage reporting.

Important distinction: the old **Draft Shelf button saves a draft** but does not yet provide a complete browse/restore interface. Completing that workflow is an improvement, not removal of a finished old browser.

Source authority for this inventory: `desktop/src/00-runtime.js`, `40-prompt-model.js`, `85-settings-store.js`, `90-settings-ui.js`, `95-composer-actions.js`, and `docs/architecture.md` in the preserved baseline.

---

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

## 4. Product direction and information architecture

### 4.1 Design thesis

**An editor with intelligence around the edges, not a control panel with an editor somewhere inside it.**

The signature experience is a traceable transformation: select a phrase, improve only that phrase, inspect why it changed, and return it to the original draft as one reversible action. Larger workflows use the same brief, context, review, and delivery system.

The intended feeling is precise, responsive, quietly capable, and unmistakably native to Hermes. “Future” means continuity, multimodal references, explicit intent, and less mechanical repetition—not glowing borders, decorative dashboards, or a simulated spaceship.

### 4.2 Surface map

| Surface ID | Surface | Job | Entry | Exit / return |
|---|---|---|---|---|
| S01 | Native Composer rail | Write and act without leaving chat | Existing native composer | Remains in the native conversation |
| S02 | Quick action popover | Choose a small operation | Improve split menu / More | Returns focus and selection to its trigger |
| S03 | Compose workspace | Shape a complex request | Compose action / existing sidebar destination | Return to originating chat; draft preserved |
| S04 | Change review | Understand and accept a proposed edit | Improve / selected-text action | Apply selected or Keep original |
| S05 | Library browser and editor | Find, create, and maintain reusable material | Library action / workspace Library destination | Insert or select instructions; no implicit send |
| S06 | Saved work browser | Recover and branch drafts and briefs | More → Saved / workspace Saved destination | Preview then restore to the captured owner |
| S07 | Voice capsule and tray | Talk, dictate, and supervise voice work | Voice action | Explicit End; release microphone |
| S08 | Settings workspace/sheet | Configure Composer, models, voice, privacy | More → Settings / workspace gear | Return without resetting current work |
| S09 | Context/evidence inspector | Inspect selected sources | Context count / cited requirement | Return to the same editor position |
| S10 | Delivery sheet | Apply, copy, or export exact material | Workspace primary action menu | Stay in workspace or return to captured chat |
| S11 | Focused advanced tool | Design brief, workflow, batch, or experiment | Create menu / contextual command | Outputs return to the common brief or saved work |

### 4.3 Persistent navigation limit

Inside the expanded route, show only **Compose, Library, Saved**, plus Settings as a utility action. These are real content collections, not feature categories.

Within Compose, the user sees an editor and at most one inspector. Advanced tools are task-specific views opened deliberately. They do not create more permanent top-level tabs.

Keep `/enchanted-composer` and the existing legacy `/composer-enhancements` entry compatible. Express subview state through supported route state or the existing route component; do not assume nested routing exists before checking the host.

### 4.4 Work-mode vocabulary

Use language describing the user's task:

- Write a request.
- Turn a thought into a brief.
- Improve this wording.
- Describe a design.
- Build a repeatable workflow.
- Compare approaches.
- Prepare an agent handoff.

Do not expose internal store, controller, schema, adapter, capability ID, or implementation-slice names as navigation.

### 4.5 Boundaries of ambition

Add features without deleting old functions. Introduce a common brief and reuse real library, voice, review, and ownership logic. Do not build a marketplace, team cloud, new authentication system, arbitrary-code runner, or replacement Hermes agent platform merely to support the redesign.

---

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

## 7. Everyday Composer and every existing action

### 7.0 Decision on the additional compact Composer references

**Decision: adopt the compact in-composer placement and grouped action-strip principle; do not copy the dense question wizard.** The user's two additional references show a preparation panel immediately above the native input and a small icon-only tool strip. The preparation stays physically connected to the request, which is worth retaining. Repeated recommendation boxes, many shortcut chips, and a long choice wall are not.

Additional reference files:

- `C:/Users/JSuic/HermesHome/cache/documents/native-inputs/4cad4bedf22c17d2395815a5b029c2a01fe148086bbbaa82d4a687c02955e270/dashboard_20261119_082410_21a3d37b_image_3ab453.png`
- `C:/Users/JSuic/HermesHome/cache/documents/native-inputs/8c0d3cf23bdfbe04f41e5cdfa0235d898adc7472eb6244bfa101c6f679e82255/dashboard_20261119_082410_a7554baa_image_623fe1.png`

The cropped strip contains mic/broadcast-like, library/document-like, case/box-like, and undo/redo-like symbols. The crop does not establish every action's identity. The source inventory in section 7.2, not icon guessing, determines behavior to retain.

#### Compact tool group

- Put Composer-owned actions in one visually coherent group within the host's existing action area. Use the native action treatment, not a permanent bordered capsule, extra toolbar background, or floating dock.
- Keep host attachments, model, reasoning, send, and stop exactly host-owned. Do not reposition or recolor them to imitate the screenshot.
- Use the section 6 icon family and section 7.1 priority/overflow rules. Grouping does not mean showing every old/new action simultaneously.
- Voice mode belongs with Voice; history belongs together; settings stays secondary. Existing user pins remain supported.
- Show separators only between meaningful groups when space allows; remove separators before shrinking targets. Tooltips describe the action, state, and configured shortcut.

#### Bounded inline preparation panel

- Compose opens a small panel above the native input when the supported host contribution and available pane geometry permit it. Expanded Compose is a deliberate continuation, not a replacement for ordinary chat.
- It is the same brief/controller as expanded Compose. No copied request store, independent model selector, or separate history stack.
- Proposed targets: host-aligned width; content-led height; maximum 300 CSS px or 40% of the available conversation-pane height, whichever is smaller. If the available panel cannot retain an approximately 180 CSS px usable work area alongside the native input, offer the expanded workspace instead of squeezing a miniature app into it.
- Header: `Shape request`, a concise progress/unresolved label, Expand, and Close. No repeated request paragraph when the native editor already contains it; provide a short source preview only when needed to disambiguate ownership.
- Body: one unresolved question or one focused preview. Show a short recommended choice and alternatives through a searchable picker, plus custom text where useful. No full outcome catalogue or permanent keyboard-badge grid.
- Recommendation: one short reason with Use / Dismiss. Another suggestion is secondary. Never show a second large box saying the AI agrees with its own recommendation.
- Footer: Back only when useful, Skip/Use default where valid, and an unambiguous Build brief or Apply to draft action. Show cancellation only while work is actually pending.
- Keep helper-model route and disclosure available from a concise detail control; do not repeat host model/billing metadata on every row.
- Close collapses local preparation without sending or discarding saved work. Close does not claim to stop voice or an independent run; active model work has an explicit Cancel action.
- Opening never auto-transmits context or starts inference. Build brief remains deterministic. Expand/collapse preserves values, selection, scroll, owner, revisions, disclosure, and pending candidate.
- The native input and send controls remain reachable; transcript focus/scroll is not forcibly reset. One panel body may scroll; the host editor is not nested inside another textarea.
- On narrow/short views, keep one task visible at a time. Advanced design/workflow/compare tools open deliberately in the expanded surface rather than packing their UIs into this panel.

```text
┌ Shape request · 1 open question                  Expand   Close ┐
│ What should the result be?                                     │
│ [Agent handoff ▾]                      [Write my own]            │
│ Suggested because you want another agent to implement this.    │
│ [Use suggestion] [Dismiss]                                     │
│ Back / Skip                            [Build brief]           │
└────────────────────────────────────────────────────────────────┘
  Native request editor — unchanged
  Composer action group                 Native model / Send
```

This is a planning wireframe, not an approved render. The inline flow, expanded workspace, and original controls must be reviewed together at actual pane sizes.

### 7.1 Default native rail

Preserve the host-owned editor, attachment controls, model picker, stop/send controls, shortcuts, and editor behavior.

Proposed default Composer additions:

```text
[ Library ] [ Compose ] [ Improve ▾ ] [ Voice ] [ More ]     [ native Send ]
```

The five additions form one compact group. Improve may be a short labelled button at normal width; the other triggers are compact icons with tooltips. This is not five labels forced into a tiny pane.

- At narrow widths, retain Compose, Improve, Voice, and More; Library moves into More.
- At tighter widths, retain Improve and More; active voice still exposes Mute and End.
- Secondary history, voice mode, saved drafts, settings, and expert actions live in More by default.
- Existing per-action visibility choices migrate; provide a one-time preview of the new default rather than silently replacing customization.
- Users can pin secondary actions. Overflow is automatic and ordered; no wrapping icon pile inside the message box.
- No dedicated new sidebar entry for each feature.

### 7.2 Every old action mapped

| Existing action | Redesigned entry and UI | Retained / improved behavior |
|---|---|---|
| Live voice | I04 Voice; becomes compact live capsule | Start, connecting, listening, muted, reconnecting, ending, error, retry; explicit End |
| Voice mode | Voice split/menu or More → Voice mode | Continuous and push-to-talk preserved; active-call changes guarded |
| Prompt library | I03 Library | Search, preview, select enhancement instructions, insert text, favorites/recents, library switching |
| Draft Shelf | More → Save draft / Saved drafts | Saving and browsing are separate named operations; full preview/restore added |
| Review enhancement | Improve menu → Review changes | Staged candidates; selective group apply; Keep original |
| Immediate Enhance | Improve primary action uses saved application preference | Existing immediate behavior remains available; new users default to review |
| Undo enhancement | More or contextual history control, I08 | Draft-bound undo; native typing undo remains host-owned |
| Redo enhancement | Adjacent to Undo where history appears, I09 | Reuse stored output; never another model call |
| Settings | More → Composer settings; workspace utility I27 | Existing settings remain accessible even when rail actions are hidden |

### 7.3 Improve menu

Popover target: approximately 300–340 px wide, bounded by available width. Top row: current recipe and Change. Main operations:

- Improve with selected recipe.
- Review changes before applying.
- Clarify / Tighten / Grammar / Expand / Summarize, preserving the old built-ins.
- Transform selection, when a supported selection is present.
- Choose enhancement model.
- Enhancement history.

Show whether an operation is **Local** or **Uses helper model** in the operation detail, not as permanent noisy badges on the rail. Local labels must mean no inference, including no embeddings.

### 7.4 Draft-safe behavior

Capture connection, profile, draft/session identity, revision, text, and attachment metadata before asynchronous work. If the user edits or changes chat, keep the candidate attached to its original owner. Do not apply to whichever editor now has focus.

If exact native selection cannot be obtained through a supported seam, selection operations work in the plugin-owned workspace editor only. State that limitation. Do not scrape Hermes's editor DOM to fake support.

### 7.5 More menu

Group by user intent, with separators:

1. **Continue:** Undo enhancement, Redo enhancement, History.
2. **Keep:** Save draft, Saved drafts, Export this draft.
3. **Prepare:** Context sources, Build a brief, Output format.
4. **Voice:** Interaction mode, Devices, Captions.
5. **Configure:** Customize bar, Composer settings, Keyboard reference.

Unavailable actions explain their reason on focus/selection; they do not masquerade as functioning destinations. Native host actions remain in host menus.

---

## 8. Compose workspace and guided brief building

### 8.1 Entry and ownership

Compose opens the bounded inline preparation panel in section 7.0 where the host contribution and actual available geometry support it. Expand opens the full writing-centred workspace with the same brief state. If the inline contribution cannot meet its usable-size contract, expose the expanded path explicitly instead of silently shipping a cramped substitute.

Opening either surface does not send the request, create an agent run, start voice, scan the project, transmit context, or rewrite the draft. A new local brief must not create a Hermes conversation unnecessarily. Advanced tools remain deliberately expanded rather than becoming a miniature application above the chat box.

### 8.2 First viewport

- Slim local navigation at the top: Compose, Library, Saved.
- Brief title as a renameable text label, not a hero heading.
- A clear Return to chat action.
- Editor taking the largest contiguous region.
- Optional section outline only for sufficiently structured content.
- A contextual inspector, initially closed for an uncomplicated request.
- Footer with unresolved issues, History, Preview brief, and Apply to draft.

Empty-state copy: **“What do you want to make happen?”** Below it: one explanatory sentence and three text actions—Start writing, Shape my request, Use a saved recipe. No demo metrics or twelve empty feature cards.

### 8.3 Freeform editor

- Plain writing first, with lightweight support for headings, lists, code, and citations.
- A view toggle can show structured brief fields without creating a second data owner.
- Selection actions appear only after a deliberate selection/action, not on every caret movement.
- `/` commands work in the plugin-owned editor and respect code blocks, IME composition, and literal slash input.
- A context menu offers normal text actions plus Improve selection, Add requirement, Link evidence, and Save as block.
- Long URLs and identifiers wrap or scroll within their content block; they do not widen the whole workspace.

### 8.4 Guided shaping

The user can keep writing while answering optional questions in the inspector. Ask only what would materially change the output.

Initial question: **“What should the result be?”** Picker groups:

- Answer or analysis.
- Plan or agent handoff.
- Working code or fix.
- Finished document.
- Structured data.
- Design specification.
- Repeatable workflow.
- Custom / Follow my wording.

Show up to three relevant suggestions first, plus Search all. The full catalogue is not always visible.

Then ask about blockers such as audience, fixed constraints, execution boundaries, or required format. Prefer at most three unresolved questions in the visible queue, with explicit Skip, Use default, and Write my own. The user may inspect all unresolved items; the visible limit is not permission to discard requirements.

### 8.5 Recommendations

A recommendation is one inline proposal:

**Suggested: Agent handoff**

“Your request asks for work another agent can implement.”

Actions: Use this / Keep my choice / Another suggestion. The current choice remains authoritative until changed explicitly. Explanations are concise and expandable. Do not repeat the same recommendation as both a prominent option and a large independent card.

### 8.6 Build versus Improve

- **Build brief:** deterministic local composition of approved material. Zero inference.
- **Improve wording:** an explicit helper-model operation with a reviewable result.
- **Apply to draft:** transfers the reviewed text back to the captured native draft.
- **Send:** remains a native Hermes action, never triggered by Build or Apply.

The footer names the actual next operation. No ambiguous Generate button that sometimes compiles locally and sometimes transmits context.

### 8.7 Preview

Preview brief is a document view of exactly what will be applied/exported. It supports source/requirement highlights without inserting UI warnings into the prompt unless those warnings belong in the deliverable. A compact receipt states: included sources, unresolved assumptions, destination, and whether any model call was used.

---

## 9. Improve, selection editing, and change review

### 9.1 Review composition

Default view: one readable proposed document with changed ranges marked. A view selector provides **Proposed / Changes / Original**; side-by-side is optional on wide containers, not mandatory.

The side list contains meaningful change descriptions: “Shortened introduction,” “Added an assumption,” “Changed output format.” Deterministic diff labels are identified as inferred descriptions, not perfect semantic analysis.

### 9.2 Changes requiring special attention

- Added scope.
- Removed constraints.
- Changed identifiers, quantities, dates, or file paths.
- New assumptions.
- Different output format or execution permission.

These appear before wording-only changes. A model must not certify its own rewrite as safe. Exact locks and structural validators may block application; semantic concerns require review.

### 9.3 Apply behavior

- Per-change accept/reject controls with keyboard support.
- Preview recomputes the actual combination of accepted changes.
- Apply selected creates one history entry.
- Apply all remains available when requirements allow it.
- Keep original closes the candidate without altering the draft.
- Undo restores the recorded prior text only if the current draft still matches the expected revision.
- Redo reapplies stored text with no new model call.
- If the native draft changed, show **“Your draft changed. Compare before applying.”** Offer Compare, Copy proposal, and Cancel—not a dangerous blind overwrite.

### 9.4 Inline transformations

Start with Tighten, Clarify, Grammar, Explain differently, Translate, and Custom instruction. Identify which transformations require inference. A local structural cleanup may normalize a selected list; it must not claim to understand meaning.

Selected text remains the edit boundary. An operation may propose surrounding changes but cannot silently apply them. Preserve exact literals and code. Long-running work can be cancelled without discarding the source text.

### 9.5 History view

A vertical timeline shows revision name, local time, source operation, and affected scope. Preview before restoring. Distinguish editor history, enhancement history, and saved versions. Do not call a temporary in-memory stack “saved history.”

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

## 11. Library, reusable material, and saved work

### 11.1 Library browser

Compact popup: search first, collections second, results third, preview on deliberate selection. Expanded library: collections column, item list, editor/preview.

Search name, body, tags, and collection. Keep selected, favorite, and recent states distinct. Favoriting is not selecting an enhancement recipe. Enter on a result selects; an explicitly labelled Insert action inserts. Never send.

### 11.2 Item types

- **Prompt:** saved instructions or reusable text.
- **Recipe:** prompt plus typed parameters, optional style, and output contract.
- **Block:** reusable section with dependencies and versioning.
- **Style:** presentation rules, not permissions or hidden persona changes.
- **Context pack:** explicitly selected source snapshots.

These share search and storage management, not five separate top-level pages. Filter by type; default to the user's current task.

### 11.3 Library editor

Fields: name, collection, tags, instructions, and optional parameters. Show usage examples as explicitly illustrative material. Existing prompt editing and incomplete editor drafts remain recoverable.

Actions: Use for Improve, Insert, Duplicate, Move, Rename, Archive/Delete, Export. Collection actions: Create, Rename, Reorder, Delete with explicit treatment of contained items.

Preserve the old five built-in enhancers and stable prompt identities. Allow useful management actions without forcing the user to import JSON just to reorganize items.

### 11.4 Typed recipes and modular blocks

Variables: text, choice, number, boolean, source reference. Required values cannot silently become empty strings. No code execution in templates.

Blocks have pinned versions and explicit follow-update choices. Show what changes before updating a used block. Detect dependency cycles and conflicting format rules. The resolved final text is always inspectable.

### 11.5 Styles

Examples: concise technical explanation, customer-facing response, design specification, incident report. These are editable examples, not prescribed user preferences.

Applying a style may change tone, headings, or density. It must not alter locked identifiers, permission boundaries, or promised deliverables. No automatic write to global memory, SOUL.md, or agent profiles.

### 11.6 Saved work

List with title, type, updated time, origin, and status. Filters: drafts, briefs, experiments, workflows. Search and sort; avoid an analytics dashboard.

Detail preview shows exactly what restores. Restore to a different chat is an explicit import/copy action, not accidental cross-owner substitution. Save/rename/duplicate/delete and expiry must be understandable.

Temporary recovery entries and deliberately named saved work have different retention rules. Never silently evict a named draft to make space for a temporary one. Storage-full states offer export and explicit cleanup.

### 11.7 Branches and decisions

A branch records an alternative without overwriting its parent. Compare two versions, name the chosen approach, and restore only after review. A local comment/decision can anchor to a requirement or changed passage.

This is device-local review, not a claim of real-time multi-user collaboration. Cross-device sync and shared cloud libraries require separate design and approval.

### 11.8 Import/export

Data-only versioned packs; item/dependency preview; duplicate / skip / explicitly replace choices; accurate included/excluded-source manifest. Reject traversal paths, executable payloads, unsupported versions, and excessive size safely. Provide undo for a successful local import.

---

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

## 13. Settings and every configuration surface

### 13.1 Settings shell

Use a focused vertical settings list rather than an ever-growing tab row. Categories:

1. Composer.
2. Assistance & models.
3. Library defaults.
4. Voice & devices.
5. Context & privacy.
6. History & storage.
7. Usage & diagnostics.
8. Accessibility & shortcuts.

At narrow width, a category picker and Back label replace the left column. Search matches setting labels and descriptions. Most settings are profile-scoped; view layout is local, and session-specific exceptions are visibly scoped.

### 13.2 Composer

- Live action-rail preview at the real compact width.
- Toggle/reorder/pin each Composer-owned action.
- Default application: Review changes or Apply immediately.
- Default workspace opening behavior and inspector preference.
- Compact/comfortable controls; preserve host zoom.
- Reset layout only, with preview—not a reset of prompts, voice accounts, or data.

### 13.3 Assistance & models

Separate role rows: Wording helper, Question helper, Context analysis, and Optional evaluator. Each can inherit an explicitly shown parent route or choose a supported provider/model.

Clicking a row opens a searchable provider/model picker with actual capability evidence, availability, reasoning controls where supported, and clear billing uncertainty. Do not hard-code Opus/Astra/Sonnet/Fable as permanent system models; user aliases may be saved.

AI behavior: Off, On request, or Approved automatic assistance. Default proposed for the replacement is **On request**. Any existing preference change requires explicit migration review.

Automatic assistance policy defines triggers, data scope, maximum calls, and cancellation. It does not authorize background generation on every keystroke. Missing route = error; no silent alternative provider.

### 13.4 Library defaults

Default collection, enhancement recipe, explicit style, favorites/recents behavior, and import/export entry. Preserve existing item IDs and selected recipe. Do not move the full library editor into Settings.

### 13.5 Voice & devices

Connection, provider, model, voice, language, interaction mode, microphone, speaker, caption policy, and optional bridge endpoint. Group connection/provider/model together, devices together, and privacy together.

Show billing lane as actual read-only route information. A custom bridge must prove the required contract; do not present a stock gateway as compatible. Unsupported chained voice is an explained limitation, not a fake working option.

### 13.6 Context & privacy

- Conversation context: manual selection by default; optional approved on-open policy.
- Independent final-delivery and helper-transmission defaults.
- Source excerpt limits, truncation disclosure, and redaction preview.
- Whether approved voice segments are retained.
- Local-only material versus remote transmission shown plainly.
- No telemetry or cloud synchronization enabled as a redesign side effect.

### 13.7 History & storage

List the actual categories stored locally, their retention, and current usage where measurable. Export before clear. Separate Clear temporary recovery, Clear enhancement history, and Delete named saved work. The last requires a clear targeted confirmation.

Provide per-item recovery when possible. Do not use a single destructive Reset everything button as the main maintenance control.

### 13.8 Usage & diagnostics

Retain Today, Last 5 hours, Last 24 hours, and This week voice activity. Distinguish elapsed call time, audio time, session counts, inference usage, price estimate, and provider quota. Unknown values are Unknown—not zero.

Diagnostics are collapsible and secret-free. Show exact route, capability evidence timestamp, public error code, and a Copy diagnostics action. Do not inspect every provider or refresh authentication on each settings visit. Explicit Refresh checks only the relevant category.

### 13.9 Accessibility & shortcuts

Follow host language with an explicit override where supported. Separate UI language, output language, and voice language. Larger controls, reduced motion, shortcut discovery, and screen-reader-friendly review preferences live here.

Use the host command registry for configurable shortcuts where exposed. Detect conflicts with Prompt Studio and native editor actions. No unreviewed hijacking of Enter, Tab, F4, or Ctrl+Shift+E.

### 13.10 Save semantics

Retain serialized profile-scoped saves and backend read-back. Show Saving / Saved / Waiting to save / Could not save accurately. Keep incomplete form drafts. A failed save retains the intended change and offers Retry; it must not quietly restore an old value without explanation.

---

## 14. Major future-facing workflows

These are proposed additions or extensions, not claims of existing completion. All use the shared editor, sources, requirements, history, and delivery system. **None earns a permanent top-level tab simply by existing.**

### F01 — Intent Map: requirements connected to real text

**Job:** understand where a complex request's constraints came from and whether a rewrite retained them.

**Entry:** select text → Mark requirement; or inspector → Requirements.

**UI:** short anchored marks in prose, a grouped requirement list, and click-through evidence. Optional relationship diagram appears only when deliberately requested; the default is readable text, not a node canvas.

**Behavior:** new clauses are proposals; exact locks block incompatible edits; assumptions remain separate; contradictions preserve both sides until decided.

**Narrow:** single requirement detail with Back to request. **Proof:** a locked literal and a no-deployment clause survive selective edits; missing content is visibly blocked.

### F02 — Reference-to-spec: design from images, not adjectives

**Job:** turn screenshots, sketches, or reference images into an implementable design brief.

**Entry:** add a selected image → Describe this design.

**UI:** reference viewer with fit/zoom and normalized region pins; paired specification editor for layout, components, tokens, interaction states, responsive rules, and icon treatment. On narrow surfaces switch Reference / Specification; do not shrink both.

**Behavior:** Keep / Change / Avoid annotations, Observed / Proposed / Unknown distinctions, exact source regions, manual annotation without inference, optional authorized vision interpretation.

**Proof:** export an agent-readable brief linked to source regions, with unmeasured values clearly proposed. Invisible states are requirements to design, not observations to invent.

### F03 — Context Budget: spend attention and tokens deliberately

**Job:** choose useful context instead of indiscriminately stuffing a prompt.

**Entry:** Context inspector → Review inclusion.

**UI:** source list with included excerpt sizes and a compact budget strip; an expandable table shows what is included, excluded, truncated, or stale.

**Behavior:** exact character counts; token counts labelled estimated unless the selected tokenizer is known. A local rule can suggest duplicate excerpts; a semantic compression request is explicit inference and requires review.

**Proof:** excluding a source removes its actual text from helper payload and final export independently. No invented monetary savings.

### F04 — Prompt Branches: compare approaches without losing the original

**Job:** try concise, detailed, or differently scoped variants while retaining a reliable original.

**Entry:** History → Create branch.

**UI:** named versions in a compact picker and a document comparison, not a permanent branching-tree dashboard.

**Behavior:** shared source provenance, immutable saved parent, explicit merge of selected changes, and conflict review. Deleting a branch does not delete its source documents.

**Proof:** restore one branch, compare another, and preserve manual work in the native draft.

### F05 — Dialect Preview: adapt a brief for its destination

**Job:** prepare one canonical brief for different target model or agent formats without corrupting the original intent.

**Entry:** Delivery → Target format/provider.

**UI:** canonical text on one side, target-specific rendering on the other; a short compatibility list explains unsupported constructs.

**Behavior:** adapter changes are visible and reversible; instructions, tool declarations, and structured output use only verified public capabilities. Unknown providers use Generic text. Choosing a target does not change the host's active model.

**Proof:** exact constraints are identical across canonical/exported forms; unsupported features are reported rather than silently dropped. This is portability, not a guarantee every model behaves identically.

### F06 — Handoff Compiler: agent-ready work, not a longer prompt

**Job:** deliver scope, files, UI specifications, restrictions, steps, and acceptance in one reliable package.

**Entry:** Deliver → Agent handoff.

**UI:** a real Markdown preview with anchored sections and an inclusion manifest. Missing inputs appear as unresolved items, not fake placeholders filled with guesses.

**Behavior:** optional per-role files, source/attachment manifest, exact identifiers, dependencies, visual acceptance, and machine-readable metadata. Kanban export produces proposed card payloads; dispatch is a separate confirmed action.

**Proof:** reopen exported files and verify all sections and selected references are present. No invented attachment path or claimed upload.

### F07 — Reusable Blocks and Parameterized Recipes

**Job:** assemble high-quality repeatable briefs without copying stale snippets.

**Entry:** library search or editor insertion command.

**UI:** parameter form, resolved preview, and block-update diff.

**Behavior:** typed required variables, version pins, dependency checks, and explicit update acceptance. Collections remain understandable for simple plain prompts.

**Proof:** an incomplete recipe cannot apply; a block update changes only approved instances.

### F08 — Answer Repair: fix the flawed part, not the whole answer

**Job:** repair a specific missing requirement, formatting error, or unsupported claim in an actual supplied answer.

**Entry:** selected response text or pasted result → Repair.

**UI:** immutable original, anchored issues, evidence field where factual correction is requested, and a targeted patch preview.

**Behavior:** preserves unrelated correct passages; no silent chat-history rewrite; no tool execution or rerun unless separately requested.

**Proof:** repair a JSON field or section omission while unchanged passages remain byte-identical. Unsupported factual correction is flagged for evidence.

### F09 — Live Output Contracts and Result Inspection

**Job:** define what valid output looks like and inspect actual results against it.

**Entry:** Output inspector; then supplied/generated result.

**UI:** contract editor and result view with exact failure locations, raw output, and source-brief version.

**Behavior:** local structural checks first, optional evaluator separate and costed; prompt checks never claim to validate real agent behavior.

**Proof:** missing JSON key, table column, and required section produce precise failures; illustrative examples never count as a run.

### F10 — Workflow Composer

**Job:** turn a repeatable multi-step task into a clear reusable plan.

**Entry:** Create → Workflow.

**UI:** ordered step list with expandable input, instruction, output, and checkpoint fields. Optional graph is a secondary visualization of the same data, not another editor state owner.

**Behavior:** input/output bindings, role ownership, explicit manual checkpoints, cycle validation, local plan export. Execution is an additional bounded tool-free lane, not implied by drawing a graph.

**Proof:** a three-step plan exports meaningful bindings; an authorized runner pauses at the checkpoint and never launches arbitrary shell code from imported content.

### F11 — Agent Team Briefs

**Job:** prepare nonoverlapping responsibilities for multiple agents without vague duplicated instructions.

**Entry:** Handoff → Split responsibilities.

**UI:** compact role table showing task, files/areas, dependency, reviewer, and deliverable. Selecting a role opens its real brief.

**Behavior:** global constraints inherited; overlap and cycles flagged; coordinator and role files exported. Creating or running agents is separate authorization.

**Proof:** each role has a precise write boundary and acceptance; export must not claim agents were started.

### F12 — Batch Workbench

**Job:** apply a recipe to explicitly selected rows without losing control of failures and cost.

**Entry:** Create → Batch from CSV/JSONL/text.

**UI:** rows, resolved-input preview, selected-row actions, output/error columns, and a run-plan footer. Not a permanent main navigation item.

**Behavior:** Preview one, Run selected, bounded concurrency, Stop queued, retry selected failures, approved-output export. Source files remain unchanged by default.

**Proof:** mixed success retains successes and retries only selected failures. No background job is shown as live without actual status evidence.

### F13 — Experiment Notebook and Compare

**Job:** compare a small number of real candidate prompts against real cases and retain evidence.

**Entry:** a branch or recipe → Compare.

**UI:** candidate/case grid, output detail, actual run receipt, and a small hypothesis/conclusion note.

**Behavior:** explicit route/call plan, limits, real latency/usage where available, deterministic validators, optional named evaluator with separate consent. No universal quality score or hidden model judge.

**Proof:** every comparison cell is an actual result, failure, cancelled state, or clearly labelled fixture. A notebook conclusion links to run evidence.

### F14 — Voice Briefing and Spoken Corrections

**Job:** speak naturally and turn approved pieces into an organized brief.

**Entry:** Voice purpose → Build a brief.

**UI:** active capsule and a proposed-clause tray; corrections link to the clause they change.

**Behavior:** temporary captions stay temporary; only approved segments persist; all updates remain bound to the starting owner and brief revision.

**Proof:** switching chat cannot write spoken text into another draft; locked clauses are never silently replaced.

### F15 — Project Kits

**Job:** carry a chosen recipe set, style, context references, constraints, and delivery defaults for a project without recreating them each time.

**Entry:** Library → New project kit; or Save current setup as kit.

**UI:** a labelled checklist of included components and a resolved preview. A compact kit selector appears only in the workspace, not another permanent native rail button.

**Behavior:** explicit activation per brief, versioning, missing-reference warnings, and portable data-only export. No silent project detection that rewrites another conversation's settings.

**Proof:** activating a kit never changes the host model, global memory, credentials, or unrelated project material.

### F16 — Work Resume Capsule

**Job:** stop mid-task and resume exactly where the user was.

**Entry:** Save for later / return to a saved item.

**UI:** one concise resume item with title, last meaningful action, unresolved issue, and Continue. It is part of Saved, not a second Kanban.

**Behavior:** keeps editor location, branch, selected sources, and pending candidate; records whether an external run is actually still alive.

**Proof:** reopening restores the captured local work without replaying a call or displaying a fake running state.

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

### F19 — Guided Attachment Manifest

**Job:** make “use the attached files” precise for another agent.

**Entry:** Context → Prepare attachments; Delivery → Manifest.

**UI:** each file shows Included bytes, Referenced only, Excluded, Missing, or Unsupported; exact role and selected pages/regions.

**Behavior:** no fake “embedded” status for a local file path. User can remove secrets or limit pages before export.

**Proof:** a recipient can distinguish what is truly inside the delivered package from what needs separate transfer.

### F20 — Readiness Preview Before Execution

**Job:** see what a request will require before giving it to an executing agent.

**Entry:** Delivery → Check readiness.

**UI:** concrete prerequisites and unresolved permissions grouped by Available / Unknown / Missing, each with evidence and a check time.

**Behavior:** read-only local checks by default; no speculative port scan, credential probing, deployment, or paid test. A plan requiring live access remains labelled unresolved until verified.

**Proof:** a missing screenshot, unsupported SDK seam, or no-deployment boundary survives into the final handoff and cannot be dismissed by an invented readiness percentage.

### F21 — Adaptive Action Search

**Job:** reach any supported operation quickly without keeping it permanently visible.

**Entry:** local action search or a host-registered command if supported.

**UI:** grouped commands/material/results with a short preview and explicit scope; keyboard navigation; matches by useful synonyms.

**Behavior:** recent actions are local and factual; context changes ranking but never execute a suggested action. Search for “fix format” can locate output repair without a separate nav button.

**Proof:** drafts, library items, context, review, advanced tools, settings, and export are reachable without hunting through a feature-tab strip.

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

## 17. Release sequence and visual acceptance

### 17.1 Four delivery waves

| Wave | Outcome | What it must prove |
|---|---|---|
| W1 — Original Composer, redesigned properly | Baseline continuity, icon family, compact rail, Improve/review, focused Compose journey | The user likes the actual interface before the roadmap expands |
| W2 — Complete everyday tools | Library, saved drafts/history, settings, voice/device surfaces, accessibility | Every old item remains usable and feels like one product |
| W3 — Distinctive intelligence | Context/evidence, Intent Map, reference-to-spec, output contracts, handoff, recipes, portability | New workflows work end-to-end, not menu-only |
| W4 — Advanced work | Workflow/team packs, batch, compare/notebook, reviewed personalization, project kits | Controlled execution and evidence without turning the everyday UI into a control panel |

Do not postpone all usable UI until the final wave. Do not install W1 into the live profile until its visual gate passes and the user authorizes installation.

### 17.2 Visual evidence gate

For each shipped surface, capture real rendered states in light and dark themes, normal width, narrow width, and the actual user pane/window dimensions. Include an ordinary long-content state and open dropdown/sheet where relevant.

Required W1 evidence: native rail idle/overflow, active voice placeholder only if not actually running clearly labelled as a visual fixture, icon sheet, Improve popover, review with real fixture changes, Compose empty/filled, and return-to-draft behavior.

A screenshot fixture can demonstrate geometry. It cannot establish a real voice connection, provider capability, or backend effect. Label its scope.

### 17.3 Hard visual rejection conditions

- A horizontal feature-tab wall.
- Wallpaper showing through working text.
- A reduced editor surrounded by badges and controls.
- Toolbars wrapping into multiple random rows.
- Settings controlling the main work surface rather than supporting it.
- Unreadable icons at actual size, mixed icon weights, or destructive-looking Undo.
- Important text clipped at the actual user width.
- A native host control duplicated or removed.
- Any top-level feature button with only an empty/disabled placeholder behind it.

### 17.4 Functional checks

Keep a lean, high-value suite. Preserve the original existing checks. Add targeted tests for owner/revision protection, selective changes, migration, disclosure, voice teardown, import safety, and actual generated bundle loading.

Render and exercise the primary journey with mouse and keyboard. Tests that search source strings or mount a permissive stub do not establish a usable design.

### 17.5 Completion states

Report separately: source implemented; local checks passed; actual UI rendered; primary interaction exercised; provider/microphone acceptance passed; package installed; live activation verified; user accepted.

“Done” on a source card must include open gates, and cannot be reused as a whole-product approval. A blocked required capability stays blocked, not reclassified as completed polish.

---

## 18. Detailed Kanban drafts — do not create yet

### 18.1 How these drafts become cards

These are proposed future cards, not live board IDs. All titles use `EC-R##` identifiers within this document only.

Each created card must include its full body below **plus** the execution contract in section 19, the relevant surface/feature/icon requirements copied or attached, exact workspace path, explicit predecessor IDs, and acceptance evidence requirements. A bare link saying “implement the document” is not an adequate card.

Default dependency graph is sequential to protect one shared implementation workspace. Split independent work later only with exclusive file/worktree ownership and explicit authorization; the current execution policy forbids delegation.

### 18.2 Common card fields

- Assigned worker: `nous-agent`.
- Provider/model: `nous / tencent/hy4-flash:free`, exact, no substitutions.
- Codex, delegated agents, MoA/swarm/reviewer agents, and fallback: forbidden.
- Completion: local-only; no push, release, install, restart, paid inference, or task dispatch without separate approval.
- Start receipt: actual route, task pins, workspace, baseline, scope, fallback none, delegation off.
- Finish receipt: changed files, checks/results, visual evidence, limitations, artifacts, actual slice commit SHA, and next-card facts.
- Each slice must commit its scoped changes after required checks and before completion. No automatic implementation pushes. A blocked slice preserves partial work and reports why completion/commit is not yet valid.
- Required status split: source/local/UI/live/user gates. Do not flatten them into one optimistic checkmark.

### EC-R00 — Preserve, retire the rejected build, and prepare the approved original baseline

**Depends on:** user approval of restore/rebuild action. **Wave:** W1. **Surfaces:** S01/S08 baseline only.

**Objective:** establish an exact recoverable original, without deleting useful work or user data.

**Actions:** verify baseline commit and renderer hash from section 2; snapshot current runtime/package/state metadata; inventory rejected-build data; prepare a new unused branch/worktree from the original baseline; restore runtime only if separately approved. Keep rejected code archived read-only.

**Must preserve:** original nine controls, six settings areas, public skill compatibility, prompt IDs/library, settings, native draft, voice accounts, and old worktrees.

**Acceptance:** original/source renderer comparison is recorded; original state is recoverable; new workspace has the correct ancestry; no forced cleanup/reset/deletion; a preservation report distinguishes code, user data, and runtime.

**Evidence:** exact paths, SHAs, archive hashes, worktree status, and concise feature-parity checklist. **Do not:** begin redesign or use the rejected workspace as the new base.

### EC-R01 — Interaction inventory, visual brief, and host-seam confirmation

**Depends on:** EC-R00. **Wave:** W1. **Surfaces:** all; planning/build preparation only.

**Objective:** turn this draft into precise approved implementation context without changing product scope.

**UI work:** inventory rail, popovers, review, library, saved work, route shell, voice tray, every settings area, narrow states, and keyboard return paths. Produce a screen/state map and implementation-ready region proportions from sections 4–5.

**Technical work:** verify exact SDK exports and APIs for editor access, selection, docking, commands, file/image input, save/export, and provider metadata. Mark actual versus proposed support.

**Acceptance:** every old action is mapped; no feature is removed; missing host seams have explicit disposition; visual scope is not reduced to “fix overflow.”

**Evidence:** source paths/API signatures, state inventory, and concise unresolved-decision list. **Do not:** fabricate APIs, create a new framework, or start live configuration changes.

### EC-R02 — Redesign the icon family and the native action rail

**Depends on:** EC-R01. **Wave:** W1. **Surfaces:** S01/S02. **Icons:** section 6, especially I01–I11/I27–I30.

**UI work:** implement the consistent icon registry; render the full icon sheet; build the five-action default rail, compact labelled Improve, adaptive overflow, active-action area, and More menu groups. Follow section 7.0's compact grouping and section 5's Hermes-only theming. Keep host send/model/attachment controls untouched.

**Interactions:** tooltips with action names and available shortcuts; keyboard focus; customization preview; retain current visibility preferences until explicit migration acceptance.

**States:** idle, hover/focus, disabled history, busy Improve, narrow overflow, enlarged controls, and active voice geometry fixture labelled as such.

**Acceptance:** icons are legible at 16 px, Undo is not destructive-looking, the rail never becomes an icon pile, essential native controls remain reachable, and every overflow action returns focus correctly.

**Evidence:** light/dark rail and icon-sheet screenshots at real host scale, keyboard walk, exact added imports. **Do not:** rebuild every screen or install into the live profile yet.

### EC-R03 — Build Improve, selective review, and safe enhancement history

**Depends on:** EC-R02. **Wave:** W1. **Surfaces:** S02/S04. **Reference:** sections 7 and 9.

**UI work:** recipe-aware Improve menu; Proposed/Changes/Original views; optional wide split; meaningful change groups; per-change acceptance; Apply selected/all; Keep original; local history.

**Behavior:** preserve immediate Enhance as a preference; default new-user flow to review; bind candidate to exact owner/revision/selection; recompute actual combined changes; one undo entry; redo without inference.

**States:** no draft, no changes, long diff, failed helper, cancelled request, stale native draft, owner drift, and missing selection seam.

**Acceptance:** a selected change applies without unrelated edits; typed changes cannot be overwritten; immediate mode remains available; no hidden route change; no invented semantic safety label.

**Evidence:** real fixture journey and narrow/wide captures; focused owner/revision/history tests. **Do not:** use external inference just to decorate the demo.

### EC-R04 — Build one complete writing-centred Compose journey

**Depends on:** EC-R03. **Wave:** W1. **Surfaces:** S03/S10.

**UI work:** section 7.0's bounded inline preparation panel plus the slim expanded Compose/Library/Saved shell; title/save/return row; dominant editor; conditional outline; one inspector; clear footer. Inline and expanded share state and preserve the native editor. Build only a complete basic brief journey, not all future panels.

**Journey:** open captured draft → edit freely → choose deliverable → answer or skip relevant questions → local Build brief → inspect exact preview → Apply to captured draft → undo.

**States:** empty, populated, unresolved question, long prose/code, narrow, short window, zoom, reopening saved local view, changed owner.

**Acceptance:** the editor is visually dominant; no feature-tab wall; inline height is bounded and its native input stays reachable; expand/collapse loses no state; local build has zero inference; Apply never sends; returning to chat preserves native state. If the required host seam is unavailable, report that gap rather than silently dropping the inline design.

**Evidence:** full journey with real controls, wide/narrow/light/dark captures, brief/native revision receipt. **Do not:** add empty advanced-tool nav buttons.

### EC-R05 — W1 visual review and correction gate

**Depends on:** EC-R04. **Wave:** W1. **Surfaces:** S01–S04/S10 as implemented.

**Objective:** reject or correct a bad interface before expanding the roadmap.

**Review packet:** actual user-width captures, icon sheet, empty/filled inline and expanded brief, expand/collapse continuity, open Improve, selective review, narrow overflow, keyboard path, live Hermes-theme switching, and explicit tested/untested integration list.

**Review criteria:** sections 5, 6, and 17; compare to the supplied anti-reference problems and this document's wireframe. The user judges visual quality; tests do not substitute for approval.

**Acceptance:** all material visual failures fixed or explicitly returned for a decision; W1 user acceptance recorded. If no user decision can be obtained, stop at review rather than install or advance.

**Evidence:** annotated findings and recaptures. **Do not:** spawn a reviewer agent under the no-delegation policy; do not describe “still needs polish” as acceptance.

### EC-R06 — Complete library browsing, editing, recipes, and collection management

**Depends on:** EC-R05 and user acceptance. **Wave:** W2. **Surface:** S05.

**UI work:** searchable popup and expanded collection/list/editor; preview; selected/favorite/recent distinctions; name/tags/body/collection fields; explicit Insert versus Use for Improve; typed variable form and resolved preview.

**Behavior:** original built-ins and IDs retained; create/edit/duplicate/move/delete/export; collection rename/reorder/delete; incomplete drafts recover; unresolved variables block application.

**States:** no results, incomplete item, large legacy library, duplicate import, unsaved/storage failure, long prompt, narrow editor/list switch.

**Acceptance:** ordinary plain prompts remain simple; a parameterized recipe works offline; collection management requires no manual JSON editing; no unintended source normalization.

**Evidence:** legacy round-trip fixture, management journey, popup/expanded captures. **Do not:** introduce five permanent item-type destinations.

### EC-R07 — Complete saved drafts, versions, branches, and resume

**Depends on:** EC-R06. **Wave:** W2. **Surface:** S06. **Features:** F04/F16.

**UI work:** save-name flow; searchable saved list; preview/restore; rename/duplicate/delete; distinct temporary/named retention; history timeline; named branch comparison; concise resume capsule.

**Behavior:** strict owner/revision checks, original parent retained, explicit cross-owner copy, no replay of inference or runs on resume.

**States:** empty, expired temporary work, missing owner, changed draft, storage full, orphaned source, interrupted candidate.

**Acceptance:** save/reopen/branch/restore is complete; named work is never silently evicted; in-memory enhancement history is not falsely labelled durable.

**Evidence:** a multi-step reopen journey and storage/owner checks. **Do not:** create a second task board or display unverified running state.

### EC-R08 — Replace the settings shell and redesign all existing configuration controls

**Depends on:** EC-R07. **Wave:** W2. **Surface:** S08. **Reference:** all section 13.

**UI work:** vertical grouped settings with search; model role rows; searchable providers/models; real reasoning controls; bar customization preview; context policy; storage controls; usage/diagnostic panels; narrow category picker.

**Parity:** Enhancement, Prompts entry, Composer bar, Voice, Audio, Account & usage remain covered. UI/output/voice languages remain distinct. Preserve per-profile autosave/read-back.

**States:** loading, inherited value, pending incomplete provider/model selection, unavailable model, saving, save failure/retry, missing device, long provider IDs.

**Acceptance:** no broad provider/auth scan on every settings open; valid changes persist and read back; failed changes remain recoverable; changing target/helper does not change the native host model.

**Evidence:** category-by-category coverage table and real local/backend settings checks where permitted. **Do not:** change credentials or global profile routing.

### EC-R09 — Redesign active voice, captions, task steering, and audio devices

**Depends on:** EC-R08. **Wave:** W2. **Surface:** S07 plus voice settings.

**UI work:** idle Voice menu; continuous/PTT selection; active capsule; actual status text; Mute/End; collapsible captions/details; inline task steering; device picker and explicit test actions.

**Behavior:** preserve session binding, provider ownership, media cleanup, next-call settings, stop semantics, and strict busy handling. Do not start a microphone automatically.

**States:** connecting/listening/speaking/muted/reconnecting/ending/failed; denied permission; missing saved device; chat switch; failed remote cleanup with local release.

**Acceptance:** UI remains compact and End is reachable; steering uses a real local form; chat switches cannot retarget; temporary tests release media. Live-provider/mic acceptance requires separate approval and must be reported separately.

**Evidence:** lifecycle fixtures plus actual permitted media/provider receipts only if authorized. **Do not:** run a forbidden provider or weaken authentication ownership for convenience.

### EC-R10 — Finish cross-surface keyboard, theme, narrow layout, and continuity

**Depends on:** EC-R09. **Wave:** W2. **Surfaces:** all W1/W2.

**UI work:** coherent type/control density, focus return, tooltip copy, command conflicts, 200% zoom, high content ranges, reduced motion, and neutral opaque surfaces in light/dark.

**Acceptance:** all old features remain accessible; no clipping or hidden footer at actual user dimensions; keyboard-only core journeys complete; native typing/send/undo unaffected.

**Evidence:** compact coverage matrix and actual rendered interactions. Fix material issues as a batch; do not build an oversized testing platform. **Do not:** call untested accessibility certified.

### EC-R11 — Context Lens, explicit capture, budget, and evidence links

**Depends on:** EC-R10. **Wave:** W3. **Surface:** S09. **Features:** F03/F19 foundation.

**UI work:** source rows and exact excerpt preview; independent helper/final disclosure; selected conversation turns/file/paste capture; freshness, truncation, inclusion budget, and linked evidence jumps.

**Behavior:** source snapshots; manual refresh; literal counts versus estimated tokens; no ambient indexing; no automatic inference.

**States:** missing source, unsupported extraction, truncated input, stale snapshot, revoked disclosure, foreign owner, empty selection.

**Acceptance:** excluding helper access removes actual payload text; final inclusion is independent; source links identify real passages; unsupported sources remain honest.

**Evidence:** payload inspections, source/requirement interaction, narrow source detail. **Do not:** claim scanning or reading content that was not accessed.

### EC-R12 — Intent Map, exact locks, assumptions, and Prompt Debugger

**Depends on:** EC-R11. **Wave:** W3. **Feature:** F01.

**UI work:** anchored requirements; grouped inspector; exact lock control; separate assumptions; conflict decision view; issue groups with source jumps and concrete actions.

**Behavior:** stable IDs, strict exact literals, prohibition preservation, partial-apply validation, and explicit assumption promotion.

**Acceptance:** a deliberate misspelling and no-deployment clause survive rewrites; incompatible apply is blocked; contradiction shows both original clauses; no “perfect/safe” score.

**Evidence:** reviewed partial-change tests and a complete issue-to-fix journey. **Do not:** flatten all semantic questions into false deterministic pass/fail guarantees.

### EC-R13 — Output contracts, real result inspection, and targeted answer repair

**Depends on:** EC-R12. **Wave:** W3. **Features:** F08/F09.

**UI work:** format editor; clearly illustrative structure preview; raw/rendered actual result; precise validator findings; immutable response and anchored repair proposal.

**Behavior:** known provider enforcement only; stale-result version labels; safe rendering; evidence-required factual corrections; unchanged passages preserved.

**Acceptance:** actual Markdown/table/JSON failures are located; no synthetic answer presented as real; selected repair cannot overwrite chat history.

**Evidence:** real supplied-result fixtures and round-trip export. **Do not:** silently execute generated HTML, tools, or assertions.

### EC-R14 — Reference-to-spec visual brief tool

**Depends on:** EC-R13. **Wave:** W3. **Feature:** F02. **Surface:** S11.

**UI work:** real reference viewer, fit/zoom, accessible pins/regions, Keep/Change/Avoid, paired specification sections, wide split/narrow switch, component/state/icon detail.

**Behavior:** source-linked Observed/Proposed/Unknown; exact literal preservation; manual annotation offline; optional vision inference only with approved route/disclosure.

**Acceptance:** export an implementable design handoff using the supplied Prompt Studio references; proposed dimensions are labelled; unseen behavior is not invented.

**Evidence:** annotation-to-requirement cross-highlighting and reopened exported spec. **Do not:** use a local path as proof the image is embedded for a remote agent.

### EC-R15 — Handoff compiler, delivery formats, attachment manifest, and readiness

**Depends on:** EC-R14. **Wave:** W3. **Features:** F06/F19/F20. **Surface:** S10.

**UI work:** delivery preview, exact sections, target destination, included/excluded manifest, missing prerequisites, and real copy/download actions.

**Behavior:** Markdown/text/JSON and true tabular CSV; actual files; truthful local handles; only approved bytes embedded; readiness evidence and uncertainty. DOCX/PDF require real conversion, not renamed text files.

**Acceptance:** reopen exports; exact design/constraint/acceptance content preserved; recipient can distinguish attached bytes from references; Kanban output is a draft, not automatic dispatch.

**Evidence:** parsed artifacts and inclusion checks. **Do not:** publish, message, create cards, or claim an upload without separate authorization/read-back.

### EC-R16 — Versioned blocks, styles, context packs, and project kits

**Depends on:** EC-R15. **Wave:** W3. **Features:** F07/F15; library extensions.

**UI work:** common library filters; block parameter/update diff; style preview; pack disclosure; project-kit component checklist.

**Behavior:** pinned versions, explicit follow-update, dependency/conflict checks, source refresh diff, data-only portability, local reviewed activation.

**Acceptance:** activating/updating a kit preserves locks and unrelated projects; existing briefs retain pinned snapshots; imports preview duplicates and rollback safely.

**Evidence:** recipe/block/contract/context-kit round-trip with accurate manifest. **Do not:** write global memory, change credentials, or execute imported code.

### EC-R17 — Destination dialect preview and capability-aware helper plans

**Depends on:** EC-R16. **Wave:** W3. **Feature:** F05.

**UI work:** canonical versus target preview, provider capability evidence, generic fallback format explicitly chosen rather than hidden provider fallback, call/disclosure plan, cancellation.

**Behavior:** canonical intent unchanged; target model choice does not mutate host; helper roles resolved visibly; no route substitution on failure.

**Acceptance:** exact identifiers and prohibitions survive exports; unknown capabilities stay Unknown; AI-off makes zero inference calls.

**Evidence:** adapter fixtures and actual permitted route evidence separately. **Do not:** hard-pin product features to the worker's Nous route or run another provider to satisfy a test.

### EC-R18 — Workflow and role-specific agent handoff planning

**Depends on:** EC-R17. **Wave:** W4. **Features:** F10/F11.

**UI work:** ordered workflow steps; bindings/contracts/checkpoints; optional graph of the same state; role ownership/dependency/reviewer table; real coordinator/role exports.

**Behavior:** inherited global constraints, cycle/overlap detection, design/export first, no automatic agent creation.

**Acceptance:** a three-step workflow and two-role handoff reopen with meaningful boundaries; no exported file claims execution occurred.

**Evidence:** real exported packs and validation failures. **Do not:** add a separate orchestration service or delegate work under this execution policy.

### EC-R19 — Bounded batch execution and controlled workflow runner

**Depends on:** EC-R18. **Wave:** W4. **Feature:** F12 plus F10 execution.

**UI work:** selected rows, resolved preview, actual output/errors, explicit call plan, Preview one/Run selected, cancellation, retry selected, manual checkpoints.

**Behavior:** bounded tool-free generation where supported, immutable source data, forward result bindings, per-run route receipt, exact selected retry scope.

**Acceptance:** mixed-success fixtures preserve success and retry one failure; real provider acceptance is open unless explicitly authorized and available; checkpoint cannot be silently skipped.

**Evidence:** run receipts, output export, limit/cancel tests. **Do not:** execute imported shell/code/tools or overwrite source rows.

### EC-R20 — Compare and evidence-linked experiment notebook

**Depends on:** EC-R19. **Wave:** W4. **Feature:** F13.

**UI work:** compact candidate/case matrix, real result/error details, hypothesis, pinned evidence, and reviewed conclusion.

**Behavior:** bounded call count, real usage/latency or Unknown, deterministic checks, explicitly separately authorized evaluator, no universal ranking score.

**Acceptance:** every visible output has provenance; no fixture labelled live; cancelled/failed runs remain evidence; retry is selected and explicit.

**Evidence:** notebook export linking to actual run IDs and fixture/live labels. **Do not:** use a hidden judge, fallback model, or delegated evaluator.

### EC-R21 — Voice-to-brief, protected localization, and reviewed learning

**Depends on:** EC-R20. **Wave:** W4. **Features:** F14/F17/F18.

**UI work:** purpose-aware voice menu; proposed-clause tray; correction review; language/glossary segments; per-recipe feedback and version-diff approval.

**Behavior:** approved-only persistence, owner-bound spoken edits, exact-term/code protection, immutable translation source, feedback changes nothing until approval.

**Acceptance:** another chat never receives the spoken update; a locked clause survives; translation preserves literal tokens; feedback approval creates a reversible new version.

**Evidence:** local interaction fixtures and actual authorized microphone/provider validation as separate gates. **Do not:** create global personality/memory writes or run forbidden voice routes.

### EC-R22 — Whole-product parity, visual finish, packaging, and acceptance handoff

**Depends on:** EC-R21. **Wave:** W4. **Surfaces:** S01–S11.

**UI work:** inspect every implemented surface, not just the landing editor. Recheck actual user container widths, both themes, long content, open overlays, keyboard paths, and icon consistency. Apply one coordinated material correction pass.

**Functional work:** run lean regression/build/lint; verify generated ESM against actual SDK; package allowlisted source; verify integrity and contents. Report every incomplete feature or host seam.

**Acceptance:** no rejected-pattern regressions; all old functions accounted for; all proposed features either proven at their approved scope or explicitly open—not silently omitted. User sees the rendered result before live installation is considered.

**Evidence:** surface/state matrix, actual screenshots, test results, package/source hashes, and a concise gap list. **Do not:** mark release complete because fixtures pass, install without approval, or push/publish.

### 18.3 Deliberate gates, not a bureaucratic obstacle course

The cards are detailed so an agent cannot reinterpret “better UI” into a tab wall. They do not require a huge suite or a review agent for every checkbox. Use coherent vertical slices, reuse the same evidence, and stop for the user at the major visual gate. A failed essential seam is a genuine blocker; an arbitrary test-count target is not.

---

## 19. Agent execution contract and handoff

### 19.1 Exact execution restrictions carried forward

```text
Assigned profile: nous-agent
Provider: nous
Model: tencent/hy4-flash:free
Codex: forbidden
Delegation: forbidden
Fallback: forbidden
```

These restrictions govern the implementing worker and all its auxiliary inference. They do not grant permission to remove existing product integrations. No Codex CLI, Codex provider, proxy to Codex, delegated coding agent, MoA/swarm, alternate reviewer model, or model-judge goal loop.

Before creating cards, verify that the exact route remains available and the profile/card settings match. If it is unavailable, block honestly. Do not substitute a different model or silently change the product scope.

### 19.2 Copy into every future card

> Work only within the approved workspace from the preserved original Composer baseline. Read this redesign review specification and your exact card scope. Preserve every predecessor's valid work and all existing user data. Do not use the rejected workbench layout or install it again. Report actual provider/model, task pins, fallback none, delegation off, baseline, scope, changed files, checks, visual evidence, failures, limitations, and the actual slice commit SHA in start/finish callbacks as applicable. Commit each completed slice's scoped changes after required checks, before marking it complete. No pushes, runtime installation, restart, external publication, paid inference, microphone activation, new tasks, or destructive cleanup without separate authorization. If blocked, preserve partial work and name the exact missing seam. Do not substitute a plausible stub or fixture for a required real integration. Keep source, UI, live integration, and user approval as separate completion gates.

### 19.3 Future card body template

```markdown
# [EC-Rxx] Specific user-visible outcome

## Approved authority
- Specification version/path and attached references:
- Approved baseline/workspace/branch:
- Exact predecessor task IDs:
- Assigned profile/provider/model:
- No Codex; no delegation; no fallback.

## User journey and scope
- Entry:
- User steps:
- Result and return path:
- Included surfaces/features:
- Explicit exclusions:

## UI contract
- Region hierarchy and geometry:
- Fields, buttons, menu items, icons and labels:
- Default/selected/disabled/busy/error/empty states:
- Narrow/short-height/zoom transformation:
- Keyboard, focus return, tooltip and screen-reader behavior:
- Exact requirements copied from the approved spec:

## Behavior and ownership
- Captured owner/revision:
- Local versus model operations:
- Data disclosure and persistence:
- Cancellation, stale state, migration and rollback:

## Acceptance
- Concrete Given/When/Then checks:
- Actual visual evidence required:
- Existing behavior preserved:
- Required integration gates and known limitations:

## Verification and callback
- Lean tests/build commands selected from the actual repository:
- Real outputs, screenshots and artifacts:
- Start and finish route/scope receipts:
- Completion state: source / local / rendered / live / user accepted:

## Permission boundaries
- Explicitly authorized actions:
- Actions requiring approval:
- Block rather than change scope/provider:
```

### 19.4 Where the next agent should begin

After approval and actual card creation: EC-R00, then EC-R01, then the W1 vertical slice. Do not generate all advanced panels first. Do not install a source-verified but visually rejected build merely because a package exists.

The user's screenshot and direct feedback outrank a source-only claim that the interface is good. If the user rejects the composition, revisit the composition—not only colors and border radii.

---

### 19.5 Mandatory commit per slice

- Once a slice is authorized to run, its local scoped commit is required before the card may be completed. This applies to product work and meaningful preflight/review documentation.
- Check the actual repository host and author first. GitHub commits use `Zero2 <deadtrix21@users.noreply.github.com>`; do not inherit a work identity or change global identity settings.
- Stage only the slice's reviewed source, generated output, tests, and agreed evidence/documentation. Do not sweep unrelated dirty work into the commit.
- Run the required lean checks; review the scoped diff and secret exposure; create a clear slice-labelled commit such as `feat(composer): EC-R04 add inline brief preparation`.
- Read back the actual commit SHA, parent, changed-file list, and working-tree state. Include them, checks and limitations in the finish callback and card metadata.
- A predecessor's commit is the recorded starting point for the next slice. Never reset or silently replace it.
- Failed required checks or an incomplete required workflow block completion. Preserve partial work and report the blocker; do not create an empty or misleading success commit to satisfy the rule.
- No empty ceremonial commits. A documentation/review slice commits its real findings/decision record. If a slice truly requires no changes, report the existing verified SHA and request a no-op disposition instead of claiming a new commit.
- Local commits do not authorize pushing, merging, deployment or installation. Future implementation pushes require separate approval. Importing these blocked cards starts no work and therefore creates no implementation commits.

## 20. Approval checklist

This is the review boundary. Approval of this Markdown's direction is not automatically permission for every destructive or external action listed elsewhere.

### Product and UI

- [ ] Keep the original Composer as the behavioral and source baseline.
- [ ] Retire the rejected feature-tab architecture; preserve an archive rather than destroy recovery options.
- [ ] Accept the writing-centred workspace and compact native rail direction.
- [ ] Accept the complete icon redraw and actual-size icon review.
- [ ] Preserve every old action and configuration capability.
- [ ] Agree that advanced workflows are contextual tools, not permanent feature tabs.
- [ ] Review the proposed future features F01–F21 and identify anything to add/change/remove.
- [ ] Require a real W1 visual acceptance gate before the large roadmap expands.

### Execution, separately

- [ ] Authorize restoration of the original live Composer, if desired.
- [ ] Approve creation of the detailed new Kanban card set.
- [ ] Confirm the exact implementing agent route/restrictions.
- [ ] Authorize implementation in a new original-baseline workspace.
- [ ] Authorize any live installation only after reviewing the rendered result.
- [ ] Authorize provider/microphone or paid testing separately where needed.

### Final direction in one sentence

**Keep the old Composer's useful capabilities, replace the failed interface approach completely, and build a powerful writing and briefing environment whose complexity appears only when the user's work needs it.**
