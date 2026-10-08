/* OWNER_ROUTER_START */
class OwnerRouter {
  constructor(api = host) { this.api = api; this.routes = new Map(); this.creating=null; this.draftIds=new Map() }
  _state(name) { const atom = this.api.state && this.api.state[name]; return atom && typeof atom.get === 'function' ? atom.get() : undefined }
  _binding(value) {
    if (!value || typeof value !== 'object' || Object.keys(value).length !== 4 || !['connectionId','profile','runtimeSessionId','storedSessionId'].every(key => Object.hasOwn(value,key))) throw new Error('Missing exact captured chat owner.')
    const owner={connectionId:bounded(value.connectionId,128),profile:bounded(value.profile,128),runtimeSessionId:bounded(value.runtimeSessionId,128),storedSessionId:bounded(value.storedSessionId,128)}
    if (!Object.values(owner).every(Boolean)) throw new Error('Missing exact captured chat owner.')
    return Object.freeze(owner)
  }
  _key(owner) { const binding=this._binding(owner); return `${binding.connectionId}\u001f${binding.profile}\u001f${binding.runtimeSessionId}\u001f${binding.storedSessionId}` }
  _routeIdentity(route) { return route && `${bounded(String(route.connectionId || route.connection_id || ''),128)}\u001f${bounded(String(route.profile || ''),128)}` }
  async capture({allowDraft=false,draftId="profile"}={}) {
    // Snapshot every focused value before the async route inventory. The binding must
    // never drift to a newly focused tile while profileRoutes() awaits Electron.
    let runtimeSessionId=bounded(this._state('focusedSessionId'),128), storedSessionId=bounded(this._state('focusedStoredSessionId') || runtimeSessionId,128); const focused=this._state('focusedSessionOwner')
    if (allowDraft && focused && !runtimeSessionId && !storedSessionId) {
      const key=JSON.stringify([focused.connectionId||focused.connection_id,focused.profile,draftId]);
      if(!this.draftIds.has(key))this.draftIds.set(key,`draft:${Date.now()}-${Math.random().toString(36).slice(2)}`);
      runtimeSessionId=storedSessionId=this.draftIds.get(key)
    }
    if (!runtimeSessionId || !storedSessionId || !focused || typeof focused !== 'object') throw new Error('No exact focused chat owner is available.')
    const owner=this._binding({connectionId:focused.connectionId || focused.connection_id,profile:focused.profile,runtimeSessionId,storedSessionId})
    let routes
    try { routes=typeof this.api.profileRoutes === 'function' ? await this.api.profileRoutes() : [] } catch { throw new Error('Focused chat route is unavailable.') }
    const expected=`${owner.connectionId}\u001f${owner.profile}`
    const matches=Array.isArray(routes) ? routes.filter(route=>this._routeIdentity(route)===expected) : []
    const exact=matches.filter(route=>bounded(String(route.runtimeSessionId || route.runtime_session_id || ''),128)===owner.runtimeSessionId && bounded(String(route.storedSessionId || route.stored_session_id || ''),128)===owner.storedSessionId)
    // Route descriptors normally identify connection/profile only. If an adapter
    // includes session fields, use the exact immutable pair before declaring ambiguity.
    const selected=exact.length===1?exact[0]:matches.length===1?matches[0]:null
    if (!selected) throw new Error('Focused chat route is ambiguous or unavailable.')
    this.routes.set(this._key(owner),selected)
    return owner
  }
  async request(owner,method,params,timeoutMs=30000) {
    const binding=this._binding(owner), route=this.routes.get(this._key(binding))
    if (!route) throw new Error('Captured chat route is unavailable.')
    if (typeof this.api.requestProfile !== 'function') throw new Error('Owner-routed requests are unavailable.')
    return this.api.requestProfile(route,method,params,timeoutMs)
  }
  focusKey() { const f=this._state('focusedSessionOwner'); return JSON.stringify([f?.connectionId||f?.connection_id,f?.profile,this._state('focusedSessionId'),this._state('focusedStoredSessionId')]) }
  async ensureSession() {
    if(this._state('focusedSessionId'))return this.capture()
    if(this.creating)return this.creating
    const focus=this.focusKey()
    this.creating=(async()=>{
      if(typeof this.api.openSession!=='function')throw new Error('Update Hermes Desktop to start voice in a new chat.')
      const draft=await this.capture({allowDraft:true}),route=this.routes.get(this._key(draft))
      const check=()=>{if(this.focusKey()!==focus)throw new Error('Chat changed while preparing voice. No microphone was opened.')};check()
      const receipt=await this.request(draft,'session.create',{source:'desktop',profile:draft.profile,cwd:this._state('cwd')||'',close_on_disconnect:false,idempotency_key:`enchanted-${draft.runtimeSessionId}`},60000)
      const owner=this._binding({connectionId:draft.connectionId,profile:draft.profile,runtimeSessionId:receipt?.session_id,storedSessionId:receipt?.stored_session_id})
      this.routes.set(this._key(owner),route);check()
      const titled=await this.request(owner,'session.title',{session_id:owner.runtimeSessionId,title:'Voice conversation'})
      if(titled?.pending)throw new Error('The new voice chat could not be saved. Try again.')
      check()
      await this.api.openSession(owner.storedSessionId,{route,awaitHydration:true,expectHistory:false,tabTitle:'Voice conversation'})
      const current=await this.capture()
      if(current.connectionId!==owner.connectionId||current.profile!==owner.profile||current.storedSessionId!==owner.storedSessionId)throw new Error('The new voice chat did not become active.')
      this.draftIds.delete(JSON.stringify([owner.connectionId,owner.profile,'profile']))
      return current
    })().finally(()=>{this.creating=null})
    return this.creating
  }
  isActive(owner) { try { const binding=this._binding(owner), focused=this._state('focusedSessionOwner'); return Boolean(focused && String(focused.connectionId || focused.connection_id)===binding.connectionId && String(focused.profile)===binding.profile && this._state('focusedSessionId')===binding.runtimeSessionId && (this._state('focusedStoredSessionId') || binding.runtimeSessionId)===binding.storedSessionId) } catch { return false } }
}
/* OWNER_ROUTER_END */
