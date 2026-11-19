import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const pluginPath = fileURLToPath(new URL('../../desktop/plugin.js', import.meta.url))
const source = await readFile(pluginPath, 'utf8')
function between(a, b) { const start = source.indexOf(a), end = source.indexOf(b); assert.ok(start >= 0 && end > start, `markers ${a}`); return source.slice(start + a.length, end) }

function iconRuntime() {
  const jsx = (type, props) => ({ type, props })
  const fragment = between('/* ICON_FAMILY_START */', '/* ICON_FAMILY_END */')
  return new Function('jsx', `${fragment};return {COMPOSER_ICONS,COMPOSER_ICON_IDS,ComposerIcon,railTierForWidth,railPlacements,normalizeRailLayoutVersion,RAIL_LAYOUT_STORAGE_KEY,MENU_ROW_CLASS}`)(jsx)
}

test('icon family registry is the complete I01-I36 catalogue with names and paths', () => {
  const { COMPOSER_ICONS, COMPOSER_ICON_IDS } = iconRuntime()
  assert.deepEqual(COMPOSER_ICON_IDS, Array.from({ length: 36 }, (_, i) => `I${String(i + 1).padStart(2, '0')}`))
  for (const id of COMPOSER_ICON_IDS) {
    const entry = COMPOSER_ICONS[id]
    assert.ok(entry.name && entry.name.length > 0, `${id} name`)
    assert.ok(Array.isArray(entry.paths) && entry.paths.length > 0 && entry.paths.every(d => typeof d === 'string' && d.length > 0), `${id} paths`)
  }
})

test('icons follow the drawing contract: 24 viewBox, 1.75 round stroke, currentColor, decorative', () => {
  const { ComposerIcon, COMPOSER_ICON_IDS } = iconRuntime()
  for (const id of COMPOSER_ICON_IDS) {
    const node = ComposerIcon({ icon: id, size: 16 })
    assert.equal(node.type, 'svg')
    assert.equal(node.props.viewBox, '0 0 24 24')
    assert.equal(node.props.width, 16)
    assert.equal(node.props.height, 16)
    assert.equal(node.props['aria-hidden'], true)
    if (id === 'I29') { assert.equal(node.props.fill, 'currentColor'); assert.equal(node.props.stroke, 'none') }
    else { assert.equal(node.props.stroke, 'currentColor'); assert.equal(node.props.fill, 'none'); assert.equal(node.props.strokeWidth, 1.75); assert.equal(node.props.strokeLinecap, 'round'); assert.equal(node.props.strokeLinejoin, 'round') }
    assert.ok(node.props.children.length > 0)
  }
  assert.equal(ComposerIcon({ icon: 'I99' }), null)
})

test('no hard-coded palette anywhere in the icon family; only the stop square is filled', () => {
  const { COMPOSER_ICONS } = iconRuntime()
  const text = JSON.stringify(COMPOSER_ICONS)
  assert.doesNotMatch(text, /#[0-9a-f]{3,8}\b|rgb\(|rgba\(|hsl\(/i)
  const filled = Object.entries(COMPOSER_ICONS).filter(([, entry]) => entry.fill)
  assert.deepEqual(filled.map(([id]) => id), ['I29'])
  assert.equal(filled[0][1].fill, 'currentColor')
})

test('Undo is a turning arrow, never destructive discard geometry', () => {
  const { COMPOSER_ICONS } = iconRuntime()
  const undo = COMPOSER_ICONS.I08
  assert.ok(undo.paths.includes('M8 5L4 9l4 4'), 'clear single arrowhead')
  assert.ok(undo.paths.some(d => d.startsWith('M4 9h11a5 5')), 'left-turning arrow body')
  assert.doesNotMatch(JSON.stringify(undo), /trash|discard|M10 11v6|M14 11v6/i)
  assert.deepEqual(COMPOSER_ICONS.I09.paths, ['M20 9H9a5 5 0 0 0 0 10h4', 'M16 5l4 4-4 4'], 'Redo mirrors Undo')
})

test('overflow tiers follow container width, not monitor width', () => {
  const { railTierForWidth } = iconRuntime()
  assert.equal(railTierForWidth(1200), 0)
  assert.equal(railTierForWidth(250), 0)
  assert.equal(railTierForWidth(249), 1)
  assert.equal(railTierForWidth(185), 1)
  assert.equal(railTierForWidth(184), 2)
  assert.equal(railTierForWidth(0), 2)
})

const allVisible = Object.fromEntries(['voice', 'voice-mode', 'prompt-library', 'draft-shelf', 'review', 'enhance', 'undo', 'redo', 'settings'].map(id => [id, true]))

test('new default rail is Library/Compose/Improve/Voice/More with secondary actions in More', () => {
  const { railPlacements } = iconRuntime()
  const { rail, more } = railPlacements({ visibility: allVisible, version: 2, tier: 0, voiceActive: false })
  assert.deepEqual(rail, ['library', 'compose', 'improve', 'voice', 'more'])
  for (const key of ['undo', 'redo', 'save-draft', 'voice-mode', 'customize-bar', 'settings']) assert.ok(more.includes(key), key)
  for (const key of ['library', 'compose', 'voice-start']) assert.ok(!more.includes(key), key)
})

test('narrow tiers move Library then Compose/Voice into More; active voice keeps Mute/End reachable', () => {
  const { railPlacements } = iconRuntime()
  const tier1 = railPlacements({ visibility: allVisible, version: 2, tier: 1, voiceActive: false })
  assert.deepEqual(tier1.rail, ['compose', 'improve', 'voice', 'more'])
  assert.ok(tier1.more.includes('library'))
  const tier2 = railPlacements({ visibility: allVisible, version: 2, tier: 2, voiceActive: false })
  assert.deepEqual(tier2.rail, ['improve', 'more'])
  assert.ok(tier2.more.includes('library') && tier2.more.includes('compose') && tier2.more.includes('voice-start'))
  const active = railPlacements({ visibility: allVisible, version: 2, tier: 2, voiceActive: true })
  assert.ok(active.rail.includes('voice-capsule'), 'active capsule stays in the rail at every tier')
  assert.ok(!active.more.includes('voice-start'))
})

test('legacy visibility is honored until the user chooses the new default; choice never rewrites old storage', () => {
  const { railPlacements, normalizeRailLayoutVersion, RAIL_LAYOUT_STORAGE_KEY } = iconRuntime()
  const hiddenLibrary = { ...allVisible, 'prompt-library': false, enhance: false, review: true, undo: false }
  for (const version of [0, 1]) {
    const { rail, more } = railPlacements({ visibility: hiddenLibrary, version, tier: 0, voiceActive: false })
    assert.ok(!rail.includes('library'), 'hidden library stays hidden')
    assert.ok(rail.includes('improve'), 'review-only visibility still exposes Improve')
    assert.ok(!more.includes('undo'), 'hidden undo stays hidden')
    assert.ok(!more.includes('library'))
  }
  const migrated = railPlacements({ visibility: hiddenLibrary, version: 2, tier: 0, voiceActive: false })
  assert.ok(migrated.rail.includes('library'), 'explicit new-default choice restores the standard rail')
  assert.equal(normalizeRailLayoutVersion(2), 2)
  assert.equal(normalizeRailLayoutVersion(1), 1)
  for (const value of [0, undefined, null, 'x', 3]) assert.equal(normalizeRailLayoutVersion(value), 0)
  assert.equal(RAIL_LAYOUT_STORAGE_KEY, 'rail-layout-version', 'layout choice uses its own key, not composer-control-visibility')
})

test('rail menus keep real operations, helper disclosure, focus return, and no host DOM scraping', () => {
  const actions = between('/* COMPOSER_ACTIONS_START */', '/* COMPOSER_ACTIONS_END */')
  for (const token of ['Improve with recipe', 'Review changes before applying', 'Built-in recipes', 'Uses helper model', 'Nothing is sent to chat.', 'More actions', 'Undo enhancement', 'Redo enhancement', 'Save draft', 'Customize bar', 'Composer settings', 'Nothing to undo yet', 'Nothing to redo yet', 'Back to actions', 'Compose · open the Composer workspace']) assert.ok(actions.includes(token), token)
  assert.ok(actions.includes("triggerRef.current?.focus()"), 'menus return focus to their trigger')
  assert.doesNotMatch(actions, /document\.querySelector|document\.addEventListener|execCommand/)
  assert.ok(actions.includes('ResizeObserver'), 'adaptive overflow measures the plugin-owned rail container')
  assert.ok(actions.includes('runBuiltin'), 'built-in recipes enhance without changing the active selection')
  const builtin = actions.slice(actions.indexOf('const runBuiltin'), actions.indexOf('const label='))
  assert.doesNotMatch(builtin, /prompt\.select|activePromptId\s*=/, 'built-ins must not rewrite the selected recipe')
})
