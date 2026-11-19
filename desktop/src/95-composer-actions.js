/* COMPOSER_ACTIONS_START */
function useControllerSnapshot(controller) { const [state,setState]=useState(()=>controller.voice.snapshot());useEffect(()=>controller.voice.subscribe(setState),[controller]);return state }
function useInteractionSnapshot(controller) { const [state,setState]=useState(()=>controller.interaction.snapshot());useEffect(()=>controller.interaction.subscribe(setState),[controller]);return state }
function VoiceTranscriptPanel({controller}) {
  const state=useControllerSnapshot(controller)
  if(state.owner&&!controller.ownerRouter.isActive(state.owner))return null
  if(state.state==='idle'&&!state.lastError)return null
  return jsxs('div',{className:'px-2 py-1 text-xs text-(--ui-text-secondary)',children:[
    state.lastError?jsxs('div',{role:'alert',className:'flex items-center gap-2',children:[jsx('span',{children:state.lastError.message}),jsx(Button,{size:'sm',variant:'ghost',onClick:()=>controller.voice.retry().catch(error=>host.notify({kind:'error',message:publicError(error)})),children:'Retry voice'}),jsx(Button,{size:'sm',variant:'ghost',onClick:()=>controller.voice.dismissError(),children:'Dismiss'})]}):null,
    jsxs('details',{children:[jsx('summary',{className:'cursor-pointer text-(--ui-text-tertiary)',children:'Voice captions & connection details'}),jsx('p',{className:'py-1 text-(--ui-text-tertiary)',children:'Temporary captions. Only tool requests and results are saved to chat.'}),jsx('div',{className:'max-h-40 overflow-auto',children:state.transcript.map(item=>jsx('p',{className:'py-1',children:item.kind==='turn'?`${item.role==='user'?'You':'Voice'}: ${item.text}`:item.status},item.id))}),jsx('ul',{className:'max-h-24 overflow-auto text-(--ui-text-tertiary)',children:(state.diagnostics||[]).map((item,index)=>jsx('li',{children:`${item.code} · ${item.message}`},index))})]})]})
}
function VoiceStatusPill({controller}) {
  const state=useControllerSnapshot(controller),interaction=useInteractionSnapshot(controller),active=['connecting','live','reconnecting','ending'].includes(state.state),pushToTalk=interaction.callMode==='push-to-talk'
  const start=()=>controller.startVoice().catch(error=>host.notify({kind:'error',message:publicError(error)}))
  if(!active)return jsx('button',{type:'button',className:ACTION_CLASS,'aria-label':state.state==='error'?'Retry Live Voice':'Start Live Voice',title:state.state==='error'?'Retry Live Voice':'Start Live Voice',onMouseDown:event=>event.preventDefault(),onClick:state.state==='error'?()=>controller.retryVoice().catch(error=>host.notify({kind:'error',message:publicError(error)})):start,children:jsx(ComposerIcon,{icon:'I04',size:16})})
  const pttAction=fn=>fn().catch(error=>host.notify({kind:'error',message:publicError(error)})),keyboardPress=event=>{if(!event.repeat&&['Enter',' '].includes(event.key)){event.preventDefault();pttAction(()=>controller.interaction.press())}},keyboardRelease=event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();pttAction(()=>controller.interaction.release())}}
  const micHandlers=pushToTalk?{onPointerDown:()=>pttAction(()=>controller.interaction.press()),onPointerUp:()=>pttAction(()=>controller.interaction.release()),onPointerCancel:()=>pttAction(()=>controller.interaction.release()),onPointerLeave:()=>pttAction(()=>controller.interaction.release()),onBlur:()=>pttAction(()=>controller.interaction.blur()),onKeyDown:keyboardPress,onKeyUp:keyboardRelease}:{onClick:()=>controller.voice.mute().catch(error=>host.notify({kind:'error',message:publicError(error)}))}
  const micLabel=pushToTalk?(interaction.pressed?'Release to mute':'Hold to talk'):(state.muted?'Unmute Live Voice':'Mute Live Voice')
  return jsxs('div',{className:'inline-flex items-center gap-1 text-xs text-(--ui-text-secondary)',children:[jsx('span',{role:'status',children:state.state==='connecting'?'Connecting…':state.state==='reconnecting'?'Reconnecting…':state.state==='ending'?'Ending…':pushToTalk?(interaction.pressed?'Talking':'Push to talk'):state.muted?'Muted':'Listening'}),jsx('button',{type:'button',className:ACTION_CLASS,disabled:!state.session,'aria-label':micLabel,title:micLabel,...micHandlers,children:jsx(state.muted?icons.MicOff:icons.Mic,{className:'size-3.5','aria-hidden':true})}),jsx('button',{type:'button',className:ACTION_CLASS,disabled:state.state==='ending','aria-label':'End Live Voice · stops provider usage',title:'End Live Voice · stops provider usage',onClick:()=>controller.stopVoice().catch(error=>host.notify({kind:'error',message:publicError(error)})),children:jsx(icons.X,{className:'size-3.5','aria-hidden':true})})]})
}
async function undoEnhancement(controller) { const {owner}=await controller.enhancer.capture();return controller.enhancer.undoFor(owner) }
async function redoEnhancement(controller) { const {owner}=await controller.enhancer.capture();return controller.enhancer.redoFor(owner) }
async function selectedEnhancementPrompt(controller) { const prompt=controller.library.prompts.find(item=>item.id===controller.library.activePromptId);if(!prompt)throw new Error('Choose a prompt first.');return prompt }
async function enhanceDraft(controller) { const {owner}=await controller.enhancer.capture(),prompt=await selectedEnhancementPrompt(controller);return controller.enhancer.enhance(owner,prompt,controller.library.enhanceWith) }
async function proposeEnhancement(controller) { const {owner}=await controller.enhancer.capture(),prompt=await selectedEnhancementPrompt(controller),proposal=await controller.enhancer.propose(owner,prompt,controller.library.enhanceWith);controller.setReviewProposal(proposal);return proposal }
async function applyReviewProposal(controller,proposal,selectedGroupIds) { const {owner}=await controller.enhancer.capture(),applied=await controller.enhancer.applyProposal(proposal,{selectedGroupIds,owner});controller.clearReviewProposal(proposal);return applied }
function discardReviewProposal(controller,proposal) { controller.enhancer.discardProposal(proposal);controller.clearReviewProposal(proposal) }
function useReviewProposal(controller) { const [proposal,setProposal]=useState(()=>controller.reviewProposal);useEffect(()=>controller.subscribeReviewProposal(setProposal),[controller]);return proposal }
function ComposerEnhancementReviewPanel({controller}) {
  const proposal=useReviewProposal(controller),[selected,setSelected]=useState(()=>new Set(proposal?.groups.map(group=>group.id)||[])),[busy,setBusy]=useState(false)
  useEffect(()=>setSelected(new Set(proposal?.groups.map(group=>group.id)||[])),[proposal])
  if(!proposal)return null
  const groups=proposal.groups||[],whole=proposal.mode==='whole',toggle=id=>setSelected(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next})
  const apply=async ids=>{if(busy)return;setBusy(true);try{await applyReviewProposal(controller,proposal,ids)}catch(error){host.notify({kind:'error',message:publicError(error)})}finally{setBusy(false)}}
  return jsx('section',{className:'mx-2 mb-1 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-background) p-2 text-xs',role:'region','aria-label':'Enhancement review',children:jsxs(Fragment,{children:[jsxs('div',{className:'flex items-center justify-between gap-2',children:[jsx('strong',{children:'Review enhancement'}),jsx('span',{className:'text-(--ui-text-tertiary)',children:whole?'Full draft replacement':'Choose changes to apply'})]}),jsxs('div',{className:'mt-2 grid gap-2 md:grid-cols-2',children:[jsxs('label',{children:['Original draft',jsx('pre',{className:'mt-1 max-h-24 overflow-auto whitespace-pre-wrap rounded border border-(--ui-stroke-secondary) p-1 text-(--ui-text-secondary)',children:proposal.original})]}),jsxs('label',{children:['Proposed draft',jsx('pre',{className:'mt-1 max-h-24 overflow-auto whitespace-pre-wrap rounded border border-(--ui-stroke-secondary) p-1 text-(--ui-text-secondary)',children:proposal.proposed})]})]}),!whole?jsx('div',{className:'mt-2 max-h-24 space-y-1 overflow-auto',children:groups.map(group=>jsx('label',{className:'flex items-start gap-2',children:[jsx('input',{type:'checkbox',checked:selected.has(group.id),onChange:()=>toggle(group.id),'aria-label':`Select ${group.id}`}),jsx('span',{children:`${group.id} · ${proposal.original.slice(group.start,group.end)||'∅'} → ${group.replacement||'∅'}`})]},group.id))}):null,jsxs('div',{className:'mt-2 flex flex-wrap gap-2',children:[jsx(Button,{type:'button',size:'sm',disabled:busy||(!whole&&selected.size===0),onClick:()=>apply([...selected]),children:'Apply selected'}),jsx(Button,{type:'button',size:'sm',variant:'ghost',disabled:busy,onClick:()=>apply(null),children:'Apply all'}),jsx(Button,{type:'button',size:'sm',variant:'ghost',disabled:busy,onClick:()=>discardReviewProposal(controller,proposal),children:'Keep original'})]})]})})
}
function ComposerDraftShelf({controller,row=false}) {
  const save=async()=>{try{const owner=await controller.ownerRouter.capture({allowDraft:true,draftId:'composer'}),surface=controller.draft.capture(),text=await controller.draft.read(surface);controller.draftShelf.save(owner,surface,{name:'Untitled draft',text});if(row)host.notify({kind:'info',message:'Draft saved on this device.'})}catch(error){host.notify({kind:'error',message:publicError(error)})}}
  if(row)return jsxs('button',{type:'button',role:'menuitem',className:MENU_ROW_CLASS,onClick:save,children:[jsx(ComposerIcon,{icon:'I10',size:16}),jsx('span',{children:'Save draft'})]})
  return jsx('button',{type:'button',className:ACTION_CLASS,'aria-label':'Draft Shelf',title:'Draft Shelf',onClick:save,children:jsx(ComposerIcon,{icon:'I10',size:16})})
}
function ComposerPromptMenu({ controller, open: openProp, onOpenChange: onOpenChangeProp }) {
  const [library,setLibrary]=useState(()=>controller.library),[openState,setOpenState]=useState(false),open=openProp??openState,setOpen=next=>{setOpenState(next);onOpenChangeProp?.(next)},[query,setQuery]=useState(''),[selected,setSelected]=useState(0),[preferences,setPreferences]=useState(()=>normalizePalettePreferences(controller.ctx.storage.get('prompt-palette-preferences',{favorites:[],recent:[]}))),triggerRef=useRef(null),searchRef=useRef(null)
  useEffect(()=>{const listener=value=>setLibrary(value);controller.libraryListeners.add(listener);return()=>controller.libraryListeners.delete(listener)},[controller])
  useEffect(()=>{if(open)queueMicrotask(()=>searchRef.current?.focus())},[open])
  const savePreferences=update=>setPreferences(current=>{const value=updatePalettePreferences(current,update);controller.ctx.storage.set('prompt-palette-preferences',value);return value})
  const change=action=>{try{controller.saveLibrary(libraryChange(controller.library,action))}catch(error){host.notify({kind:'error',message:publicError(error)})}}
  const remember=id=>savePreferences(current=>({...current,recent:[id,...current.recent.filter(item=>item!==id)]}))
  const rows=buildPromptActionIndex(library,preferences,query),close=()=>{setOpen(false);setQuery('');setSelected(0);queueMicrotask(()=>triggerRef.current?.focus())},optionId=row=>`prompt-action-option-${row.kind}-${encodeURIComponent(row.id)}`,selectedRow=rows[selected]
  const activate=row=>{if(!row)return;change({type:'prompt.select',id:row.id});remember(row.id);close()}
  const keyDown=event=>{if(event.key==='Escape'){event.preventDefault();close();return}if(event.target?.closest?.('button,textarea,select,a'))return;if(event.key==='ArrowDown'){event.preventDefault();setSelected(value=>Math.min(value+1,Math.max(0,rows.length-1)))}else if(event.key==='ArrowUp'){event.preventDefault();setSelected(value=>Math.max(0,value-1))}else if(event.key==='Enter'){event.preventDefault();activate(selectedRow)}}
  const active=library.prompts.find(prompt=>prompt.id===library.activePromptId)
  return jsx(Popover,{open,onOpenChange:next=>{if(next)setOpen(true);else close()},children:jsxs(Fragment,{children:[jsx(PopoverTrigger,{asChild:true,children:jsx('button',{ref:triggerRef,type:'button',className:ACTION_CLASS,'aria-label':'Prompt library',title:active?`Prompt · ${active.name}`:'Prompt library',children:jsx(ComposerIcon,{icon:'I03',size:16})})}),jsx(PopoverContent,{align:'end',variant:'menu',className:'w-64 max-w-[calc(100vw-1rem)] bg-(--ui-bg-elevated) p-1',children:jsxs('div',{onKeyDown:keyDown,children:[jsx('input',{ref:searchRef,type:'search',role:'combobox',value:query,onChange:event=>{setQuery(event.target.value);setSelected(0)},placeholder:'Search prompts','aria-label':'Search prompts','aria-controls':'prompt-action-results','aria-expanded':open,'aria-activedescendant':open&&selectedRow?optionId(selectedRow):undefined,className:'w-full rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-1.5 text-xs text-foreground outline-none focus:border-(--ui-stroke-primary)'}),jsx('div',{id:'prompt-action-results',role:'listbox','aria-label':'Prompt results',className:'mt-1 max-h-56 space-y-0.5 overflow-y-auto',children:rows.map((row,index)=>jsxs('div',{id:optionId(row),role:'option','aria-selected':index===selected,className:`block cursor-pointer rounded-md px-2 py-1.5 ${index===selected?'bg-(--ui-control-active-background)':''}`,onMouseEnter:()=>setSelected(index),onMouseDown:event=>event.preventDefault(),onClick:()=>activate(row),children:[jsx('strong',{className:'block truncate text-xs',children:row.title}),jsx('span',{className:'block truncate text-[10px] text-(--ui-text-tertiary)',children:row.subtitle})]},`${row.kind}:${row.id}`))}),!rows.length?jsx('p',{className:'p-3 text-center text-xs text-(--ui-text-tertiary)',children:'No prompts match that search.'}):null,selectedRow?.kind==='prompt'?jsxs('div',{className:'mt-1 flex flex-wrap gap-1 border-t border-(--ui-stroke-secondary) pt-1',children:[jsx(Button,{type:'button',size:'sm',variant:'ghost',onClick:()=>{const favorite=!preferences.favorites.includes(selectedRow.id);savePreferences(current=>({...current,favorites:favorite?[selectedRow.id,...current.favorites]:current.favorites.filter(item=>item!==selectedRow.id)}))},children:preferences.favorites.includes(selectedRow.id)?'★':'☆'}),jsx(Button,{type:'button',size:'sm',variant:selectedRow.id===library.activePromptId?'default':'ghost',onClick:()=>activate(selectedRow),children:selectedRow.id===library.activePromptId?'Using':'Use for Enhance'}),jsx(Button,{type:'button',size:'sm',variant:'ghost',onClick:()=>{controller.enhancer.insert(selectedRow.prompt.body).then(()=>remember(selectedRow.id)).catch(error=>host.notify({kind:'error',message:publicError(error)}))},children:'Insert'})]}):null,jsx('p',{className:'mt-1 text-[10px] text-(--ui-text-tertiary)',children:'↑↓ navigate · Enter use · Esc close'})]})})]})})
}
function VoiceTaskInspector({controller}) { const [snapshot,setSnapshot]=useState(()=>controller.delegation.snapshot());useEffect(()=>controller.delegation.subscribe(setSnapshot),[controller]);const task=snapshot.active||snapshot.queued;if(!task&&snapshot.state==='idle')return null;return jsx('section',{role:'region','aria-label':'Voice task inspector',className:'mx-2 mb-1 rounded-md border border-(--ui-stroke-secondary) p-2 text-xs',children:jsxs(Fragment,{children:[jsx('strong',{children:`Voice task · ${snapshot.state}`}),task?jsx('p',{children:bounded(task.text,240)}):null,task?.lastSteering?jsx('p',{children:`Last steer: ${bounded(task.lastSteering,160)}`}):null,task?.resultDelivery?jsx('p',{children:`Result delivery: ${task.resultDelivery}`}):null,jsx(Button,{size:'sm',variant:'ghost',disabled:!snapshot.active,onClick:()=>controller.delegation.cancel().catch(error=>host.notify({kind:'error',message:publicError(error)})),children:'Stop'}),jsx(Button,{size:'sm',variant:'ghost',disabled:!snapshot.active,onClick:()=>{const text=globalThis.prompt?.('Steer active task');if(text)controller.delegation.request(task.owner||{},text,`${Date.now()}`,()=>{})},children:'Steer'})]})}) }
function VoiceInteractionModeChooser({controller,row=false}) {
  const interaction=useInteractionSnapshot(controller),[open,setOpen]=useState(false),mode=interaction.mode,label=mode==='push-to-talk'?'Push to talk':'Continuous'
  const choose=next=>{try{controller.interaction.setMode(next);setOpen(false)}catch(error){host.notify({kind:'error',message:publicError(error)})}}
  const trigger=row
    ?jsxs('button',{type:'button',role:'menuitem',className:MENU_ROW_CLASS,'aria-label':`Voice mode · ${label}`,title:`Voice mode · ${label}`,children:[jsx(ComposerIcon,{icon:'I06',size:16}),jsx('span',{children:`Voice mode · ${label}`})]})
    :jsx('button',{type:'button',className:ACTION_CLASS,'aria-label':`Voice mode · ${label}`,title:`Voice mode · ${label}`,children:jsx(ComposerIcon,{icon:'I06',size:16})})
  return jsx(Popover,{open,onOpenChange:setOpen,children:jsxs(Fragment,{children:[jsx(PopoverTrigger,{asChild:true,children:trigger}),jsx(PopoverContent,{align:'end',variant:'menu',className:'w-40 bg-(--ui-bg-elevated) p-1',children:jsxs('div',{role:'menu','aria-label':'Voice interaction mode',children:[jsx('button',{type:'button',role:'menuitemradio','aria-checked':mode==='continuous',disabled:interaction.active&&mode!=='continuous',className:`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${mode==='continuous'?'bg-(--ui-control-active-background)':''}`,onClick:()=>choose('continuous'),children:jsx('span',{children:'Continuous'})}),jsx('button',{type:'button',role:'menuitemradio','aria-checked':mode==='push-to-talk',disabled:interaction.active&&mode!=='push-to-talk',className:`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${mode==='push-to-talk'?'bg-(--ui-control-active-background)':''}`,onClick:()=>choose('push-to-talk'),children:jsx('span',{children:'Push to talk'})}),jsx('button',{type:'button',role:'menuitemradio','aria-checked':false,disabled:true,className:'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-(--ui-text-tertiary) opacity-60',title:'Chained voice requires a public Hermes seam',children:jsx('span',{children:'Chained (unavailable)'})})]})})]})})
}
async function moveEnhancement(controller,fn) { try{if(!await fn(controller))host.notify({kind:'info',message:'This draft changed after enhancement. Your edits have been preserved.'})}catch(error){host.notify({kind:'error',message:publicError(error)})} }
function useLibraryIndex(controller) {
  const [library,setLibrary]=useState(()=>controller.library),[query,setQuery]=useState(''),[selected,setSelected]=useState(0),[preferences,setPreferences]=useState(()=>normalizePalettePreferences(controller.ctx.storage.get('prompt-palette-preferences',{favorites:[],recent:[]})))
  useEffect(()=>{const listener=value=>setLibrary(value);controller.libraryListeners.add(listener);return()=>controller.libraryListeners.delete(listener)},[controller])
  const savePreferences=update=>setPreferences(current=>{const value=updatePalettePreferences(current,update);controller.ctx.storage.set('prompt-palette-preferences',value);return value})
  const change=action=>{try{controller.saveLibrary(libraryChange(controller.library,action))}catch(error){host.notify({kind:'error',message:publicError(error)})}}
  const remember=id=>savePreferences(current=>({...current,recent:[id,...current.recent.filter(item=>item!==id)]}))
  const rows=buildPromptActionIndex(library,preferences,query)
  return {library,query,setQuery,selected,setSelected,preferences,savePreferences,change,remember,rows}
}
function MoreLibraryView({controller,onBack,onDone}) {
  const {library,query,setQuery,selected,setSelected,preferences,savePreferences,change,remember,rows}=useLibraryIndex(controller)
  const searchRef=useRef(null),selectedRow=rows[selected]
  useEffect(()=>{queueMicrotask(()=>searchRef.current?.focus())},[])
  const activate=row=>{if(!row)return;change({type:'prompt.select',id:row.id});remember(row.id);onDone()}
  const keyDown=event=>{if(event.key==='Escape'){event.preventDefault();onBack();return}if(event.target?.closest?.('button,textarea,select,a'))return;if(event.key==='ArrowDown'){event.preventDefault();setSelected(value=>Math.min(value+1,Math.max(0,rows.length-1)))}else if(event.key==='ArrowUp'){event.preventDefault();setSelected(value=>Math.max(0,value-1))}else if(event.key==='Enter'){event.preventDefault();activate(selectedRow)}}
  return jsxs('div',{onKeyDown:keyDown,children:[
    jsxs('button',{type:'button',className:MENU_ROW_CLASS,onClick:onBack,children:[jsx('span',{'aria-hidden':true,children:'‹'}),jsx('span',{children:'Back to actions'})]}),
    jsx('input',{ref:searchRef,type:'search',value:query,onChange:event=>{setQuery(event.target.value);setSelected(0)},placeholder:'Search prompts','aria-label':'Search prompts',className:'mt-1 w-full rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-1.5 text-xs text-foreground outline-none focus:border-(--ui-stroke-primary)'}),
    jsx('div',{role:'listbox','aria-label':'Prompt results',className:'mt-1 max-h-56 space-y-0.5 overflow-y-auto',children:rows.map((row,index)=>jsxs('div',{role:'option','aria-selected':index===selected,className:`block cursor-pointer rounded-md px-2 py-1.5 ${index===selected?'bg-(--ui-control-active-background)':''}`,onMouseEnter:()=>setSelected(index),onMouseDown:event=>event.preventDefault(),onClick:()=>activate(row),children:[jsx('strong',{className:'block truncate text-xs',children:row.title}),jsx('span',{className:'block truncate text-[10px] text-(--ui-text-tertiary)',children:row.subtitle})]},`${row.kind}:${row.id}`))}),
    !rows.length?jsx('p',{className:'p-3 text-center text-xs text-(--ui-text-tertiary)',children:'No prompts match that search.'}):null,
    selectedRow?.kind==='prompt'?jsxs('div',{className:'mt-1 flex flex-wrap gap-1 border-t border-(--ui-stroke-secondary) pt-1',children:[jsx(Button,{type:'button',size:'sm',variant:'ghost',onClick:()=>{const favorite=!preferences.favorites.includes(selectedRow.id);savePreferences(current=>({...current,favorites:favorite?[selectedRow.id,...current.favorites]:current.favorites.filter(item=>item!==selectedRow.id)}))},children:preferences.favorites.includes(selectedRow.id)?'★':'☆'}),jsx(Button,{type:'button',size:'sm',variant:selectedRow.id===library.activePromptId?'default':'ghost',onClick:()=>activate(selectedRow),children:selectedRow.id===library.activePromptId?'Using':'Use for Enhance'}),jsx(Button,{type:'button',size:'sm',variant:'ghost',onClick:()=>{controller.enhancer.insert(selectedRow.prompt.body).then(()=>remember(selectedRow.id)).catch(error=>host.notify({kind:'error',message:publicError(error)}))},children:'Insert'})]}):null,
  ]})
}
function ImproveMenu({controller,enhancing,setEnhancing,history,onOpenLibrary}) {
  const [open,setOpen]=useState(false),triggerRef=useRef(null),library=controller.library,active=library.prompts.find(prompt=>prompt.id===library.activePromptId)
  const close=()=>{setOpen(false);queueMicrotask(()=>triggerRef.current?.focus())}
  const run=async fn=>{if(enhancing)return;setEnhancing(true);try{await fn(controller);close()}catch(error){host.notify({kind:'error',message:publicError(error)})}finally{setEnhancing(false)}}
  const runBuiltin=async id=>{const prompt=controller.library.prompts.find(item=>item.id===id);if(!prompt){host.notify({kind:'error',message:'That built-in recipe is missing from your library.'});return}
    if(enhancing)return;setEnhancing(true);try{const {owner}=await controller.enhancer.capture();await controller.enhancer.enhance(owner,prompt,controller.library.enhanceWith);close()}catch(error){host.notify({kind:'error',message:publicError(error)})}finally{setEnhancing(false)}}
  const label=enhancing?'Enhancing draft':'Enhance draft',busy=enhancing||history.busy
  const row=(key,text,onClick,detail='')=>jsxs('button',{type:'button',role:'menuitem',className:MENU_ROW_CLASS,disabled:busy,onClick,children:[jsx('span',{className:'min-w-0 flex-1 truncate',children:text}),detail?jsx('span',{className:'text-[10px] text-(--ui-text-tertiary)',children:detail}):null]},key)
  return jsx(Popover,{open,onOpenChange:next=>next?setOpen(true):close(),children:jsxs(Fragment,{children:[
    jsx(PopoverTrigger,{asChild:true,children:jsxs('button',{ref:triggerRef,type:'button',className:`${ACTION_CLASS} w-auto gap-1 px-1.5`,'aria-label':label,title:label,'aria-haspopup':'menu','aria-expanded':open,disabled:busy,onMouseDown:event=>event.preventDefault(),children:[enhancing?jsx(Codicon,{name:'loading',size:'0.95rem'}):jsx(ComposerIcon,{icon:'I02',size:16}),jsx('span',{className:'text-xs',children:enhancing?'Enhancing':'Improve'}),jsx(Codicon,{name:'chevron-down',size:'0.7rem'})]})}),
    jsx(PopoverContent,{align:'end',variant:'menu',className:'w-72 max-w-[calc(100vw-1rem)] bg-(--ui-bg-elevated) p-1',children:jsxs('div',{role:'menu','aria-label':'Improve',children:[
      jsxs('div',{className:'flex items-center justify-between gap-2 px-2 py-1.5 text-xs text-(--ui-text-secondary)',children:[jsxs('span',{className:'min-w-0 truncate',children:['Recipe: ',jsx('strong',{children:active?.name||'none'})]}),jsx(Button,{type:'button',size:'sm',variant:'ghost',onClick:()=>{close();onOpenLibrary()},children:'Change'})]}),
      row('primary','Improve with recipe',()=>run(enhanceDraft),'Uses helper model'),
      row('review','Review changes before applying',()=>run(proposeEnhancement),'Uses helper model'),
      jsx('div',{className:MENU_GROUP_CLASS,children:'Built-in recipes'}),
      ...DEFAULT_PROMPTS.map(([id,name])=>row(id,name,()=>runBuiltin(id))),
      jsx('div',{className:MENU_GROUP_CLASS,children:'Configure'}),
      row('model','Choose enhancement model',()=>{close();host.navigate('/enchanted-composer')}),
      jsx('p',{className:MENU_NOTE_CLASS,children:'These operations use your helper model. Nothing is sent to chat.'}),
    ]})})]})})
}
function MoreMenu({controller,history,moreKeys,open,onOpenChange,view,onViewChange}) {
  const triggerRef=useRef(null)
  const close=()=>{onOpenChange(false);queueMicrotask(()=>triggerRef.current?.focus())}
  const nav=hint=>{if(hint)controller.ctx.storage.set('ec-settings-tab-hint',hint);close();host.navigate('/enchanted-composer')}
  const group=label=>jsx('div',{className:MENU_GROUP_CLASS,children:label},`g-${label}`)
  const iconRow=(key,icon,text,onClick,disabled=false,title=text)=>jsxs('button',{type:'button',role:'menuitem',className:MENU_ROW_CLASS,disabled,title,onClick,children:[jsx(ComposerIcon,{icon,size:16}),jsx('span',{children:text})]},key)
  const rows=[]
  if(moreKeys.includes('undo')||moreKeys.includes('redo')){rows.push(group('Continue'))
    if(moreKeys.includes('undo'))rows.push(iconRow('undo','I08','Undo enhancement',()=>{close();void moveEnhancement(controller,undoEnhancement)},!history.canUndo||history.busy,history.canUndo?'Undo enhancement':'Nothing to undo yet'))
    if(moreKeys.includes('redo'))rows.push(iconRow('redo','I09','Redo enhancement',()=>{close();void moveEnhancement(controller,redoEnhancement)},!history.canRedo||history.busy,history.canRedo?'Redo enhancement':'Nothing to redo yet'))}
  if(moreKeys.includes('save-draft')){rows.push(group('Keep'));rows.push(jsx(ComposerDraftShelf,{controller,row:true},'save'))}
  if(moreKeys.includes('library')||moreKeys.includes('compose')){rows.push(group('Prepare'))
    if(moreKeys.includes('library'))rows.push(iconRow('library','I03','Prompt library',()=>onViewChange('library')))
    if(moreKeys.includes('compose'))rows.push(iconRow('compose','I01','Compose',()=>nav()))}
  if(moreKeys.includes('voice-mode')||moreKeys.includes('voice-start')){rows.push(group('Voice'))
    if(moreKeys.includes('voice-mode'))rows.push(jsx(VoiceInteractionModeChooser,{controller,row:true},'voice-mode'))
    if(moreKeys.includes('voice-start'))rows.push(iconRow('voice-start','I04','Start Live Voice',()=>{close();controller.startVoice().catch(error=>host.notify({kind:'error',message:publicError(error)}))}))}
  if(moreKeys.includes('customize-bar')||moreKeys.includes('settings')){rows.push(group('Configure'))
    if(moreKeys.includes('customize-bar'))rows.push(iconRow('customize-bar','I27','Customize bar',()=>nav('composer')))
    if(moreKeys.includes('settings'))rows.push(iconRow('settings','I27','Composer settings',()=>nav('enhancement')))}
  const content=view==='library'
    ?jsx(MoreLibraryView,{controller,onBack:()=>onViewChange('root'),onDone:close})
    :jsxs('div',{role:'menu','aria-label':'More actions',children:rows})
  return jsx(Popover,{open,onOpenChange:next=>next?onOpenChange(true):close(),children:jsxs(Fragment,{children:[
    jsx(PopoverTrigger,{asChild:true,children:jsx('button',{ref:triggerRef,type:'button',className:ACTION_CLASS,'aria-label':'More actions',title:'More actions','aria-haspopup':'menu','aria-expanded':open,onMouseDown:event=>event.preventDefault(),children:jsx(ComposerIcon,{icon:'I28',size:16})})}),
    jsx(PopoverContent,{align:'end',variant:'menu',className:'w-64 max-w-[calc(100vw-1rem)] bg-(--ui-bg-elevated) p-1',children:content})]})})
}
function ComposerActions({controller}) {
  const [enhancing,setEnhancing]=useState(false),[history,setHistory]=useState({canUndo:false,canRedo:false,busy:false}),[visibility,setVisibility]=useState(()=>({...controller.composerControls})),[version,setVersion]=useState(()=>normalizeRailLayoutVersion(controller.railLayoutVersion)),[tier,setTier]=useState(0),[libraryOpen,setLibraryOpen]=useState(false),[moreOpen,setMoreOpen]=useState(false),[moreView,setMoreView]=useState('root')
  const railRef=useRef(null),voice=useControllerSnapshot(controller),voiceActive=['connecting','live','reconnecting','ending'].includes(voice.state)
  useEffect(()=>controller.subscribeComposerControls(value=>setVisibility({...value})),[controller])
  useEffect(()=>controller.subscribeRailLayout?.(value=>setVersion(normalizeRailLayoutVersion(value)))||(()=>{}),[controller])
  useEffect(()=>{
    let live=true,sequence=0
    const refresh=async()=>{const seq=++sequence;try{const {owner}=await controller.enhancer.capture(),next=await controller.enhancer.status(owner);if(live&&seq===sequence)setHistory(next)}catch{if(live&&seq===sequence)setHistory({canUndo:false,canRedo:false,busy:false})}}
    const dispose=controller.enhancer.subscribe(refresh),unsubscribers=['focusedSessionId','focusedStoredSessionId','focusedSessionOwner'].map(name=>host.state?.[name]?.subscribe?.(refresh)).filter(Boolean)
    void refresh()
    return()=>{live=false;++sequence;dispose();unsubscribers.forEach(fn=>fn())}
  },[controller])
  useEffect(()=>{
    // Adaptive overflow measures only this plugin-owned container (no host DOM scraping).
    const node=railRef.current
    if(!node||typeof ResizeObserver==='undefined')return
    const observer=new ResizeObserver(entries=>{const width=entries[0]?.contentRect?.width??0;setTier(railTierForWidth(width))})
    observer.observe(node)
    return()=>observer.disconnect()
  },[])
  const placements=railPlacements({visibility,version,tier,voiceActive})
  const openLibrary=()=>{if(placements.rail.includes('library'))setLibraryOpen(true);else{setMoreView('library');setMoreOpen(true)}}
  const items={
    library:jsx(ComposerPromptMenu,{controller,open:libraryOpen,onOpenChange:setLibraryOpen},'library'),
    compose:jsx('button',{type:'button',className:ACTION_CLASS,'aria-label':'Compose',title:'Compose · open the Composer workspace',onMouseDown:event=>event.preventDefault(),onClick:()=>host.navigate('/enchanted-composer'),children:jsx(ComposerIcon,{icon:'I01',size:16})},'compose'),
    improve:jsx(ImproveMenu,{controller,enhancing,setEnhancing,history,onOpenLibrary:openLibrary},'improve'),
    voice:jsx(VoiceStatusPill,{controller},'voice'),
    'voice-capsule':jsx(VoiceStatusPill,{controller},'voice-capsule'),
    more:jsx(MoreMenu,{controller,history,moreKeys:placements.more,open:moreOpen,onOpenChange:setMoreOpen,view:moreView,onViewChange:setMoreView},'more'),
  }
  return jsx('div',{ref:railRef,role:'group','aria-label':'Enchanted Composer actions',className:'inline-flex min-w-0 items-center gap-0.5',children:placements.rail.map(key=>items[key])})
}
/* COMPOSER_ACTIONS_END */
