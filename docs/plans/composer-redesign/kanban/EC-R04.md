# EC-R04 — Build one complete writing-centred Compose journey

**Plan key:** `EC-R04` · **Predecessor:** `EC-R03` · **Initial status:** `blocked` · **Target:** `nonconformist-innovation`

## Exact vertical slice

### EC-R04 — Build one complete writing-centred Compose journey

**Depends on:** EC-R03. **Wave:** W1. **Surfaces:** S03/S10.

**UI work:** section 7.0's bounded inline preparation panel plus the slim expanded Compose/Library/Saved shell; title/save/return row; dominant editor; conditional outline; one inspector; clear footer. Inline and expanded share state and preserve the native editor. Build only a complete basic brief journey, not all future panels.

**Journey:** open captured draft → edit freely → choose deliverable → answer or skip relevant questions → local Build brief → inspect exact preview → Apply to captured draft → undo.

**States:** empty, populated, unresolved question, long prose/code, narrow, short window, zoom, reopening saved local view, changed owner.

**Acceptance:** the editor is visually dominant; no feature-tab wall; inline height is bounded and its native input stays reachable; expand/collapse loses no state; local build has zero inference; Apply never sends; returning to chat preserves native state. If the required host seam is unavailable, report that gap rather than silently dropping the inline design.

**Evidence:** full journey with real controls, wide/narrow/light/dark captures, brief/native revision receipt. **Do not:** add empty advanced-tool nav buttons.

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

Add the smallest shared brief state and inline/expanded Compose components supported by the approved SDK. Integrate through the original registration/composition root. Do not import the rejected 92-studio.js or its feature-panel registry wholesale.

## Concrete acceptance scenarios

- [ ] Given an inline brief with answers and a pending candidate, when Expand and return are used, preserve the same owner, revision, values and candidate.
- [ ] Given a short pane, when opening Compose, use the explicitly labelled expanded path rather than hide the native input under an oversized panel.

## Required UI and product contracts — embedded, not optional reading

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
