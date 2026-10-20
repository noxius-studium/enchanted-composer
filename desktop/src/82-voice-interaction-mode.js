/* VOICE_INTERACTION_MODE_START */
const VOICE_INTERACTION_MODES=new Set(['continuous','push-to-talk','chained'])
class VoiceInteractionMode {
  constructor({mode='continuous',setMuted=null,chainedSeam=null}={}) { this.setMuted=typeof setMuted==='function'?setMuted:null;this.chainedSeam=chainedSeam;this.mode=this._mode(mode);this.callMode=null;this.muted=false;this.pressed=false;this.disposed=false;this.generation=0;this.listeners=new Set() }
  _mode(value) { if(!VOICE_INTERACTION_MODES.has(value))throw new Error('Unsupported voice interaction mode.');return value }
  snapshot() { return Object.freeze({mode:this.mode,callMode:this.callMode,active:Boolean(this.callMode),muted:this.muted,pressed:this.pressed}) }
  subscribe(fn) { if(typeof fn!=='function')throw new Error('Voice interaction listener must be a function.');this.listeners.add(fn);fn(this.snapshot());return()=>this.listeners.delete(fn) }
  _emit() { const value=this.snapshot();for(const listener of this.listeners)listener(value) }
  setMode(mode) { const next=this._mode(mode);if(this.callMode&&next!==this.callMode)throw new Error('Voice interaction mode cannot change during an active call.');if(next==='chained'&&typeof this.chainedSeam!=='function')throw new Error('Chained voice is unavailable until a public Hermes seam is injected.');this.mode=next;this._emit();return next }
  start(mode=this.mode) { if(this.callMode)throw new Error('Voice interaction mode is already active.');this.setMode(mode);this.callMode=this.mode;this.pressed=false;this._emit();if(this.callMode==='push-to-talk')this._localMute(true);return this.callMode }
  async press() { if(this.callMode!=='push-to-talk'||this.disposed)return false;this.pressed=true;this._emit();return this._localMute(false) }
  async release() { if(this.callMode!=='push-to-talk')return false;this.pressed=false;this._emit();return this._localMute(true) }
  async blur() { return this.release() }
  async cancel() { this.pressed=false;this.callMode=null;this._emit();return this._localMute(true) }
  _localMute(muted) { this.muted=Boolean(muted);this._emit();const generation=++this.generation;const acknowledgement=this.setMuted?Promise.resolve(this.setMuted(this.muted)).catch(()=>false):Promise.resolve(true);return acknowledgement.then(()=>generation===this.generation?this.muted:this.muted) }
  dispose() { this.disposed=true;this.pressed=false;this.callMode=null;this._emit();const result=this._localMute(true);this.listeners.clear();return result }
}
/* VOICE_INTERACTION_MODE_END */
