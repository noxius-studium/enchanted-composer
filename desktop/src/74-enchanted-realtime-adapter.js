/* ENCHANTED_REALTIME_ADAPTER_START */
class RealtimeVoiceAdapter extends VoiceBackendAdapter {
  constructor(ctx,audio) { super();this.ctx=ctx;this.audio=audio;this.sessions=new Map() }
  async capabilities(selection={}) { const result=await this.ctx.rest('/capabilities',{method:'POST',body:{owner:this._owner(selection.owner)},timeoutMs:10000});return result.backends.find(item=>item.backend==='enchanted-realtime') }
  _emit(ref,type,payload) {
    if(ref.closed)return
    if(!ref.sinks.size){ref.pending.push({type,payload});if(ref.pending.length>100)ref.pending.shift();return}
    for(const sink of ref.sinks)sink({type,payload})
  }
  _event(ref,msg) {
    if(!msg||typeof msg.type!=='string')return
    const item=msg.item||{},turn=msg.turn||{}
    if(['input_transcript.added','conversation.item.input_audio_transcription.delta','session.input_transcript.delta'].includes(msg.type))this._emit(ref,'transcript.delta',{role:'user',text:item.text||msg.delta||'',final:false})
    else if(['output_transcript.added','response.output_audio_transcript.delta','session.output_transcript.delta'].includes(msg.type))this._emit(ref,'transcript.delta',{role:'assistant',text:item.text||msg.delta||'',final:false})
    else if(msg.type==='turn.done'){this._emit(ref,'turn.done',{role:turn.role==='assistant'?'assistant':'user',text:bounded(turn.transcript,8192)});if(turn.role==='assistant')this._emit(ref,'response.state',{state:'idle'})}
    else if(['conversation.item.input_audio_transcription.completed','response.output_audio_transcript.done'].includes(msg.type))this._emit(ref,'turn.done',{role:msg.type.startsWith('conversation')?'user':'assistant',text:bounded(msg.transcript,8192)})
    else if(msg.type==='turn.created'&&turn.role==='assistant'){ref.turnId=bounded(turn.id,128);ref.interrupted=false;this._emit(ref,'response.state',{state:'speaking',newTurn:true})}
    else if(msg.type==='input_audio_buffer.speech_started')this._emit(ref,'audio.input.state',{speaking:true})
    else if(msg.type==='input_audio_buffer.speech_stopped')this._emit(ref,'audio.input.state',{speaking:false})
    else if(msg.type==='output_audio_buffer.started')this._emit(ref,'response.state',{state:'speaking',newTurn:true})
    else if(msg.type==='output_audio_buffer.stopped')this._emit(ref,'response.state',{state:'idle'})
    else if(msg.type==='session.usage.updated')this._emit(ref,'usage.updated',{audioMs:Number(msg.usage?.audio_duration_ms)||0})
    else if(msg.type==='delegation.created'){const text=Array.isArray(item.content)?item.content.map(part=>part?.text||'').join(''):'';this._emit(ref,'delegation.requested',{text:bounded(text,8000),correlationId:bounded(item.id,128)})}
    else if(msg.type==='session.closed')this._emit(ref,'error',{code:'provider-ended',fatal:true,message:'The voice provider ended this call. Retry voice to reconnect to the same chat.'})
    else if(msg.type==='error'){
      const code=String(msg.error?.code||'provider-warning'),fatal=['session_expired','session_closed','authentication_error','quota_exceeded'].includes(code)
      this._emit(ref,'error',{code:/^[a-z0-9_]{1,64}$/i.test(code)?code:'provider-warning',fatal,message:fatal?'The voice provider cannot continue this call. Check account availability, then retry.':'The voice provider reported a warning. The call is still open.'})
    }
  }
  async start(request) {
    const peer=new RTCPeerConnection(),channel=peer.createDataChannel('oai-events')
    const ref={peer,channel,sinks:new Set(),pending:[],closed:false,turnId:'',interrupted:false,generation:`${now()}-${Math.random().toString(36).slice(2)}`,owner:request.owner,id:null,reconnectTimer:null,healthTimer:null}
    try {
      if(!request.stream?.getTracks)throw new Error('Microphone stream is unavailable.')
      request.stream.getTracks().forEach(track=>peer.addTrack(track,request.stream))
      channel.onmessage=event=>{try{this._event(ref,JSON.parse(event.data))}catch{this._emit(ref,'error',{code:'invalid-event',fatal:false,message:'A malformed voice event was ignored.'})}}
      channel.onerror=()=>this._emit(ref,'error',{code:'channel-warning',fatal:false,message:'Voice data channel reported a transport warning.'})
      channel.onclose=()=>this._emit(ref,'error',{code:'channel-closed',fatal:true,message:'The voice data channel closed. Retry to reconnect to the same chat.'})
      peer.ontrack=event=>{this.audio.attachRemote(event.streams?.[0]||new MediaStream([event.track]),request.outputDeviceId).catch(()=>this._emit(ref,'error',{code:'playback-unavailable',fatal:false,message:'Voice playback is unavailable. Check the selected speaker and audio permissions.'}))}
      const connection=()=>{
        const state=peer.connectionState
        if(state==='connected'){clearTimeout(ref.reconnectTimer);ref.reconnectTimer=null;this._emit(ref,'session.state',{state:'connected'})}
        else if(state==='disconnected'){
          this._emit(ref,'session.state',{state:'disconnected'})
          // Let the same peer recover. Never silently start a new billable call.
          if(!ref.reconnectTimer)ref.reconnectTimer=setTimeout(()=>this._emit(ref,'error',{code:'connection-timeout',fatal:true,message:'Voice could not recover its connection. Your chat is safe; retry when the network is ready.'}),10000)
        } else if(['failed','closed'].includes(state))this._emit(ref,'error',{code:'connection-ended',fatal:true,message:'The voice connection ended. Retry when ready.'})
      }
      peer.onconnectionstatechange=connection
      peer.oniceconnectionstatechange=()=>{if(peer.iceConnectionState==='failed')this._emit(ref,'error',{code:'ice-failed',fatal:true,message:'The audio network connection failed. Check the network, then retry voice.'})}
      const offer=await peer.createOffer();await peer.setLocalDescription(offer)
      const response=await this.ctx.rest('/v1/talk/start',{method:'POST',body:{owner:this._owner(request.owner),generation:ref.generation,backend:'enchanted-realtime',engine:request.engine,billingLane:request.billingLane,provider:request.provider,voice:request.voice,language:request.language,resultCapture:request.resultCapture,offer:peer.localDescription?.sdp||offer.sdp},timeoutMs:120000})
      if(!response?.ok||!response.answer||!response.sessionId)throw new Error('Voice negotiation returned no answer.')
      ref.id=response.sessionId;await peer.setRemoteDescription({type:'answer',sdp:response.answer})
      if(channel.readyState!=='open')await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>finish(new Error('Voice audio negotiation timed out.')),20000)
        const finish=error=>{clearTimeout(timer);channel.removeEventListener('open',opened);channel.removeEventListener('close',closed);error?reject(error):resolve()}
        const opened=()=>finish(),closed=()=>finish(new Error('Voice closed during negotiation.'))
        channel.addEventListener('open',opened,{once:true});channel.addEventListener('close',closed,{once:true})
      })
      this.sessions.set(ref.id,ref)
      if(response.healthCheck===true){
        let checking=false
        ref.healthTimer=setInterval(async()=>{if(checking||ref.closed)return;checking=true;try{const health=await this.ctx.rest('/v1/talk/health',{method:'POST',body:this._body(ref),timeoutMs:8000});if(health?.alive===false)this._emit(ref,'error',{code:'voice-process-ended',fatal:true,message:'The local voice process stopped. Retry voice; your Hermes chat is unaffected.'})}catch{this._emit(ref,'error',{code:'health-unavailable',fatal:false,message:'Voice process status is temporarily unavailable.'})}finally{checking=false}},10000)
      }
      return {id:ref.id,backend:'enchanted-realtime',owner:request.owner,resultCapture:response.resultCapture,state:'live',generation:ref.generation}
    } catch(error) { await this._close(ref).catch(()=>{});throw error }
  }
  subscribe(id,sink) { const ref=this.sessions.get(id);if(!ref)throw new Error('Voice session ended.');ref.sinks.add(sink);const pending=ref.pending.splice(0);queueMicrotask(()=>{if(!ref.closed&&ref.sinks.has(sink))for(const event of pending)sink(event)});return()=>ref.sinks.delete(sink) }
  _owner(owner) { return {connectionId:owner?.connectionId,profile:owner?.profile,runtimeSessionId:owner?.runtimeSessionId,storedSessionId:owner?.storedSessionId} }
  _body(ref,extra={}) { return {sessionId:ref.id,generation:ref.generation,owner:this._owner(ref.owner),...extra} }
  async setMuted(id,muted) { const ref=this.sessions.get(id);if(ref){ref.peer.getSenders().forEach(sender=>{if(sender.track?.kind==='audio')sender.track.enabled=!muted});await this.ctx.rest('/v1/talk/command',{method:'POST',body:this._body(ref,{command:'mute',muted}),timeoutMs:8000})} }
  async interrupt(id) { const ref=this.sessions.get(id);if(!ref||ref.interrupted)return;ref.interrupted=true;if(ref.turnId){const turnId=ref.turnId;ref.turnId='';await this.ctx.rest('/v1/talk/command',{method:'POST',body:this._body(ref,{command:'interrupt',turnId}),timeoutMs:8000})}else if(ref.channel.readyState==='open')ref.channel.send(JSON.stringify({type:'response.cancel'})) }
  async deliverDelegationResult(id,correlationId,text) { const ref=this.sessions.get(id);if(!ref||ref.channel.readyState!=='open')throw new Error('Voice result channel is unavailable.');const safe=bounded(text,3500);if(ref.results?.has(correlationId))return;ref.results ||= new Set();ref.channel.send(JSON.stringify({type:'delegation.context.append',delegation_item_id:correlationId,content:[{type:'input_text',text:safe}]}));ref.results.add(correlationId);await this.ctx.rest('/v1/talk/result',{method:'POST',body:this._body(ref,{correlationId,text:safe}),timeoutMs:10000}) }
  async _close(ref) {
    ref.closed=true;clearTimeout(ref.reconnectTimer);clearInterval(ref.healthTimer);ref.channel.onmessage=null;ref.channel.onclose=null;ref.channel.onerror=null;ref.peer.ontrack=null;ref.peer.onconnectionstatechange=null;ref.peer.oniceconnectionstatechange=null;ref.channel.close();ref.peer.close();this.audio.detachRemote();ref.sinks.clear();ref.pending=[]
    if(ref.id)await this.ctx.rest('/v1/talk/close',{method:'POST',body:this._body(ref),timeoutMs:10000})
  }
  async stop(id) { const ref=this.sessions.get(id);if(!ref)return;this.sessions.delete(id);await this._close(ref) }
}
// Existing extraction fixtures and the legacy transport contract retain this alias.
const EnchantedRealtimeBackendAdapter = RealtimeVoiceAdapter
/* ENCHANTED_REALTIME_ADAPTER_END */
