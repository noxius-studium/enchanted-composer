/* PROMPT_ENHANCER_START */
class PromptEnhancer {
  constructor({draftAdapter,ownerRouter,api=host,review=null}) {
    this.draft=draftAdapter;this.ownerRouter=ownerRouter;this.api=api;this.review=review;this.proposals=new WeakSet();this.applying=new WeakSet();this.histories=new Map();this.listeners=new Set();this.pending=new Set()
  }
  key(owner,surfaceId) {
    // Saved chats survive editor remounts; unsent drafts stay surface-scoped.
    return JSON.stringify([owner.connectionId,owner.profile,owner.storedSessionId,owner.runtimeSessionId.startsWith('draft:')?surfaceId:''])
  }
  subscribe(fn) { this.listeners.add(fn);return()=>this.listeners.delete(fn) }
  _emit() { for(const fn of this.listeners)fn() }
  override(value) { if(!value||value.kind!=='model'||!bounded(value.provider,128)||!bounded(value.model,128))return null;return {provider:bounded(value.provider,128),model:bounded(value.model,128),reasoningEffort:bounded(value.reasoningEffort,16)} }
  async pinned(owner,original,instructions,override) {
    try{return await this.api.rest('/v1/enhance',{method:'POST',body:{owner,input:original,instructions,...override},timeoutMs:70000})}
    catch(error){if(/405|method not allowed/i.test(publicError(error)))throw new Error('The updated enhancement backend needs a normal Hermes Desktop restart.');throw error}
  }
  async capture() { const surface=this.draft.capture(),owner=await this.ownerRouter.capture({allowDraft:true,draftId:surface.surfaceId});if(this.draft.capture().surfaceId!==surface.surfaceId)throw new Error('The focused draft changed.');return {surface,owner} }
  _sameOwner(left,right) { return ['connectionId','profile','runtimeSessionId','storedSessionId'].every(key=>left?.[key]===right?.[key]) }
  _route(selection) { const override=this.override(selection);return override?{kind:'model',...override}:{kind:'session'} }
  async _request(owner,original,prompt,selection) { const override=this.override(selection),instructions=`${prompt.body}\n\nReturn only the rewritten prompt.`;return override?this.pinned(owner,original,instructions,override):this.ownerRouter.request(owner,'llm.oneshot',{instructions,input:original,task:'title_generation',max_tokens:4096,temperature:.2},70000) }
  async propose(owner,prompt,selection) {
    if(!this.review)throw new Error('Selective enhancement review is unavailable.')
    const surface=this.draft.capture(),original=await this.draft.read(surface),key=this.key(owner,surface.surfaceId)
    if(!original.trim())throw new Error('The composer is empty.')
    if(this.pending.has(key))throw new Error('This draft is already being enhanced.')
    this.pending.add(key);this._emit()
    try { const result=await this._request(owner,original,prompt,selection),proposed=typeof result?.text==='string'?result.text.slice(0,12000):''
      if(!proposed.trim())throw new Error('Enhancement returned no text.')
      const current=this.draft.capture(),currentOwner=await this.ownerRouter.capture({allowDraft:true,draftId:current.surfaceId})
      if(current.surfaceId!==surface.surfaceId||await this.draft.read(surface)!==original||!this._sameOwner(currentOwner,owner))throw new Error('Composer changed while enhancing. Your draft was left untouched.')
      const proposal=this.review.create({owner,surface:{surfaceId:surface.surfaceId},original,prompt,route:this._route(selection),proposed});this.proposals.add(proposal);return proposal
    } finally { this.pending.delete(key);this._emit() }
  }
  async status(owner) {
    try { const surface=this.draft.capture(),key=this.key(owner,surface.surfaceId),history=this.histories.get(key),text=await this.draft.read(surface)
      if(!text)this.histories.delete(key)
      const valid=Boolean(text)&&history&&history.values[history.index]===text
      return {canUndo:Boolean(valid&&history.index>0),canRedo:Boolean(valid&&history.index<history.values.length-1),busy:this.pending.has(key)}
    } catch { return {canUndo:false,canRedo:false,busy:false} }
  }
  async enhance(owner,prompt,selection) {
    const surface=this.draft.capture(),original=await this.draft.read(surface),key=this.key(owner,surface.surfaceId)
    if(!original.trim())throw new Error('The composer is empty.')
    if(this.pending.has(key))throw new Error('This draft is already being enhanced.')
    this.pending.add(key);this._emit()
    try {
      const override=this.override(selection),instructions=`${prompt.body}\n\nReturn only the rewritten prompt.`
      const result=override?await this.pinned(owner,original,instructions,override):await this.ownerRouter.request(owner,'llm.oneshot',{instructions,input:original,task:'title_generation',max_tokens:4096,temperature:.2},70000)
      const enhanced=bounded(result?.text,12000)
      if(!enhanced)throw new Error('Enhancement returned no text.')
      const current=this.draft.capture(),currentOwner=await this.ownerRouter.capture({allowDraft:true,draftId:current.surfaceId})
      if(current.editor!==surface.editor||await this.draft.read(surface)!==original||this.key(currentOwner,current.surfaceId)!==key)throw new Error('Composer changed while enhancing. Your draft was left untouched.')
      let history=this.histories.get(key)
      if(!history||history.values[history.index]!==original)history={values:[original],index:0}
      // Commit history only after the actual editor write succeeds.
      await this.draft.replace(enhanced,surface)
      const applied=await this.draft.read(surface)
      if(applied===original&&enhanced!==original)throw new Error('The editor did not accept the enhancement.')
      if(applied!==original){history.values=history.values.slice(0,history.index+1);history.values.push(applied);if(history.values.length>31)history.values.shift();history.index=history.values.length-1;this.histories.delete(key);this.histories.set(key,history)}
      while(this.histories.size>50)this.histories.delete(this.histories.keys().next().value)
      return applied
    } finally { this.pending.delete(key);this._emit() }
  }
  insert(text) { return this.draft.insert(text) }
  discardProposal(proposal) { if(!proposal||!this.proposals.has(proposal))return false;this.proposals.delete(proposal);this._emit();return true }
  async applyProposal(proposal,{selectedGroupIds=null,owner=null}={}) {
    if(!this.review||!proposal||!Object.isFrozen(proposal)||!this.proposals.has(proposal))throw new Error('Enhancement proposal is invalid.')
    if(this.applying.has(proposal))throw new Error('This enhancement proposal is already being applied.')
    this.applying.add(proposal)
    try {
      if(owner&&!this._sameOwner(owner,proposal.owner))throw new Error('This proposal no longer belongs to the focused chat.')
      const surface=this.draft.capture(),currentOwner=await this.ownerRouter.capture({allowDraft:true,draftId:surface.surfaceId}),key=this.key(proposal.owner,proposal.surface?.surfaceId)
      if(surface.surfaceId!==proposal.surface?.surfaceId||!this._sameOwner(currentOwner,proposal.owner)||await this.draft.read(surface)!==proposal.original)throw new Error('The composer changed since this proposal was created. Your draft was left untouched.')
      if(this.pending.has(key))throw new Error('This draft is already being enhanced.')
      const accepted=this.review.compose(proposal,selectedGroupIds)
      if(typeof accepted!=='string'||accepted.length>12000)throw new Error('Enhancement proposal is invalid.')
      let history=this.histories.get(key)
      if(!history||history.values[history.index]!==proposal.original)history={values:[proposal.original],index:0}
      await this.draft.replace(accepted,surface)
      const applied=await this.draft.read(surface)
      if(applied===proposal.original&&accepted!==proposal.original)throw new Error('The editor did not accept the enhancement.')
      if(applied!==proposal.original){history.values=history.values.slice(0,history.index+1);history.values.push(applied);if(history.values.length>31)history.values.shift();history.index=history.values.length-1;this.histories.delete(key);this.histories.set(key,history)}
      while(this.histories.size>50)this.histories.delete(this.histories.keys().next().value)
      this.proposals.delete(proposal);this._emit();return applied
    } finally { this.applying.delete(proposal) }
  }
  async _move(owner,direction) {
    const surface=this.draft.capture(),key=this.key(owner,surface.surfaceId),history=this.histories.get(key)
    if(!history||this.pending.has(key)||await this.draft.read(surface)!==history.values[history.index])return false
    const next=history.index+direction
    if(next<0||next>=history.values.length)return false
    await this.draft.replace(history.values[next],surface)
    if(await this.draft.read(surface)!==history.values[next])throw new Error('The editor did not accept the history change.')
    history.index=next;this._emit();return true
  }
  undoFor(owner) { return this._move(owner,-1) }
  redoFor(owner) { return this._move(owner,1) }
  dispose() { this.histories.clear();this.proposals=new WeakSet();this.applying=new WeakSet();this.listeners.clear() }
}
/* PROMPT_ENHANCER_END */
