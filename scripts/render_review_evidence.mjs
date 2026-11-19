// EC-R03 evidence: execute the real review engine journey (no model calls; a
// scripted reply stands in for the helper and is labelled as such) and render
// a labelled review-views geometry fixture. Live-host acceptance stays open.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const source = await readFile(`${root}desktop/plugin.js`, 'utf8')
const between = (a, b) => { const s = source.indexOf(a), e = source.indexOf(b); if (s < 0 || e < 0) throw new Error('markers'); return source.slice(s + a.length, e) }
const env = { bounded: (v, l = 8192) => typeof v === 'string' ? v.trim().slice(0, l) : '', publicError: e => (e && e.message) || 'error', now: () => Date.now(), host: {} }
const { EnhancementReview, PromptEnhancer } = new Function(...Object.keys(env), `${between('/* ENHANCEMENT_REVIEW_START */', '/* ENHANCEMENT_REVIEW_END */')}\n${between('/* PROMPT_ENHANCER_START */', '/* PROMPT_ENHANCER_END */')}\nreturn {EnhancementReview,PromptEnhancer}`)(...Object.values(env))

const owner = { connectionId: 'local', profile: 'default', runtimeSessionId: 'draft:composer', storedSessionId: 'stored' }
const original = 'Write a summary. Do not deploy. Count 3 items.'
const scriptedReply = 'Compose a summary. Count 4 items.'
let text = original
const surface = { surfaceId: 'composer', editor: 'fixture' }
const draft = { capture: () => surface, read: async () => text, replace: async next => { text = next }, insert: async t => { text += t } }
const ownerRouter = { capture: async () => owner, request: async () => ({ text: scriptedReply }) }
const review = new EnhancementReview()
const enhancer = new PromptEnhancer({ draftAdapter: draft, ownerRouter, api: {}, review })
const prompt = { id: 'clarify', name: 'Clarify', body: 'Clarify.' }

const receipt = { fixture: true, helper_reply: 'scripted stand-in, not a live model call', steps: [] }
const proposal = await enhancer.propose(owner, prompt, null)
receipt.steps.push({ step: 'propose', groups: proposal.groups.map(g => ({ id: g.id, kind: g.kind, label: g.label, attention: g.attention })), reviewOrder: proposal.reviewOrder })
const reworded = proposal.groups.find(g => g.kind === 'reworded')
const applied = await enhancer.applyProposal(proposal, { selectedGroupIds: [reworded.id], owner })
receipt.steps.push({ step: 'apply-selected (reworded only)', draft: applied, preserved: ['Do not deploy.', 'Count 3 items.'] })
const snap = await enhancer.historyFor(owner)
receipt.steps.push({ step: 'history', entries: snap.entries.map(e => ({ op: e.op, current: e.current })) })
await enhancer.undoFor(owner)
receipt.steps.push({ step: 'undo', draft: text })
await enhancer.restoreTo(owner, 1)
receipt.steps.push({ step: 'restore-to-applied', draft: text })
await mkdir(`${root}docs/plans/composer-redesign/evidence/EC-R03`, { recursive: true })
await writeFile(`${root}docs/plans/composer-redesign/evidence/EC-R03/review-journey-receipt.json`, JSON.stringify(receipt, null, 2) + '\n')

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const fg = '#1c1e21', bg = '#ffffff', chip = '#eef1f4', stroke = '#d7dade'
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="360" font-family="system-ui,sans-serif"><rect width="100%" height="100%" fill="#fafafa"/>`
svg += `<text x="20" y="26" font-size="14" font-weight="600" fill="${fg}">Review views (EC-R03 geometry fixture — not live-host acceptance)</text>`
svg += `<text x="20" y="44" font-size="9" fill="#5c6166">Scripted helper reply; marks use the host active-selection token in the product. Attention rows carry text labels, never color alone.</text>`
const panel = (x, title) => { svg += `<rect x="${x}" y="60" width="230" height="280" rx="8" fill="${bg}" stroke="${stroke}"/><text x="${x + 12}" y="82" font-size="11" font-weight="600" fill="${fg}">${title}</text>` }
panel(20, 'Proposed (selected changes marked)')
svg += `<rect x="32" y="96" width="206" height="60" rx="4" fill="${chip}"/><text x="40" y="114" font-size="9" fill="${fg}">Compose a summary. Do not</text><text x="40" y="128" font-size="9" fill="${fg}">deploy. Count 3 items.</text>`
svg += `<rect x="40" y="104" width="52" height="12" fill="none" stroke="${fg}" stroke-dasharray="2 2"/><text x="32" y="176" font-size="8" fill="#5c6166">Preview recomputes the actual</text><text x="32" y="188" font-size="8" fill="#5c6166">combination of selected changes.</text>`
svg += `<rect x="32" y="290" width="80" height="22" rx="6" fill="${chip}"/><text x="40" y="305" font-size="9" fill="${fg}">Apply selected</text><rect x="120" y="290" width="56" height="22" rx="6" fill="${chip}"/><text x="128" y="305" font-size="9" fill="${fg}">Apply all</text>`
panel(265, 'Changes (attention first)')
const rows = [['⚠ Removed a restriction', true], ['⚠ Changed a number, path, or identifier', true], ['Reworded passage', false]]
rows.forEach(([label, att], i) => { const y = 96 + i * 52; svg += `<rect x="277" y="${y}" width="206" height="44" rx="4" fill="${bg}" stroke="${stroke}"/><rect x="285" y="${y + 8}" width="10" height="10" fill="${chip}" stroke="${fg}"/><text x="302" y="${y + 17}" font-size="8.5" fill="${fg}">${esc(label)}</text><text x="302" y="${y + 31}" font-size="7.5" fill="#5c6166">${att ? 'needs attention · inferred description' : 'inferred description'}</text>` })
svg += `<text x="277" y="270" font-size="8" fill="#5c6166">Descriptions are inferred from the diff,</text><text x="277" y="282" font-size="8" fill="#5c6166">not semantic analysis.</text>`
panel(510, 'Original')
svg += `<rect x="522" y="96" width="206" height="60" rx="4" fill="${chip}"/><text x="530" y="114" font-size="9" fill="${fg}">Write a summary. Do not</text><text x="530" y="128" font-size="9" fill="${fg}">deploy. Count 3 items.</text>`
svg += `<text x="522" y="176" font-size="8" fill="#5c6166">Stale draft? “Your draft changed.</text><text x="522" y="188" font-size="8" fill="#5c6166">Compare before applying.” with</text><text x="522" y="200" font-size="8" fill="#5c6166">Compare / Copy proposal / Cancel.</text>`
svg += '</svg>'
await writeFile(`${root}docs/plans/composer-redesign/evidence/EC-R03/review-views.svg`, svg)
console.log('EC-R03 evidence written:', JSON.stringify(receipt.steps.map(s => s.step)))
