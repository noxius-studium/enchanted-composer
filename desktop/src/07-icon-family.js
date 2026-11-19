/* ICON_FAMILY_START */
// Composer line-icon family (SPECIFICATION.md §6). Drawing contract §6.2:
// viewBox 0 0 24 24, live area 3–21, stroke 1.75 round caps/joins, single
// foreground via currentColor. Filled shapes limited to the specified stop
// square (I29). No hard-coded colors; Hermes remains the sole theme authority.
const COMPOSER_ICONS = Object.freeze({
  I01: { name: 'Compose', paths: ['M4 5v14h14', 'M4 5h5', 'M15 3l6 6-8 8-4 1 1-4 8-8z'] },
  I02: { name: 'Improve', paths: ['M5 19L14 10', 'M17 3l1.2 2.8L21 7l-2.8 1.2L17 11l-1.2-2.8L13 7l2.8-1.2L17 3z'] },
  I03: { name: 'Library', paths: ['M5 4v16', 'M9 4v16', 'M13 4.5l4 15.5', 'M4 20h16'] },
  I04: { name: 'Voice', paths: ['M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z', 'M6 11a6 6 0 0 0 12 0', 'M12 17v4'] },
  I05: { name: 'Voice muted', paths: ['M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z', 'M6 11a6 6 0 0 0 12 0', 'M12 17v4', 'M4 4l16 16'] },
  I06: { name: 'Voice modes', paths: ['M4 9c1.5-2 3-2 4.5 0', 'M4 15c1.5-2 3-2 4.5 0', 'M15.5 9c1.5-2 3-2 4.5 0', 'M15.5 15c1.5-2 3-2 4.5 0', 'M12 6v12'] },
  I07: { name: 'Review changes', paths: ['M4 5h7', 'M4 9h7', 'M4 13h5', 'M13 11h7', 'M13 15h7', 'M13 19h5', 'M11 9c1 0 1 2 2 2'] },
  I08: { name: 'Undo', paths: ['M4 9h11a5 5 0 0 1 0 10h-4', 'M8 5L4 9l4 4'] },
  I09: { name: 'Redo', paths: ['M20 9H9a5 5 0 0 0 0 10h4', 'M16 5l4 4-4 4'] },
  I10: { name: 'Saved draft', paths: ['M6 3h9l4 4v14H6z', 'M15 3v4h4', 'M10 16v5l2-1.5 2 1.5v-5'] },
  I11: { name: 'History', paths: ['M5 12a7 7 0 1 0 2.5-5.4', 'M4 4v4h4', 'M12 8v4l3 2'] },
  I12: { name: 'Context', paths: ['M4 4h10v12H4z', 'M10 8h10v12H10z', 'M11 12h2'] },
  I13: { name: 'Requirement', paths: ['M6 4H4v16h2', 'M18 4h2v16h-2', 'M8 9h8', 'M8 13h5', 'M17 16a1 1 0 1 0 .01 0'] },
  I14: { name: 'Lock literal', paths: ['M7 11V8a5 5 0 0 1 10 0v3', 'M5 11h14v9H5z', 'M12 14v3'] },
  I15: { name: 'Output format', paths: ['M4 7V4h3', 'M17 4h3v3', 'M20 17v3h-3', 'M7 20H4v-3', 'M8 10h8', 'M8 14h8'] },
  I16: { name: 'Preview', paths: ['M3 5h18v14H3z', 'M6 9h8', 'M14 14c1.5-2 4.5-2 6 0c-1.5 2-4.5 2-6 0z', 'M17 14a.5.5 0 1 0 .01 0'] },
  I17: { name: 'Apply to draft', paths: ['M14 3h5v18h-5', 'M3 12h9', 'M9 8l4 4-4 4'] },
  I18: { name: 'Export', paths: ['M4 15v5h16v-5', 'M12 15V4', 'M8 8l4-4 4 4'] },
  I19: { name: 'Copy', paths: ['M9 8h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z', 'M4 16V5a1 1 0 0 1 1-1h11'] },
  I20: { name: 'Branch', paths: ['M6 7v10', 'M6 12c5 0 9-1 10.5-3.5', 'M6 5a2 2 0 1 0 .01 0', 'M18 7a2 2 0 1 0 .01 0', 'M6 19a2 2 0 1 0 .01 0'] },
  I21: { name: 'Workflow', paths: ['M3 4h6v5H3z', 'M15 4h6v5h-6z', 'M9 15h6v5H9z', 'M9 6.5h6', 'M18 9v3.5a1.5 1.5 0 0 1-1.5 1.5H13.5a1.5 1.5 0 0 0-1.5 1.5V15'] },
  I22: { name: 'Team plan', paths: ['M8 6a2.5 2.5 0 1 0 .01 0', 'M16 6a2.5 2.5 0 1 0 .01 0', 'M5 13h14', 'M5 13v4', 'M19 13v4'] },
  I23: { name: 'Compare', paths: ['M3 4h8v16H3z', 'M13 4h8v16h-8z', 'M5 8h4', 'M5 12h4', 'M15 8h4', 'M15 12h4'] },
  I24: { name: 'Batch', paths: ['M5 4h14v4H5z', 'M5 10h14v4H5z', 'M5 16h14v4H5z', 'M7 6h2'] },
  I25: { name: 'Reference design', paths: ['M3 5h18v14H3z', 'M16 6l3-3 2 2-3 3z'] },
  I26: { name: 'Model route', paths: ['M3 5h6v5H3z', 'M15 14h6v5h-6z', 'M9 7.5h5.5a2 2 0 0 1 2 2V14'] },
  I27: { name: 'Settings', paths: ['M4 6h16', 'M4 12h16', 'M4 18h16', 'M9 6a2 2 0 1 0 .01 0', 'M15 12a2 2 0 1 0 .01 0', 'M7 18a2 2 0 1 0 .01 0'] },
  I28: { name: 'More', paths: ['M5 12a1.2 1.2 0 1 0 .01 0', 'M12 12a1.2 1.2 0 1 0 .01 0', 'M19 12a1.2 1.2 0 1 0 .01 0'] },
  I29: { name: 'Stop', paths: ['M8 8h8v8H8z'], fill: 'currentColor' },
  I30: { name: 'Close', paths: ['M6 6l12 12', 'M18 6L6 18'] },
  I31: { name: 'Search', paths: ['M10.5 4a6.5 6.5 0 1 0 .01 0', 'M15.5 15.5L20 20'] },
  I32: { name: 'Block', paths: ['M4 4h7v7H4z', 'M13 13h7v7h-7z', 'M11 7.5h2', 'M16.5 11v2'] },
  I33: { name: 'Evidence', paths: ['M5 6c-1.5.8-2.5 2.2-2.5 4H5V6z', 'M11 6c-1.5.8-2.5 2.2-2.5 4H11V6z', 'M4 16h16', 'M4 19h10'] },
  I34: { name: 'Feedback', paths: ['M4 4h16v12H9l-5 4z', 'M9 10l2 2 4-4'] },
  I35: { name: 'Language', paths: ['M3 4h8v6H3z', 'M13 14h8v6h-8z', 'M10 12h4', 'M12 10l2 2-2 2'] },
  I36: { name: 'Cost and usage', paths: ['M5 13v7', 'M10 9v11', 'M15 5v15', 'M18 6l1.5 1.5L21.5 5'] },
})
const COMPOSER_ICON_IDS = Object.freeze(Object.keys(COMPOSER_ICONS))
// Decorative by default: the surrounding button supplies the accessible name.
function ComposerIcon({ icon, size = 16, className = '' }) {
  const entry = COMPOSER_ICONS[icon]
  if (!entry) return null
  return jsx('svg', {
    viewBox: '0 0 24 24', width: size, height: size, className,
    fill: entry.fill || 'none', stroke: entry.fill ? 'none' : 'currentColor',
    strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true, focusable: false,
    children: entry.paths.map((d, index) => jsx('path', { d }, index)),
  })
}
// Rail layout contract (SPECIFICATION.md §7.0/§7.1). Pure helpers so tests can
// verify overflow and migration behavior without a DOM.
const RAIL_LAYOUT_STORAGE_KEY = 'rail-layout-version'
function normalizeRailLayoutVersion(value) { return value === 2 ? 2 : value === 1 ? 1 : 0 }
// Proposed width targets (§5.4 container-width rule); verified at implementation.
function railTierForWidth(width) { return width >= 250 ? 0 : width >= 185 ? 1 : 2 }
function railPlacements({ visibility, version, tier, voiceActive }) {
  const legacy = normalizeRailLayoutVersion(version) < 2
  const visible = id => !legacy || visibility[id] !== false
  const improveVisible = !legacy || visibility.enhance !== false || visibility.review !== false
  const rail = [], more = []
  const libraryOn = visible('prompt-library')
  const voiceOn = visible('voice')
  if (libraryOn && tier === 0) rail.push('library'); else if (libraryOn) more.push('library')
  if (tier < 2) rail.push('compose'); else more.push('compose')
  if (improveVisible) rail.push('improve')
  if (voiceActive) rail.push('voice-capsule')
  else if (voiceOn && tier < 2) rail.push('voice')
  else if (voiceOn) more.push('voice-start')
  rail.push('more')
  if (visible('undo')) more.push('undo')
  if (visible('redo')) more.push('redo')
  if (visible('draft-shelf')) more.push('save-draft')
  if (visible('voice-mode')) more.push('voice-mode')
  if (visible('settings')) { more.push('customize-bar'); more.push('settings') }
  return { rail, more }
}
const MENU_ROW_CLASS = 'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-(--ui-text-secondary) hover:bg-(--ui-control-active-background) hover:text-foreground disabled:cursor-default disabled:opacity-45'
const MENU_GROUP_CLASS = 'px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-(--ui-text-tertiary)'
const MENU_NOTE_CLASS = 'border-t border-(--ui-stroke-secondary) px-2 pb-1 pt-2 text-[10px] leading-4 text-(--ui-text-tertiary)'
/* ICON_FAMILY_END */
