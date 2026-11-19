# W1 visual review packet — EC-R05 (human gate)

**Status: awaiting your visual decision.** Nothing is installed into your live profile. This packet covers W1 slices EC-R00 → EC-R04 plus the cross-cutting durability card EC-X01, on branch `redesign/w1-original-composer` (baseline `feea09c` ancestry preserved).

## 1. What was built (source-complete, locally verified)

| Slice | Commit | Deliverable |
|---|---|---|
| EC-R00 | `988e861` | Preservation report; baseline + renderer hash verified; rejected-build inventory (Windows-only limitation recorded); implementation branch prepared |
| EC-R01 | `12be912` | Interaction inventory S01–S11, host-seam table (verified vs proposed), visual brief, build contract |
| EC-R02 | `4bdc454` | 36-icon Composer family; rail `[Library][Compose][Improve ▾][Voice][More]`; adaptive overflow; grouped More; one-time migration preview (your old visibility stays until you choose) |
| EC-R03 | `a70b4b5` | Improve depth: Proposed/Changes/Original review, attention-first inferred change labels, recomputed selected preview, stale-draft Compare/Copy/Cancel, cancellation, history timeline + guarded restore, review-default preference (immediate preserved) |
| EC-R04 | `6969241` | One brief state: bounded inline "Shape request" panel + expanded editor-dominant workspace (Compose/Library/Saved), zero-inference Build brief, exact preview receipt, guarded Apply/Undo to the captured draft — never sends |
| EC-X01 | `1571ffe` | Host-update durability: seam probe, visible degradation notice, compatibility diagnostics, versioned-storage contract tests, DURABILITY.md recovery |

## 2. Evidence inventory (all labelled; fixtures demonstrate geometry only)

- `evidence/EC-R02/icon-sheet.svg` — all 36 icons at 16/20 px on neutral light/dark surfaces + 28/36/44 px targets, rendered from the shipped registry.
- `evidence/EC-R02/rail-tiers.svg` — wide/narrow/tight overflow tiers; active-voice capsule keeps Mute/End (labelled fixture, not a live call).
- `evidence/EC-R03/review-journey-receipt.json` — **executed** engine journey: propose → apply-selected → history → undo → restore (scripted helper reply, labelled; no live model call).
- `evidence/EC-R03/review-views.svg` — Proposed/Changes/Original geometry with attention rows.
- `evidence/EC-R04/compose-wireframes.svg` — inline panel above the native input + expanded workspace; states covered list.
- `preservation/EC-R00-preservation-report.md`, `inventory/EC-R01-interaction-inventory.md` — source-grounded reports.

## 3. Checks actually run (at `1571ffe`)

- `node --test` desktop + dashboard: **117/117 pass** (incl. executed Compose journey, cancellation, owner-drift refusal, selective apply, durability contract).
- `verify_desktop.mjs`: public imports only, approved areas, public draft API, no `prompt.submit`/`execCommand`.
- `build_desktop.py --check`, `build_dashboard.py --check`: bundles fresh.
- `pytest`: **44 passed** · `ruff`: clean.

## 4. Hard rejection conditions (spec §17.3) — self-audit

| Condition | Status |
|---|---|
| Horizontal feature-tab wall | None — expanded nav is Compose/Library/Saved only; settings is a utility |
| Wallpaper through working text | None — opaque host surfaces (`--ui-background`, `--ui-bg-elevated`) |
| Reduced editor surrounded by badges | Editor is the dominant region; one optional inspector |
| Toolbars wrapping into random rows | Overflow tiers move items into More; no wrap pile |
| Settings controlling the work surface | Settings supports; workspace owns the work |
| Destructive-looking Undo | I08 turning arrow; contract test forbids discard geometry |
| Native control duplicated/removed | Host send/model/attachments/stop untouched |
| Empty placeholder feature buttons | None — every nav item opens a real view; unavailable items explain why |
| Icons unreadable at size | Fixture sheet at 16/20 px; **live-host legibility is yours to judge** |

Theme authority: no hard-coded colors in implementation (test-enforced); all surfaces use Hermes tokens; light/dark follows the host.

## 5. Open gates (honest, not flattened)

1. **Your visual acceptance** — this review. Fixtures are geometry evidence, not live-host renders.
2. **Live-host rendering** at your actual pane width/theme — requires your desktop; inline usable-height contract is measured-or-expanded-fallback until then.
3. **Microphone/provider acceptance** — untouched; needs separate authorization.
4. **Installation into the live profile** — not authorized, not performed.
5. Overflow width thresholds (250/185 px) are proposed targets pending live measurement.

## 6. Decision requested

- **Approve W1 direction** → I continue with EC-R06 (library browsing/editing/recipes/collections) and the W2 chain.
- **Request corrections** → name what fails your eye (composition, density, icons, wording); I revisit the composition, not just colors (spec §19.4), and re-present.
- Anything you reject outright stays rejected; nothing advances past this gate on fixtures alone.
