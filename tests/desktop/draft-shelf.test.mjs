import assert from 'node:assert/strict'
import test from 'node:test'
import {runtime,storage,owner} from './runtime-helper.mjs'

function fixture({initial={},now=()=>1_000}={}) {
  const mem=storage(initial), text={value:''}, focus={owner:{...owner},surface:{address:'stored',surfaceId:'surface:stored'}}
  const draftAdapter={
    capture:()=>({...focus.surface}),
    read:async surface=>{assert.equal(surface.surfaceId,focus.surface.surfaceId);return text.value},
    replace:async(value,surface)=>{assert.equal(surface.surfaceId,focus.surface.surfaceId);text.value=value},
    compareAndReplace:async(expected,value,surface,revalidate)=>{assert.equal(surface.surfaceId,focus.surface.surfaceId);revalidate();if(text.value!==expected)throw new Error('Current draft changed; restore was not applied.');text.value=value;revalidate();if(text.value!==value)throw new Error('Hermes did not preserve the restored draft.')},
  }
  const ownerRouter={isActive:value=>JSON.stringify(value)===JSON.stringify(focus.owner)}
  const DraftShelfStore=runtime().DraftShelfStore
  return {store:new DraftShelfStore({storage:mem},{draftAdapter,ownerRouter,now,idFactory:(()=>{let id=0;return()=>`draft-${++id}`})()}),mem,text,focus}
}

test('saves exact text as an owner-scoped named persistent draft with a safe preview',async()=>{
  const f=fixture();const saved=await f.store.save(owner,{address:'stored',surfaceId:'surface:stored'},{name:'  Plan  ',text:'  line one\n\nline two  '})
  assert.equal(saved.name,'Plan');assert.equal(saved.text,'  line one\n\nline two  ');assert.equal(saved.preview,'line one line two')
  assert.deepEqual(f.store.list(owner,{address:'stored',surfaceId:'surface:stored'}).map(row=>row.id),[saved.id])
  assert.equal(f.store.get(owner,{address:'stored',surfaceId:'surface:stored'},saved.id).text,'  line one\n\nline two  ')
  assert.equal(JSON.stringify([...f.mem.map.values()]).includes('attachment'),false)
})

test('isolates drafts by exact connection profile and saved-session surface',async()=>{
  const f=fixture();await f.store.save(owner,{address:'stored',surfaceId:'surface:stored'},{text:'private'})
  assert.equal(f.store.list({...owner,profile:'work'},{address:'stored',surfaceId:'surface:stored'}).length,0)
  assert.equal(f.store.list({...owner,storedSessionId:'other'},{address:'other',surfaceId:'surface:other'}).length,0)
  assert.equal(f.store.list({...owner,runtimeSessionId:'rehydrated-runtime'},{address:'stored',surfaceId:'surface:stored'}).length,1)
})

test('supports a distinct unsent draft surface without creating a session',async()=>{
  const f=fixture();const surface={address:'new',surfaceId:'surface:new'}
  await f.store.save(owner,surface,{text:'unsent'})
  assert.equal(f.store.list(owner,surface).length,1)
  assert.equal(f.store.list(owner,{address:'stored',surfaceId:'surface:stored'}).length,0)
})

test('prunes expired temporary drafts and migrates missing storage without writes',async()=>{
  let time=1_000;const f=fixture({now:()=>time});const temp=await f.store.save(owner,{address:'stored',surfaceId:'surface:stored'},{text:'expires',temporary:true,ttlMs:10})
  assert.equal(f.store.list(owner,{address:'stored',surfaceId:'surface:stored'}).length,1);time+=11
  assert.equal(f.store.prune(),1);assert.equal(f.store.get(owner,{address:'stored',surfaceId:'surface:stored'},temp.id),null)
  assert.equal(f.mem.map.has('draft-shelf:v1'),true)
})

test('enforces bounded draft text and counts without losing existing drafts',async()=>{
  const f=fixture();for(let index=0;index<20;index++)await f.store.save(owner,{address:'stored',surfaceId:'surface:stored'},{text:String(index)})
  await assert.rejects(f.store.save(owner,{address:'stored',surfaceId:'surface:stored'},{text:'overflow'}),/limit/)
  await assert.rejects(f.store.save(owner,{address:'stored',surfaceId:'surface:stored'},{text:'x'.repeat(12001)}),/too long/)
  assert.equal(f.store.list(owner,{address:'stored',surfaceId:'surface:stored'}).length,20)
})

test('enforces a global entry ceiling across many chats without evicting named drafts',async()=>{
  const f=fixture(),drafts=[]
  for(let index=0;index<100;index++)drafts.push(await f.store.save(owner,{address:`chat-${index}`,surfaceId:`surface:${index}`},{name:`Named ${index}`,text:'saved'}))
  const before=structuredClone(f.mem.get('draft-shelf:v1'))
  await assert.rejects(f.store.save(owner,{address:'overflow',surfaceId:'surface:overflow'},{name:'Must keep',text:'saved'}),/global capacity/i)
  assert.deepEqual(f.mem.get('draft-shelf:v1'),before)
  assert.equal(f.store.get(owner,{address:'chat-0',surfaceId:'surface:0'},drafts[0].id).name,'Named 0')
})

test('accepts max-size named drafts until the serialized global byte ceiling and preserves them on rejection',async()=>{
  const f=fixture(),saved=[]
  for(let index=0;index<21;index++)saved.push(await f.store.save(owner,{address:`large-${index}`,surfaceId:`surface:large-${index}`},{name:`Large ${index}`,text:'x'.repeat(12000)}))
  const before=structuredClone(f.mem.get('draft-shelf:v1'))
  await assert.rejects(f.store.save(owner,{address:'large-overflow',surfaceId:'surface:large-overflow'},{name:'Too large',text:'x'.repeat(12000)}),/global capacity/i)
  assert.deepEqual(f.mem.get('draft-shelf:v1'),before)
  assert.equal(f.store.get(owner,{address:'large-0',surfaceId:'surface:large-0'},saved[0].id).text.length,12000)
})

test('evicts the oldest temporary draft deterministically before rejecting a global save',async()=>{
  const f=fixture(),surface={address:'temporary',surfaceId:'surface:temporary'}
  const first=await f.store.save(owner,surface,{text:'first',temporary:true,ttlMs:1000})
  await f.store.save(owner,{address:'temporary-2',surfaceId:'surface:temporary-2'},{text:'second',temporary:true,ttlMs:1000})
  for(let index=0;index<98;index++)await f.store.save(owner,{address:`named-${index}`,surfaceId:`surface:named-${index}`},{name:`Named ${index}`,text:'named'})
  const saved=await f.store.save(owner,{address:'new',surfaceId:'surface:new'},{name:'New named',text:'named'})
  assert.equal(saved.name,'New named')
  assert.equal(f.store.get(owner,surface,first.id),null)
  assert.equal(f.store.list(owner,{address:'temporary-2',surfaceId:'surface:temporary-2'}).length,1)
})

test('rename duplicate and delete persist only the addressed owner records',async()=>{
  const f=fixture();const saved=await f.store.save(owner,{address:'stored',surfaceId:'surface:stored'},{name:'One',text:'body'})
  const renamed=await f.store.rename(owner,{address:'stored',surfaceId:'surface:stored'},saved.id,'Two')
  const copy=await f.store.duplicate(owner,{address:'stored',surfaceId:'surface:stored'},saved.id)
  assert.equal(renamed.name,'Two');assert.equal(copy.name,'Two copy');assert.notEqual(copy.id,saved.id)
  assert.equal(await f.store.delete(owner,{address:'stored',surfaceId:'surface:stored'},saved.id),true);assert.equal(f.store.get(owner,{address:'stored',surfaceId:'surface:stored'},saved.id),null)
})

test('storage failures do not claim mutations',async()=>{
  const f=fixture();f.mem.set=()=>{throw new Error('storage offline')}
  await assert.rejects(f.store.save(owner,{address:'stored',surfaceId:'surface:stored'},{text:'body'}),/storage offline/)
  assert.equal(f.store.list(owner,{address:'stored',surfaceId:'surface:stored'}).length,0)
})

test('caps corrupt huge persisted arrays before exact normalization',()=>{
  const scope=JSON.stringify([owner.connectionId,owner.profile,owner.storedSessionId,'stored','surface:stored'])
  const entries=Array.from({length:10000},()=>null)
  entries[0]={id:'safe',scope,name:'Saved',text:'body',temporary:false,createdAt:1,updatedAt:1,expiresAt:null}
  Object.defineProperty(entries,100,{get(){throw new Error('unbounded entry inspection')},configurable:true})
  const f=fixture({initial:{'draft-shelf:v1':{version:1,entries}}})
  assert.deepEqual(f.store.list(owner,{address:'stored',surfaceId:'surface:stored'}).map(entry=>entry.id),['safe'])
})

test('normalizes persisted records through a draft-only whitelist before resaving',async()=>{
  const scope=JSON.stringify([owner.connectionId,owner.profile,owner.storedSessionId,'stored','surface:stored'])
  const f=fixture({initial:{'draft-shelf:v1':{version:1,entries:[{id:'safe',scope,name:'Saved',text:'body',preview:'forged',temporary:false,createdAt:1,updatedAt:1,expiresAt:null,attachments:['private-file'],credentials:{token:'secret'},transcript:'private conversation',providerPayload:{raw:true}}]}}})
  const listed=f.store.list(owner,{address:'stored',surfaceId:'surface:stored'})
  assert.deepEqual(listed,[{id:'safe',scope,name:'Saved',text:'body',preview:'body',temporary:false,createdAt:1,updatedAt:1,expiresAt:null}])
  await f.store.rename(owner,{address:'stored',surfaceId:'surface:stored'},'safe','Renamed')
  const stored=f.mem.get('draft-shelf:v1')
  assert.deepEqual(Object.keys(stored.entries[0]).sort(),['createdAt','expiresAt','id','name','preview','scope','temporary','text','updatedAt'])
  assert.equal(JSON.stringify(stored).includes('secret'),false)
  assert.equal(JSON.stringify(stored).includes('private conversation'),false)
})

test('restore fails closed on owner focus drift, changed text, and unconfirmed overwrite',async()=>{
  const f=fixture();const surface={address:'stored',surfaceId:'surface:stored'},saved=await f.store.save(owner,surface,{text:'saved'})
  f.focus.owner={...owner,profile:'other'};await assert.rejects(f.store.restore(owner,surface,saved.id,{expectedText:''}),/focus/)
  f.focus.owner={...owner};f.text.value='changed';await assert.rejects(f.store.restore(owner,surface,saved.id,{expectedText:'expected'}),/changed/)
  await assert.rejects(f.store.restore(owner,surface,saved.id,{expectedText:'changed'}),/confirm/)
  await f.store.restore(owner,surface,saved.id,{expectedText:'changed',confirmText:'changed'});assert.equal(f.text.value,'saved')
})

test('restore delegates its final expected-text check to the compare-and-replace adapter operation',async()=>{
  const f=fixture(),surface={address:'stored',surfaceId:'surface:stored'},saved=await f.store.save(owner,surface,{text:'saved'});f.text.value='expected'
  let compared=false
  f.store.draftAdapter.compareAndReplace=async(expected,next,checkedSurface,revalidate)=>{
    compared=true;assert.equal(expected,'expected');assert.equal(next,'saved');assert.deepEqual(checkedSurface,surface)
    f.text.value='edited during restore';revalidate()
    if(f.text.value!==expected)throw new Error('Current draft changed; restore was not applied.')
    f.text.value=next
  }
  await assert.rejects(f.store.restore(owner,surface,saved.id,{expectedText:'expected',confirmText:'expected'}),/changed/)
  assert.equal(compared,true);assert.equal(f.text.value,'edited during restore')
})
