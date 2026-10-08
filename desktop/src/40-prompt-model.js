/* PROMPT_MODEL_START */
const LIBRARY_VERSION = 3
const DEFAULT_PROMPTS = Object.freeze([['clarify','Clarify','Make the request unambiguous without adding requirements.'],['tighten','Tighten','Remove filler while preserving intent and constraints.'],['grammar','Grammar','Correct grammar and style without changing meaning.'],['expand','Expand','Expand into concrete ordered work.'],['summarize','Summarize','Summarize the request and preserve decisions.']])
const REASONING_EFFORTS = Object.freeze(['','none','minimal','low','medium','high','xhigh','max','ultra'])
function createLibrary() {
  return { version: LIBRARY_VERSION, folders: [{ id: 'enhancers', name: 'Enhancers', locked: true }], prompts: DEFAULT_PROMPTS.map(([id,name,body], order) => ({ id, folderId: 'enhancers', name, body, order })), activeLibraryId:'enhancers', activePromptId:'clarify', enhanceWith: { kind: 'session', reasoningEffort:'' } }
}
function validateLibrary(value) {
  if(value&&typeof value==='object'&&value.version===1)value={...value,version:2,activePromptId:'clarify',enhanceWith:value.enhanceWith?.kind==='model'?{...value.enhanceWith,reasoningEffort:''}:{kind:'session',reasoningEffort:''}}
  if(value&&typeof value==='object'&&value.version===2){const active=value.prompts?.find(prompt=>prompt?.id===value.activePromptId);value={...value,version:LIBRARY_VERSION,activeLibraryId:active?.folderId||'enhancers'}}
  if (!value || typeof value !== 'object' || value.version !== LIBRARY_VERSION || !Array.isArray(value.folders) || !Array.isArray(value.prompts) || value.folders.length > 64 || value.prompts.length > 400) throw new Error('Invalid prompt-library import.')
  const folders = value.folders.map(folder => ({ id: bounded(folder.id,64), name: bounded(folder.name,128), locked: Boolean(folder.locked) }))
  const ids = new Set(folders.map(folder => folder.id))
  if (folders.some(folder => !folder.id || !folder.name) || ids.size!==folders.length || !ids.has('enhancers')) throw new Error('Prompt-library folders are invalid.')
  const prompts = value.prompts.map((prompt,index) => ({ id: bounded(prompt.id,64), folderId: bounded(prompt.folderId,64), name: bounded(prompt.name,128), body: bounded(prompt.body,12000), order: Number.isInteger(prompt.order) ? prompt.order : index }))
  if (prompts.some(prompt => !prompt.id || !ids.has(prompt.folderId) || !prompt.name) || new Set(prompts.map(prompt=>prompt.id)).size!==prompts.length) throw new Error('Prompt-library prompts are invalid.')
  const rawReasoning=value.enhanceWith?.reasoningEffort??''
  if(!REASONING_EFFORTS.includes(rawReasoning))throw new Error('Enhancement Thinking level is invalid.')
  const reasoningEffort=rawReasoning
  const enhanceWith = value.enhanceWith && value.enhanceWith.kind === 'model' ? { kind:'model', provider:bounded(value.enhanceWith.provider,128), model:bounded(value.enhanceWith.model,128), reasoningEffort } : { kind:'session', reasoningEffort:'' }
  if(enhanceWith.kind==='model'&&(!enhanceWith.provider||!enhanceWith.model))throw new Error('Enhancement model selection is invalid.')
  const sorted=prompts.sort((a,b) => a.order - b.order),requested=bounded(value.activePromptId,64),activePromptId=sorted.some(prompt=>prompt.id===requested)?requested:(sorted.find(prompt=>prompt.id==='clarify')||sorted[0])?.id||'',requestedLibrary=bounded(value.activeLibraryId,64),activeLibraryId=ids.has(requestedLibrary)?requestedLibrary:(sorted.find(prompt=>prompt.id===activePromptId)?.folderId||'enhancers')
  if(!activePromptId)throw new Error('Prompt library needs at least one prompt.')
  return { version: LIBRARY_VERSION, folders, prompts: sorted, activeLibraryId, activePromptId, enhanceWith }
}
function exportLibrary(library) { return JSON.stringify(validateLibrary(library), null, 2) }
function importLibrary(text, { dryRun = true, previous } = {}) { if (typeof text !== 'string' || text.length > 512000) throw new Error('Prompt-library import is too large.'); const next = validateLibrary(JSON.parse(text)); return { dryRun, next, rollback: previous ? validateLibrary(previous) : null } }
function libraryId() { return `${now()}-${Math.random().toString(36).slice(2)}` }
function libraryChange(library,action) {
  const next=validateLibrary(library), id=action.id, at=next.prompts.findIndex(row=>row.id===id), folderAt=next.folders.findIndex(row=>row.id===id)
  if(action.type==='folder.create') next.folders.push({id:libraryId(),name:bounded(action.name,128),locked:false})
  else if(action.type==='folder.rename' && folderAt>=0 && !next.folders[folderAt].locked) next.folders[folderAt].name=bounded(action.name,128)
  else if(action.type==='folder.delete' && folderAt>=0 && !next.folders[folderAt].locked) { next.prompts=next.prompts.map(row=>row.folderId===id?{...row,folderId:'enhancers'}:row);next.folders.splice(folderAt,1);if(next.activeLibraryId===id)next.activeLibraryId='enhancers' }
  else if(action.type==='folder.move' && folderAt>=0 && !next.folders[folderAt].locked) { const [row]=next.folders.splice(folderAt,1);next.folders.splice(Math.max(1,Math.min(action.to,next.folders.length)),0,row) }
  else if(action.type==='prompt.create') next.prompts.push({id:libraryId(),folderId:action.folderId||'enhancers',name:bounded(action.name,128)||'Untitled',body:bounded(action.body,12000),order:next.prompts.length})
  else if(action.type==='prompt.edit' && at>=0) next.prompts[at]={...next.prompts[at],name:bounded(action.name,128)||next.prompts[at].name,body:bounded(action.body,12000),folderId:action.folderId||next.prompts[at].folderId}
  else if(action.type==='prompt.delete' && at>=0) { if(next.prompts.length===1)throw new Error('Prompt library needs at least one prompt.');next.prompts.splice(at,1);if(next.activePromptId===id)next.activePromptId=(next.prompts.find(row=>row.folderId===next.activeLibraryId)||next.prompts.find(row=>row.id==='clarify')||next.prompts[0]).id }
  else if(action.type==='prompt.move' && at>=0) { const [row]=next.prompts.splice(at,1);next.prompts.splice(Math.max(0,Math.min(action.to,next.prompts.length)),0,row) }
  else if(action.type==='prompt.transfer' && at>=0 && next.folders.some(folder=>folder.id===action.folderId)) next.prompts[at]={...next.prompts[at],folderId:action.folderId}
  else if(action.type==='prompt.select' && at>=0) { next.activePromptId=id;next.activeLibraryId=next.prompts[at].folderId }
  else if(action.type==='library.select' && folderAt>=0) next.activeLibraryId=id
  else if(action.type==='override') next.enhanceWith=action.value
  else throw new Error('Invalid library change.')
  next.prompts.forEach((row,index)=>row.order=index)
  return validateLibrary(next)
}
/* PROMPT_MODEL_END */
