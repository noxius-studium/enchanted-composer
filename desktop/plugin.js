import { jsx, jsxs, Fragment } from 'react/jsx-runtime'
import { useEffect, useRef, useState } from 'react'
import { COMPOSER_AREAS, ROUTES_AREA, SIDEBAR_NAV_AREA, Codicon, Button, Popover, PopoverContent, PopoverTrigger, RowButton, Tabs, TabsList, TabsTrigger, host, icons } from '@hermes/plugin-sdk'

const PLUGIN_ID = 'composer-enhancements'
const ACTION_CLASS = 'inline-flex size-(--composer-control-size) shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-(--ui-text-tertiary) hover:bg-(--chrome-action-hover) hover:text-foreground'
const now = () => Date.now()
const bounded = (value, limit = 8192) => typeof value === 'string' ? value.trim().slice(0, limit) : ''
function publicError(error, fallback = 'Enchanted Composer could not complete that action.') { return bounded(error && error.message, 240) || fallback }
/* PURE_CONTRACT_SOURCE */
/* CONTRACTS_START */
const CONTRACT_VERSION = '1'
const MAX_IDENTIFIER_LENGTH = 128
const MAX_EVENT_STRING_LENGTH = 512
const MAX_PAYLOAD_DEPTH = 4
const MAX_PAYLOAD_ITEMS = 32
const BACKEND_IDS = Object.freeze({ ENCHANTED_REALTIME: 'enchanted-realtime', ENCHANTED_BRIDGE: 'enchanted-bridge' })
const BackendId = BACKEND_IDS
const EVENT_TYPES = new Set(['sessionStarted', 'transcript', 'sessionStopped', 'error'])
const SESSION_STATES = new Set(['created', 'starting', 'active', 'stopping', 'stopped', 'failed'])
const TRANSITIONS = Object.freeze({
  created: new Set(['starting', 'failed']),
  starting: new Set(['active', 'stopping', 'failed']),
  active: new Set(['stopping', 'failed']),
  stopping: new Set(['stopped', 'failed']),
  stopped: new Set(),
  failed: new Set(),
})
const SECRET_KEY = /(?:token|secret|credential|password|authorization|api[-_]?key|access[-_]?key|sdp|raw[-_]?provider)/i
const PUBLIC_MESSAGES = Object.freeze({
  invalid_contract: 'The supplied public contract is invalid.',
  invalid_event: 'The supplied voice event is invalid.',
  backend_not_ready: 'The selected backend is not ready.',
  engine_not_available: 'The selected engine is not available.',
  composer_bridge_required: 'The selected backend requires composerBridge.',
  illegal_session_transition: 'The requested session transition is not allowed.',
})

class ContractError extends Error {
  constructor(code) {
    super(PUBLIC_MESSAGES[code])
    this.name = 'ContractError'
    this.code = code
  }

  toJSON() {
    return { code: this.code, message: this.message }
  }
}

function reject(code) {
  throw new ContractError(code)
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function exactRecord(value, keys, code) {
  if (!isRecord(value) || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))) {
    reject(code)
  }
  return value
}

function boundedString(value, limit, code) {
  if (typeof value !== 'string' || value.length === 0 || value.length > limit) reject(code)
  return value
}

function normalizedBackend(value) {
  if (value === BACKEND_IDS.ENCHANTED_REALTIME || value === BACKEND_IDS.ENCHANTED_BRIDGE) return value
  return reject('invalid_contract')
}

function freezePublic(value, depth = 0) {
  if (depth > MAX_PAYLOAD_DEPTH) reject('invalid_event')
  if (value === null || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) reject('invalid_event')
    return value
  }
  if (typeof value === 'string') return boundedString(value, MAX_EVENT_STRING_LENGTH, 'invalid_event')
  if (Array.isArray(value)) {
    if (value.length > MAX_PAYLOAD_ITEMS) reject('invalid_event')
    return Object.freeze(value.map(item => freezePublic(item, depth + 1)))
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
    if (entries.length > MAX_PAYLOAD_ITEMS) reject('invalid_event')
    const copy = {}
    for (const [key, item] of entries) {
      if (key.length === 0 || key.length > MAX_IDENTIFIER_LENGTH || SECRET_KEY.test(key)) reject('invalid_event')
      Object.defineProperty(copy, key, {
        value: freezePublic(item, depth + 1),
        enumerable: true,
        writable: false,
        configurable: false,
      })
    }
    return Object.freeze(copy)
  }
  return reject('invalid_event')
}

function redactSecrets(value) {
  if (Array.isArray(value)) return value.map(redactSecrets)
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SECRET_KEY.test(key) ? '[REDACTED]' : redactSecrets(item)]))
  }
  return value
}

function normalizeOwnerBinding(value) {
  const owner = exactRecord(value, ['connectionId', 'profile', 'runtimeSessionId', 'storedSessionId'], 'invalid_contract')
  return Object.freeze({
    connectionId: boundedString(owner.connectionId, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    profile: boundedString(owner.profile, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    runtimeSessionId: boundedString(owner.runtimeSessionId, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    storedSessionId: boundedString(owner.storedSessionId, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
  })
}

function normalizeFeatureFlags(value) {
  const flags = exactRecord(value, ['composerBridge'], 'invalid_contract')
  if (typeof flags.composerBridge !== 'boolean') reject('invalid_contract')
  return Object.freeze({ composerBridge: flags.composerBridge })
}

function normalizeCapability(value) {
  const capability = exactRecord(value, ['backend', 'installed', 'compatible', 'supported', 'ready', 'featureFlags'], 'invalid_contract')
  const backend = normalizedBackend(capability.backend)
  for (const field of ['installed', 'compatible', 'supported', 'ready']) {
    if (typeof capability[field] !== 'boolean') reject('invalid_contract')
  }
  if (capability.ready && !(capability.installed && capability.compatible && capability.supported)) reject('invalid_contract')
  return Object.freeze({
    backend,
    installed: capability.installed,
    compatible: capability.compatible,
    supported: capability.supported,
    ready: capability.ready,
    featureFlags: normalizeFeatureFlags(capability.featureFlags),
  })
}

function normalizeCapabilities(value) {
  if (!Array.isArray(value)) reject('invalid_contract')
  const normalized = value.map(normalizeCapability)
  if (new Set(normalized.map(item => item.backend)).size !== normalized.length) reject('invalid_contract')
  return Object.freeze(normalized)
}

function normalizeEngine(value) {
  const engine = exactRecord(value, ['backend', 'engine', 'billingLane'], 'invalid_contract')
  return Object.freeze({
    backend: normalizedBackend(engine.backend),
    engine: boundedString(engine.engine, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    billingLane: boundedString(engine.billingLane, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
  })
}

function normalizeVoiceEvent(value) {
  const event = exactRecord(value, ['type', 'sessionId', 'payload'], 'invalid_event')
  if (typeof event.type !== 'string' || !EVENT_TYPES.has(event.type)) reject('invalid_event')
  if (!isRecord(event.payload)) reject('invalid_event')
  return Object.freeze({
    type: event.type,
    sessionId: boundedString(event.sessionId, MAX_IDENTIFIER_LENGTH, 'invalid_event'),
    payload: freezePublic(event.payload),
  })
}

function resolveEngine(request, capabilities, engines) {
  const target = normalizeEngine(request)
  const normalizedCapabilities = normalizeCapabilities(capabilities)
  const normalizedEngines = Array.isArray(engines) ? engines.map(normalizeEngine) : reject('invalid_contract')
  const capability = normalizedCapabilities.find(item => item.backend === target.backend)
  if (!capability || !capability.ready) reject('backend_not_ready')
  if (target.backend === BACKEND_IDS.ENCHANTED_BRIDGE && !capability.featureFlags.composerBridge) {
    reject('composer_bridge_required')
  }
  const engine = normalizedEngines.find(item => item.backend === target.backend && item.engine === target.engine && item.billingLane === target.billingLane)
  if (!engine) reject('engine_not_available')
  return engine
}

function createVoiceSession(backend, engine, owner) {
  return Object.freeze({
    backend: normalizedBackend(backend),
    engine: boundedString(engine, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    owner: normalizeOwnerBinding(owner),
    state: 'created',
  })
}

function transitionVoiceSession(session, state) {
  if (!isRecord(session) || !SESSION_STATES.has(session.state) || !SESSION_STATES.has(state) || !TRANSITIONS[session.state].has(state)) {
    reject('illegal_session_transition')
  }
  return Object.freeze({
    backend: normalizedBackend(session.backend),
    engine: boundedString(session.engine, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    owner: normalizeOwnerBinding(session.owner),
    state,
  })
}

const CONTRACT_TEST_EXPORTS = Object.freeze({
  CONTRACT_VERSION,
  BackendId,
  ContractError,
  normalizeOwnerBinding,
  normalizeCapabilities,
  normalizeVoiceEvent,
  redactSecrets,
  resolveEngine,
  createVoiceSession,
  transitionVoiceSession,
})
/* CONTRACTS_END */
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
/* TRANSCRIPT_BUFFER_START */
class LiveTranscriptBuffer {
  constructor(clock = now) { this.clock = clock; this.records = []; this.listeners = new Set(); this.idleTimer = null }
  clear() { this.records = []; this._cancelIdle(); this._emit() }
  dispose() { this._cancelIdle(); this.listeners.clear() }
  subscribe(fn) { this.listeners.add(fn); fn(this.rendered()); return () => this.listeners.delete(fn) }
  rendered() { return this.records.slice(-60).map(record => ({ ...record })) }
  context(limit = 12000) { const text=this.records.filter(record=>record.kind==='turn'&&record.text).slice(-40).map(record=>`${record.role==='assistant'?'Voice assistant':'User'}: ${record.text.replace(/\s+/g,' ').trim()}`).filter(line=>!line.endsWith(': ')).join('\n');return text.length>limit?text.slice(-limit):text }
  _emit() { for (const listener of this.listeners) listener(this.rendered()) }
  _cancelIdle() { if (this.idleTimer) clearTimeout(this.idleTimer); this.idleTimer = null }
  _scheduleIdle() { this._cancelIdle(); this.idleTimer = setTimeout(() => { const record = this.records.at(-1); if (record && !record.final && this.clock() - record.updatedAt >= 8000) { record.final = true; this._emit() } }, 8050) }
  push({ role = 'system', text = '', final = false, kind = 'turn', status = '' }) { const stamp=this.clock(),safe=typeof text==='string'?text.slice(0,8192):'',previous=this.records.at(-1);if(kind==='turn'&&safe&&previous&&previous.kind==='turn'&&previous.role===role&&!previous.final&&stamp-previous.updatedAt<=3500){previous.text+=safe;previous.updatedAt=stamp;previous.final ||= Boolean(final)}else if(kind==='turn'&&safe)this.records.push({id:`${stamp}-${Math.random()}`,kind,role,text:safe,status:'',final:Boolean(final),createdAt:stamp,updatedAt:stamp});else if(kind!=='turn'&&(safe||status))this.records.push({id:`${stamp}-${Math.random()}`,kind,role:'system',text:safe,status:bounded(status,256),final:true,createdAt:stamp,updatedAt:stamp});if(this.records.length>240)this.records.splice(0,this.records.length-240);const current=this.records.at(-1);if(current&&!current.final)this._scheduleIdle();else this._cancelIdle();this._emit() }
  turnDone(role,text='') { const record=[...this.records].reverse().find(item=>item.kind==='turn'&&item.role===role&&!item.final);const safe=bounded(text,8192);if(record){if(safe)record.text=safe;record.final=true;record.updatedAt=this.clock();this._cancelIdle();this._emit()}else if(safe)this.push({role,text:safe,final:true}) }
}
/* TRANSCRIPT_BUFFER_END */
/* DELEGATION_BRIDGE_START */
const JUNK_DELEGATION=/^(?:hi|hello|hey|thanks|thank you|ok(?:ay)?|sure|yes|no|bye|goodbye|hola|gracias|dale|bueno|al[oó]|me escuchas|\.{1,}|[?!,\s]+)$/i
const STOP_ACTIVE_TASK=/^\s*(?:stop|cancel|skip|abort|never mind|nevermind|do not continue|don't continue)\b/i
const DELEGATION_STATES=new Set(['idle','starting','running','steering','stopping','stop-failed','queued','approval-required','completed','failed','cancelled','expired'])
function isJunkDelegation(text) { const value=bounded(text,2000); return value.length<4 || JUNK_DELEGATION.test(value) }
class DelegationBridge {
  constructor({api,transcript,clock=now,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}) { this.api=api;this.transcript=transcript;this.clock=clock;this.wait=wait;this.active=null;this.queued=null;this.disposed=false;this.listeners=new Set();this.generation=0 }
  subscribe(fn) { if(typeof fn!=='function')throw new Error('Delegation listener must be a function.');this.listeners.add(fn);fn(this.snapshot());return()=>this.listeners.delete(fn) }
  snapshot() { const state=this.active?.state||this.queued?.state||'idle';return Object.freeze({state:DELEGATION_STATES.has(state)?state:'idle',active:this._taskSnapshot(this.active),queued:this._taskSnapshot(this.queued)}) }
  _taskSnapshot(task) { if(!task)return null;const state=DELEGATION_STATES.has(task.state)?task.state:'idle',correlationId=bounded(task.correlationId,128),runId=bounded(task.runId,128),value={state,text:bounded(task.text,8000),correlationId,createdAt:task.createdAt,startedAt:task.startedAt||null,updatedAt:task.updatedAt||task.createdAt,completedAt:task.completedAt||null,lastSteering:bounded(task.lastSteering,8000),resultDelivery:task.resultDelivery||'pending'};if(runId)value.runId=runId;return Object.freeze(value) }
  _emit() { const snapshot=this.snapshot();for(const listener of this.listeners)listener(snapshot) }
  _state(task,state) { if(!task)return;task.state=state;task.updatedAt=this.clock();if(['completed','failed','cancelled','expired'].includes(state))task.completedAt=task.updatedAt;this._emit() }
  _task(owner,text,correlationId,onComplete,voiceContext,state='starting') { const createdAt=this.clock();return {owner,text:bounded(text,8000),voiceContext:bounded(voiceContext,12000),correlationId:bounded(correlationId,128)||`${createdAt}`,onComplete,createdAt,updatedAt:createdAt,startedAt:null,completedAt:null,state,lastSteering:'',resultDelivery:'pending',settled:false,cancelled:false,stopRequested:false,stopAcknowledged:false,generation:this.generation} }
  _valid(task,generation=task.generation) { return !this.disposed&&!task.cancelled&&task.generation===generation&&this.generation===generation }
  async cancel() { const task=this.active;this.generation+=1;this.queued=null;if(task){task.cancelled=true;this._state(task,'cancelled');this.active=null;if(task.runId)await this.api.rest('/v1/run/stop',{method:'POST',body:{owner:task.owner,runId:task.runId},timeoutMs:15000}).catch(()=>{})}this._emit() }
  async dispose() { this.disposed=true;this.generation+=1;this.queued=null;const task=this.active;if(task){task.cancelled=true;this._state(task,'cancelled');this.active=null;if(task.runId)await this.api.rest('/v1/run/stop',{method:'POST',body:{owner:task.owner,runId:task.runId},timeoutMs:15000}).catch(()=>{})}this.listeners.clear() }
  request(owner,text,correlationId,onComplete,voiceContext='') { if(this.disposed||isJunkDelegation(text))return false;const task=this._task(owner,text,correlationId,onComplete,voiceContext);if(this.active?.runId){this._control(task).catch(error=>this.transcript.push({kind:'chip',status:`Task update failed · ${publicError(error)}`}));return true}if(this.active){task.state='queued';this.queued=task;this._emit();this.transcript.push({kind:'chip',status:'delegation queued · replaces the prior queued request'});return true}this._run(task);return true }
  async _deliver(task,text,generation=task.generation) { if(!this._valid(task,generation)||task.settled||typeof task.onComplete!=='function'){if(!task.settled){task.resultDelivery='unavailable';this._emit()}return}task.settled=true;try{await task.onComplete(bounded(text,12000));task.resultDelivery='delivered'}catch(error){task.resultDelivery='failed';throw error}finally{this._emit()} }
  _finish(task) { if(this.active!==task)return;this.active=null;this._emit();const queued=this.queued;this.queued=null;if(!this.disposed&&queued&&this.clock()-queued.createdAt<=600000)this._run(queued);else if(queued){this._state(queued,'expired');this.transcript.push({kind:'chip',status:'queued delegation expired'});this._emit()} }
  async _control(task) { const active=this.active;if(!active?.runId)return;const stopping=STOP_ACTIVE_TASK.test(task.text),path=stopping?'/v1/run/stop':'/v1/run/steer',generation=this.generation
    if(stopping){active.stopRequested=true;this._state(active,'stopping')}else{active.lastSteering=task.text;this._state(active,'steering')}
    try { await this.api.rest(path,{method:'POST',body:{owner:active.owner,runId:active.runId,...(stopping?{}:{text:task.text})},timeoutMs:15000});if(!this._valid(active,generation))return;if(stopping){active.stopAcknowledged=true;this._state(active,'cancelled');this.transcript.push({kind:'chip',status:'Hermes chat task stopped'});await this._deliver(active,'The active Hermes task was stopped.',generation);await this._deliver(task,'The active Hermes task was stopped.',generation);this._finish(active)}else{this._state(active,'running');this.transcript.push({kind:'chip',status:'Hermes chat task updated'});await this._deliver(task,'Your update was sent to the active Hermes task.',generation)}}
    catch(error){if(!this._valid(active,generation))return;if(stopping){this._state(active,'stop-failed');this.transcript.push({kind:'chip',status:`Hermes chat task stop failed · retry available · ${publicError(error)}`});await this._deliver(task,`Hermes could not stop the active task: ${publicError(error)}`,generation)}else{this._state(active,'running');await this._deliver(task,`Hermes could not update the active task: ${publicError(error)}`,generation)}}
  }
  async _run(task) { this.active=task;task.startedAt=this.clock();this._state(task,'starting');this.transcript.push({kind:'chip',status:'Hermes chat tool run · working…'})
    try { const receipt=await this.api.rest('/v1/run/start',{method:'POST',body:{owner:task.owner,text:task.text,voiceContext:task.voiceContext},timeoutMs:15000});task.runId=bounded(receipt?.runId,128);if(task.cancelled&&task.runId){await this.api.rest('/v1/run/stop',{method:'POST',body:{owner:task.owner,runId:task.runId},timeoutMs:15000}).catch(()=>{});return}if(!receipt?.ok||!task.runId)throw new Error('Hermes returned no tool-run receipt.');this._state(task,'running');let output=''
      for(let attempt=0;attempt<180&&!this.disposed&&!task.cancelled&&!task.stopAcknowledged;attempt+=1){const result=await this.api.rest('/v1/run/status',{method:'POST',body:{owner:task.owner,runId:task.runId},timeoutMs:15000});if(this.disposed||task.cancelled||task.stopAcknowledged)break;const status=bounded(result?.status,64);if(task.stopRequested){await this.wait(1000);continue}if(status==='completed'){output=bounded(result.output,12000)||'Hermes completed the tool run without a textual result.';this._state(task,'completed');break}if(['failed','cancelled','interrupted'].includes(status)){this._state(task,status==='failed'?'failed':'cancelled');throw new Error(bounded(result?.error,512)||`Hermes tool run ${status}.`)}if(result?.approvalRequired){this._state(task,'approval-required');await this.api.rest('/v1/run/stop',{method:'POST',body:{owner:task.owner,runId:task.runId},timeoutMs:15000}).catch(()=>{});output='Hermes paused this request because it requires explicit approval in a supported approval surface.';break}await this.wait(1000)}
      if(output){this.transcript.push({kind:'chip',status:'Hermes tool result ready'});await this._deliver(task,output)}else if(!this.disposed&&!task.cancelled&&!task.stopRequested&&!task.stopAcknowledged){await this.api.rest('/v1/run/stop',{method:'POST',body:{owner:task.owner,runId:task.runId},timeoutMs:15000}).catch(()=>{});this._state(task,'expired');this.transcript.push({kind:'chip',status:'Hermes tool run timed out'})}
    } catch(error) { if(task.runId&&!task.stopRequested)await this.api.rest('/v1/run/stop',{method:'POST',body:{owner:task.owner,runId:task.runId},timeoutMs:15000}).catch(()=>{});if(!task.stopRequested){if(task.state!=='cancelled')this._state(task,'failed');this.transcript.push({kind:'chip',status:`delegation failed · ${publicError(error)}`})} }
    finally { if(task.stopRequested&&!task.stopAcknowledged&&!task.cancelled&&!this.disposed)return;this._finish(task) }
  }
}
/* DELEGATION_BRIDGE_END */
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
  const prompts = value.prompts.map((prompt,index) => ({ id: bounded(prompt.id,64), folderId: bounded(prompt.folderId,64), name: bounded(prompt.name,128), body: bounded(prompt.body,12000), tags: [...new Set((Array.isArray(prompt.tags)?prompt.tags:[]).map(tag=>bounded(tag,64)).filter(Boolean))].slice(0,16), order: Number.isInteger(prompt.order) ? prompt.order : index }))
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
/* PROMPT_ACTION_INDEX_START */
const PALETTE_QUERY_LIMIT=256
const PALETTE_RESULT_LIMIT=50
const PALETTE_FAVORITE_LIMIT=64
const PALETTE_RECENT_LIMIT=30
const PALETTE_PREFERENCE_INSPECTION_LIMIT=256
function paletteText(value,limit=12000){return typeof value==='string'?value.slice(0,limit).trim():''}
function palettePreferenceIds(value,limit){const ids=[];if(!Array.isArray(value))return ids;for(let index=0;index<Math.min(value.length,PALETTE_PREFERENCE_INSPECTION_LIMIT);index++){const id=paletteText(value[index],64);if(id&&!ids.includes(id))ids.push(id);if(ids.length===limit)break}return ids}
function normalizePalettePreferences(value){return {favorites:palettePreferenceIds(value?.favorites,PALETTE_FAVORITE_LIMIT),recent:palettePreferenceIds(value?.recent,PALETTE_RECENT_LIMIT)}}
function updatePalettePreferences(current,update){return normalizePalettePreferences(typeof update==='function'?update(normalizePalettePreferences(current)):update)}
function paletteTerms(query){return paletteText(query,PALETTE_QUERY_LIMIT).toLocaleLowerCase().split(/\s+/).filter(Boolean)}
function paletteMatches(terms,fields){if(!terms.length)return true;const haystack=fields.map(field=>paletteText(field).toLocaleLowerCase()).join('\n');return terms.every(term=>haystack.includes(term))}
function buildPromptActionIndex(library,preferences={},query='',actions=[]){
  const terms=paletteTerms(query),folders=new Map((Array.isArray(library?.folders)?library.folders:[]).map(folder=>[folder.id,paletteText(folder.name,128)])),favorites=new Set(Array.isArray(preferences?.favorites)?preferences.favorites:[]),recent=new Set(Array.isArray(preferences?.recent)?preferences.recent:[]),recentOrder=new Map((Array.isArray(preferences?.recent)?preferences.recent:[]).map((id,index)=>[id,index])),prompts=Array.isArray(library?.prompts)?library.prompts:[],active=paletteText(library?.activePromptId,64)
  const rows=[]
  for(const prompt of prompts){const id=paletteText(prompt?.id,64),name=paletteText(prompt?.name,128),body=paletteText(prompt?.body),libraryName=folders.get(prompt?.folderId)||'',tags=Array.isArray(prompt?.tags)?prompt.tags.map(tag=>paletteText(tag,64)).filter(Boolean):[];if(!id||!name||!paletteMatches(terms,[name,body,libraryName,...tags]))continue;rows.push({id,kind:'prompt',title:name,subtitle:libraryName||'Prompt library',prompt,tags,rank:id===active?0:favorites.has(id)?1:recent.has(id)?2:3,recentOrder:recentOrder.get(id)??Number.MAX_SAFE_INTEGER,order:Number.isInteger(prompt?.order)?prompt.order:0})}
  for(const action of Array.isArray(actions)?actions:[]){const id=paletteText(action?.id,64),title=paletteText(action?.title,128),keywords=Array.isArray(action?.keywords)?action.keywords.map(keyword=>paletteText(keyword,64)).filter(Boolean):[];if(!id||!title||!paletteMatches(terms,[title,action?.subtitle,...keywords]))continue;rows.push({id,kind:'action',title,subtitle:paletteText(action?.subtitle,128),action,rank:4,order:0})}
  return rows.sort((left,right)=>left.rank-right.rank||(left.recentOrder??Number.MAX_SAFE_INTEGER)-(right.recentOrder??Number.MAX_SAFE_INTEGER)||left.order-right.order||left.title.localeCompare(right.title)).slice(0,PALETTE_RESULT_LIMIT)
}
/* PROMPT_ACTION_INDEX_END */
/* DRAFT_SHELF_START */
const DRAFT_SHELF_KEY='draft-shelf:v1'
const DRAFT_SHELF_VERSION=1
const DRAFT_SHELF_MAX_TEXT=12000
const DRAFT_SHELF_MAX_PER_SURFACE=20
const DRAFT_SHELF_MAX_ENTRIES=100
const DRAFT_SHELF_MAX_BYTES=256*1024
const DRAFT_SHELF_MAX_NAME=128
const DRAFT_SHELF_MAX_PREVIEW=160
const DRAFT_SHELF_MAX_TTL=1000*60*60*24*30
function draftShelfString(value,limit,label,{trim=false,required=true}={}) {
  if(typeof value!=='string')throw new Error(`${label} is invalid.`)
  if(value.length>limit)throw new Error(`${label} is too long or empty.`)
  const result=trim?value.trim():value
  if(required&&!result)throw new Error(`${label} is too long or empty.`)
  return result
}
function draftShelfOwner(owner) {
  if(!owner||typeof owner!=='object')throw new Error('Draft owner is invalid.')
  return Object.freeze({connectionId:draftShelfString(owner.connectionId,128,'Draft owner'),profile:draftShelfString(owner.profile,128,'Draft owner'),runtimeSessionId:draftShelfString(owner.runtimeSessionId,128,'Draft owner'),storedSessionId:draftShelfString(owner.storedSessionId,128,'Draft owner')})
}
function draftShelfSurface(surface) {
  if(!surface||typeof surface!=='object')throw new Error('Draft surface is invalid.')
  return Object.freeze({address:draftShelfString(surface.address,128,'Draft surface'),surfaceId:draftShelfString(surface.surfaceId,512,'Draft surface')})
}
function draftShelfScope(owner,surface) { return JSON.stringify([owner.connectionId,owner.profile,owner.storedSessionId,surface.address,surface.surfaceId]) }
function draftShelfPreview(text) { return text.replace(/[\u0000-\u001f\u007f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,DRAFT_SHELF_MAX_PREVIEW) }
function draftShelfCopy(entry) { return Object.freeze({...entry}) }
function draftShelfEntry(value) {
  if(!value||typeof value!=='object'||Array.isArray(value))return null
  try {
    const id=draftShelfString(value.id,128,'Draft id'),scope=draftShelfString(value.scope,2048,'Draft scope'),name=draftShelfString(value.name,DRAFT_SHELF_MAX_NAME,'Draft name',{trim:true}),text=draftShelfString(value.text,DRAFT_SHELF_MAX_TEXT,'Draft text',{required:false})
    const temporary=value.temporary===true?true:value.temporary===false?false:null,createdAt=Number(value.createdAt),updatedAt=Number(value.updatedAt)
    if(temporary===null||!Number.isSafeInteger(createdAt)||createdAt<0||!Number.isSafeInteger(updatedAt)||updatedAt<createdAt)throw new Error('Draft timestamps are invalid.')
    const expiresAt=temporary?Number(value.expiresAt):null
    if(temporary&&(!Number.isSafeInteger(expiresAt)||expiresAt<=createdAt))throw new Error('Draft expiry is invalid.')
    return Object.freeze({id,scope,name,text,preview:draftShelfPreview(text),temporary,createdAt,updatedAt,expiresAt})
  } catch { return null }
}
class DraftShelfStore {
  constructor(ctx,{draftAdapter,ownerRouter,now:clock=now,idFactory}={}) {
    if(!ctx?.storage||typeof ctx.storage.get!=='function'||typeof ctx.storage.set!=='function')throw new Error('Draft Shelf storage is unavailable.')
    if(!draftAdapter||typeof draftAdapter.capture!=='function'||typeof draftAdapter.read!=='function'||typeof draftAdapter.compareAndReplace!=='function')throw new Error('Draft Shelf requires the public Composer draft API.')
    if(!ownerRouter||typeof ownerRouter.isActive!=='function')throw new Error('Draft Shelf requires exact focused-owner checks.')
    this.ctx=ctx;this.draftAdapter=draftAdapter;this.ownerRouter=ownerRouter;this.now=clock;this.idFactory=idFactory||(()=>`${this.now()}-${Math.random().toString(36).slice(2)}`)
  }
  _read() {
    const value=this.ctx.storage.get(DRAFT_SHELF_KEY,null)
    if(value===null||value===undefined)return {version:DRAFT_SHELF_VERSION,entries:[]}
    if(!value||typeof value!=='object'||value.version!==DRAFT_SHELF_VERSION||!Array.isArray(value.entries))throw new Error('Draft Shelf storage is invalid.')
    const inspected=Array.prototype.slice.call(value.entries,0,DRAFT_SHELF_MAX_ENTRIES)
    return {version:DRAFT_SHELF_VERSION,entries:inspected.map(draftShelfEntry).filter(Boolean)}
  }
  _serialized(entries) { return JSON.stringify({version:DRAFT_SHELF_VERSION,entries}) }
  _fits(entries) { return entries.length<=DRAFT_SHELF_MAX_ENTRIES&&new TextEncoder().encode(this._serialized(entries)).byteLength<=DRAFT_SHELF_MAX_BYTES }
  _write(document) { this.ctx.storage.set(DRAFT_SHELF_KEY,{version:DRAFT_SHELF_VERSION,entries:document.entries}) }
  _expired(entry) { return Number.isFinite(entry.expiresAt)&&entry.expiresAt<=this.now() }
  _scope(owner,surface) { return draftShelfScope(draftShelfOwner(owner),draftShelfSurface(surface)) }
  _entries(owner,surface) { const scope=this._scope(owner,surface);return this._read().entries.filter(entry=>entry.scope===scope&&!this._expired(entry)) }
  _validateId(id) { return draftShelfString(id,128,'Draft id') }
  _commit(document,nextEntries) {
    if(!this._fits(nextEntries))throw new Error('Draft Shelf global capacity reached; delete a named draft before saving another.')
    this._write({version:DRAFT_SHELF_VERSION,entries:nextEntries});return document
  }
  _saveEntries(entries,entry) {
    const next=[...entries,entry],removable=entries.filter(row=>row.temporary).sort((a,b)=>a.createdAt-b.createdAt||a.updatedAt-b.updatedAt||a.id.localeCompare(b.id))
    for(const row of removable) {
      if(this._fits(next))break
      next.splice(next.indexOf(row),1)
    }
    if(!this._fits(next))throw new Error('Draft Shelf global capacity reached; delete a named draft before saving another.')
    return next
  }
  list(owner,surface) { return this._entries(owner,surface).sort((a,b)=>b.updatedAt-a.updatedAt).map(draftShelfCopy) }
  get(owner,surface,id) { return this._entries(owner,surface).find(entry=>entry.id===this._validateId(id))||null }
  async save(owner,surface,{name='Untitled draft',text,temporary=false,ttlMs=1000*60*60*24}={}) {
    const scope=this._scope(owner,surface),document=this._read(),entries=document.entries.filter(row=>!this._expired(row)),active=entries.filter(entry=>entry.scope===scope)
    const draftText=draftShelfString(text,DRAFT_SHELF_MAX_TEXT,'Draft text',{required:false}),draftName=draftShelfString(name,DRAFT_SHELF_MAX_NAME,'Draft name',{trim:true}),isTemporary=temporary===true
    if(active.length>=DRAFT_SHELF_MAX_PER_SURFACE)throw new Error('Draft Shelf limit reached for this chat.')
    if(!isTemporary&&temporary!==false)throw new Error('Draft type is invalid.')
    const ttl=Number(ttlMs);if(isTemporary&&(!Number.isInteger(ttl)||ttl<1||ttl>DRAFT_SHELF_MAX_TTL))throw new Error('Temporary draft expiry is invalid.')
    const at=this.now(),entry={id:this._validateId(this.idFactory()),scope,name:draftName,text:draftText,preview:draftShelfPreview(draftText),temporary:isTemporary,createdAt:at,updatedAt:at,expiresAt:isTemporary?at+ttl:null}
    if(entries.some(row=>row.id===entry.id))throw new Error('Draft id collision.')
    this._commit(document,this._saveEntries(entries,entry));return draftShelfCopy(entry)
  }
  async rename(owner,surface,id,name) { return this._change(owner,surface,id,entry=>({...entry,name:draftShelfString(name,DRAFT_SHELF_MAX_NAME,'Draft name',{trim:true}),updatedAt:this.now()})) }
  async duplicate(owner,surface,id) {
    const source=this.get(owner,surface,id);if(!source)throw new Error('Draft was not found.')
    return this.save(owner,surface,{name:`${source.name} copy`.slice(0,DRAFT_SHELF_MAX_NAME),text:source.text,temporary:source.temporary,ttlMs:source.temporary?Math.max(1,source.expiresAt-this.now()):undefined})
  }
  async delete(owner,surface,id) {
    const scope=this._scope(owner,surface),draftId=this._validateId(id),document=this._read(),exists=document.entries.some(entry=>entry.scope===scope&&entry.id===draftId&&!this._expired(entry))
    if(!exists)return false
    this._commit(document,document.entries.filter(entry=>!(entry.scope===scope&&entry.id===draftId)));return true
  }
  async _change(owner,surface,id,change) {
    const scope=this._scope(owner,surface),draftId=this._validateId(id),document=this._read(),index=document.entries.findIndex(entry=>entry.scope===scope&&entry.id===draftId&&!this._expired(entry))
    if(index<0)throw new Error('Draft was not found.')
    const entry=change(document.entries[index]),entries=[...document.entries];entries[index]=entry;this._commit(document,entries);return draftShelfCopy(entry)
  }
  prune() { const document=this._read(),entries=document.entries.filter(entry=>!this._expired(entry)),removed=document.entries.length-entries.length;if(removed)this._commit(document,entries);return removed }
  _focused(owner,surface) {
    if(!this.ownerRouter.isActive(owner))throw new Error('Draft restore stopped because focus changed.')
    const captured=this.draftAdapter.capture();if(captured.surfaceId!==surface.surfaceId||captured.address!==surface.address)throw new Error('Draft restore stopped because focus changed.')
  }
  async restore(owner,surface,id,{expectedText,confirmText}={}) {
    const exactOwner=draftShelfOwner(owner),exactSurface=draftShelfSurface(surface),entry=this.get(exactOwner,exactSurface,id);if(!entry)throw new Error('Draft was not found.')
    if(typeof expectedText!=='string')throw new Error('Draft restore requires the exact current text.')
    this._focused(exactOwner,exactSurface);const current=await this.draftAdapter.read(exactSurface);this._focused(exactOwner,exactSurface)
    if(current!==expectedText)throw new Error('Current draft changed; restore was not applied.')
    if(current!==''&&current!==entry.text&&confirmText!==expectedText)throw new Error('Please confirm the exact current draft before replacing it.')
    await this.draftAdapter.compareAndReplace(expectedText,entry.text,exactSurface,()=>this._focused(exactOwner,exactSurface));return draftShelfCopy(entry)
  }
}
/* DRAFT_SHELF_END */
/* DRAFT_ADAPTER_START */
class ComposerDraftAdapter {
  constructor(api=host) { this.api=api }
  capture() {
    if(!this.api.composer?.getDraft||!this.api.composer?.setDraft)throw new Error('Update Hermes Desktop: Enchanted Composer requires the public composer API.')
    const owner=this.api.state.focusedSessionOwner.get(),stored=this.api.state.focusedStoredSessionId.get(),runtime=this.api.state.focusedSessionId.get()
    if(!owner)throw new Error('The focused chat owner is unavailable.')
    if(stored&&!runtime)throw new Error('Wait for this chat to finish loading.')
    const address=stored||runtime||'new',surfaceId=JSON.stringify([owner.connectionId||owner.connection_id,owner.profile,address])
    return Object.freeze({address,surfaceId,editor:surfaceId})
  }
  async read(surface=this.capture()) {
    const text=await this.api.composer.getDraft(surface.address)
    if(typeof text!=='string')throw new Error('The captured composer is not available.')
    return text.replace(/\r\n/g,'\n')
  }
  async replace(text,surface=this.capture()) {
    if(this.capture().surfaceId!==surface.surfaceId)throw new Error('The focused draft changed. Your text was not replaced.')
    if(!await this.api.composer.setDraft(surface.address,String(text).slice(0,12000)))throw new Error('Hermes did not accept the draft change. Reopen this chat and try again.')
  }
  async compareAndReplace(expectedText,text,surface=this.capture(),revalidate=()=>{}) {
    if(typeof expectedText!=='string'||typeof revalidate!=='function')throw new Error('Draft restore requires an exact current draft check.')
    const target=String(text).slice(0,12000),checkSurface=()=>{const current=this.capture();if(current.surfaceId!==surface.surfaceId||current.address!==surface.address)throw new Error('The focused draft changed. Your text was not replaced.')}
    checkSurface();revalidate()
    // The public Composer API has separate read/write calls, not an atomic CAS. Re-read
    // immediately before its acknowledged write, then verify the written value by read-back.
    const current=await this.read(surface);if(current!==expectedText)throw new Error('Current draft changed; restore was not applied.')
    revalidate();checkSurface()
    if(!await this.api.composer.setDraft(surface.address,target))throw new Error('Hermes did not accept the draft change. Reopen this chat and try again.')
    revalidate();checkSurface()
    if(await this.read(surface)!==target)throw new Error('Hermes did not preserve the restored draft. Reopen this chat and try again.')
    revalidate();checkSurface()
  }
  async insert(text,surface=this.capture()) {
    if(this.capture().surfaceId!==surface.surfaceId)throw new Error('The focused draft changed.')
    if(!await this.api.composer.insertText(surface.address,String(text).slice(0,12000),{mode:'block'}))throw new Error('Hermes did not accept the prompt insertion.')
  }
}
/* DRAFT_ADAPTER_END */
/* ENHANCEMENT_REVIEW_START */
class EnhancementReview {
  constructor({maxText=12000,maxTokens=512,maxGroups=32}={}) { this.maxText=maxText;this.maxTokens=maxTokens;this.maxGroups=maxGroups }
  _text(value) { return typeof value==='string'?value.slice(0,this.maxText):'' }
  _exact(value,label) { if(typeof value!=='string')return '';if(value.length>this.maxText)throw new Error(`Enhancement proposal ${label} is too large.`);return value }
  _copy(value,keys,label) { const copy={};for(const key of keys)copy[key]=this._exact(value?.[key],`${label}.${key}`);return copy }
  _freeze(value) { if(Array.isArray(value))return Object.freeze(value.map(item=>this._freeze(item)));if(value&&typeof value==='object'){const copy={};for(const [key,item] of Object.entries(value))copy[key]=this._freeze(item);return Object.freeze(copy)}return value }
  _tokens(text) { return text.match(/\s+|[^\s]+/g)||[] }
  _changes(original,proposed) {
    const left=this._tokens(original),right=this._tokens(proposed)
    if(left.length>this.maxTokens||right.length>this.maxTokens||left.length*right.length>this.maxTokens*this.maxTokens)return null
    const rows=left.length+1,columns=right.length+1,table=Array.from({length:rows},()=>new Uint16Array(columns))
    for(let i=left.length-1;i>=0;i--)for(let j=right.length-1;j>=0;j--)table[i][j]=left[i]===right[j]?table[i+1][j+1]+1:Math.max(table[i+1][j],table[i][j+1])
    const actions=[];let i=0,j=0
    while(i<left.length||j<right.length){if(i<left.length&&j<right.length&&left[i]===right[j]){actions.push(['=',left[i]]);i++;j++}else if(j<right.length&&(i===left.length||table[i][j+1]>=table[i+1][j])){actions.push(['+',right[j++]])}else actions.push(['-',left[i++]])}
    const groups=[],offsets=[];let offset=0;for(const token of left){offsets.push(offset);offset+=token.length}offsets.push(offset)
    let leftAt=0,group=null
    for(const [kind,text] of actions){if(kind==='='){if(group){groups.push(group);group=null}leftAt++;continue}if(!group)group={start:leftAt,end:leftAt,replacement:''};if(kind==='-'){group.end++;leftAt++}else group.replacement+=text}
    if(group)groups.push(group)
    if(groups.length>this.maxGroups)return null
    return groups.map((group,index)=>({id:`change-${index+1}`,start:offsets[group.start],end:offsets[group.end],replacement:this._text(group.replacement)}))
  }
  create({owner,surface,original,prompt,route,proposed}) {
    const before=this._exact(original,'original'),after=this._text(proposed),groups=before===after?[]:this._changes(before,after),routeCopy={kind:this._exact(route?.kind,'route.kind')}
    if(routeCopy.kind==='model')Object.assign(routeCopy,this._copy(route,['provider','model','reasoningEffort'],'route'))
    return this._freeze({owner:this._copy(owner,['connectionId','profile','runtimeSessionId','storedSessionId'],'owner'),surface:this._copy(surface,['surfaceId','editor'],'surface'),original:before,prompt:this._copy(prompt,['id','name','body'],'prompt'),route:routeCopy,proposed:after,mode:groups===null?'whole':'groups',groups:groups||[]})
  }
  compose(proposal,selectedGroupIds=null) {
    if(!proposal||proposal.mode==='whole'||!Array.isArray(selectedGroupIds))return proposal?.proposed||''
    const selected=new Set(selectedGroupIds),groups=proposal.groups.filter(group=>selected.has(group.id))
    let cursor=0,result=''
    for(const group of groups){result+=proposal.original.slice(cursor,group.start)+group.replacement;cursor=group.end}
    return result+proposal.original.slice(cursor)
  }
}
/* ENHANCEMENT_REVIEW_END */
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
/* AUDIO_DEVICE_CONTROLLER_START */
class AudioDeviceController {
  constructor() { this.stream = null; this.audio = null; this.output = null; this.muted = false; this.listeners = new Set(); this.onTrackEnded = null; this.meterTimer=null; this.meterSource=null }
  async devices({requestPermission=false}={}) { if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];let temporary=null;if(requestPermission&&!this.stream){if(!navigator.mediaDevices.getUserMedia)throw new Error('Microphone capture is unsupported.');temporary=await navigator.mediaDevices.getUserMedia({audio:true})}try{return (await navigator.mediaDevices.enumerateDevices()).filter(device=>device.kind==='audioinput'||device.kind==='audiooutput').map(device=>({id:device.deviceId,kind:device.kind,label:device.label||`${device.kind} device`}))}finally{temporary?.getTracks?.().forEach(track=>track.stop())} }
  async acquire(inputDeviceId = 'default') { if (this.stream) throw new Error('Composer Live Voice already owns a microphone lease.'); if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Microphone capture is unsupported.'); try { try{this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:inputDeviceId&&inputDeviceId!=='default'?{exact:inputDeviceId}:undefined}})}catch(error){if(inputDeviceId==='default' || !['NotFoundError','OverconstrainedError'].includes(error?.name))throw error;this.stream=await navigator.mediaDevices.getUserMedia({audio:true})} this.stream.getAudioTracks().forEach(track => track.onended = () => { const callback=this.onTrackEnded; this.release(); callback?.() }); return this.stream } catch (error) { const code = error && error.name === 'NotAllowedError' ? 'Microphone permission was denied.' : error && error.name === 'NotReadableError' ? 'Microphone is busy. End native voice or another call first.' : 'Microphone could not be acquired.'; throw new Error(code) } }
  async levelTest(durationMs = 1500) { const temporary = !this.stream; const stream = this.stream || await this.acquire(); this.audio ||= new AudioContext(); const source = this.audio.createMediaStreamSource(stream), analyser = this.audio.createAnalyser(); source.connect(analyser); try { const data = new Uint8Array(analyser.fftSize); await new Promise(resolve => setTimeout(resolve, Math.min(Math.max(durationMs,100),5000))); analyser.getByteTimeDomainData(data); const level = data.reduce((sum,value) => sum + Math.abs(value - 128),0) / (data.length * 128); return Math.round(level * 100) } finally { source.disconnect(); if (temporary) this.release() } }
  setMuted(muted) { this.muted = Boolean(muted); if (this.stream) this.stream.getAudioTracks().forEach(track => track.enabled = !this.muted); return this.muted }
  async setSink(element, outputDeviceId) { if (!element || !outputDeviceId || outputDeviceId === 'default') return false; if (typeof element.setSinkId !== 'function') return false; await element.setSinkId(outputDeviceId); this.output = element; return true }
  async attachRemote(stream, outputDeviceId='default') { this.detachRemote(); const element=new Audio(); element.autoplay=true; element.srcObject=stream; this.output=element; await this.setSink(element,outputDeviceId); await element.play(); return element }
  monitorBarge(callback) { if(!this.stream || typeof AudioContext==='undefined')return;this.audio ||= new AudioContext();const analyser=this.audio.createAnalyser();analyser.fftSize=512;this.meterSource=this.audio.createMediaStreamSource(this.stream);this.meterSource.connect(analyser);const values=new Uint8Array(analyser.fftSize);let speakingSince=0;this.meterTimer=setInterval(()=>{analyser.getByteTimeDomainData(values);const level=values.reduce((sum,value)=>sum+Math.abs(value-128),0)/(values.length*128);if(!this.muted&&level>.11){speakingSince ||= now();if(now()-speakingSince>600){speakingSince=0;callback(level)}}else speakingSince=0},150) }
  async resumeRemote() { if(this.output)await this.output.play() }
  detachRemote() { if(this.output) { this.output.pause?.(); this.output.srcObject=null; this.output=null } }
  interrupt() { if (this.output) { this.output.pause?.(); try{this.output.currentTime=0}catch{} } }
  release() { if(this.meterTimer)clearInterval(this.meterTimer);this.meterTimer=null;this.meterSource?.disconnect();this.meterSource=null;if (this.stream) this.stream.getTracks().forEach(track => {track.onended=null;track.stop()}); this.stream = null; if (this.audio) { this.audio.close().catch(() => {}); this.audio = null } this.detachRemote(); this.muted = false }
}
/* AUDIO_DEVICE_CONTROLLER_END */
/* VOICE_BACKEND_CONTRACT_START */
class VoiceBackendAdapter {
  async capabilities() { throw new Error('Adapter capabilities are not implemented.') }
  async start() { throw new Error('Adapter start is not implemented.') }
  async setMuted() {}
  async interrupt() {}
  async deliverDelegationResult() {}
  async stop() {}
  subscribe() { return () => {} }
}
class VoiceBackendResolver {
  constructor(adapters) { this.adapters = adapters }
  adapter(selection) { const adapter = this.adapters[selection.backend]; if (!adapter) throw new Error('Selected backend is not installed.'); return adapter }
  async resolve(selection) { const adapter = this.adapter(selection); const capability = await adapter.capabilities(selection); if (!capability || !capability.ready) throw new Error((capability && capability.unavailableReason && capability.unavailableReason.message) || 'Selected backend is not ready.'); if (selection.backend === 'enchanted-bridge' && !(capability.featureFlags && capability.featureFlags.composerBridge)) throw new Error('Selected backend requires composerBridge.'); return { adapter, capability, selection: Object.freeze({ ...selection }) } }
}
/* VOICE_BACKEND_CONTRACT_END */
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
/* ENCHANTED_BRIDGE_ADAPTER_START */
class ComposerBridgeBackendAdapter extends VoiceBackendAdapter {
  constructor(ctx,audio) { super();this.ctx=ctx;this.audio=audio;this.sessions=new Map();this.probe=null }
  _owner(owner) { return {connectionId:owner?.connectionId,profile:owner?.profile,runtimeSessionId:owner?.runtimeSessionId,storedSessionId:owner?.storedSessionId} }
  _url(endpoint) { const url=new URL(endpoint),loopback=/^(127\.0\.0\.1|localhost|\[::1\])$/i.test(url.hostname);if(url.search||url.hash||!url.host||(url.protocol!=='wss:'&&!(url.protocol==='ws:'&&loopback)))throw new Error('Composer bridge requires wss or an explicit loopback development endpoint.');return url.href }
  _send(ref,message) { if(ref.socket.readyState!==WebSocket.OPEN)throw new Error('Composer bridge connection is closed.');ref.socket.send(JSON.stringify(message)) }
  _capable(message,provider) { return message&&message.composerBridge===true&&message.protocol==='composer-bridge-v1'&&message.authMode==='composer-bound-token-v1'&&Array.isArray(message.providers)&&message.providers.includes(provider)&&message.taskAuthority==='composer' }
  _open(endpoint,owner,provider,proof=null,timeoutMs=10000) { return new Promise((resolve,reject)=>{let socket;try{socket=new WebSocket(this._url(endpoint))}catch(error){reject(error);return}let done=false;const finish=(error,result)=>{if(done)return;done=true;clearTimeout(timer);if(error){socket.close();reject(error)}else resolve(result)},timer=setTimeout(()=>finish(new Error('Composer bridge handshake timed out.')),timeoutMs);socket.onopen=()=>socket.send(JSON.stringify({type:'composer.capabilities.request',protocol:'composer-bridge-v1',provider,...(owner?{owner:this._owner(owner)}:{}),...(proof?{proof}:{})}));socket.onerror=()=>finish(new Error('Composer bridge connection failed.'));socket.onmessage=event=>{let message;try{message=JSON.parse(event.data)}catch{return}if(message.type==='composer.capabilities'){if(!this._capable(message,provider))finish(new Error('Gateway does not advertise a compatible authenticated Composer bridge.'));else finish(null,{socket,capabilities:message})}}}) }
  _payload(msg) { if(!msg||typeof msg!=='object'||typeof msg.type!=='string'||typeof msg.sessionId!=='string'||msg.sessionId.length>128||!msg.payload||typeof msg.payload!=='object'||Array.isArray(msg.payload))return null;const p=msg.payload,keys=Object.keys(p);if(keys.length>8||keys.some(key=>/token|secret|credential|password|authorization|api[-_]?key|access[-_]?key|sdp|raw[-_]?provider/i.test(key)))return null;const text=value=>typeof value==='string'&&value.length<=8192?value:'';const bool=value=>typeof value==='boolean'?value:false;switch(msg.type){case 'composer.transcript':if(!['user','assistant'].includes(p.role)||!text(p.text))return null;return {type:'transcript.delta',payload:{role:p.role,text:text(p.text),final:bool(p.final)}};case 'composer.turn.done':if(!['user','assistant'].includes(p.role))return null;return {type:'turn.done',payload:{role:p.role,text:text(p.text)}};case 'composer.response':if(!['speaking','idle'].includes(p.state))return null;return {type:'response.state',payload:{state:p.state,newTurn:bool(p.newTurn)}};case 'composer.delegation':if(!text(p.text)||!text(p.correlationId)||p.correlationId.length>128)return null;return {type:'delegation.requested',payload:{text:text(p.text),correlationId:text(p.correlationId)}};case 'composer.usage':if(!Number.isFinite(p.audioMs)||p.audioMs<0||p.audioMs>86_400_000)return null;return {type:'usage.updated',payload:{audioMs:Math.floor(p.audioMs)}};case 'composer.error':return {type:'error',payload:{message:'Composer bridge reported an error.'}};case 'composer.session':if(!['connected','closed'].includes(p.state))return null;return {type:'session.state',payload:{state:p.state}};case 'composer.audio':if(typeof p.base64!=='string'||p.base64.length>1_400_000||!/^[A-Za-z0-9+/=]+$/.test(p.base64))return null;return {type:'audio.output',payload:{base64:p.base64}};default:return null} }
  async capabilities(selection) { if(!selection.endpoint)return {backend:'enchanted-bridge',installed:false,compatible:false,supported:false,ready:false,featureFlags:{composerBridge:false},unavailableReason:{message:'A Composer bridge endpoint is required.'}};try{const probe=await this._open(selection.endpoint,null,selection.provider);this.probe?.socket.close();this.probe={...probe,endpoint:selection.endpoint,provider:selection.provider};return {backend:'enchanted-bridge',installed:true,compatible:true,supported:true,ready:true,featureFlags:{composerBridge:true}}}catch(error){return {backend:'enchanted-bridge',installed:true,compatible:false,supported:false,ready:false,featureFlags:{composerBridge:false},unavailableReason:{message:publicError(error)}}} }
  async start(request) { const probe=this.probe;if(!probe||probe.endpoint!==request.endpoint||probe.provider!==request.provider)throw new Error('Composer bridge preflight expired.');probe.socket.close();this.probe=null;const id=`bridge-${now()}-${Math.random().toString(36).slice(2)}`,owner=this._owner(request.owner),proof=await this.ctx.rest('/v1/live/bridge-proof',{method:'POST',body:{owner,endpoint:request.endpoint,provider:request.provider,sessionId:id,nonce:`${now()}-${Math.random().toString(36).slice(2)}`},timeoutMs:10000});if(!proof?.proof||!proof?.expiresAt||Number(proof.expiresAt)*1000<=Date.now())throw new Error('Composer bridge authorization is not ready.');const {socket,capabilities}=await this._open(request.endpoint,owner,request.provider,proof);if(capabilities.audioFraming!=='webm-opus-v1'||typeof MediaRecorder==='undefined'||!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')){socket.close();throw new Error('Composer bridge audio framing is unsupported.')}const ref={id,socket,owner,provider:request.provider,sinks:new Set(),closed:false,capabilities,sequence:0,results:new Set(),playback:null,interrupted:false};this.sessions.set(id,ref);const emit=event=>{let msg;try{msg=JSON.parse(event.data)}catch{this._emitMalformed(ref);return}if(msg.sessionId!==id||ref.closed)return;const normalized=this._payload(msg);if(!normalized){this._emitMalformed(ref);return}if(normalized.type==='response.state'&&normalized.payload.newTurn)ref.interrupted=false;for(const sink of ref.sinks)sink(normalized);if(normalized.type==='audio.output'){const bytes=Uint8Array.from(atob(normalized.payload.base64),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'audio/webm;codecs=opus'}));ref.playback?.pause();if(ref.playback?.src)URL.revokeObjectURL(ref.playback.src);ref.playback=new Audio(url);this.audio?.setSink(ref.playback,request.outputDeviceId).catch(()=>{});ref.playback.play().catch(()=>{})}};await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{socket.close();reject(new Error('Composer bridge session timed out.'))},10000);socket.onmessage=event=>{let msg;try{msg=JSON.parse(event.data)}catch{return}const same=msg.type==='composer.session.ready'&&msg.sessionId===id&&JSON.stringify(msg.owner)===JSON.stringify(owner);if(same&&msg.authMode==='composer-bound-token-v1'){clearTimeout(timer);resolve()}else if(msg.type==='composer.error'){clearTimeout(timer);reject(new Error('Composer bridge refused the session.'))}};this._send(ref,{type:'composer.session.start',protocol:'composer-bridge-v1',sessionId:id,owner,provider:request.provider,engine:request.engine,billingLane:request.billingLane,voice:request.voice,language:request.language,proof})}).catch(error=>{this.sessions.delete(id);ref.closed=true;socket.close();throw error});socket.onmessage=emit;socket.onclose=()=>{if(!ref.closed)for(const sink of ref.sinks)sink({type:'error',payload:{code:'bridge-closed',fatal:true,message:'The custom voice bridge disconnected. Retry when it is available.'}})};ref.recorder=new MediaRecorder(request.stream,{mimeType:'audio/webm;codecs=opus'});ref.recorder.ondataavailable=async event=>{if(ref.closed||!event.data.size||socket.bufferedAmount>1_000_000)return;const bytes=new Uint8Array(await event.data.arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);this._send(ref,{type:'composer.audio.input',sessionId:id,sequence:++ref.sequence,base64:btoa(binary)})};ref.recorder.start(200);return {id,backend:'enchanted-bridge',owner,resultCapture:request.resultCapture,state:'live'} }
  _emitMalformed(ref) { for(const sink of ref.sinks)sink({type:'error',payload:{message:'Composer bridge sent an invalid public event.'}}) }
  subscribe(id,sink) { const ref=this.sessions.get(id);if(!ref)throw new Error('Composer bridge session ended.');ref.sinks.add(sink);return()=>ref.sinks.delete(sink) }
  async setMuted(id,muted) { const ref=this.sessions.get(id);if(ref)this._send(ref,{type:'composer.input.mute',sessionId:id,muted:Boolean(muted)}) }
  async interrupt(id) { const ref=this.sessions.get(id);if(!ref||ref.interrupted)return;ref.interrupted=true;ref.playback?.pause();this._send(ref,{type:'composer.response.interrupt',sessionId:id}) }
  async deliverDelegationResult(id,correlationId,text) { const ref=this.sessions.get(id);if(!ref||ref.results.has(correlationId))return;this._send(ref,{type:'composer.delegation.result',sessionId:id,correlationId,text:bounded(text,3500)});ref.results.add(correlationId) }
  async stop(id) { const ref=this.sessions.get(id);if(!ref)return;this.sessions.delete(id);if(ref.recorder&&ref.recorder.state!=='inactive')ref.recorder.stop();ref.playback?.pause();if(ref.playback?.src)URL.revokeObjectURL(ref.playback.src);if(ref.socket.readyState===WebSocket.OPEN)this._send(ref,{type:'composer.session.close',sessionId:id});ref.closed=true;ref.socket.close();ref.sinks.clear() }
}
/* ENCHANTED_BRIDGE_ADAPTER_END */
/* SPEECH_ENGINE_CATALOG_START */
const SPEECH_BILLING_CLASSES=new Set(['subscription','api','local','managed','unknown'])
const SPEECH_SECRET_KEY=/(?:token|secret|credential|password|authorization|api[-_]?key|access[-_]?key)/i
function speechRecord(value) { return value!==null&&typeof value==='object'&&!Array.isArray(value) }
function speechText(value,limit=128) { if(typeof value!=='string'||!value.trim()||value.length>limit)throw new Error('Invalid speech capability receipt.');return value.trim() }
function speechFlag(value) { if(typeof value!=='boolean')throw new Error('Invalid speech capability receipt.');return value }
function speechInteger(value) { if(!Number.isInteger(value)||value<0||value>1_000_000)throw new Error('Invalid speech capability receipt.');return value }
function speechSafe(value) { if(!speechRecord(value)||Object.keys(value).some(key=>SPEECH_SECRET_KEY.test(key)))throw new Error('Invalid speech capability receipt.');return value }
function speechExact(value,keys) { const row=speechSafe(value),actual=Object.keys(row);if(actual.length!==keys.length||actual.some(key=>!keys.includes(key)))throw new Error('Invalid speech capability receipt.');return row }
function speechStreaming(value) { const row=speechExact(value,['input','output']);return Object.freeze({input:speechFlag(row.input),output:speechFlag(row.output)}) }
function speechPreview(value) { const row=speechExact(value,['supported','url']),supported=speechFlag(row.supported);if(typeof row.url!=='string'||row.url.length>2048)throw new Error('Invalid speech capability receipt.');const url=row.url.trim();if(url&&!/^https:\/\//i.test(url))throw new Error('Invalid speech capability receipt.');if(!supported&&url)throw new Error('Invalid speech capability receipt.');return Object.freeze({supported,url}) }
function speechBillingClass(value) { if(!SPEECH_BILLING_CLASSES.has(value))throw new Error('Invalid speech capability receipt.');return value }
function normalizeNativeRealtimeEngine(value) { const row=speechExact(value,['id','provider','model','voice','language','streaming','preview','local','ready','maxInputLength','maxOutputLength','billingClass']);return Object.freeze({id:speechText(row.id),provider:speechText(row.provider),model:speechText(row.model),voice:speechText(row.voice),language:speechText(row.language,32),streaming:speechStreaming(row.streaming),preview:speechPreview(row.preview),local:speechFlag(row.local),ready:speechFlag(row.ready),maxInputLength:speechInteger(row.maxInputLength),maxOutputLength:speechInteger(row.maxOutputLength),billingClass:speechBillingClass(row.billingClass)}) }
function normalizeSpeechProviderReceipt(value) { const row=speechExact(value,['provider','model','voice','language','streaming','preview','local','ready','maxInputLength','maxOutputLength','billingClass']);return Object.freeze({provider:speechText(row.provider),model:speechText(row.model),voice:speechText(row.voice),language:speechText(row.language,32),streaming:speechStreaming(row.streaming),preview:speechPreview(row.preview),local:speechFlag(row.local),ready:speechFlag(row.ready),maxInputLength:speechInteger(row.maxInputLength),maxOutputLength:speechInteger(row.maxOutputLength),billingClass:speechBillingClass(row.billingClass)}) }
function normalizeSpeechCatalog(value) { const row=speechExact(value,['nativeRealtime','providers']);if(!Array.isArray(row.nativeRealtime)||!Array.isArray(row.providers))throw new Error('Invalid speech capability receipt.');const nativeRealtime=row.nativeRealtime.map(normalizeNativeRealtimeEngine),providers=row.providers.map(normalizeSpeechProviderReceipt);if(nativeRealtime.length>32||providers.length>128||new Set(nativeRealtime.map(item=>item.id)).size!==nativeRealtime.length||new Set(providers.map(item=>`${item.provider}\u001f${item.model}\u001f${item.voice}\u001f${item.language}`)).size!==providers.length)throw new Error('Invalid speech capability receipt.');return Object.freeze({nativeRealtime:Object.freeze(nativeRealtime),providers:Object.freeze(providers)}) }
/* SPEECH_ENGINE_CATALOG_END */
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
  async setMuted(muted) {
    const session=this.session,adapter=this.adapter;if(!session)return false
    const value=this.audio.setMuted(Boolean(muted));this._emit()
    try{await adapter.setMuted(session.id,value)}catch{this._note('mute-sync','Microphone changed locally; provider acknowledgement was unavailable.');this._emit()}
    return value
  }
  mute() { return this.setMuted(!this.audio.muted) }
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
/* SETTINGS_STORE_START */
const DEFAULT_SETTINGS=Object.freeze({backend:'enchanted-realtime',engine:'gpt-live-1-codex',provider:'codex',billingLane:'subscription',voice:'cove',language:'en',inputDeviceId:'default',outputDeviceId:'default',endpoint:''})
const SETTINGS_FIELDS=Object.freeze({backend:'backend',provider:'provider',billingLane:'billing_lane',engine:'engine',voice:'voice',language:'language',inputDeviceId:'input_device_id',outputDeviceId:'output_device_id',endpoint:'bridge_endpoint'})
function settingsWire(settings) { return Object.fromEntries(Object.entries(SETTINGS_FIELDS).map(([key,wire])=>[wire,settings[key]])) }
function settingsLocal(wire) { return Object.fromEntries(Object.entries(SETTINGS_FIELDS).map(([key,name])=>[key,wire[name]])) }
function migrateRendererVoiceDefaults(settings) {
  if(!settings||typeof settings!=='object')return null
  const next={...settings}

  if(next.backend==='enchanted-realtime'&&next.provider==='codex'&&next.billingLane==='subscription'&&(next.engine===undefined||next.engine==='gpt-live-1-codex')&&next.voice==='cedar')next.voice='cove'
  return next
}
class ComposerSettingsStore {
  constructor(ctx,{delay=350}={}) { this.ctx=ctx;this.delay=delay;this.records=new Map();this.listeners=new Set();this.closed=false }
  key(owner) { return JSON.stringify([owner.connectionId,owner.profile]) }
  subscribe(fn) { this.listeners.add(fn);return()=>this.listeners.delete(fn) }
  _emit(record) { for(const fn of this.listeners)fn(record) }
  record(owner) {
    const key=this.key(owner)
    if(!this.records.has(key)) {
      const cached=migrateRendererVoiceDefaults(this.ctx.storage.get(`settings:${key}`,null)),pending=migrateRendererVoiceDefaults(this.ctx.storage.get(`pending-settings:${key}`,null))
      this.records.set(key,{key,owner:{...owner},cachedValue:cached,value:{...DEFAULT_SETTINGS,...cached,...pending},saved:{...DEFAULT_SETTINGS,...cached},revision:pending?1:0,savedRevision:0,status:pending?'unsaved':'loading',error:'',loaded:false,timer:null,flight:null,loading:null})
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
        if(!record.revision&&result.exists===false&&record.cachedValue){record.value={...saved,...record.cachedValue};record.revision++}
        else if(!record.revision)record.value={...saved}
        // One-time legacy renderer defaults belong only to the first adopting owner.
        const legacy=migrateRendererVoiceDefaults(this.ctx.storage.get('settings',null)),claim=this.ctx.storage.get('settings-migration-owner',null)
        if(result.exists===false && !record.cachedValue && legacy && (!claim||claim===record.key) && !record.revision){
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
/* SETTINGS_UI_START */
function statusText(value, fallback='Unavailable') { return bounded(value && (value.detail || value.message || value.status),180) || fallback }
function sameKeys(left,right,keys) { return keys.every(key=>(left?.[key]??'')===(right?.[key]??'')) }
function usageRow(label,value) { const minutes=Number(value?.minutes)||0,audio=Number(value?.audioMinutes)||0;return jsxs('div',{className:'flex items-center justify-between gap-3 border-t border-(--ui-stroke-secondary) py-2 text-xs',children:[jsx('span',{className:'font-medium text-(--ui-text-secondary)',children:label}),jsx('span',{children:`${minutes.toFixed(1)} min · ${audio.toFixed(1)} audio · ${Number(value?.sessions)||0} sessions`})]}) }
function Field({ label, children }) { return jsxs('div',{className:'ec-field',children:[jsx('span',{children:label}),children]}) }
function PanelHeader({ title, description, actions }) { return jsxs('div',{className:'flex flex-wrap items-start justify-between gap-3',children:[jsxs('div',{children:[jsx('h2',{className:'text-sm font-semibold',children:title}),jsx('p',{className:'mt-1 text-xs text-(--ui-text-tertiary)',children:description})]}),actions?jsx('div',{className:'flex flex-wrap gap-2',children:actions}):null]}) }
const COMPOSER_CONTROL_STORAGE_KEY='composer-control-visibility'
const COMPOSER_CONTROL_DEFINITIONS=Object.freeze([
  {id:'voice',icon:'mic',label:'Live voice',description:'Start, mute, and end a voice conversation.'},
  {id:'voice-mode',icon:'broadcast',label:'Voice mode',description:'Choose continuous or push-to-talk behavior.'},
  {id:'prompt-library',icon:'notebook',label:'Prompt library',description:'Choose or insert a saved enhancement prompt.'},
  {id:'draft-shelf',icon:'bookmark',label:'Draft shelf',description:'Save the current unsent draft for later.'},
  {id:'review',icon:'preview',label:'Review enhancement',description:'Preview and selectively apply proposed changes.'},
  {id:'enhance',icon:'sparkle',label:'Enhance',description:'Enhance the current draft immediately.'},
  {id:'undo',icon:'discard',label:'Undo enhancement',description:'Undo the most recent enhancement.'},
  {id:'redo',icon:'redo',label:'Redo enhancement',description:'Reapply the most recently undone enhancement.'},
  {id:'settings',icon:'settings-gear',label:'Composer settings',description:'Open Enchanted Composer settings from the composer.'},
])
function normalizeComposerControlVisibility(value) {
  const input=value&&typeof value==='object'&&!Array.isArray(value)?value:{}
  return Object.fromEntries(COMPOSER_CONTROL_DEFINITIONS.map(item=>[item.id,input[item.id]!==false]))
}
function ThemedSelect({ options, value, onChange, disabled=false, ariaLabel }) {
  const [open,setOpen]=useState(false),rows=(Array.isArray(options)?options:[]).filter(Boolean),selected=rows.find(row=>row.value===value),label=selected?.label??value??'Choose'
  const choose=row=>{if(disabled||row.disabled)return;onChange?.(row.value);setOpen(false)}
  return jsx(Popover,{open,onOpenChange:next=>{if(!disabled)setOpen(next)},children:jsxs(Fragment,{children:[jsx(PopoverTrigger,{asChild:true,children:jsxs('button',{type:'button',disabled,'aria-label':ariaLabel,'aria-haspopup':'listbox','aria-expanded':open,className:'ec-select-trigger',children:[jsx('span',{className:'truncate',children:label}),jsx(Codicon,{name:'chevron-down',size:'0.8rem'})]})}),jsx(PopoverContent,{align:'start',variant:'menu',className:'w-(--radix-popover-trigger-width) min-w-48 max-w-[calc(100vw-1rem)] bg-(--ui-bg-elevated) p-1',children:jsx('div',{role:'listbox','aria-label':ariaLabel,className:'max-h-64 overflow-y-auto',children:rows.map(row=>jsxs(RowButton,{type:'button',role:'option','aria-selected':row.value===value,disabled:row.disabled,className:`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs hover:bg-(--ui-control-active-background) ${row.value===value?'bg-(--ui-control-active-background)':''}`,onClick:()=>choose(row),children:[jsx('span',{className:'truncate',children:row.label}),row.value===value?jsx(Codicon,{name:'check',size:'0.8rem'}):null]},row.value))})})]})})
}
function SearchableModelPicker({ options, value, onChange, disabled=false }) {
  const [open,setOpen]=useState(false),[query,setQuery]=useState('')
  const needle=query.trim().toLowerCase(),filtered=needle?options.filter(item=>item.toLowerCase().includes(needle)):options
  const choose=item=>{onChange(item);setOpen(false);setQuery('')}
  const label=value?(options.includes(value)?value:`${value} · unavailable`):'Choose a model'
  return jsx(Popover,{open,onOpenChange:next=>{setOpen(next);if(!next)setQuery('')},children:jsxs(Fragment,{children:[jsx(PopoverTrigger,{asChild:true,children:jsxs('button',{type:'button',disabled,'aria-label':'Enhancement model','aria-expanded':open,className:'ec-select-trigger',children:[jsx('span',{className:'truncate',children:label}),jsx(Codicon,{name:'chevron-down',size:'0.8rem'})]})}),jsx(PopoverContent,{align:'start',variant:'menu',className:'w-(--radix-popover-trigger-width) min-w-64 max-w-[calc(100vw-1rem)] bg-(--ui-bg-elevated) p-1.5',children:jsxs('div',{children:[jsxs('label',{className:'mb-1.5 flex h-7 items-center border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) px-2',children:[jsx(Codicon,{name:'search',size:'0.75rem'}),jsx('input',{type:'search',value:query,onChange:event=>setQuery(event.target.value),placeholder:'Search models','aria-label':'Search enhancement models',autoFocus:true,className:'min-w-0 flex-1 border-0 bg-transparent px-1 py-0 text-xs outline-none placeholder:text-(--ui-text-tertiary)'})]}),jsx('div',{className:'max-h-64 overflow-y-auto',role:'listbox','aria-label':'Enhancement models',children:filtered.length?filtered.map(item=>jsxs(RowButton,{className:`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs hover:bg-(--ui-control-active-background) ${item===value?'bg-(--ui-control-active-background)':''}`,role:'option','aria-selected':item===value,onClick:()=>choose(item),children:[jsx('span',{className:'truncate',children:item}),item===value?jsx(Codicon,{name:'check',size:'0.8rem'}):null]},item)):jsx('p',{className:'px-2 py-4 text-center text-xs text-(--ui-text-tertiary)',children:'No advertised models match that search.'})})]})})]})})
}
function enhancementThinkingLevels(provider,model,capability) {
  if(!provider||!model||capability?.reasoning===false)return ['']
  const bare=model.toLowerCase().split('/').at(-1),canDisable=capability?.canDisableReasoning!==false
  let values
  if(provider==='openai-codex'){if(['gpt-6-astra','gpt-6-astra-900k'].includes(bare))values=['low','medium','high','xhigh','max'];else if(bare.includes('gpt-5.6')||bare.startsWith('gpt-6-sol')||bare.startsWith('gpt-6-luna'))values=['none','low','medium','high','xhigh','max'];else values=['none','low','medium','high','xhigh']}else values=['none','minimal','low','medium','high','xhigh','max']
  if(!canDisable)values=values.filter(value=>value!=='none')
  return ['',...values]
}
const EC_STYLES=`
.ec-settings{max-width:1040px;padding:28px;color:var(--ui-text-primary);font-size:13px}
.ec-settings h1{font-size:24px;letter-spacing:-.025em;font-weight:600;margin:0}
.ec-settings h2{font-size:16px;font-weight:600;margin:0}.ec-settings h3{font-weight:600;margin:18px 0 8px}
.ec-muted{color:var(--ui-text-tertiary);font-size:12px;line-height:1.6}.ec-settings p{margin:6px 0}
.ec-head,.ec-row{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}
.ec-tabs{display:flex;gap:4px;overflow:auto;border-bottom:1px solid var(--ui-stroke-secondary);margin:22px 0}
.ec-tabs button{background:transparent;border:0;border-bottom:2px solid transparent;padding:12px 14px;color:var(--ui-text-tertiary);white-space:nowrap}
.ec-tabs button[aria-selected=true]{color:var(--ui-text-primary);border-bottom-color:var(--ui-accent)}
.ec-settings button:focus-visible,.ec-settings input:focus-visible,.ec-settings textarea:focus-visible{outline:2px solid var(--ui-accent);outline-offset:2px}
.ec-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:22px}
.ec-field,.ec-settings label{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:500}
.ec-settings input:not([type=checkbox]),.ec-settings textarea,.ec-select-trigger{box-sizing:border-box;min-width:0;width:100%;background:var(--ui-control-background,transparent);color:var(--ui-text-primary);border:1px solid var(--ui-stroke-secondary);border-radius:6px;padding:9px 10px;font:inherit}
.ec-select-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left}
.ec-settings label.ec-control-toggle{display:flex;flex-direction:row;align-items:flex-start;justify-content:space-between;gap:16px}
.ec-composer-preview{margin-top:18px;border:1px solid var(--ui-stroke-secondary);border-radius:8px;background:color-mix(in srgb,var(--ui-bg-elevated) 94%,transparent);overflow:hidden}
.ec-preview-head{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;color:var(--ui-text-tertiary);font-size:10px;border-bottom:1px solid var(--ui-stroke-secondary)}
.ec-preview-input{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:38px;padding:7px 9px}.ec-preview-placeholder{color:var(--ui-text-tertiary);font-size:11px;white-space:nowrap}
.ec-preview-icons{display:flex;align-items:center;justify-content:flex-end;gap:2px;min-width:0;flex-wrap:wrap}.ec-preview-icon{display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center;border-radius:5px;color:var(--ui-text-tertiary);background:transparent}
.ec-toggle-control{position:relative;display:inline-flex;flex:0 0 auto;margin-top:1px}.ec-toggle-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.ec-toggle-box{display:inline-flex;width:14px;height:14px;align-items:center;justify-content:center;border:1px solid var(--ui-stroke-primary,var(--ui-stroke-secondary));border-radius:4px;color:transparent;background:var(--ui-control-background,transparent);transition:background 120ms,border-color 120ms,color 120ms}.ec-toggle-input:checked+.ec-toggle-box{border-color:var(--ui-accent);background:var(--ui-accent);color:var(--ui-bg-primary,#111)}.ec-toggle-input:focus-visible+.ec-toggle-box{outline:2px solid var(--ui-accent);outline-offset:2px}
.ec-settings textarea{min-height:140px;resize:vertical;line-height:1.6}.ec-settings button{cursor:pointer}.ec-settings button:disabled{opacity:.45;cursor:default}
.ec-section{padding:0 0 24px}.ec-divider{border-top:1px solid var(--ui-stroke-secondary);margin:24px 0}.ec-note{padding:12px 14px;border-left:2px solid var(--ui-accent);margin:18px 0;font-size:12px;line-height:1.6;background:var(--ui-control-active-background)}
.ec-prompts{display:grid;grid-template-columns:minmax(180px,1fr) minmax(0,2fr);gap:24px;margin-top:22px}.ec-prompt-list{display:flex;flex-direction:column;gap:4px}.ec-prompt-list button{text-align:left;padding:10px;border:0;border-radius:6px;background:transparent;color:inherit}.ec-prompt-list button[aria-pressed=true]{background:var(--ui-control-active-background)}
.ec-stack{display:flex;flex-direction:column;gap:14px}.ec-status{font-size:12px;color:var(--ui-text-tertiary)}.ec-error{color:var(--dt-destructive,var(--ui-text-primary));overflow-wrap:anywhere}
@media(max-width:650px){.ec-settings{padding:16px}.ec-grid,.ec-prompts{grid-template-columns:1fr}.ec-settings h1{font-size:21px}.ec-tabs{flex-wrap:wrap}.ec-tabs button{padding:10px}}
`
function SettingsStatus({record,onRetry}) {
  const labels={loading:'Loading…',saving:'Saving…',saved:'All changes saved',unsaved:'Changes waiting to save',error:'Couldn’t save'}
  return jsxs('div',{className:'ec-status',role:'status','aria-live':'polite',children:[jsx('span',{children:labels[record?.status]||'Loading…'}),record?.status==='error'?jsx(Button,{type:'button',size:'sm',variant:'ghost',onClick:onRetry,children:'Retry save'}):null]})
}
function EnhancementModelPanel({controller,catalog,error}) {
  const [library,setLibrary]=useState(()=>controller.library),[providerDraft,setProviderDraft]=useState(null)
  useEffect(()=>{controller.libraryListeners.add(setLibrary);return()=>controller.libraryListeners.delete(setLibrary)},[controller])
  const chosen=library.enhanceWith,provider=providerDraft??(chosen.kind==='model'?chosen.provider:''),model=chosen.kind==='model'&&chosen.provider===provider?chosen.model:''
  const rows=catalog?.models||[],models=rows.filter(row=>row.provider===provider),current=models.find(row=>row.model===model)
  const save=value=>{try{controller.saveLibrary(libraryChange(controller.library,{type:'override',value}));setProviderDraft(null)}catch(reason){host.notify({kind:'error',message:publicError(reason)})}}
  return jsxs('section',{className:'ec-section',children:[jsx(PanelHeader,{title:'Make your draft clearer',description:'Enhance before sending—even in a new chat. Undo and redo stay with that draft.'}),error?jsx('p',{className:'ec-error',role:'alert',children:error}):null,
    jsx('div',{className:'ec-note',children:chosen.kind==='model'?`Using ${chosen.model} · ${chosen.provider}`:'Using the profile’s default enhancement route. No message is sent to chat.'}),
    jsxs('div',{className:'ec-grid',children:[jsx(Field,{label:'Provider',children:jsx(ThemedSelect,{ariaLabel:'Enhancement provider',value:provider,options:[{value:'',label:'Profile default'},...(catalog?.providers||[]).filter(p=>rows.some(row=>row.provider===p.slug)).map(p=>({value:p.slug,label:p.name||p.slug}))],onChange:value=>{if(!value)save({kind:'session',reasoningEffort:''});else setProviderDraft(value)}})}),jsx(Field,{label:'Model',children:jsx(SearchableModelPicker,{options:models.map(row=>row.model),value:model,disabled:!provider,onChange:value=>save({kind:'model',provider,model:value,reasoningEffort:''})})}),jsx(Field,{label:'Thinking level',children:jsx(ThemedSelect,{ariaLabel:'Thinking level',value:chosen.kind==='model'?chosen.reasoningEffort:'',disabled:!current||current.capability?.reasoning===false,options:enhancementThinkingLevels(provider,model,current?.capability).map(value=>({value,label:value||'Provider default'})),onChange:value=>save({kind:'model',provider,model,reasoningEffort:value})})})]}),providerDraft?jsx('p',{className:'ec-muted',role:'status',children:'Choose a model to finish this selection. Your previous choice is still saved.'}):jsx('p',{className:'ec-muted',children:'Valid selections save automatically on this device. Prompts are managed in the next tab.'})]})
}
function PromptLibraryPanel({controller}) {
  const [library,setLibrary]=useState(()=>controller.library),[editor,setEditor]=useState(()=>controller.ctx.storage.get('prompt-editor-draft',null)),[newLibrary,setNewLibrary]=useState(''),[notice,setNotice]=useState(''),[importText,setImportText]=useState(''),[preview,setPreview]=useState(null),[rollback,setRollback]=useState(null)
  useEffect(()=>{controller.libraryListeners.add(setLibrary);return()=>controller.libraryListeners.delete(setLibrary)},[controller])
  const change=action=>{try{controller.saveLibrary(libraryChange(controller.library,action));setNotice('Saved on this device.')}catch(error){setNotice(publicError(error))}}
  const edit=prompt=>{const next={id:prompt.id,name:prompt.name,body:prompt.body,folderId:prompt.folderId};setEditor(next);controller.ctx.storage.set('prompt-editor-draft',next)}
  const update=patch=>{const next={...editor,...patch};setEditor(next);controller.ctx.storage.set('prompt-editor-draft',next);if(next.id&&next.name.trim()&&next.body.trim())change({type:'prompt.edit',...next});else setNotice('Draft kept on this device. A name and instructions are required.')}
  const add=()=>{const next={id:'',name:'',body:'',folderId:library.activeLibraryId};setEditor(next);controller.ctx.storage.set('prompt-editor-draft',next)}
  const create=()=>{if(!editor?.name.trim()||!editor?.body.trim())return;try{const before=new Set(controller.library.prompts.map(p=>p.id)),next=libraryChange(controller.library,{type:'prompt.create',...editor}),created=next.prompts.find(p=>!before.has(p.id));controller.saveLibrary(next);edit(created);setNotice('Prompt created and saved.')}catch(error){setNotice(publicError(error))}}
  const download=()=>{const url=URL.createObjectURL(new Blob([exportLibrary(controller.library)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='enchanted-composer-prompts.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  return jsxs('section',{className:'ec-section',children:[jsx(PanelHeader,{title:'Your prompt library',description:'Pick instructions for Enhance, or insert them into a draft. Existing prompt edits save as you type.',actions:jsx(Button,{type:'button',size:'sm',onClick:add,children:'New prompt'})}),
    jsxs('div',{className:'ec-grid',children:[jsx(Field,{label:'Library',children:jsx(ThemedSelect,{ariaLabel:'Active prompt library',value:library.activeLibraryId,onChange:value=>change({type:'library.select',id:value}),options:library.folders.map(folder=>({value:folder.id,label:folder.name}))})}),jsx(Field,{label:'Create library',children:jsxs('div',{className:'ec-row',children:[jsx('input',{'aria-label':'New prompt library name',placeholder:'Library name',value:newLibrary,onChange:event=>setNewLibrary(event.target.value)}),jsx(Button,{size:'sm',disabled:!newLibrary.trim(),onClick:()=>{change({type:'folder.create',name:newLibrary});setNewLibrary('')},children:'Create library'})]})})]}),
    jsxs('div',{className:'ec-prompts',children:[jsx('div',{className:'ec-prompt-list',children:library.prompts.filter(p=>p.folderId===library.activeLibraryId).map(p=>jsxs('button',{type:'button','aria-pressed':editor?.id===p.id,onClick:()=>edit(p),children:[jsx('strong',{children:p.name}),p.id===library.activePromptId?jsx('div',{className:'ec-muted',children:'Selected for Enhance'}):null]},p.id))}),editor?jsxs('div',{className:'ec-stack',children:[jsx(Field,{label:'Prompt name',children:jsx('input',{'aria-label':'Prompt name',value:editor.name,maxLength:128,onChange:event=>update({name:event.target.value})})}),jsx(Field,{label:'Instructions',children:jsx('textarea',{'aria-label':'Prompt instructions',value:editor.body,maxLength:12000,onChange:event=>update({body:event.target.value})})}),jsx(Field,{label:'Move to library',children:jsx(ThemedSelect,{ariaLabel:'Prompt library destination',value:editor.folderId,onChange:value=>{update({folderId:value});if(editor.id)change({type:'prompt.transfer',id:editor.id,folderId:value})},options:library.folders.map(f=>({value:f.id,label:f.name}))})}),jsxs('div',{className:'ec-row',children:editor.id?[jsx(Button,{size:'sm',onClick:()=>change({type:'prompt.select',id:editor.id}),children:'Use for Enhance'},'select'),jsx(Button,{size:'sm',variant:'ghost',disabled:library.prompts.length<=1,onClick:()=>{change({type:'prompt.delete',id:editor.id});setEditor(null);controller.ctx.storage.remove?.('prompt-editor-draft')},children:'Delete'},'delete')]:[jsx(Button,{size:'sm',disabled:!editor.name.trim()||!editor.body.trim(),onClick:create,children:'Add prompt'},'add')]}),jsx('p',{className:'ec-muted',role:'status',children:notice||'Edits save automatically. Incomplete drafts are kept on this device.'})]}):jsx('p',{className:'ec-muted',children:'Choose a prompt to edit its instructions.'})]}),
    jsx('hr',{className:'ec-divider'}),jsxs('details',{children:[jsx('summary',{children:'Import and export'}),jsx('p',{className:'ec-muted',children:'Review an import before replacing your library. Export first to keep a backup.'}),jsx(Button,{size:'sm',variant:'ghost',onClick:download,children:'Export library'}),jsx('textarea',{'aria-label':'Import prompt library JSON',value:importText,onChange:event=>setImportText(event.target.value),placeholder:'Paste exported library JSON'}),jsx(Button,{size:'sm',variant:'ghost',onClick:()=>{try{setPreview(importLibrary(importText,{dryRun:true,previous:controller.library}))}catch(error){setNotice(publicError(error))}},children:'Preview import'}),preview?jsx(Button,{size:'sm',onClick:()=>{try{setRollback(controller.library);controller.saveLibrary({...preview.next,enhanceWith:controller.library.enhanceWith});setPreview(null);setNotice('Library imported.')}catch(error){setNotice(publicError(error))}},children:`Import ${preview.next.prompts.length} prompts`}):null,rollback?jsx(Button,{size:'sm',variant:'ghost',onClick:()=>{controller.saveLibrary(rollback);setRollback(null)},children:'Undo import'}):null,jsx('p',{role:'status',className:'ec-muted',children:notice})]})]})
}
function ComposerBarPreview({visibility}) {
  const shown=COMPOSER_CONTROL_DEFINITIONS.filter(item=>visibility[item.id]!==false)
  return jsxs('div',{className:'ec-composer-preview','aria-label':'Composer bar preview',children:[jsxs('div',{className:'ec-preview-head',children:[jsx('span',{children:'Live preview'}),jsx('span',{children:`${shown.length} ${shown.length===1?'control':'controls'}`})]}),jsxs('div',{className:'ec-preview-input',children:[jsx('span',{className:'ec-preview-placeholder',children:'Adjust or continue'}),shown.length?jsx('div',{className:'ec-preview-icons',children:shown.map(item=>jsx('span',{className:'ec-preview-icon',title:item.label,'aria-label':item.label,children:item.id==='voice'?jsx(icons.Mic,{className:'size-3.5','aria-hidden':true}):jsx(Codicon,{name:item.icon,size:'0.8rem'})},item.id))}):jsx('span',{className:'ec-muted',children:'No Composer controls selected'})]})]})
}
function ComposerControlsPanel({controller}) {
  const [visibility,setVisibility]=useState(()=>({...controller.composerControls}))
  useEffect(()=>controller.subscribeComposerControls(value=>setVisibility({...value})),[controller])
  return jsxs('section',{className:'ec-section',children:[jsx(PanelHeader,{title:'Composer bar',description:'Choose exactly which Enchanted Composer controls appear beside the message box.'}),jsx(ComposerBarPreview,{visibility}),jsx('div',{className:'mt-4 grid gap-1.5',children:COMPOSER_CONTROL_DEFINITIONS.map(item=>jsxs('label',{className:'ec-control-toggle rounded-md border border-(--ui-stroke-secondary) bg-(--ui-control-background,transparent) px-3 py-2',children:[jsxs('span',{className:'min-w-0',children:[jsx('strong',{className:'block text-xs',children:item.label}),jsx('span',{className:'mt-0.5 block text-[10px] font-normal leading-4 text-(--ui-text-tertiary)',children:item.description})]}),jsxs('span',{className:'ec-toggle-control',children:[jsx('input',{type:'checkbox',className:'ec-toggle-input',checked:visibility[item.id]!==false,'aria-label':`Show ${item.label}`,onChange:event=>controller.setComposerControlVisibility(item.id,event.target.checked)}),jsx('span',{className:'ec-toggle-box','aria-hidden':true,children:jsx(Codicon,{name:'check',size:'0.65rem'})})]})]},item.id))}),jsx('p',{className:'ec-muted',children:'The settings page remains available from the sidebar even if you hide its composer icon.'})]})
}
const SETTINGS_TABS=Object.freeze([['enhancement','Enhancement'],['prompts','Prompts'],['composer','Composer bar'],['voice','Voice'],['audio','Audio'],['usage','Account & usage']])
function EnchantedComposerPage({controller}) {
  const [tab,setTab]=useState('enhancement'),[state,setState]=useState({loading:true,error:'',record:null}),[scan,setScan]=useState(false)
  const mounted=useRef(false),generation=useRef(0)
  const refresh=async()=>{const gen=++generation.current;setState(previous=>({...previous,loading:true,error:''}));try{const data=await controller.refreshControlSurface();if(mounted.current&&gen===generation.current)setState({...data,record:{...data.record},loading:false,error:''})}catch(error){if(mounted.current&&gen===generation.current)setState(previous=>({...previous,loading:false,error:publicError(error)}))}}
  useEffect(()=>{mounted.current=true;void refresh();const unsubscribe=controller.settingsStore.subscribe(record=>{if(mounted.current)setState(previous=>previous.record?.key===record.key?{...previous,record:{...record}}:previous)});return()=>{mounted.current=false;++generation.current;unsubscribe()}},[controller])

  const settings=state.record?.value||DEFAULT_SETTINGS,owner=state.owner
  const update=patch=>{if(!owner)return;try{controller.saveSettings(patch,owner).catch(error=>setState(previous=>({...previous,error:publicError(error)})))}catch(error){setState(previous=>({...previous,error:publicError(error)}))}}
  const retry=()=>{if(owner)void controller.settingsStore.flush(owner).catch(()=>{});else void refresh()}
  const providers=state.voiceCatalog?.backends?.find(row=>row.backend===settings.backend)?.providers||[],provider=providers.find(row=>row.id===settings.provider)
  const chooseProvider=id=>{const p=providers.find(row=>row.id===id);if(p)update({provider:p.id,billingLane:p.billingLane,engine:p.defaultModel,voice:p.defaultVoice})}
  const option=(value,label=value)=>({value,label})
  const voice=jsxs('section',{className:'ec-section',children:[jsx(PanelHeader,{title:'A conversation, out loud',description:'Full-duplex voice stays bound to the chat where you start it. Tool requests still run through Hermes.',actions:jsx(Button,{size:'sm',variant:'ghost',disabled:state.loading,onClick:refresh,children:'Check providers'})}),
    jsx('p',{className:'ec-muted',children:'Changes apply to your next call. They never switch an active call’s provider or billing.'}),state.voiceError?jsx('p',{role:'alert',className:'ec-error',children:state.voiceError}):null,
    jsxs('div',{className:'ec-grid',children:[jsx(Field,{label:'Connection',children:jsx(ThemedSelect,{ariaLabel:'Voice connection',value:settings.backend,disabled:state.loading,options:[option('enchanted-realtime','Realtime voice'),option('enchanted-bridge','Custom voice bridge')],onChange:backend=>{const p=state.voiceCatalog?.backends?.find(row=>row.backend===backend)?.providers?.[0];if(p)update({backend,provider:p.id,billingLane:p.billingLane,engine:p.defaultModel,voice:p.defaultVoice});else setState(previous=>({...previous,error:'This connection has no supported provider. Check availability first.'}))}})}),jsx(Field,{label:'Provider',children:jsx(ThemedSelect,{ariaLabel:'Live voice provider',value:settings.provider,disabled:state.loading||!providers.length,options:providers.map(p=>option(p.id,p.name+(p.ready?'':' · sign-in or setup required'))),onChange:chooseProvider})}),jsx(Field,{label:'Model',children:jsx(ThemedSelect,{ariaLabel:'Live voice engine',value:settings.engine,disabled:!provider,options:(provider?.models||[settings.engine]).map(value=>option(value)),onChange:value=>update({engine:value})})}),jsx(Field,{label:'Voice',children:jsx(ThemedSelect,{ariaLabel:'Voice',value:settings.voice,disabled:!provider,options:(provider?.voices||[settings.voice]).map(value=>option(value)),onChange:value=>update({voice:value})})}),jsx(Field,{label:'Language',children:jsx(ThemedSelect,{ariaLabel:'Voice language',value:settings.language,options:[option('en','English'),option('es','Spanish')],onChange:value=>update({language:value})})}),jsx(Field,{label:'Billing',children:jsx(ThemedSelect,{ariaLabel:'Billing lane',value:settings.billingLane,disabled:true,options:[option(settings.billingLane,settings.billingLane==='subscription'?'Codex subscription':settings.billingLane==='api'?'API billing':'Bridge managed')]})})]}),
    jsx('p',{className:'ec-muted',children:provider?.detail||'Provider readiness is checked before opening the microphone.'}),settings.backend==='enchanted-bridge'?jsx(Field,{label:'Secure bridge endpoint',children:jsx('input',{'aria-label':'Bridge endpoint',value:settings.endpoint,placeholder:'wss://your-bridge.example',onChange:event=>update({endpoint:event.target.value})})}):null,
    jsx('div',{className:'ec-note',children:'Voice captions are optional and temporary. Tool requests and their results appear in your Hermes chat. Full voice-history synchronization is not included in this release.'})]})
  const audio=jsxs('section',{className:'ec-section',children:[jsx(PanelHeader,{title:'Microphone & speaker',description:'Choose where you speak and listen. These choices save independently of provider sign-in.',actions:jsx(Button,{size:'sm',variant:'ghost',disabled:scan,onClick:async()=>{setScan(true);try{const devices=await controller.audio.devices({requestPermission:true});if(mounted.current)setState(previous=>({...previous,devices}))}catch(error){if(mounted.current)setState(previous=>({...previous,error:publicError(error)}))}finally{if(mounted.current)setScan(false)}},children:scan?'Detecting…':'Detect audio devices'})}),
    jsx('div',{className:'ec-grid',children:[['Microphone','audioinput','inputDeviceId'],['Speaker','audiooutput','outputDeviceId']].map(([label,kind,key])=>jsx(Field,{label,children:jsx(ThemedSelect,{ariaLabel:`${label} device`,value:settings[key],options:[option('default','System default'),...(state.devices||[]).filter(d=>d.kind===kind&&d.id!=='default').map(d=>option(d.id,d.label)),settings[key]!=='default'&&!(state.devices||[]).some(d=>d.id===settings[key])?option(settings[key],'Saved device · not currently detected'):null],onChange:value=>update({[key]:value})})},key))}),jsx('p',{className:'ec-muted',children:'Device detection briefly requests microphone permission, then releases it. Changes apply to the next call.'})]})
  const usage=jsxs('section',{className:'ec-section',children:[jsx(PanelHeader,{title:'Account & usage',description:state.auth?.subscription?.ready?'Codex CLI detected. Authentication is verified by Codex when voice starts.':'Install and sign in with the official Codex CLI to use subscription voice.',actions:jsx(Button,{size:'sm',variant:'ghost',onClick:refresh,children:'Refresh status'})}),jsx('div',{className:'ec-note',children:'Enchanted Composer does not read, refresh, back up, or write Codex OAuth files. Run codex login outside Hermes if authentication is required.'}),jsx('p',{className:'ec-muted',children:state.auth?.subscription?.detail||'Codex CLI status is unavailable.'}),jsx('hr',{className:'ec-divider'}),jsx('h2',{children:'Voice activity'}),jsx('p',{className:'ec-muted',children:'Local voice has no allowance; these are activity totals, not quota estimates.'}),usageRow('Today',state.usage?.today),usageRow('Last 5 hours',state.usage?.rolling5h),usageRow('Last 24 hours',state.usage?.rolling24h),usageRow('This week',state.usage?.week)]})
  const panel=tab==='enhancement'?jsx(EnhancementModelPanel,{controller,catalog:state.catalog,error:state.modelError}):tab==='prompts'?jsx(PromptLibraryPanel,{controller}):tab==='composer'?jsx(ComposerControlsPanel,{controller}):tab==='voice'?voice:tab==='audio'?audio:usage
  return jsxs('main',{className:'ec-settings',children:[jsx('style',{children:EC_STYLES}),jsxs('header',{className:'ec-head',children:[jsxs('div',{children:[jsx('h1',{children:'Enchanted Composer'}),jsx('p',{className:'ec-muted',children:owner?`Voice & audio · ${owner.profile} on ${owner.connectionId}`:'Better drafts. Easier conversations.'})]}),jsx(SettingsStatus,{record:state.record,onRetry:retry})]}),
    jsx('nav',{className:'ec-tabs',role:'tablist','aria-label':'Enchanted Composer settings',children:SETTINGS_TABS.map(([id,label])=>jsx('button',{type:'button',role:'tab',id:`ec-tab-${id}`,'aria-selected':tab===id,'aria-controls':`ec-panel-${id}`,onClick:()=>setTab(id),children:label},id))}),
    state.error?jsxs('div',{className:'ec-note ec-error',role:'alert',children:[state.error,jsx(Button,{size:'sm',variant:'ghost',onClick:refresh,children:'Retry loading'})]}):null,state.record?.error?jsx('p',{className:'ec-error',role:'alert',children:state.record.error}):null,
    jsx('div',{role:'tabpanel',id:`ec-panel-${tab}`,'aria-labelledby':`ec-tab-${tab}`,children:jsx('fieldset',{disabled:state.loading&&!['prompts','enhancement'].includes(tab),style:{border:0,padding:0,margin:0,minWidth:0},children:panel})})]})
}
/* SETTINGS_UI_END */
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
  if(!active)return jsx('button',{type:'button',className:ACTION_CLASS,'aria-label':state.state==='error'?'Retry Live Voice':'Start Live Voice',title:state.state==='error'?'Retry Live Voice':'Start Live Voice',onMouseDown:event=>event.preventDefault(),onClick:state.state==='error'?()=>controller.retryVoice().catch(error=>host.notify({kind:'error',message:publicError(error)})):start,children:jsx(icons.Mic,{className:'size-4','aria-hidden':true})})
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
function ComposerDraftShelf({controller}) { return jsx('button',{type:'button',className:ACTION_CLASS,'aria-label':'Draft Shelf',title:'Draft Shelf',onClick:async()=>{try{const owner=await controller.ownerRouter.capture({allowDraft:true,draftId:'composer'}),surface=controller.draft.capture(),text=await controller.draft.read(surface);controller.draftShelf.save(owner,surface,{name:'Untitled draft',text})}catch(error){host.notify({kind:'error',message:publicError(error)})}},children:jsx(Codicon,{name:'bookmark',size:'0.95rem'})}) }
function ComposerPromptMenu({ controller }) {
  const [library,setLibrary]=useState(()=>controller.library),[open,setOpen]=useState(false),[query,setQuery]=useState(''),[selected,setSelected]=useState(0),[preferences,setPreferences]=useState(()=>normalizePalettePreferences(controller.ctx.storage.get('prompt-palette-preferences',{favorites:[],recent:[]}))),triggerRef=useRef(null),searchRef=useRef(null)
  useEffect(()=>{const listener=value=>setLibrary(value);controller.libraryListeners.add(listener);return()=>controller.libraryListeners.delete(listener)},[controller])
  useEffect(()=>{if(open)queueMicrotask(()=>searchRef.current?.focus())},[open])
  const savePreferences=update=>setPreferences(current=>{const value=updatePalettePreferences(current,update);controller.ctx.storage.set('prompt-palette-preferences',value);return value})
  const change=action=>{try{controller.saveLibrary(libraryChange(controller.library,action))}catch(error){host.notify({kind:'error',message:publicError(error)})}}
  const remember=id=>savePreferences(current=>({...current,recent:[id,...current.recent.filter(item=>item!==id)]}))
  const rows=buildPromptActionIndex(library,preferences,query),close=()=>{setOpen(false);setQuery('');setSelected(0);queueMicrotask(()=>triggerRef.current?.focus())},optionId=row=>`prompt-action-option-${row.kind}-${encodeURIComponent(row.id)}`,selectedRow=rows[selected]
  const activate=row=>{if(!row)return;change({type:'prompt.select',id:row.id});remember(row.id);close()}
  const keyDown=event=>{if(event.key==='Escape'){event.preventDefault();close();return}if(event.target?.closest?.('button,textarea,select,a'))return;if(event.key==='ArrowDown'){event.preventDefault();setSelected(value=>Math.min(value+1,Math.max(0,rows.length-1)))}else if(event.key==='ArrowUp'){event.preventDefault();setSelected(value=>Math.max(0,value-1))}else if(event.key==='Enter'){event.preventDefault();activate(selectedRow)}}
  const active=library.prompts.find(prompt=>prompt.id===library.activePromptId)
  return jsx(Popover,{open,onOpenChange:next=>{if(next)setOpen(true);else close()},children:jsxs(Fragment,{children:[jsx(PopoverTrigger,{asChild:true,children:jsx('button',{ref:triggerRef,type:'button',className:ACTION_CLASS,'aria-label':'Prompt library',title:active?`Prompt · ${active.name}`:'Prompt library',children:jsx(Codicon,{name:'notebook',size:'0.95rem'})})}),jsx(PopoverContent,{align:'end',variant:'menu',className:'w-64 max-w-[calc(100vw-1rem)] bg-(--ui-bg-elevated) p-1',children:jsxs('div',{onKeyDown:keyDown,children:[jsx('input',{ref:searchRef,type:'search',role:'combobox',value:query,onChange:event=>{setQuery(event.target.value);setSelected(0)},placeholder:'Search prompts','aria-label':'Search prompts','aria-controls':'prompt-action-results','aria-expanded':open,'aria-activedescendant':open&&selectedRow?optionId(selectedRow):undefined,className:'w-full rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-1.5 text-xs text-foreground outline-none focus:border-(--ui-stroke-primary)'}),jsx('div',{id:'prompt-action-results',role:'listbox','aria-label':'Prompt results',className:'mt-1 max-h-56 space-y-0.5 overflow-y-auto',children:rows.map((row,index)=>jsxs('div',{id:optionId(row),role:'option','aria-selected':index===selected,className:`block cursor-pointer rounded-md px-2 py-1.5 ${index===selected?'bg-(--ui-control-active-background)':''}`,onMouseEnter:()=>setSelected(index),onMouseDown:event=>event.preventDefault(),onClick:()=>activate(row),children:[jsx('strong',{className:'block truncate text-xs',children:row.title}),jsx('span',{className:'block truncate text-[10px] text-(--ui-text-tertiary)',children:row.subtitle})]},`${row.kind}:${row.id}`))}),!rows.length?jsx('p',{className:'p-3 text-center text-xs text-(--ui-text-tertiary)',children:'No prompts match that search.'}):null,selectedRow?.kind==='prompt'?jsxs('div',{className:'mt-1 flex flex-wrap gap-1 border-t border-(--ui-stroke-secondary) pt-1',children:[jsx(Button,{type:'button',size:'sm',variant:'ghost',onClick:()=>{const favorite=!preferences.favorites.includes(selectedRow.id);savePreferences(current=>({...current,favorites:favorite?[selectedRow.id,...current.favorites]:current.favorites.filter(item=>item!==selectedRow.id)}))},children:preferences.favorites.includes(selectedRow.id)?'★':'☆'}),jsx(Button,{type:'button',size:'sm',variant:selectedRow.id===library.activePromptId?'default':'ghost',onClick:()=>activate(selectedRow),children:selectedRow.id===library.activePromptId?'Using':'Use for Enhance'}),jsx(Button,{type:'button',size:'sm',variant:'ghost',onClick:()=>{controller.enhancer.insert(selectedRow.prompt.body).then(()=>remember(selectedRow.id)).catch(error=>host.notify({kind:'error',message:publicError(error)}))},children:'Insert'})]}):null,jsx('p',{className:'mt-1 text-[10px] text-(--ui-text-tertiary)',children:'↑↓ navigate · Enter use · Esc close'})]})})]})})
}
function VoiceTaskInspector({controller}) { const [snapshot,setSnapshot]=useState(()=>controller.delegation.snapshot());useEffect(()=>controller.delegation.subscribe(setSnapshot),[controller]);const task=snapshot.active||snapshot.queued;if(!task&&snapshot.state==='idle')return null;return jsx('section',{role:'region','aria-label':'Voice task inspector',className:'mx-2 mb-1 rounded-md border border-(--ui-stroke-secondary) p-2 text-xs',children:jsxs(Fragment,{children:[jsx('strong',{children:`Voice task · ${snapshot.state}`}),task?jsx('p',{children:bounded(task.text,240)}):null,task?.lastSteering?jsx('p',{children:`Last steer: ${bounded(task.lastSteering,160)}`}):null,task?.resultDelivery?jsx('p',{children:`Result delivery: ${task.resultDelivery}`}):null,jsx(Button,{size:'sm',variant:'ghost',disabled:!snapshot.active,onClick:()=>controller.delegation.cancel().catch(error=>host.notify({kind:'error',message:publicError(error)})),children:'Stop'}),jsx(Button,{size:'sm',variant:'ghost',disabled:!snapshot.active,onClick:()=>{const text=globalThis.prompt?.('Steer active task');if(text)controller.delegation.request(task.owner||{},text,`${Date.now()}`,()=>{})},children:'Steer'})]})}) }
function VoiceInteractionModeChooser({controller}) {
  const interaction=useInteractionSnapshot(controller),[open,setOpen]=useState(false),mode=interaction.mode,label=mode==='push-to-talk'?'Push to talk':'Continuous'
  const choose=next=>{try{controller.interaction.setMode(next);setOpen(false)}catch(error){host.notify({kind:'error',message:publicError(error)})}}
  return jsx(Popover,{open,onOpenChange:setOpen,children:jsxs(Fragment,{children:[jsx(PopoverTrigger,{asChild:true,children:jsx('button',{type:'button',className:ACTION_CLASS,'aria-label':`Voice mode · ${label}`,title:`Voice mode · ${label}`,children:jsx(Codicon,{name:mode==='push-to-talk'?'radio-tower':'broadcast',size:'0.95rem'})})}),jsx(PopoverContent,{align:'end',variant:'menu',className:'w-40 bg-(--ui-bg-elevated) p-1',children:jsxs('div',{role:'menu','aria-label':'Voice interaction mode',children:[jsx('button',{type:'button',role:'menuitemradio','aria-checked':mode==='continuous',disabled:interaction.active&&mode!=='continuous',className:`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${mode==='continuous'?'bg-(--ui-control-active-background)':''}`,onClick:()=>choose('continuous'),children:jsx('span',{children:'Continuous'})}),jsx('button',{type:'button',role:'menuitemradio','aria-checked':mode==='push-to-talk',disabled:interaction.active&&mode!=='push-to-talk',className:`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${mode==='push-to-talk'?'bg-(--ui-control-active-background)':''}`,onClick:()=>choose('push-to-talk'),children:jsx('span',{children:'Push to talk'})}),jsx('button',{type:'button',role:'menuitemradio','aria-checked':false,disabled:true,className:'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-(--ui-text-tertiary) opacity-60',title:'Chained voice requires a public Hermes seam',children:jsx('span',{children:'Chained (unavailable)'})})]})})]})})
}
function ComposerActions({controller}) {
  const [enhancing,setEnhancing]=useState(false),[history,setHistory]=useState({canUndo:false,canRedo:false,busy:false}),[visibility,setVisibility]=useState(()=>({...controller.composerControls}))
  useEffect(()=>controller.subscribeComposerControls(value=>setVisibility({...value})),[controller])
  useEffect(()=>{
    let live=true,sequence=0
    const refresh=async()=>{const seq=++sequence;try{const {owner}=await controller.enhancer.capture(),next=await controller.enhancer.status(owner);if(live&&seq===sequence)setHistory(next)}catch{if(live&&seq===sequence)setHistory({canUndo:false,canRedo:false,busy:false})}}
    const dispose=controller.enhancer.subscribe(refresh),unsubscribers=['focusedSessionId','focusedStoredSessionId','focusedSessionOwner'].map(name=>host.state?.[name]?.subscribe?.(refresh)).filter(Boolean)
    void refresh()
    return()=>{live=false;++sequence;dispose();unsubscribers.forEach(fn=>fn())}
  },[controller])
  const enhance=async()=>{if(enhancing)return;setEnhancing(true);try{await enhanceDraft(controller)}catch(error){host.notify({kind:'error',message:publicError(error)})}finally{setEnhancing(false)}}
  const move=async fn=>{try{if(!await fn(controller))host.notify({kind:'info',message:'This draft changed after enhancement. Your edits have been preserved.'})}catch(error){host.notify({kind:'error',message:publicError(error)})}}
  const action=(label,icon,callback,disabled=false)=>jsx('button',{type:'button',className:ACTION_CLASS,'aria-label':label,title:label,disabled,onMouseDown:event=>event.preventDefault(),onClick:callback,children:jsx(Codicon,{name:icon,size:'0.95rem'})})
  const review=async()=>{if(enhancing)return;setEnhancing(true);try{await proposeEnhancement(controller)}catch(error){host.notify({kind:'error',message:publicError(error)})}finally{setEnhancing(false)}}
  const show=(id,control)=>visibility[id]!==false?control:null
  return jsxs(Fragment,{children:[show('voice',jsx(VoiceStatusPill,{controller})),show('voice-mode',jsx(VoiceInteractionModeChooser,{controller})),show('prompt-library',jsx(ComposerPromptMenu,{controller})),show('draft-shelf',jsx(ComposerDraftShelf,{controller})),show('review',action('Review enhancement','preview',review,enhancing||history.busy)),show('enhance',action(enhancing?'Enhancing draft':'Enhance draft',enhancing?'loading':'sparkle',enhance,enhancing||history.busy)),show('undo',action('Undo enhancement','discard',()=>move(undoEnhancement),enhancing||!history.canUndo)),show('redo',action('Redo enhancement','redo',()=>move(redoEnhancement),enhancing||!history.canRedo)),show('settings',action('Enchanted Composer settings','settings-gear',()=>host.navigate('/enchanted-composer')))]})
}
/* COMPOSER_ACTIONS_END */
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
  const enhancer=new PromptEnhancer({draftAdapter:draft,ownerRouter,api:ctx,review:new EnhancementReview()}),draftShelf=new DraftShelfStore(ctx,{draftAdapter:draft,ownerRouter}),settingsStore=new ComposerSettingsStore(ctx)
  const delegation=new DelegationBridge({api:ctx,transcript}),resolver=new VoiceBackendResolver({'enchanted-realtime':new RealtimeVoiceAdapter(ctx,audio),'enchanted-bridge':new ComposerBridgeBackendAdapter(ctx,audio)})
  const voice=new LiveVoiceSessionController({ctx,ownerRouter,transcript,delegation,audio,resolver})
  const interaction=new VoiceInteractionMode({setMuted:muted=>voice.setMuted(muted)}),controller={ctx,ownerRouter,transcript,audio,draft,enhancer,draftShelf,delegation,voice,interaction,settingsStore,settings:{...DEFAULT_SETTINGS},settingsOwner:null,voiceCatalog:null,library:validateLibrary(ctx.storage.get('library',null)||createLibrary()),libraryListeners:new Set(),composerControls:normalizeComposerControlVisibility(ctx.storage.get(COMPOSER_CONTROL_STORAGE_KEY,null)),composerControlListeners:new Set(),reviewProposal:null,reviewListeners:new Set(),
    subscribeReviewProposal(listener){this.reviewListeners.add(listener);return()=>this.reviewListeners.delete(listener)},
    setReviewProposal(proposal){if(this.reviewProposal&&this.reviewProposal!==proposal)enhancer.discardProposal(this.reviewProposal);this.reviewProposal=proposal;for(const listener of this.reviewListeners)listener(proposal)},
    clearReviewProposal(proposal=this.reviewProposal){if(proposal!==this.reviewProposal)return false;this.reviewProposal=null;for(const listener of this.reviewListeners)listener(null);return true},
    saveLibrary(next){const value=validateLibrary(next);ctx.storage.set('library',value);this.library=value;for(const listener of this.libraryListeners)listener(value)},
    subscribeComposerControls(listener){this.composerControlListeners.add(listener);return()=>this.composerControlListeners.delete(listener)},
    setComposerControlVisibility(id,visible){if(!COMPOSER_CONTROL_DEFINITIONS.some(item=>item.id===id))throw new Error('Unknown composer control.');const next={...this.composerControls,[id]:visible===true};ctx.storage.set(COMPOSER_CONTROL_STORAGE_KEY,next);this.composerControls=next;for(const listener of this.composerControlListeners)listener(next);return next},
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
      const session=await voice.start({...record.value},owner);interaction.start();return session
    },
    async retryVoice(){const session=await voice.retry();interaction.start();return session},
    async stopVoice(){await voice.stop();await interaction.cancel()},
    async dispose(){if(this.reviewProposal)enhancer.discardProposal(this.reviewProposal);this.reviewProposal=null;this.reviewListeners.clear();this.composerControlListeners.clear();unsubscribeInteraction();await interaction.dispose();await voice.dispose();await settingsStore.dispose();enhancer.dispose();this.libraryListeners.clear()}
  }
  const unsubscribeInteraction=voice.subscribe(snapshot=>{if(['idle','error'].includes(snapshot.state)&&interaction.callMode)void interaction.cancel()})
  return controller
}
export default {
  id:PLUGIN_ID,name:'Enchanted Composer',description:'Live voice, reusable prompts, and dependable draft enhancement.',defaultEnabled:false,
  register(ctx){
    const controller=createController(ctx)
    ctx.register({id:'voice-transcript',area:COMPOSER_AREAS.top,order:10,render:()=>jsx(VoiceTranscriptPanel,{controller})})
    ctx.register({id:'voice-task-inspector',area:COMPOSER_AREAS.top,order:11,render:()=>jsx(VoiceTaskInspector,{controller})})
    ctx.register({id:'enhancement-review',area:COMPOSER_AREAS.top,order:11,render:()=>jsx(ComposerEnhancementReviewPanel,{controller})})
    ctx.register({id:'actions',area:COMPOSER_AREAS.actions,order:10,render:()=>jsx(ComposerActions,{controller})})
    ctx.register({id:'route',area:ROUTES_AREA,order:25,data:{path:'/enchanted-composer'},render:()=>jsx(EnchantedComposerPage,{controller})})
    ctx.register({id:'legacy-route',area:ROUTES_AREA,order:25,data:{path:'/composer-enhancements'},render:()=>jsx(EnchantedComposerPage,{controller})})
    ctx.register({id:'sidebar-nav',area:SIDEBAR_NAV_AREA,order:25,data:{path:'/enchanted-composer',label:'Enchanted Composer',codicon:'sparkle'}})
    ctx.onDispose(()=>controller.dispose())
  }
}
/* REGISTER_END */
