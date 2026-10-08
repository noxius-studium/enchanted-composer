/* REGISTER_START */
function normalizeModelCatalog(value) {
  const providers=Array.isArray(value?.providers)?value.providers:[], models=[]
  for(const provider of providers){const slug=bounded(String(provider?.slug||provider?.id||provider?.name||''),128),capabilities=provider?.capabilities&&typeof provider.capabilities==='object'?provider.capabilities:{};if(!slug||!Array.isArray(provider?.models))continue;for(const item of provider.models){const model=bounded(typeof item==='string'?item:String(item?.id||item?.name||''),128),raw=capabilities[model],capability=raw&&typeof raw==='object'?{reasoning:raw.reasoning!==false,canDisableReasoning:raw.can_disable_reasoning!==false}:{reasoning:true,canDisableReasoning:true};if(model)models.push({provider:slug,model,capability})}}
  return {providers:providers.map(provider=>({slug:bounded(String(provider?.slug||provider?.id||provider?.name||''),128),name:bounded(String(provider?.name||provider?.slug||''),128)})).filter(provider=>provider.slug),models,provider:bounded(String(value?.provider||value?.currentProvider||''),128),model:bounded(String(value?.model||value?.currentModel||''),128)}
}
function normalizeVoiceCatalog(value) {
  const backends=[]
  for(const item of Array.isArray(value?.backends)?value.backends:[]){
    const backend=bounded(String(item?.backend||''),64);if(!backend)continue
    const providers=[]
    for(const row of Array.isArray(item?.providers)?item.providers:[]){
      const id=bounded(String(row?.id||''),64),billingLane=bounded(String(row?.billingLane||''),64)
      if(!id||!billingLane)continue
      const models=(Array.isArray(row.models)?row.models:[]).map(value=>bounded(typeof value==='string'?value:String(value?.id||''),128)).filter(Boolean)
      const voices=(Array.isArray(row.voices)?row.voices:[]).map(value=>bounded(typeof value==='string'?value:String(value?.id||''),128)).filter(Boolean)
      providers.push({id,name:bounded(String(row?.name||id),128),billingLane,ready:row?.ready===true,detail:bounded(String(row?.detail||''),180),models,voices,defaultModel:bounded(String(row?.defaultModel||models[0]||''),128),defaultVoice:bounded(String(row?.defaultVoice||voices[0]||''),128)})
    }
    backends.push({backend,providers,detail:bounded(String(item?.detail||''),180)})
  }
  return {backends}
}
function voiceProvider(catalog,settings){return catalog?.backends?.find(item=>item.backend===settings.backend)?.providers?.find(item=>item.id===settings.provider)||null}
function voiceSelectionStatus(settings,catalog){
  const backend=catalog?.backends?.find(item=>item.backend===settings.backend)
  if(!backend)return {valid:false,ready:false,message:'Check providers to choose a voice.'}
  const provider=voiceProvider(catalog,settings)
  if(!provider)return {valid:false,ready:false,message:backend.detail||'The selected provider is not advertised by this backend.'}
  const valid=settings.billingLane===provider.billingLane&&provider.models.includes(settings.engine)&&provider.voices.includes(settings.voice)
  return {valid,ready:provider.ready,message:valid?(provider.detail||(provider.ready?'Provider ready.':'Provider unavailable.')):'Choose a model and voice supported by the selected provider.'}
}
function reconcileVoiceSettings(settings,catalog){
  const provider=voiceProvider(catalog,settings);if(!provider)return {settings:{...settings},message:''}
  const next={...settings,billingLane:provider.billingLane,engine:provider.models.includes(settings.engine)?settings.engine:provider.defaultModel,voice:provider.voices.includes(settings.voice)?settings.voice:provider.defaultVoice}
  const changed=next.billingLane!==settings.billingLane||next.engine!==settings.engine||next.voice!==settings.voice
  return {settings:next,message:changed?`Adjusted the saved ${provider.name} selection to a supported billing, model, and voice. Choose a supported voice to apply it.`:''}
}
function createController(ctx) {
  const ownerRouter=new OwnerRouter(host),transcript=new LiveTranscriptBuffer(),audio=new AudioDeviceController(),draft=new ComposerDraftAdapter()
  const enhancer=new PromptEnhancer({draftAdapter:draft,ownerRouter,api:ctx}),settingsStore=new ComposerSettingsStore(ctx)
  const delegation=new DelegationBridge({api:ctx,transcript}),resolver=new VoiceBackendResolver({'enchanted-realtime':new RealtimeVoiceAdapter(ctx,audio),'enchanted-bridge':new ComposerBridgeBackendAdapter(ctx,audio)})
  const voice=new LiveVoiceSessionController({ctx,ownerRouter,transcript,delegation,audio,resolver})
  const controller={ctx,ownerRouter,transcript,audio,draft,enhancer,delegation,voice,settingsStore,settings:{...DEFAULT_SETTINGS},settingsOwner:null,voiceCatalog:null,library:validateLibrary(ctx.storage.get('library',null)||createLibrary()),libraryListeners:new Set(),
    saveLibrary(next){const value=validateLibrary(next);ctx.storage.set('library',value);this.library=value;for(const listener of this.libraryListeners)listener(value)},
    async saveSettings(patch,owner=this.settingsOwner){if(!owner)throw new Error('Load settings before editing.');const record=settingsStore.update(owner,patch);this.settings=record.value;return record},
    async refreshControlSurface(){
      const owner=await ownerRouter.capture({allowDraft:true});this.settingsOwner=owner
      const record=await settingsStore.load(owner);this.settings=record.value
      const safe=promise=>promise.catch(error=>({ok:false,error:{message:publicError(error)}}))
      const [devices,capabilities,voiceResult,auth,usage,modelResult]=await Promise.all([
        audio.devices().catch(()=>[]),safe(ctx.rest('/v1/capabilities',{method:'POST',body:{owner},timeoutMs:10000})),safe(ctx.rest('/v1/voice/options',{method:'POST',body:{owner},timeoutMs:10000})),safe(ctx.rest('/v1/codex/status',{method:'POST',body:{owner},timeoutMs:15000})),safe(ctx.rest('/v1/usage/read',{method:'POST',body:{owner},timeoutMs:10000})),safe(ownerRouter.request(owner,'model.options',{explicit_only:true},30000))])
      this.voiceCatalog=normalizeVoiceCatalog(voiceResult)
      return {owner,record,devices,capabilities,voiceCatalog:this.voiceCatalog,auth,usage,catalog:normalizeModelCatalog(modelResult),voiceError:voiceResult?.ok?'':statusText(voiceResult?.error,'Voice discovery is unavailable.'),modelError:modelResult?.error?statusText(modelResult.error):''}
    },
    async startVoice(){
      // Preserve an unsent draft while the public host API opens its first real session.
      let pendingDraft='';try{if(!host.state.focusedSessionId.get())pendingDraft=await draft.read(draft.capture())}catch{}
      const owner=await ownerRouter.ensureSession()
      if(pendingDraft){const surface=draft.capture();if(!await draft.read(surface))await draft.replace(pendingDraft,surface)}
      const record=await settingsStore.load(owner);await settingsStore.flush(owner);this.settings=record.value
      if(!ownerRouter.isActive(owner))throw new Error('Chat changed before voice could start.')
      return voice.start({...record.value},owner)
    },
    async dispose(){await voice.dispose();await settingsStore.dispose();enhancer.dispose();this.libraryListeners.clear()}
  }
  return controller
}
export default {
  id:PLUGIN_ID,name:'Enchanted Composer',description:'Live voice, reusable prompts, and dependable draft enhancement.',defaultEnabled:false,
  register(ctx){
    const controller=createController(ctx)
    ctx.register({id:'voice-transcript',area:COMPOSER_AREAS.top,order:10,render:()=>jsx(VoiceTranscriptPanel,{controller})})
    ctx.register({id:'actions',area:COMPOSER_AREAS.actions,order:10,render:()=>jsx(ComposerActions,{controller})})
    ctx.register({id:'route',area:ROUTES_AREA,order:25,data:{path:'/enchanted-composer'},render:()=>jsx(EnchantedComposerPage,{controller})})
    ctx.register({id:'legacy-route',area:ROUTES_AREA,order:25,data:{path:'/composer-enhancements'},render:()=>jsx(EnchantedComposerPage,{controller})})
    ctx.register({id:'sidebar-nav',area:SIDEBAR_NAV_AREA,order:25,data:{path:'/enchanted-composer',label:'Enchanted Composer',codicon:'sparkle'}})
    ctx.onDispose(()=>controller.dispose())
  }
}
/* REGISTER_END */
