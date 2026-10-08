/* SETTINGS_STORE_START */
const DEFAULT_SETTINGS=Object.freeze({backend:'enchanted-realtime',engine:'gpt-live-1-codex',provider:'codex',billingLane:'subscription',voice:'cove',language:'en',inputDeviceId:'default',outputDeviceId:'default',endpoint:''})
const SETTINGS_FIELDS=Object.freeze({backend:'backend',provider:'provider',billingLane:'billing_lane',engine:'engine',voice:'voice',language:'language',inputDeviceId:'input_device_id',outputDeviceId:'output_device_id',endpoint:'bridge_endpoint'})
function settingsWire(settings) { return Object.fromEntries(Object.entries(SETTINGS_FIELDS).map(([key,wire])=>[wire,settings[key]])) }
function settingsLocal(wire) { return Object.fromEntries(Object.entries(SETTINGS_FIELDS).map(([key,name])=>[key,wire[name]])) }
class ComposerSettingsStore {
  constructor(ctx,{delay=350}={}) { this.ctx=ctx;this.delay=delay;this.records=new Map();this.listeners=new Set();this.closed=false }
  key(owner) { return JSON.stringify([owner.connectionId,owner.profile]) }
  subscribe(fn) { this.listeners.add(fn);return()=>this.listeners.delete(fn) }
  _emit(record) { for(const fn of this.listeners)fn(record) }
  record(owner) {
    const key=this.key(owner)
    if(!this.records.has(key)) {
      const cached=this.ctx.storage.get(`settings:${key}`,null),pending=this.ctx.storage.get(`pending-settings:${key}`,null)
      this.records.set(key,{key,owner:{...owner},value:{...DEFAULT_SETTINGS,...cached,...pending},saved:{...DEFAULT_SETTINGS,...cached},revision:pending?1:0,savedRevision:0,status:pending?'unsaved':'loading',error:'',loaded:false,timer:null,flight:null,loading:null})
    }
    return this.records.get(key)
  }
  async load(owner) {
    const record=this.record(owner)
    if(record.loaded)return record
    if(record.loading)return record.loading
    record.loading=(async()=>{
      try {
        const result=await this.ctx.rest('/v1/settings/read',{method:'POST',body:{owner:record.owner},timeoutMs:10000})
        if(!result?.ok||!result.settings)throw new Error('Settings could not be read.')
        const saved={...DEFAULT_SETTINGS,...settingsLocal(result.settings)}
        record.saved=saved
        if(!record.revision)record.value={...saved}
        // One-time legacy renderer defaults belong only to the first adopting owner.
        const legacy=this.ctx.storage.get('settings',null),claim=this.ctx.storage.get('settings-migration-owner',null)
        if(result.exists===false && legacy && (!claim||claim===record.key) && !record.revision){
          this.ctx.storage.set('settings-migration-owner',record.key);record.value={...saved,...legacy};record.revision++
        }
        record.loaded=true;record.status=record.revision>record.savedRevision?'unsaved':'saved';record.error=''
        if(record.status==='unsaved')this._schedule(record)
      } catch(error) { record.status='error';record.error=publicError(error,'Settings are unavailable. Retry to load them.');throw error }
      finally { record.loading=null;this._emit(record) }
      return record
    })()
    return record.loading
  }
  update(owner,patch) {
    if(this.closed)throw new Error('Settings are closed.')
    const record=this.record(owner)
    if(!record.loaded)throw new Error('Wait for settings to load before editing.')
    if(Object.keys(patch).some(key=>!Object.hasOwn(SETTINGS_FIELDS,key)))throw new Error('Unknown setting.')
    if(Object.values(patch).some(value=>typeof value!=='string'||value.length>256))throw new Error('Setting is invalid or too long.')
    const value={...record.value,...patch}
    // Persist pending changes first: failed storage must never claim an autosave.
    this.ctx.storage.set(`pending-settings:${record.key}`,value)
    record.value=value;record.revision++;record.status='saving';record.error='';this._emit(record);this._schedule(record)
    return record
  }
  _schedule(record) { clearTimeout(record.timer);record.timer=setTimeout(()=>{record.timer=null;void this.flush(record.owner).catch(()=>{})},this.delay) }
  async flush(owner) {
    const record=this.record(owner);clearTimeout(record.timer);record.timer=null
    if(record.flight)return record.flight
    if(!record.loaded)return this.load(owner)
    record.flight=(async()=>{
      while(record.savedRevision<record.revision){
        const revision=record.revision,value={...record.value},wire=settingsWire(value)
        record.status='saving';this._emit(record)
        try {
          const receipt=await this.ctx.rest('/v1/settings',{method:'PUT',body:{owner:record.owner,settings:wire},timeoutMs:10000})
          if(receipt?.ok!==true)throw new Error('Settings were not accepted.')
          const check=await this.ctx.rest('/v1/settings/read',{method:'POST',body:{owner:record.owner},timeoutMs:10000})
          if(!check?.ok||Object.keys(wire).some(key=>check.settings?.[key]!==wire[key]))throw new Error('Saved settings could not be verified. Retry to keep your changes.')
          this.ctx.storage.set(`settings:${record.key}`,value)
          record.saved=value;record.savedRevision=revision
          if(record.revision===revision){this.ctx.storage.remove?.(`pending-settings:${record.key}`);record.status='saved';record.error=''}
        } catch(error) { record.status='error';record.error=publicError(error);this._emit(record);throw error }
        this._emit(record)
      }
      return record
    })().finally(()=>{record.flight=null})
    return record.flight
  }
  async dispose() { this.closed=true;await Promise.allSettled([...this.records.values()].map(async record=>{clearTimeout(record.timer);await record.loading?.catch(()=>{});clearTimeout(record.timer);if(record.loaded)await this.flush(record.owner)}));this.listeners.clear() }
}
/* SETTINGS_STORE_END */
