/* BRIEF_MODEL_START */
// Common brief model (SPECIFICATION.md §8). One state owner for inline and
// expanded Compose. Build brief is deterministic local composition: zero
// inference, no network, no transmission (spec §8.6/§15.5).
const BRIEF_VERSION = 1
const DELIVERABLES = Object.freeze([
  { id: 'answer', label: 'Answer or analysis' },
  { id: 'plan', label: 'Plan or agent handoff' },
  { id: 'code', label: 'Working code or fix' },
  { id: 'document', label: 'Finished document' },
  { id: 'data', label: 'Structured data' },
  { id: 'design', label: 'Design specification' },
  { id: 'workflow', label: 'Repeatable workflow' },
  { id: 'custom', label: 'Custom / Follow my wording' },
])
const BRIEF_QUESTIONS = Object.freeze([
  { id: 'deliverable', prompt: 'What should the result be?', kind: 'deliverable' },
  { id: 'audience', prompt: 'Who is this for?', options: ['Just me', 'My team', 'A customer', 'Another agent'] },
  { id: 'constraints', prompt: 'Any fixed constraints or things to avoid?', options: ['No deployment', 'Keep it short', 'Use existing tools', 'None'] },
  { id: 'format', prompt: 'Required output format?', options: ['Freeform', 'Markdown sections', 'Table', 'JSON', 'Agent handoff'] },
])
function createBrief(seed = {}) {
  return {
    version: BRIEF_VERSION,
    id: typeof seed.id === 'string' && seed.id ? seed.id : `brief-${now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: bounded(seed.title, 128) || 'Untitled brief',
    text: bounded(seed.text, 12000),
    deliverable: DELIVERABLES.some(item => item.id === seed.deliverable) ? seed.deliverable : '',
    customDeliverable: bounded(seed.customDeliverable, 200),
    answers: seed.answers && typeof seed.answers === 'object' && !Array.isArray(seed.answers) ? Object.fromEntries(Object.entries(seed.answers).map(([key, value]) => [bounded(key, 64), bounded(value, 400)])) : {},
    skipped: Array.isArray(seed.skipped) ? seed.skipped.filter(id => BRIEF_QUESTIONS.some(q => q.id === id)) : [],
    revision: Number.isInteger(seed.revision) ? seed.revision : 0,
    createdAt: Number.isFinite(seed.createdAt) ? seed.createdAt : now(),
    updatedAt: now(),
    owner: seed.owner && typeof seed.owner === 'object' ? seed.owner : null,
    sourceText: bounded(seed.sourceText, 12000),
    lastApplied: seed.lastApplied && typeof seed.lastApplied === 'object' ? seed.lastApplied : null,
  }
}
function validateBrief(value) {
  if (!value || typeof value !== 'object' || value.version !== BRIEF_VERSION) throw new Error('Invalid brief.')
  return createBrief(value)
}
function unresolvedQuestions(brief) {
  return BRIEF_QUESTIONS.filter(question => question.id === 'deliverable' ? !brief.deliverable : !(question.id in brief.answers) && !brief.skipped.includes(question.id))
}
// At most three unresolved questions visible at once (spec §8.4); the full
// list stays inspectable — the visible limit never discards requirements.
function visibleQuestions(brief) { return unresolvedQuestions(brief).slice(0, 3) }
function briefRecommendation(brief) {
  if (brief.deliverable) return null
  const text = brief.text.toLowerCase()
  if (/another agent|hand off|handoff|implement this|delegate/.test(text)) return { deliverable: 'plan', reason: 'Your request asks for work another agent can implement.' }
  if (/\b(code|function|bug|fix|script|program|api)\b/.test(text)) return { deliverable: 'code', reason: 'Your request mentions working code.' }
  if (/\b(write|document|report|article|email|post)\b/.test(text)) return { deliverable: 'document', reason: 'Your request asks for finished writing.' }
  return { deliverable: 'answer', reason: 'A direct answer fits this request.' }
}
function briefChange(brief, action) {
  const next = createBrief({ ...brief, revision: brief.revision + 1 })
  if (action.type === 'title') next.title = bounded(action.value, 128) || 'Untitled brief'
  else if (action.type === 'text') next.text = bounded(action.value, 12000)
  else if (action.type === 'deliverable') {
    if (!DELIVERABLES.some(item => item.id === action.value)) throw new Error('Unknown deliverable.')
    next.deliverable = action.value
    if (action.value !== 'custom') next.customDeliverable = ''
  }
  else if (action.type === 'custom-deliverable') next.customDeliverable = bounded(action.value, 200)
  else if (action.type === 'answer') {
    if (!BRIEF_QUESTIONS.some(question => question.id === action.id)) throw new Error('Unknown question.')
    next.answers = { ...brief.answers, [action.id]: bounded(action.value, 400) }
    next.skipped = brief.skipped.filter(id => id !== action.id)
  }
  else if (action.type === 'skip') {
    if (!BRIEF_QUESTIONS.some(question => question.id === action.id)) throw new Error('Unknown question.')
    next.skipped = [...new Set([...brief.skipped, action.id])]
    next.answers = Object.fromEntries(Object.entries(brief.answers).filter(([key]) => key !== action.id))
  }
  else if (action.type === 'source') next.sourceText = bounded(action.value, 12000)
  else if (action.type === 'owner') next.owner = action.value || null
  else if (action.type === 'applied') next.lastApplied = action.value || null
  else throw new Error('Invalid brief change.')
  return next
}
// Deterministic build: approved material only. No inferred content, no hidden
// warnings inserted into the deliverable (spec §8.7), zero model calls.
function buildBrief(brief) {
  const deliverable = DELIVERABLES.find(item => item.id === brief.deliverable)
  const deliverableLabel = brief.deliverable === 'custom' ? (brief.customDeliverable || 'Custom deliverable') : (deliverable ? deliverable.label : 'Not chosen yet')
  const lines = [`# ${brief.title}`, '', '## Goal', brief.text.trim() || '(No request text yet.)', '', '## Deliverable', deliverableLabel]
  for (const question of BRIEF_QUESTIONS.filter(question => question.id !== 'deliverable')) {
    const answer = brief.answers[question.id]
    if (answer) lines.push('', `## ${question.prompt}`, answer)
  }
  const unresolved = unresolvedQuestions(brief)
  if (unresolved.length) lines.push('', '## Unresolved questions', ...unresolved.map(question => `- ${question.prompt}`))
  const skipped = BRIEF_QUESTIONS.filter(question => question.id !== 'deliverable' && brief.skipped.includes(question.id))
  if (skipped.length) lines.push('', '## Skipped (use defaults)', ...skipped.map(question => `- ${question.prompt}`))
  return { text: lines.join('\n').slice(0, 12000), unresolved: unresolved.map(question => question.id), modelCalls: 0, includedSources: [] }
}
/* BRIEF_MODEL_END */
