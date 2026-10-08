import assert from 'node:assert/strict'
import test from 'node:test'
import {runtime,storage,owner,tick} from './runtime-helper.mjs'

function ownerHost() {
  const focus={runtime:null,stored:null,profile:'default'},calls=[],route={connectionId:'local',profile:'default'}
  const host={state:{focusedSessionId:{get:()=>focus.runtime},focusedStoredSessionId:{get:()=>focus.stored},focusedSessionOwner:{get:()=>({connectionId:'local',profile:focus.profile})},cwd:{get:()=>''}},profileRoutes:async()=>[route],requestProfile:async(_route,method,params)=>{calls.push({method,params});if(method==='session.create')return {session_id:'new-runtime',stored_session_id:'new-stored'};if(method==='session.title')return {pending:false};return {}},openSession:async stored=>{focus.runtime='new-runtime';focus.stored=stored}}
  return {host,focus,calls}
}
test('draft enhancement route capture does not create or submit a session',async()=>{
  const {host,calls}=ownerHost(),r=runtime({host}),router=new r.OwnerRouter(host)
  const draft=await router.capture({allowDraft:true,draftId:'editor'})
  assert.match(draft.runtimeSessionId,/^draft:/)
  assert.equal(calls.length,0)
  assert.deepEqual(await router.capture({allowDraft:true,draftId:'editor'}),draft)
})
test('voice in a blank chat creates one persisted session before opening it',async()=>{
  const {host,calls}=ownerHost(),r=runtime({host}),router=new r.OwnerRouter(host)
  const [a,b]=await Promise.all([router.ensureSession(),router.ensureSession()])
  assert.equal(a.storedSessionId,'new-stored');assert.deepEqual(a,b)
  assert.deepEqual(calls.map(c=>c.method),['session.create','session.title'])
  assert.equal(calls[0].params.profile,'default');assert.ok(calls[0].params.idempotency_key)
})
test('new-chat startup refuses focus drift instead of stealing another chat',async()=>{
  const {host,focus}=ownerHost();let opened=false
  const request=host.requestProfile;host.requestProfile=async(...args)=>{const result=await request(...args);if(args[1]==='session.create')focus.runtime='other';return result};host.openSession=async()=>{opened=true}
  await assert.rejects(new (runtime({host}).OwnerRouter)(host).ensureSession(),/Chat changed/)
  assert.equal(opened,false)
})
function enhancementFixture() {
  const r=runtime();let value='  original\n',surface={surfaceId:'a',editor:{}},calls=0
  const draft={capture:()=>surface,read:()=>value,replace:text=>{value=text},insert:()=>{}},router={capture:async()=>owner,request:async()=>({text:`rewrite ${++calls}`})}
  const enhancer=new r.PromptEnhancer({draftAdapter:draft,ownerRouter:router,api:{}})
  return {enhancer,get text(){return value},set text(v){value=v},remount:()=>{surface={surfaceId:'b',editor:{}}},get calls(){return calls},draft}
}
test('multi-step undo and redo survive editor remount without another model call',async()=>{
  const f=enhancementFixture();await f.enhancer.enhance(owner,{body:'clarify'});await f.enhancer.enhance(owner,{body:'tighten'});f.remount()
  assert.equal(await f.enhancer.undoFor(owner),true);assert.equal(f.text,'rewrite 1')
  assert.equal(await f.enhancer.undoFor(owner),true);assert.equal(f.text,'  original\n')
  assert.equal(await f.enhancer.redoFor(owner),true);assert.equal(await f.enhancer.redoFor(owner),true);assert.equal(f.text,'rewrite 2');assert.equal(f.calls,2)
})
test('history never overwrites a manual edit or a different chat',async()=>{
  const f=enhancementFixture();await f.enhancer.enhance(owner,{body:'clarify'});f.text='my newer draft'
  assert.equal(await f.enhancer.undoFor(owner),false);assert.equal(f.text,'my newer draft')
  f.text='rewrite 1';assert.equal(await f.enhancer.undoFor({...owner,storedSessionId:'different'}),false)
})
test('failed editor writes do not advance history',async()=>{
  const f=enhancementFixture();await f.enhancer.enhance(owner,{body:'clarify'});f.draft.replace=()=>{throw new Error('editor failed')}
  await assert.rejects(f.enhancer.undoFor(owner),/editor failed/);assert.equal((await f.enhancer.status(owner)).canUndo,true)
})
function settingsFixture() {
  const r=runtime(),db=new Map(),puts=[],mem=storage();let fail=false,release=null
  const ctx={storage:mem,rest:async(path,options)=>{
    const key=JSON.stringify([options.body.owner.connectionId,options.body.owner.profile])
    if(path==='/v1/settings'){if(fail)throw new Error('offline');puts.push(options.body.settings);if(release)await release;db.set(key,structuredClone(options.body.settings));return {ok:true}}
    return {ok:true,exists:true,settings:db.get(key)||r.settingsWire(r.DEFAULT_SETTINGS)}
  }}
  return {store:new r.ComposerSettingsStore(ctx,{delay:60000}),db,puts,mem,set fail(value){fail=value},set wait(value){release=value}}
}
test('autosave serializes overlapping updates and verifies the latest merged value',async()=>{
  const f=settingsFixture();await f.store.load(owner);let release;f.wait=new Promise(resolve=>{release=resolve})
  f.store.update(owner,{inputDeviceId:'one'});const saving=f.store.flush(owner);await tick();f.store.update(owner,{outputDeviceId:'two'});release();await saving
  assert.equal(f.puts.length,2);assert.equal(f.puts[1].input_device_id,'one');assert.equal(f.puts[1].output_device_id,'two');assert.equal(f.store.record(owner).status,'saved');await f.store.dispose()
})
test('failed autosave keeps pending values and retries without needing voice credentials',async()=>{
  const f=settingsFixture();await f.store.load(owner);f.fail=true;f.store.update(owner,{inputDeviceId:'usb'})
  await assert.rejects(f.store.flush(owner),/offline/);assert.equal(f.store.record(owner).status,'error');assert.equal(f.store.record(owner).value.inputDeviceId,'usb')
  assert.ok(f.mem.map.has(`pending-settings:${f.store.key(owner)}`));f.fail=false;await f.store.flush(owner);assert.equal(f.store.record(owner).status,'saved');await f.store.dispose()
})
test('settings are isolated by both connection and profile',async()=>{
  const f=settingsFixture(),other={...owner,profile:'work'};await f.store.load(owner);await f.store.load(other)
  f.store.update(owner,{inputDeviceId:'private-mic'});await f.store.flush(owner)
  assert.equal(f.store.record(other).value.inputDeviceId,'default');assert.equal(f.store.record({...owner,connectionId:'remote'}).value.inputDeviceId,'default');await f.store.dispose()
})
function voiceFixture() {
  const r=runtime();let stopped=0,released=0,sink,resumed=0
  const transcript=new r.LiveTranscriptBuffer(),audio={muted:false,acquire:async()=>({getTracks:()=>[]}),release:()=>{released++},monitorBarge:()=>{},interrupt:()=>{},resumeRemote:async()=>{resumed++},setMuted(value){this.muted=value;return value}}
  const adapter={start:async request=>({id:'voice',owner:request.owner}),subscribe:(_id,fn)=>{sink=fn;return()=>{}},stop:async()=>{stopped++},interrupt:async()=>{},setMuted:async()=>{}}
  const controller=new r.LiveVoiceSessionController({ctx:{rest:async()=>({ok:true})},ownerRouter:{ensureSession:async()=>owner},transcript,delegation:{cancel:async()=>{},dispose:async()=>{}},audio,resolver:{resolve:async selection=>({adapter,selection})}})
  return {controller,adapter,audio,get stops(){return stopped},get releases(){return released},get resumes(){return resumed},event:event=>sink(event)}
}
test('a channel warning does not kill voice; fatal close retains its reason after cleanup',async()=>{
  const f=voiceFixture();await f.controller.start({})
  f.event({type:'error',payload:{message:'Temporary channel warning'}})
  assert.equal(f.controller.state,'live');assert.equal(f.stops,0)
  f.event({type:'error',payload:{code:'channel-closed',fatal:true,message:'Channel closed; retry voice.'}});await tick()
  assert.equal(f.controller.state,'error');assert.equal(f.stops,1);assert.match(f.controller.snapshot().lastError.message,/Channel closed/);assert.ok(f.controller.snapshot().diagnostics.length)
  await f.controller.dispose()
})
test('transient disconnect can recover on the same session; new output resumes playback',async()=>{
  const f=voiceFixture();await f.controller.start({});f.event({type:'session.state',payload:{state:'disconnected'}});assert.equal(f.controller.state,'reconnecting')
  f.event({type:'session.state',payload:{state:'connected'}});assert.equal(f.controller.state,'live');assert.equal(f.stops,0)
  f.event({type:'response.state',payload:{state:'speaking',newTurn:true}});await tick();assert.equal(f.resumes,1);await f.controller.dispose()
})
test('stopping during negotiation disposes the eventual peer and never revives voice',async()=>{
  const f=voiceFixture();let release;f.adapter.start=async request=>{await new Promise(resolve=>{release=resolve});return {id:'late',owner:request.owner}}
  const starting=f.controller.start({});await tick();await f.controller.stop();release();await assert.rejects(starting,/cancelled/)
  assert.equal(f.controller.session,null);assert.equal(f.controller.state,'idle');assert.equal(f.stops,1);await f.controller.dispose()
})
test('transcript finals replace deltas and preserve word-boundary whitespace',()=>{
  const {LiveTranscriptBuffer}=runtime(),buffer=new LiveTranscriptBuffer();buffer.push({role:'user',text:'Hello '});buffer.push({role:'user',text:'there'});buffer.turnDone('user','Hello there')
  assert.equal(buffer.rendered().length,1);assert.equal(buffer.rendered()[0].text,'Hello there');buffer.dispose()
})

test('public composer adapter awaits acknowledgements and addresses new drafts explicitly',async()=>{
  const {host}=ownerHost();let value='before';const calls=[]
  host.composer={getDraft:async id=>{calls.push(['read',id]);return value},setDraft:async(id,text)=>{await tick();calls.push(['write',id]);value=text;return true},insertText:async(id,text)=>{calls.push(['insert',id]);value+=text;return true}}
  const {ComposerDraftAdapter}=runtime({host}),adapter=new ComposerDraftAdapter(host),surface=adapter.capture()
  assert.equal(await adapter.read(surface),'before');await adapter.replace('after',surface);assert.equal(await adapter.read(surface),'after')
  assert.ok(calls.every(call=>call[1]==='new'))
  host.composer.setDraft=async()=>false;await assert.rejects(adapter.replace('not-applied',surface),/did not accept/);assert.equal(value,'after')
})
test('a second new voice chat never reuses the first new-chat idempotency key',async()=>{
  const {host,focus,calls}=ownerHost(),router=new (runtime({host}).OwnerRouter)(host)
  await router.ensureSession();focus.runtime=null;focus.stored=null;await router.ensureSession()
  const creates=calls.filter(call=>call.method==='session.create');assert.equal(creates.length,2);assert.notEqual(creates[0].params.idempotency_key,creates[1].params.idempotency_key)
})
