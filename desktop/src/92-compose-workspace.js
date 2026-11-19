/* COMPOSE_WORKSPACE_START */
// Compose surfaces (SPECIFICATION.md §7.0/§8). Inline and expanded share the
// controller's single brief state. Opening never sends, transmits context, or
// starts inference; Build brief is deterministic; Apply never sends.
function useBrief(controller) {
  const [brief, setBrief] = useState(() => controller.brief)
  useEffect(() => controller.subscribeBrief(setBrief), [controller])
  return brief
}
function useComposeMode(controller) {
  const [mode, setMode] = useState(() => controller.composeMode)
  useEffect(() => controller.subscribeCompose(setMode), [controller])
  return mode
}
function briefActions(controller, setNotice) {
  const change = action => { try { controller.saveBrief(briefChange(controller.brief, action)) } catch (error) { host.notify({ kind: 'error', message: publicError(error) }) } }
  const apply = async () => { try { await controller.applyBriefToDraft(); setNotice('Applied to your draft. Nothing was sent.'); return true } catch (error) { setNotice(publicError(error)); return false } }
  const undo = async () => { try { await controller.undoBriefApply(); setNotice('Undo applied. Your previous draft is back.') } catch (error) { setNotice(publicError(error)) } }
  return { change, apply, undo }
}
function DeliverablePicker({ brief, change, compact = false }) {
  const [query, setQuery] = useState(''), [showAll, setShowAll] = useState(false), [custom, setCustom] = useState('')
  const needle = query.trim().toLowerCase()
  const matches = DELIVERABLES.filter(item => !needle || item.label.toLowerCase().includes(needle))
  const shown = showAll || needle ? matches : matches.slice(0, 3)
  const recommendation = briefRecommendation(brief)
  const [dismissed, setDismissed] = useState(false)
  return jsxs('div', { children: [
    recommendation && !dismissed ? jsxs('div', { className: 'mb-1 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-control-active-background) p-1.5', children: [
      jsxs('p', { children: [jsx('strong', { children: `Suggested: ${DELIVERABLES.find(item => item.id === recommendation.deliverable)?.label}` }), ' — ', recommendation.reason] }),
      jsxs('div', { className: 'mt-1 flex gap-1', children: [
        jsx(Button, { type: 'button', size: 'sm', onClick: () => change({ type: 'deliverable', value: recommendation.deliverable }), children: 'Use this' }),
        jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => setDismissed(true), children: 'Keep my choice' }),
      ] }),
    ] }) : null,
    jsx('input', { type: 'search', value: query, onChange: event => setQuery(event.target.value), placeholder: 'Search deliverables', 'aria-label': 'Search deliverables', className: 'w-full rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-1.5 text-xs text-foreground outline-none focus:border-(--ui-stroke-primary)' }),
    jsx('div', { role: 'listbox', 'aria-label': 'Deliverable choices', className: 'mt-1 space-y-0.5', children: shown.map(item => jsx('button', { type: 'button', role: 'option', 'aria-selected': brief.deliverable === item.id, className: `block w-full rounded-md px-2 py-1.5 text-left text-xs ${brief.deliverable === item.id ? 'bg-(--ui-control-active-background)' : 'hover:bg-(--ui-control-active-background)'}`, onClick: () => change({ type: 'deliverable', value: item.id }), children: item.label }, item.id)) }),
    !showAll && !needle && matches.length > 3 ? jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => setShowAll(true), children: 'Search all' }) : null,
    jsxs('div', { className: 'mt-1 flex gap-1', children: [
      jsx('input', { value: custom, onChange: event => setCustom(event.target.value), placeholder: 'Write my own', 'aria-label': 'Custom deliverable', className: 'min-w-0 flex-1 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-1.5 text-xs text-foreground outline-none focus:border-(--ui-stroke-primary)' }),
      jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: !custom.trim(), onClick: () => { change({ type: 'deliverable', value: 'custom' }); change({ type: 'custom-deliverable', value: custom }) }, children: 'Use' }),
    ] }),
    compact ? null : jsx('p', { className: 'mt-1 text-(--ui-text-tertiary)', children: 'Choosing never sends anything. You can change this later.' }),
  ] })
}
function QuestionBody({ brief, question, change }) {
  const [custom, setCustom] = useState('')
  if (question.id === 'deliverable') return jsx(DeliverablePicker, { brief, change })
  return jsxs('div', { children: [
    jsx('div', { className: 'space-y-0.5', children: question.options.map(option => jsx('button', { type: 'button', className: `block w-full rounded-md px-2 py-1.5 text-left text-xs ${brief.answers[question.id] === option ? 'bg-(--ui-control-active-background)' : 'hover:bg-(--ui-control-active-background)'}`, onClick: () => change({ type: 'answer', id: question.id, value: option }), children: option }, option)) }),
    jsxs('div', { className: 'mt-1 flex gap-1', children: [
      jsx('input', { value: custom, onChange: event => setCustom(event.target.value), placeholder: 'Write my own', 'aria-label': `Custom answer: ${question.prompt}`, className: 'min-w-0 flex-1 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-1.5 text-xs text-foreground outline-none focus:border-(--ui-stroke-primary)' }),
      jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: !custom.trim(), onClick: () => change({ type: 'answer', id: question.id, value: custom }), children: 'Use' }),
    ] }),
    jsxs('div', { className: 'mt-1 flex gap-1', children: [
      jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => change({ type: 'skip', id: question.id }), children: 'Skip' }),
      jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => change({ type: 'answer', id: question.id, value: 'Use default' }), children: 'Use default' }),
    ] }),
  ] })
}
function BriefPreview({ brief, onBack, onApply, onUndo, busy }) {
  const built = buildBrief(brief)
  return jsxs('div', { children: [
    jsx('pre', { className: 'max-h-40 overflow-auto whitespace-pre-wrap rounded border border-(--ui-stroke-secondary) p-1.5 text-(--ui-text-secondary)', 'aria-label': 'Brief preview', children: built.text }),
    jsxs('p', { className: 'mt-1 text-(--ui-text-tertiary)', children: [`Model calls: ${built.modelCalls}`, `Unresolved: ${built.unresolved.length}`, 'Destination: captured native draft', 'Included sources: none yet'].join(' · ') }),
    jsxs('div', { className: 'mt-1 flex flex-wrap gap-1', children: [
      onBack ? jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: onBack, children: 'Back' }) : null,
      jsx(Button, { type: 'button', size: 'sm', disabled: busy || !brief.text.trim(), onClick: onApply, children: 'Apply to draft' }),
      brief.lastApplied ? jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: onUndo, children: 'Undo apply' }) : null,
    ] }),
  ] })
}
function ComposeInlinePanel({ controller }) {
  const mode = useComposeMode(controller), brief = useBrief(controller)
  const [showPreview, setShowPreview] = useState(false), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [tooShort, setTooShort] = useState(false)
  const panelRef = useRef(null)
  const { change, apply, undo } = briefActions(controller, setNotice)
  useEffect(() => {
    const node = panelRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(entries => { const height = entries[0]?.contentRect?.height ?? 0; setTooShort(height > 0 && height < 220) })
    observer.observe(node)
    return () => observer.disconnect()
  }, [mode])
  if (mode !== 'inline') return null
  const open = unresolvedQuestions(brief), question = visibleQuestions(brief)[0]
  const expand = () => { controller.setComposeMode('expanded'); host.navigate('/enchanted-composer') }
  const runApply = async () => { if (busy) return; setBusy(true); await apply(); setBusy(false) }
  return jsx('section', { ref: panelRef, role: 'region', 'aria-label': 'Shape request', className: 'mx-2 mb-1 max-h-[300px] overflow-auto rounded-md border border-(--ui-stroke-secondary) bg-(--ui-background) p-2 text-xs', children: jsxs(Fragment, { children: [
    jsxs('div', { className: 'flex items-center justify-between gap-2', children: [
      jsxs('span', { className: 'flex min-w-0 items-center gap-2', children: [jsx('strong', { children: 'Shape request' }), jsx('span', { className: 'truncate text-(--ui-text-tertiary)', children: open.length ? `${open.length} open question${open.length === 1 ? '' : 's'}` : 'Ready to build' })] }),
      jsxs('span', { className: 'flex shrink-0 gap-1', children: [jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: expand, children: 'Expand' }), jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => controller.closeCompose(), children: 'Close' })] }),
    ] }),
    tooShort ? jsxs('p', { className: 'mt-1 text-(--ui-text-tertiary)', role: 'status', children: ['This pane is too short for inline shaping. ', jsx('button', { type: 'button', className: 'underline', onClick: expand, children: 'Open the expanded workspace' })] }) : null,
    notice ? jsx('p', { className: 'mt-1 text-(--ui-text-secondary)', role: 'status', children: notice }) : null,
    jsxs('div', { className: 'mt-1', children: [
      showPreview ? jsx(BriefPreview, { brief, busy, onBack: () => setShowPreview(false), onApply: runApply, onUndo: undo })
        : question ? jsxs(Fragment, { children: [jsx('p', { className: 'mb-1 font-medium', children: question.prompt }), jsx(QuestionBody, { brief, question, change })] })
          : brief.text.trim() ? jsxs('div', { children: [jsx('p', { className: 'text-(--ui-text-secondary)', children: 'Your request is ready. Build the brief to preview exactly what will be applied.' }), jsx(Button, { type: 'button', size: 'sm', className: 'mt-1', onClick: () => setShowPreview(true), children: 'Build brief' })] })
            : jsxs('div', { children: [jsx('p', { children: 'What do you want to make happen?' }), jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', className: 'mt-1', onClick: expand, children: 'Start writing in the workspace' })] }),
    ] }),
    !showPreview && question && brief.text.trim() ? jsx('div', { className: 'mt-1 border-t border-(--ui-stroke-secondary) pt-1', children: jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => setShowPreview(true), children: 'Build brief' }) }) : null,
  ] }) })
}
function ComposeWorkspace({ controller }) {
  const brief = useBrief(controller)
  const [view, setView] = useState('compose'), [inspector, setInspector] = useState(false), [showPreview, setShowPreview] = useState(false), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(() => controller.ctx.storage.get('compose-saved-briefs', []))
  const editorRef = useRef(null)
  const { change, apply, undo } = briefActions(controller, setNotice)
  const open = unresolvedQuestions(brief)
  const runApply = async () => { if (busy) return; setBusy(true); await apply(); setBusy(false) }
  const persistSaved = list => { controller.ctx.storage.set('compose-saved-briefs', list); setSaved(list) }
  const saveNamed = () => { persistSaved([...saved.filter(item => item.id !== brief.id), validateBrief({ ...brief })]); setNotice('Saved on this device.') }
  const returnToChat = () => { controller.closeCompose(); host.navigate('/') }
  const navButton = (id, label) => jsx('button', { type: 'button', 'aria-selected': view === id, className: `rounded-md px-2 py-1 text-xs ${view === id ? 'bg-(--ui-control-active-background) text-foreground' : 'text-(--ui-text-secondary)'}`, onClick: () => { setView(id); setShowPreview(false) }, children: label }, id)
  const outline = brief.text.length > 400 ? jsxs('div', { className: 'mb-1 rounded-md border border-(--ui-stroke-secondary) p-1.5 text-(--ui-text-tertiary)', 'aria-label': 'Brief outline', children: ['Goal', brief.deliverable ? 'Deliverable' : null, Object.keys(brief.answers).length ? 'Constraints' : null, open.length ? `Unresolved (${open.length})` : null].filter(Boolean).join(' · ') }) : null
  return jsxs('main', { className: 'flex min-h-[420px] flex-col gap-2 p-3 text-xs text-(--ui-text-primary)', 'aria-label': 'Compose workspace', children: [
    jsxs('div', { className: 'flex flex-wrap items-center justify-between gap-2', children: [
      jsxs('div', { role: 'tablist', 'aria-label': 'Compose navigation', className: 'flex gap-1', children: [navButton('compose', 'Compose'), navButton('library', 'Library'), navButton('saved', 'Saved')] }),
      jsxs('div', { className: 'flex gap-1', children: [jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => controller.closeCompose(), children: 'Settings' }), jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: returnToChat, children: 'Return to chat' })] }),
    ] }),
    notice ? jsx('p', { role: 'status', className: 'text-(--ui-text-secondary)', children: notice }) : null,
    view === 'library' ? jsx(PromptLibraryPanel, { controller }) : null,
    view === 'saved' ? jsxs('section', { className: 'flex flex-col gap-2', children: [
      jsxs('div', { className: 'flex items-center justify-between gap-2', children: [jsx('strong', { children: 'Saved briefs' }), jsx(Button, { type: 'button', size: 'sm', onClick: saveNamed, children: 'Save current brief' })] }),
      jsx('p', { className: 'text-(--ui-text-tertiary)', children: 'Named briefs kept on this device. Versions and branches are coming to Saved work.' }),
      !saved.length ? jsx('p', { className: 'text-(--ui-text-tertiary)', children: 'Nothing saved yet. Save the current brief to keep it here.' }) : null,
      jsx('div', { className: 'space-y-1', children: saved.map(item => jsxs('div', { className: 'flex items-center justify-between gap-2 rounded-md border border-(--ui-stroke-secondary) p-2', children: [
        jsxs('span', { className: 'min-w-0', children: [jsx('strong', { className: 'block truncate', children: item.title }), jsx('span', { className: 'text-(--ui-text-tertiary)', children: new Date(item.updatedAt).toLocaleString() })] }),
        jsxs('span', { className: 'flex shrink-0 gap-1', children: [jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => { controller.saveBrief(validateBrief(item)); setView('compose'); setNotice('Opened saved brief.') }, children: 'Open' }), jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => persistSaved(saved.filter(row => row.id !== item.id)), children: 'Delete' })] }),
      ] }, item.id)) }),
    ] }) : null,
    view === 'compose' ? jsxs(Fragment, { children: [
      jsxs('div', { className: 'flex flex-wrap items-center gap-2', children: [
        jsx('input', { value: brief.title, onChange: event => change({ type: 'title', value: event.target.value }), 'aria-label': 'Brief title', className: 'min-w-0 flex-1 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-control-background,transparent) px-2 py-1 text-sm font-medium outline-none focus:border-(--ui-stroke-primary)' }),
        jsx('span', { className: 'text-(--ui-text-tertiary)', children: 'Saved on device' }),
        jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: saveNamed, children: 'Save' }),
      ] }),
      outline,
      !brief.text.trim() && !showPreview ? jsxs('div', { className: 'rounded-md border border-(--ui-stroke-secondary) p-3', children: [
        jsx('p', { className: 'text-sm font-medium', children: 'What do you want to make happen?' }),
        jsx('p', { className: 'mt-1 text-(--ui-text-tertiary)', children: 'Write freely, or shape the request with a few optional questions. Nothing is sent until you choose.' }),
        jsxs('div', { className: 'mt-2 flex flex-wrap gap-1', children: [
          jsx(Button, { type: 'button', size: 'sm', onClick: () => editorRef.current?.focus(), children: 'Start writing' }),
          jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => setInspector(true), children: 'Shape my request' }),
          jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => setView('library'), children: 'Use a saved recipe' }),
        ] }),
      ] }) : null,
      showPreview ? jsx(BriefPreview, { brief, busy, onBack: () => setShowPreview(false), onApply: runApply, onUndo: undo }) : jsxs('div', { className: 'flex min-h-0 flex-1 gap-2', children: [
        jsx('textarea', { ref: editorRef, value: brief.text, onChange: event => change({ type: 'text', value: event.target.value }), 'aria-label': 'Request editor', placeholder: 'Write the request…', className: 'min-h-[240px] min-w-0 flex-1 resize-y rounded-md border border-(--ui-stroke-secondary) bg-(--ui-control-background,transparent) p-2 text-sm leading-6 outline-none focus:border-(--ui-stroke-primary)' }),
        inspector ? jsxs('aside', { className: 'w-64 shrink-0 space-y-2 overflow-auto rounded-md border border-(--ui-stroke-secondary) p-2', 'aria-label': 'Brief inspector', children: [
          jsxs('div', { className: 'flex items-center justify-between gap-2', children: [jsx('strong', { children: 'Inspector' }), jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => setInspector(false), children: 'Close' })] }),
          open.length ? jsxs('div', { children: [jsx('p', { className: 'mb-1 font-medium', children: open[0].prompt }), jsx(QuestionBody, { brief, question: open[0], change })] }) : jsx('p', { className: 'text-(--ui-text-tertiary)', children: 'No open questions. Edit the deliverable any time.' }),
          jsxs('div', { className: 'border-t border-(--ui-stroke-secondary) pt-1 text-(--ui-text-tertiary)', children: [
            jsx('p', { children: `Deliverable: ${DELIVERABLES.find(item => item.id === brief.deliverable)?.label || 'not chosen'}` }),
            ...Object.entries(brief.answers).map(([key, value]) => jsx('p', { children: `${BRIEF_QUESTIONS.find(q => q.id === key)?.prompt || key} ${value}` }, key)),
            brief.skipped.length ? jsx('p', { children: `Skipped: ${brief.skipped.join(', ')}` }) : null,
            jsx('p', { children: `Revision ${brief.revision}` }),
          ] }),
        ] }) : null,
      ] }),
      jsxs('div', { className: 'flex flex-wrap items-center justify-between gap-2 border-t border-(--ui-stroke-secondary) pt-2', children: [
        jsxs('span', { className: 'text-(--ui-text-tertiary)', children: [open.length ? `${open.length} unresolved` : 'No unresolved questions', brief.lastApplied ? ' · applied to draft' : ''].join('') }),
        jsxs('span', { className: 'flex flex-wrap gap-1', children: [
          jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => setInspector(value => !value), children: inspector ? 'Hide inspector' : 'Inspect' }),
          brief.lastApplied ? jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: undo, children: 'Undo apply' }) : null,
          jsx(Button, { type: 'button', size: 'sm', variant: 'ghost', onClick: () => setShowPreview(true), children: 'Preview brief' }),
          jsx(Button, { type: 'button', size: 'sm', disabled: busy || !brief.text.trim(), onClick: runApply, children: 'Apply to draft' }),
        ] }),
      ] }),
    ] }) : null,
  ] })
}
/* COMPOSE_WORKSPACE_END */
