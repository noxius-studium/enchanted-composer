/* LIVE_SESSION_CONTROLLER_START */
class LiveVoiceSessionController {
  constructor({ctx,ownerRouter,transcript,delegation,audio,resolver}) {
    Object.assign(this,{ctx,ownerRouter,transcript,delegation,audio,resolver})
    this.session=null;this.adapter=null;this.unsubscribe=null;this.startedAt=0;this.audioMs=0;this.state='idle';this.listeners=new Set();this.botSpeaking=false;this.interruptInFlight=false;this.generation=0;this.lastError=null;this.diagnostics=[];this.lastStart=null;this.stopping=null;this.disposed=false
  }
  subscribe(fn) { this.listeners.add(fn);fn(this.snapshot());return()=>this.listeners.delete(fn) }
  snapshot() { return {state:this.state,muted:this.audio.muted,session:this.session,owner:this.session?.owner||this.lastStart?.owner,lastError:this.lastError,diagnostics:[...this.diagnostics],transcript:this.transcript.rendered()} }
  _emit() { for(const listener of this.listeners)listener(this.snapshot()) }
  _note(code,message) { this.diagnostics.push({at:now(),code:bounded(code,64),message:bounded(message,240)});if(this.diagnostics.length>30)this.diagnostics.shift() }
  start(selection,retainedOwner=null) {
    if(this.pendingStart)return Promise.reject(new Error('Voice is still finishing its previous connection.'))
    const pending=this._start(selection,retainedOwner);this.pendingStart=pending
    return pending.finally(()=>{if(this.pendingStart===pending)this.pendingStart=null})
  }
  async _start(selection,retainedOwner=null) {
    if(this.disposed)throw new Error('Voice has been disposed.')
    if(this.startPending||this.session||['connecting','ending','reconnecting'].includes(this.state))throw new Error('Live Voice is already active.')
    this.startPending=true;const generation=++this.generation;this.state='connecting';this.lastError=null;this._emit()
    let adapter=null,session=null
    const check=()=>{if(generation!==this.generation||this.disposed)throw new Error('Voice start was cancelled.')}
    try {
      const owner=retainedOwner||await (this.ownerRouter.ensureSession?this.ownerRouter.ensureSession():this.ownerRouter.capture());check()
      this.lastStart={selection:{...selection},owner};this.transcript.clear()
      const resolved=await this.resolver.resolve({...selection,owner});check();adapter=resolved.adapter
      const stream=await this.audio.acquire(selection.inputDeviceId);check()
      this.audio.onTrackEnded=()=>this._fail('microphone-ended','The microphone disconnected. Reconnect it, then retry voice.')
      session=await adapter.start({...resolved.selection,stream,owner,resultCapture:'bound-chat-run'});check()
      this.adapter=adapter;this.session=session;this.startedAt=now();this.audioMs=0;this.state='live'
      this.unsubscribe=adapter.subscribe(session.id,event=>{if(this.session===session)this._event(event)})
      this.audio.monitorBarge(()=>{if(this.botSpeaking&&!this.audio.muted)this.interrupt().catch(error=>this._note('interrupt',publicError(error)))})
      this._note('connected','Voice connected to the captured chat.');this._emit();return session
    } catch(error) {
      if(session)await adapter.stop(session.id).catch(()=>{})
      this.audio.onTrackEnded=null;this.audio.release()
      if(generation===this.generation){this.session=null;this.adapter=null;this.state='error';this.lastError={code:'start-failed',message:publicError(error)};this._note('start-failed',this.lastError.message);this._emit()}
      throw error
    } finally { this.startPending=false;if(generation!==this.generation&&this.state==='ending'){this.state='idle';this._emit()} }
  }
  retry() { if(!this.lastStart)throw new Error('Start voice from a chat first.');return this.start(this.lastStart.selection,this.lastStart.owner) }
  dismissError() { if(this.session)return;this.lastError=null;this.state='idle';this._emit() }
  _fail(code,message) {
    if(this.state==='ending'||this.state==='error'||this.disposed)return
    this.lastError={code:bounded(code,64),message:bounded(message,240)};this._note(code,message)
    void this.stop('failure').catch(()=>{})
  }
  _event(event) {
    if(!event?.type||!this.session)return
    const payload=event.payload||{},session=this.session,adapter=this.adapter
    if(event.type==='transcript.delta') {
      if(payload.final)this.transcript.turnDone(payload.role,payload.text)
      else this.transcript.push({role:payload.role==='assistant'?'assistant':'user',text:payload.text||''})
    }
    if(event.type==='turn.done')this.transcript.turnDone(payload.role,payload.text)
    if(event.type==='delegation.requested')this.delegation.request(session.owner,payload.text,payload.correlationId,text=>{
      if(this.session!==session)throw new Error('The originating voice session ended; the result remains in chat.')
      return adapter.deliverDelegationResult(session.id,payload.correlationId,text)
    },this.transcript.context())
    if(event.type==='audio.input.state'&&payload.speaking&&this.botSpeaking&&!this.audio.muted)this.interrupt().catch(error=>{this._note('interrupt',publicError(error));this._emit()})
    if(event.type==='usage.updated')this.audioMs=Math.max(this.audioMs,Number(payload.audioMs)||0)
    if(event.type==='error') {
      if(payload.fatal===true)this._fail(payload.code||'voice-failed',payload.message||'Voice disconnected. Retry when ready.')
      else this._note(payload.code||'warning',payload.message||'Voice reported a warning.')
    }
    if(event.type==='session.state') {
      if(payload.state==='disconnected')this.state='reconnecting'
      if(['connected','live'].includes(payload.state))this.state='live'
      if(['closed','failed'].includes(payload.state))this._fail('connection-ended','The voice connection ended. Your Hermes chat is still available.')
    }
    if(event.type==='response.state') {
      if(payload.newTurn){this.interruptInFlight=false;this.botSpeaking=payload.state==='speaking'}
      else if(payload.state==='idle')this.botSpeaking=false
      else if(payload.state==='speaking'){this.botSpeaking=true;this.interruptInFlight=false}
      if(payload.state==='speaking')this.audio.resumeRemote?.().catch(error=>{this._note('playback',publicError(error));this._emit()})
    }
    this._emit()
  }
  async mute() {
    const session=this.session,adapter=this.adapter;if(!session)return false
    const muted=this.audio.setMuted(!this.audio.muted);this._emit()
    try{await adapter.setMuted(session.id,muted)}catch{this._note('mute-sync','Microphone changed locally; provider acknowledgement was unavailable.');this._emit()}
    return muted
  }
  async interrupt() {
    if(!this.session||!this.botSpeaking||this.interruptInFlight)return false
    this.interruptInFlight=true;this.botSpeaking=false;this.audio.interrupt()
    try{await this.adapter.interrupt(this.session.id);return true}catch(error){this.interruptInFlight=false;throw error}finally{this._emit()}
  }
  async stop(reason='user') {
    if(this.stopping)return this.stopping
    ++this.generation
    const session=this.session,adapter=this.adapter;this.state='ending';this._emit()
    this.unsubscribe?.();this.unsubscribe=null;this.audio.onTrackEnded=null;this.audio.release();this.session=null;this.adapter=null
    this.stopping=(async()=>{
      try {
        if(session){await adapter.stop(session.id);const durationMs=Math.max(1,now()-this.startedAt);await this.ctx.rest('/v1/usage',{method:'POST',body:{owner:session.owner,durationMs,audioMs:Math.min(durationMs,Math.max(0,this.audioMs))},timeoutMs:10000}).catch(()=>{})}
      } catch { this._note('cleanup','Remote voice cleanup was not acknowledged; local microphone and playback are stopped.') }
      finally {
        await this.delegation.cancel?.()
        this.audioMs=0;this.botSpeaking=false;this.interruptInFlight=false;this.transcript.clear()
        this.state=reason==='failure'?'error':this.startPending?'ending':'idle';if(reason!=='failure')this.lastError=null
        this._emit()
      }
    })().finally(()=>{this.stopping=null})
    return this.stopping
  }
  async dispose() { this.disposed=true;await this.stop('dispose');await this.pendingStart?.catch(()=>{});await this.delegation.dispose();this.transcript.dispose();this.listeners.clear() }
}
/* LIVE_SESSION_CONTROLLER_END */
