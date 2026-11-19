import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { runtime, storage } from './runtime-helper.mjs'

const pluginPath = fileURLToPath(new URL('../../desktop/plugin.js', import.meta.url))
const source = await readFile(pluginPath, 'utf8')
function between(a, b) { const start = source.indexOf(a), end = source.indexOf(b); assert.ok(start >= 0 && end > start, `markers ${a}`); return source.slice(start + a.length, end) }
function briefRuntime() {
  const env = { now: () => Date.now(), bounded: (v, l = 8192) => typeof v === 'string' ? v.trim().slice(0, l) : '' }
  return new Function(...Object.keys(env), `${between('/* BRIEF_MODEL_START */', '/* BRIEF_MODEL_END */')}\nreturn {createBrief,validateBrief,briefChange,buildBrief,briefRecommendation,unresolvedQuestions,visibleQuestions,DELIVERABLES,BRIEF_QUESTIONS}`)(...Object.values(env))
}
function chatHost() {
  const box = { text: 'rough idea about a tool' }
  const focus = { owner: { connectionId: 'local', profile: 'default' }, runtime: 'rt-1', stored: 'st-1' }
  const host = {
    state: {
      focusedSessionId: { get: () => focus.runtime, subscribe: () => () => {} },
      focusedStoredSessionId: { get: () => focus.stored, subscribe: () => () => {} },
      focusedSessionOwner: { get: () => focus.owner, subscribe: () => () => {} },
    },
    composer: { getDraft: async () => box.text, setDraft: async (_address, value) => { box.text = value; return true }, insertText: async () => true },
    profileRoutes: async () => [{ connectionId: 'local', profile: 'default', id: 'route-1' }],
    requestProfile: async () => ({}), openSession: async () => {}, notify: () => {}, navigate: () => {},
  }
  return { host, box, focus }
}

test('brief build is deterministic, zero-inference, and inserts no hidden warnings', () => {
  const m = briefRuntime()
  let brief = m.createBrief({ text: 'Ship the report' })
  brief = m.briefChange(brief, { type: 'deliverable', value: 'document' })
  brief = m.briefChange(brief, { type: 'answer', id: 'audience', value: 'My team' })
  brief = m.briefChange(brief, { type: 'skip', id: 'format' })
  const first = m.buildBrief(brief), second = m.buildBrief(brief)
  assert.equal(first.text, second.text, 'deterministic')
  assert.equal(first.modelCalls, 0)
  assert.deepEqual(first.includedSources, [])
  assert.ok(first.text.includes('# Untitled brief') && first.text.includes('Ship the report') && first.text.includes('Finished document') && first.text.includes('My team'))
  assert.ok(first.text.includes('Skipped (use defaults)'))
  assert.ok(first.unresolved.includes('constraints'))
  assert.doesNotMatch(first.text, /Execution boundary|Do not send, publish/, 'no invented constraints inserted into the deliverable')
  assert.throws(() => m.validateBrief({ version: 99 }), /Invalid brief/)
  assert.throws(() => m.briefChange(brief, { type: 'deliverable', value: 'nope' }), /Unknown deliverable/)
})

test('recommendations propose without applying; visible questions cap at three without discarding the rest', () => {
  const m = briefRuntime()
  const brief = m.createBrief({ text: 'Please implement this in another agent' })
  const rec = m.briefRecommendation(brief)
  assert.equal(rec.deliverable, 'plan')
  assert.equal(brief.deliverable, '', 'recommendation never auto-applies')
  assert.equal(m.briefRecommendation(m.briefChange(brief, { type: 'deliverable', value: 'answer' })), null)
  const empty = m.createBrief({})
  assert.equal(m.unresolvedQuestions(empty).length, m.BRIEF_QUESTIONS.length)
  assert.equal(m.visibleQuestions(empty).length, 3)
  const skipped = m.briefChange(empty, { type: 'skip', id: 'audience' })
  assert.ok(!m.unresolvedQuestions(skipped).some(q => q.id === 'audience'))
  const answered = m.briefChange(skipped, { type: 'answer', id: 'audience', value: 'My team' })
  assert.ok(!answered.skipped.includes('audience'), 'answering un-skips')
})

test('full Compose journey: open captured draft, shape, local build, apply, undo — nothing is ever sent', async () => {
  const { host, box, focus } = chatHost()
  const r = runtime({ host }), mem = storage(), controller = r.createController({ storage: mem, rest: async () => ({ ok: true }) })
  assert.equal(controller.composeMode, 'closed')
  await controller.openCompose('inline')
  assert.equal(controller.composeMode, 'inline')
  assert.equal(controller.brief.text, 'rough idea about a tool', 'seeds from the captured native draft without transmitting')
  assert.ok(controller.brief.owner.surfaceId)
  controller.saveBrief(r.briefChange(controller.brief, { type: 'deliverable', value: 'plan' }))
  const built = await controller.applyBriefToDraft()
  assert.equal(built.modelCalls, 0)
  assert.ok(box.text.startsWith('# Untitled brief'))
  assert.ok(box.text.includes('Plan or agent handoff'))
  assert.ok(controller.brief.lastApplied, 'apply recorded for undo')
  assert.equal(await controller.undoBriefApply(), true)
  assert.equal(box.text, 'rough idea about a tool', 'undo restores the exact previous draft')
  assert.equal(controller.brief.lastApplied, null)
  focus.owner = { connectionId: 'local', profile: 'other' }
  await assert.rejects(() => controller.applyBriefToDraft(), /focused chat changed/, 'owner drift refuses apply and keeps the brief')
  assert.ok(controller.brief.text.includes('rough idea'))
  controller.closeCompose()
  assert.equal(controller.composeMode, 'closed')
  assert.ok(controller.brief.text, 'close preserves the brief')
  const reopened = r.createController({ storage: mem, rest: async () => ({ ok: true }) })
  assert.equal(reopened.brief.text, controller.brief.text, 'reopening restores the saved local brief')
  assert.equal(reopened.brief.deliverable, 'plan')
})

test('Compose surfaces keep the bounded inline contract, honest empty state, and no send path', () => {
  const compose = between('/* COMPOSE_WORKSPACE_START */', '/* COMPOSE_WORKSPACE_END */')
  for (const token of ['Shape request', 'What do you want to make happen?', 'Build brief', 'Apply to draft', 'Preview brief', 'Return to chat', 'Nothing was sent', 'Start writing', 'Shape my request', 'Use a saved recipe', 'max-h-[300px]', 'too short for inline shaping', 'Saved on this device', 'Expand', 'Close', 'Search all', 'Write my own', 'Keep my choice', 'Use default', 'Skip', 'Model calls:', 'Destination: captured native draft']) assert.ok(compose.includes(token), token)
  assert.doesNotMatch(compose, /prompt\.submit|composer\.send|execCommand|document\.querySelector/)
  assert.ok(compose.includes('ResizeObserver'), 'inline usable-height is measured, with an expanded fallback offered')
  const actions = between('/* COMPOSER_ACTIONS_START */', '/* COMPOSER_ACTIONS_END */')
  assert.ok(actions.includes("controller.openCompose('inline')"), 'rail Compose opens the bounded inline panel in chat')
  const register = between('/* REGISTER_START */', '/* REGISTER_END */')
  assert.ok(register.includes("id:'compose-inline',area:COMPOSER_AREAS.top"), 'inline panel uses the public top-area seam')
})
