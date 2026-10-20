import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

const source=await readFile(new URL('../../desktop/plugin.js',import.meta.url),'utf8')
const between=(start,end)=>{const from=source.indexOf(start),to=source.indexOf(end);assert.ok(from>=0&&to>from,`missing ${start}`);return source.slice(from+start.length,to)}
const bounded=(value,limit=8192)=>typeof value==='string'?value.trim().slice(0,limit):''

test('delegation snapshots expose immutable bounded task state and subscriptions',async()=>{
  let stamp=10,releaseStatus
  const bridgeCode=between('/* DELEGATION_BRIDGE_START */','/* DELEGATION_BRIDGE_END */')
  const {DelegationBridge}=new Function('now','bounded','publicError',`${bridgeCode};return {DelegationBridge}`)(()=>stamp,bounded,error=>error.message)
  const updates=[],api={rest:async path=>{
    if(path==='/v1/run/start')return {ok:true,runId:'safe-run'}
    if(path==='/v1/run/status')return await new Promise(resolve=>{releaseStatus=()=>resolve({status:'completed',output:'done'})})
    return {ok:true}
  }}
  const bridge=new DelegationBridge({api,transcript:{push:()=>{}},clock:()=>stamp,wait:async()=>{}})
  const unsubscribe=bridge.subscribe(value=>updates.push(value))
  assert.deepEqual(bridge.snapshot(),{state:'idle',active:null,queued:null})
  bridge.request({connectionId:'c'},'inspect the build','d1',()=>{})
  while(!releaseStatus)await new Promise(resolve=>setImmediate(resolve))
  const running=bridge.snapshot().active
  assert.equal(running.state,'running');assert.equal(running.correlationId,'d1');assert.equal(running.runId,'safe-run');assert.equal(running.text,'inspect the build');assert.equal(running.resultDelivery,'pending');assert.ok(Object.isFrozen(running))
  bridge.request({connectionId:'c'},'use release branch','d2',()=>{})
  assert.equal(bridge.snapshot().active.lastSteering,'use release branch');assert.equal(bridge.snapshot().active.state,'steering')
  releaseStatus();await new Promise(resolve=>setImmediate(resolve))
  assert.ok(updates.length>=4);unsubscribe();await bridge.dispose()
})

test('stopping a delegated run suppresses a completed status that races the stop acknowledgement',async()=>{
  let releaseStatus,releaseStop,delivered=0,stopDelivery=0
  const bridgeCode=between('/* DELEGATION_BRIDGE_START */','/* DELEGATION_BRIDGE_END */')
  const {DelegationBridge}=new Function('now','bounded','publicError',`${bridgeCode};return {DelegationBridge}`)(()=>10,bounded,error=>error.message)
  const api={rest:async path=>{
    if(path==='/v1/run/start')return {ok:true,runId:'run-race'}
    if(path==='/v1/run/status')return await new Promise(resolve=>{releaseStatus=()=>resolve({status:'completed',output:'late output'})})
    if(path==='/v1/run/stop')return await new Promise(resolve=>{releaseStop=resolve})
    return {ok:true}
  }}
  const bridge=new DelegationBridge({api,transcript:{push:()=>{}},clock:()=>10,wait:async()=>{}})
  bridge.request({connectionId:'c'},'perform work','first',()=>{delivered++})
  while(!releaseStatus)await new Promise(resolve=>setImmediate(resolve))
  bridge.request({connectionId:'c'},'stop','stop',()=>{stopDelivery++})
  while(!releaseStop)await new Promise(resolve=>setImmediate(resolve))
  assert.equal(bridge.snapshot().active.state,'stopping')
  releaseStatus();await new Promise(resolve=>setImmediate(resolve));assert.equal(delivered,0)
  releaseStop({ok:true});await new Promise(resolve=>setImmediate(resolve));assert.equal(delivered,1);assert.equal(stopDelivery,1)
})

test('cancelling a delegated start prevents delivery when the start resolves or rejects late',async()=>{
  for(const outcome of ['resolve','reject']){
    let settle,delivered=0,stops=0
    const bridgeCode=between('/* DELEGATION_BRIDGE_START */','/* DELEGATION_BRIDGE_END */')
    const {DelegationBridge}=new Function('now','bounded','publicError',`${bridgeCode};return {DelegationBridge}`)(()=>10,bounded,error=>error.message)
    const api={rest:async path=>{
      if(path==='/v1/run/start')return await new Promise((resolve,reject)=>{settle=()=>outcome==='resolve'?resolve({ok:true,runId:'run-late'}):reject(new Error('late start failure'))})
      if(path==='/v1/run/stop'){stops++;return {ok:true}}
      throw new Error(`unexpected ${path}`)
    }}
    const bridge=new DelegationBridge({api,transcript:{push:()=>{}},clock:()=>10,wait:async()=>{}})
    bridge.request({connectionId:'c'},'perform work',outcome,()=>{delivered++})
    while(!settle)await new Promise(resolve=>setImmediate(resolve))
    const cancellation=bridge.cancel();assert.equal(bridge.snapshot().state,'idle')
    settle();await cancellation;await new Promise(resolve=>setImmediate(resolve))
    assert.equal(delivered,0);assert.equal(stops,outcome==='resolve'?1:0)
  }
})

test('a rejected voice stop retains the run for retry and suppresses late status output',async()=>{
  let releaseStatus,stopAttempts=0,initialDelivery=0,stopDelivery=0
  const bridgeCode=between('/* DELEGATION_BRIDGE_START */','/* DELEGATION_BRIDGE_END */')
  const {DelegationBridge}=new Function('now','bounded','publicError',`${bridgeCode};return {DelegationBridge}`)(()=>10,bounded,error=>error.message)
  const api={rest:async path=>{
    if(path==='/v1/run/start')return {ok:true,runId:'run-retry'}
    if(path==='/v1/run/status')return await new Promise(resolve=>{releaseStatus=resolve})
    if(path==='/v1/run/stop'){stopAttempts++;if(stopAttempts===1)throw new Error('stop unavailable');return {ok:true}}
    throw new Error(`unexpected ${path}`)
  }}
  const bridge=new DelegationBridge({api,transcript:{push:()=>{}},clock:()=>10,wait:async()=>{}})
  bridge.request({connectionId:'c'},'perform work','first',()=>{initialDelivery++})
  while(!releaseStatus)await new Promise(resolve=>setImmediate(resolve))
  bridge.request({connectionId:'c'},'stop','stop-first',()=>{stopDelivery++})
  await new Promise(resolve=>setImmediate(resolve))
  assert.equal(bridge.snapshot().state,'stop-failed');assert.equal(bridge.snapshot().active.runId,'run-retry')
  releaseStatus({status:'completed',output:'must not be delivered'});await new Promise(resolve=>setImmediate(resolve))
  assert.equal(initialDelivery,0);assert.equal(bridge.snapshot().active.runId,'run-retry')
  bridge.request({connectionId:'c'},'stop','stop-retry',()=>{stopDelivery++})
  await new Promise(resolve=>setImmediate(resolve))
  assert.equal(stopAttempts,2);assert.equal(initialDelivery,1);assert.equal(stopDelivery,2)
  await bridge.dispose()
})

test('cancelling while a voice stop acknowledgement is in flight invalidates every callback',async()=>{
  let releaseStatus,releaseVoiceStop,stopCalls=0,initialDelivery=0,stopDelivery=0
  const bridgeCode=between('/* DELEGATION_BRIDGE_START */','/* DELEGATION_BRIDGE_END */')
  const {DelegationBridge}=new Function('now','bounded','publicError',`${bridgeCode};return {DelegationBridge}`)(()=>10,bounded,error=>error.message)
  const api={rest:async path=>{
    if(path==='/v1/run/start')return {ok:true,runId:'run-cancel'}
    if(path==='/v1/run/status')return await new Promise(resolve=>{releaseStatus=resolve})
    if(path==='/v1/run/stop'){stopCalls++;return stopCalls===1?await new Promise(resolve=>{releaseVoiceStop=resolve}):{ok:true}}
    throw new Error(`unexpected ${path}`)
  }}
  const bridge=new DelegationBridge({api,transcript:{push:()=>{}},clock:()=>10,wait:async()=>{}})
  bridge.request({connectionId:'c'},'perform work','first',()=>{initialDelivery++})
  while(!releaseStatus)await new Promise(resolve=>setImmediate(resolve))
  bridge.request({connectionId:'c'},'stop','stop',()=>{stopDelivery++})
  while(!releaseVoiceStop)await new Promise(resolve=>setImmediate(resolve))
  await bridge.cancel();releaseVoiceStop({ok:true});releaseStatus({status:'completed',output:'late output'})
  await new Promise(resolve=>setImmediate(resolve))
  assert.equal(initialDelivery,0);assert.equal(stopDelivery,0);assert.equal(bridge.snapshot().state,'idle')
})

test('interaction mode captures call mode, rejects drift, and makes local push-to-talk mute authoritative',async()=>{
  const code=between('/* VOICE_INTERACTION_MODE_START */','/* VOICE_INTERACTION_MODE_END */')
  const {VoiceInteractionMode}=new Function(`${code};return {VoiceInteractionMode}`)()
  const calls=[],mode=new VoiceInteractionMode({setMuted:async value=>{calls.push(value)}})
  assert.equal(mode.mode,'continuous');assert.equal(mode.setMode('push-to-talk'),'push-to-talk');assert.equal(mode.start(),'push-to-talk');assert.equal(mode.snapshot().muted,true)
  assert.throws(()=>mode.setMode('continuous'),/active/)
  await mode.press();assert.equal(mode.snapshot().muted,false)
  const late=mode.release();await mode.blur();await late
  assert.equal(mode.snapshot().muted,true);assert.equal(mode.snapshot().pressed,false)
  assert.throws(()=>new VoiceInteractionMode().start('chained'),/unavailable/)
  mode.dispose();assert.equal(mode.snapshot().muted,true);assert.ok(calls.includes(true))
})

test('speech catalog normalizes generic native and registered provider capability receipts without secrets',()=>{
  const code=between('/* SPEECH_ENGINE_CATALOG_START */','/* SPEECH_ENGINE_CATALOG_END */')
  const {normalizeSpeechCatalog}=new Function(`${code};return {normalizeSpeechCatalog}`)()
  const native={id:'realtime',provider:'provider-native',model:'model-live',voice:'voice-live',language:'en',streaming:{input:true,output:true},preview:{supported:true,url:'https://preview.example/live'},local:false,ready:true,maxInputLength:1000,maxOutputLength:2000,billingClass:'subscription'},provider={provider:'provider-alpha',model:'model-a',voice:'voice-a',language:'en',streaming:{input:false,output:true},preview:{supported:true,url:'https://preview.example/a'},local:false,ready:true,maxInputLength:1000,maxOutputLength:2000,billingClass:'api'},catalogInput={nativeRealtime:[native],providers:[provider]}
  const catalog=normalizeSpeechCatalog(catalogInput)
  assert.deepEqual(catalog.nativeRealtime[0],native);assert.ok(Object.isFrozen(catalog.nativeRealtime[0]));assert.equal(catalog.providers[0].provider,'provider-alpha');assert.ok(Object.isFrozen(catalog.providers[0]))
  assert.deepEqual(normalizeSpeechCatalog({nativeRealtime:[],providers:[{...provider,preview:{supported:false,url:''}}]}).providers[0].preview,{supported:false,url:''})
  const rejects=value=>assert.throws(()=>normalizeSpeechCatalog(value),/invalid/i)
  rejects({...catalogInput,unexpected:true});rejects({...catalogInput,nativeRealtime:{}});rejects({...catalogInput,providers:{}})
  rejects({nativeRealtime:[{...native,unexpected:true}],providers:[]});rejects({nativeRealtime:[],providers:[{...provider,unexpected:true}]})
  rejects({nativeRealtime:[{...native,streaming:{...native.streaming,unexpected:true}}],providers:[]});rejects({nativeRealtime:[],providers:[{...provider,preview:{...provider.preview,unexpected:true}}]})
  rejects({nativeRealtime:[{...native,preview:{supported:false,url:'https://preview.example/live'}}],providers:[]});rejects({nativeRealtime:[],providers:[{...provider,token:'secret'}]})
})
