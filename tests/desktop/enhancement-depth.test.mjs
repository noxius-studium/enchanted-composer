import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { runtime, storage } from './runtime-helper.mjs'

const pluginPath = fileURLToPath(new URL('../../desktop/plugin.js', import.meta.url))
const source = await readFile(pluginPath, 'utf8')
function between(a, b) { const start = source.indexOf(a), end = source.indexOf(b); assert.ok(start >= 0 && end > start, `markers ${a}`); return source.slice(start + a.length, end) }

function engine() {
  const reviewSrc = between('/* ENHANCEMENT_REVIEW_START */', '/* ENHANCEMENT_REVIEW_END */')
  const enhancerSrc = between('/* PROMPT_ENHANCER_START */', '/* PROMPT_ENHANCER_END */')
  const env = { bounded: (v, l = 8192) => typeof v === 'string' ? v.trim().slice(0, l) : '', publicError: e => (e && e.message) || 'error', now: () => Date.now(), host: {} }
  return new Function(...Object.keys(env), `${reviewSrc}\n${enhancerSrc}\nreturn {EnhancementReview,PromptEnhancer}`)(...Object.values(env))
}
const owner = { connectionId: 'local', profile: 'default', runtimeSessionId: 'draft:composer', storedSessionId: 'stored' }
function harness({ reply = 'rewritten text', defer = false } = {}) {
  const { EnhancementReview, PromptEnhancer } = engine()
  let text = 'Write a summary. Do not deploy. Count 3 items.'
  const surface = { surfaceId: 'composer', editor: 'e1' }
  let resolveReply = null
  const replyPromise = defer ? new Promise(r => { resolveReply = r }) : null
  const draft = { capture: () => surface, read: async () => text, replace: async next => { text = next }, insert: async t => { text += t } }
  const ownerRouter = { capture: async () => owner, request: async () => defer ? replyPromise : { text: reply } }
  const api = { rest: async () => defer ? replyPromise : { text: reply } }
  const review = new EnhancementReview()
  const enhancer = new PromptEnhancer({ draftAdapter: draft, ownerRouter, api, review })
  return { enhancer, review, surface, getText: () => text, setText: t => { text = t }, resolveReply: v => resolveReply(v) }
}
const prompt = { id: 'clarify', name: 'Clarify', body: 'Clarify.' }

test('change groups carry inferred labels; attention changes sort first without breaking positional compose', () => {
  const { review } = harness()
  const original = 'Write a summary. Do not deploy. Count 3 items.'
  const proposed = 'Compose a summary. Count 4 items.'
  const proposal = review.create({ owner, surface: { surfaceId: 'composer' }, original, prompt, route: { kind: 'session' }, proposed })
  assert.equal(proposal.mode, 'groups')
  const kinds = proposal.groups.map(g => g.kind)
  assert.ok(kinds.includes('restriction-removed'), 'removed restriction detected')
  assert.ok(kinds.includes('identifier-changed'), 'changed number detected')
  assert.ok(kinds.includes('reworded'), 'wording change detected')
  for (const g of proposal.groups) assert.ok(typeof g.label === 'string' && g.label.length > 0)
  const attention = proposal.groups.filter(g => g.attention).map(g => g.id)
  assert.ok(attention.length >= 2)
  assert.deepEqual(proposal.reviewOrder.slice(0, attention.length).sort(), attention.sort(), 'attention-first display order')
  const reworded = proposal.groups.find(g => g.kind === 'reworded')
  const composed = review.compose(proposal, [reworded.id])
  assert.equal(composed, 'Compose a summary. Do not deploy. Count 3 items.', 'selective compose stays positional regardless of display order')
  assert.ok(Object.isFrozen(proposal) && Object.isFrozen(proposal.groups[0]))
})

test('cancellation discards the pending result before any write and leaves history untouched', async () => {
  const f = harness({ defer: true })
  const pending = f.enhancer.enhance(owner, prompt, null)
  await new Promise(r => setTimeout(r, 0))
  f.enhancer.cancelPending(owner)
  f.resolveReply({ text: 'late result' })
  await assert.rejects(pending, /cancelled/i)
  assert.equal(f.getText(), 'Write a summary. Do not deploy. Count 3 items.', 'draft untouched')
  const status = await f.enhancer.status(owner)
  assert.equal(status.canUndo, false)
  assert.equal(status.busy, false)
})

test('history records operations and timestamps; restore is guarded against draft drift and uses no inference', async () => {
  const f = harness({ reply: 'first rewrite' })
  await f.enhancer.enhance(owner, prompt, null)
  f.setText('first rewrite')
  const second = harness({ reply: 'second rewrite' })
  // reuse same enhancer with a new reply by swapping the router result
  f.enhancer.ownerRouter.request = async () => ({ text: 'second rewrite' })
  await f.enhancer.enhance(owner, prompt, null)
  const snap = await f.enhancer.historyFor(owner)
  assert.equal(snap.entries.length, 3)
  assert.deepEqual(snap.entries.map(e => e.op), ['Original', 'Enhancement', 'Enhancement'])
  assert.ok(snap.entries.every(e => typeof e.at === 'number'))
  assert.equal(snap.entries[2].current, true)
  assert.equal(await f.enhancer.undoFor(owner), true)
  assert.equal(f.getText(), 'first rewrite')
  assert.equal(await f.enhancer.restoreTo(owner, 0), true)
  assert.equal(f.getText(), 'Write a summary. Do not deploy. Count 3 items.')
  f.setText('manual edit after history')
  assert.equal(await f.enhancer.restoreTo(owner, 2), false, 'drifted draft refuses restore')
  const stale = await f.enhancer.historyFor(owner)
  assert.equal(stale.stale, true)
  void second
})

test('selective review apply records a Review apply entry and preserves unrelated text', async () => {
  const f = harness({ reply: 'Compose a summary. Count 4 items.' })
  const proposal = await f.enhancer.propose(owner, prompt, null)
  const reworded = proposal.groups.find(g => g.kind === 'reworded')
  const applied = await f.enhancer.applyProposal(proposal, { selectedGroupIds: [reworded.id], owner })
  assert.equal(applied, 'Compose a summary. Do not deploy. Count 3 items.')
  const snap = await f.enhancer.historyFor(owner)
  assert.equal(snap.entries.at(-1).op, 'Review apply')
})

test('controller defaults to review, persists the choice locally, and exposes history/cancel seams', () => {
  const r = runtime(), mem = storage(), controller = r.createController({ storage: mem, rest: async () => ({ ok: true }) })
  assert.equal(controller.enhancementApplyMode, 'review', 'new users default to review')
  let seen = null
  const unsub = controller.subscribeEnhancementApplyMode(v => { seen = v })
  controller.setEnhancementApplyMode('immediate')
  assert.equal(seen, 'immediate')
  assert.equal(mem.get('enhancement-apply-mode'), 'immediate')
  assert.throws(() => controller.setEnhancementApplyMode('sometimes'), /review or immediate/)
  unsub()
  let historySeen = null
  controller.subscribeHistory(v => { historySeen = v })
  controller.setHistoryOpen(true)
  assert.equal(historySeen, true)
  assert.equal(typeof controller.cancelEnhancement, 'function')
  const legacy = runtime().createController({ storage: storage({ 'enhancement-apply-mode': 'immediate' }), rest: async () => ({ ok: true }) })
  assert.equal(legacy.enhancementApplyMode, 'immediate', 'existing immediate preference is preserved')
})

test('review and history UI keep the required states, honest labels, and focus-safe copy', () => {
  const actions = between('/* COMPOSER_ACTIONS_START */', '/* COMPOSER_ACTIONS_END */')
  for (const token of ['Proposed', 'Changes', 'Original', 'Your draft changed. Compare before applying.', 'Copy proposal', 'Compare', 'Cancel', 'inferred from the diff, not semantic analysis', 'Preview recomputes the actual combination', 'Cancel enhancement', 'Enhancement history', 'In-memory history for this draft', 'Restore', 'needs attention', 'Apply selected', 'Apply all', 'Keep original']) assert.ok(actions.includes(token), token)
  assert.ok(actions.includes("'aria-label':'Proposed draft'"))
  assert.doesNotMatch(actions, /AI-safe|perfect prompt|fully verified/i)
})
