import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import test from 'node:test'

const source=await readFile(new URL('../../desktop/plugin.js',import.meta.url),'utf8')
const between=(start,end)=>{const a=source.indexOf(start),b=source.indexOf(end);assert.ok(a>=0&&b>a,`missing ${start}`);return source.slice(a+start.length,b)}
const bounded=(value,limit=8192)=>typeof value==='string'?value.trim().slice(0,limit):''
const review=()=>new Function(`${between('/* ENHANCEMENT_REVIEW_START */','/* ENHANCEMENT_REVIEW_END */')}\nreturn {EnhancementReview}`)().EnhancementReview
const enhancer=()=>new Function('host','bounded',`${between('/* PROMPT_ENHANCER_START */','/* PROMPT_ENHANCER_END */')}\nreturn {PromptEnhancer}`)({},bounded).PromptEnhancer
const owner=Object.freeze({connectionId:'c',profile:'default',runtimeSessionId:'r',storedSessionId:'s'})

function fixture({original='alpha one\nbeta two\ngamma three', proposed='alpha ONE\nbeta two\ngamma THREE'}={}) {
  let text=original,calls=0,surface={surfaceId:'surface',editor:{id:'editor'}}
  const draft={capture:()=>surface,read:async()=>text,replace:async value=>{text=value},insert:async()=>{}}
  const router={capture:async()=>owner,request:async()=>{calls+=1;return {text:proposed}}}
  return {draft,enhancer:new (enhancer())({draftAdapter:draft,ownerRouter:router,api:{},review:new (review())()}),get text(){return text},set text(value){text=value},get calls(){return calls},changeSurface(){surface={surfaceId:'other',editor:{id:'other'}}}}
}

test('propose returns a frozen exact draft-bound proposal without changing the draft',async()=>{
  const f=fixture(),proposal=await f.enhancer.propose(owner,{id:'clarify',name:'Clarify',body:'Rewrite clearly'},null)
  assert.equal(f.text,'alpha one\nbeta two\ngamma three')
  assert.equal(f.calls,1)
  assert.equal(Object.isFrozen(proposal),true)
  assert.equal(Object.isFrozen(proposal.owner),true)
  assert.equal(proposal.original,'alpha one\nbeta two\ngamma three')
  assert.equal(proposal.surface.surfaceId,'surface')
  assert.deepEqual(proposal.prompt,{id:'clarify',name:'Clarify',body:'Rewrite clearly'})
  assert.deepEqual(proposal.route,{kind:'session'})
  assert.equal(proposal.proposed,'alpha ONE\nbeta two\ngamma THREE')
  assert.ok(proposal.groups.length>=2)
})

test('applyProposal applies selected groups as one history revision and redo does not call the model',async()=>{
  const f=fixture(),proposal=await f.enhancer.propose(owner,{id:'clarify',body:'Rewrite'},null)
  const selected=[proposal.groups[0].id]
  const applied=await f.enhancer.applyProposal(proposal,{selectedGroupIds:selected})
  assert.notEqual(applied,proposal.original)
  assert.notEqual(applied,proposal.proposed)
  assert.equal(f.calls,1)
  assert.equal(await f.enhancer.undoFor(owner),true)
  assert.equal(f.text,proposal.original)
  assert.equal(await f.enhancer.redoFor(owner),true)
  assert.equal(f.text,applied)
  assert.equal(f.calls,1)
})

test('applyProposal fails closed for manual edits, owner drift, or surface drift',async()=>{
  const f=fixture(),proposal=await f.enhancer.propose(owner,{id:'clarify',body:'Rewrite'},null)
  f.text='manual edit'
  await assert.rejects(()=>f.enhancer.applyProposal(proposal),/changed since this proposal/)
  f.text=proposal.original
  await assert.rejects(()=>f.enhancer.applyProposal(proposal,{owner:{...owner,storedSessionId:'other'}}),/no longer belongs/)
  f.changeSurface()
  await assert.rejects(()=>f.enhancer.applyProposal(proposal),/changed since this proposal/)
})

test('successful apply and explicit discard each consume a proposal, including after undo',async()=>{
  const f=fixture(),applied=await f.enhancer.propose(owner,{id:'clarify',body:'Rewrite'},null)
  await f.enhancer.applyProposal(applied)
  assert.equal(await f.enhancer.undoFor(owner),true)
  await assert.rejects(()=>f.enhancer.applyProposal(applied),/invalid/)
  const discarded=await f.enhancer.propose(owner,{id:'clarify',body:'Rewrite'},null)
  assert.equal(f.enhancer.discardProposal(discarded),true)
  await assert.rejects(()=>f.enhancer.applyProposal(discarded),/invalid/)
})

test('an in-flight apply reserves the proposal until it succeeds or fails',async()=>{
  const f=fixture(),proposal=await f.enhancer.propose(owner,{id:'clarify',body:'Rewrite'},null)
  let unblock,start
  const started=new Promise(resolve=>{start=resolve}),blocked=new Promise(resolve=>{unblock=resolve})
  f.draft.replace=async value=>{start();await blocked;f.text=value}
  const first=f.enhancer.applyProposal(proposal)
  await started
  const second=f.enhancer.applyProposal(proposal)
  unblock()
  const results=await Promise.allSettled([first,second])
  assert.equal(results[0].status,'fulfilled')
  assert.equal(results[1].status,'rejected')
  assert.match(results[1].reason.message,/already being applied/)
  await assert.rejects(()=>f.enhancer.applyProposal(proposal),/invalid/)
})

test('a failed stale apply leaves the issued proposal available for a retry',async()=>{
  const f=fixture(),proposal=await f.enhancer.propose(owner,{id:'clarify',body:'Rewrite'},null)
  f.text='manual edit'
  await assert.rejects(()=>f.enhancer.applyProposal(proposal),/changed since this proposal/)
  f.text=proposal.original
  assert.equal(await f.enhancer.applyProposal(proposal),proposal.proposed)
})

test('applyProposal rejects a frozen proposal that was not issued by this enhancer',async()=>{
  const f=fixture(),proposal=await f.enhancer.propose(owner,{id:'clarify',body:'Rewrite'},null)
  const forged=Object.freeze({...proposal,groups:proposal.groups})
  await assert.rejects(()=>f.enhancer.applyProposal(forged),/invalid/)
  assert.equal(f.text,proposal.original)
})

test('composer review controls propose without changing the sparkle path, then apply selected/all or discard',async()=>{
  const actions=between('/* COMPOSER_ACTIONS_START */','/* COMPOSER_ACTIONS_END */'),start=actions.indexOf('async function selectedEnhancementPrompt'),end=actions.indexOf('function ComposerPromptMenu')
  assert.ok(start>=0&&end>start,'review action helpers are registered before the composer menu')
  const controls=new Function(`${actions.slice(start,end)};return {enhanceDraft,proposeEnhancement,applyReviewProposal,discardReviewProposal}`)()
  const proposal=Object.freeze({groups:[{id:'change-1'},{id:'change-2'}]}),calls=[],controller={library:{activePromptId:'clarify',enhanceWith:null,prompts:[{id:'clarify',body:'Rewrite'}]},enhancer:{capture:async()=>({owner}),enhance:async()=>calls.push('instant'),propose:async()=>proposal,applyProposal:async(_proposal,options)=>{calls.push(options);return 'applied'},discardProposal:value=>calls.push(['discard',value])},setReviewProposal:value=>calls.push(['show',value]),clearReviewProposal:value=>calls.push(['clear',value])}
  await controls.enhanceDraft(controller)
  assert.deepEqual(calls,['instant'])
  calls.length=0
  await controls.proposeEnhancement(controller)
  assert.deepEqual(calls,[['show',proposal]])
  await controls.applyReviewProposal(controller,proposal,['change-1'])
  await controls.applyReviewProposal(controller,proposal,null)
  controls.discardReviewProposal(controller,proposal)
  assert.deepEqual(calls.slice(1),[{selectedGroupIds:['change-1'],owner},['clear',proposal],{selectedGroupIds:null,owner},['clear',proposal],['discard',proposal],['clear',proposal]])
  assert.ok(actions.includes("action('Review enhancement'"))
  assert.ok(actions.includes("action(enhancing?'Enhancing draft':'Enhance draft'"))
  assert.ok(actions.includes('Original draft'))
  assert.ok(actions.includes('Proposed draft'))
  assert.ok(actions.includes('Apply selected'))
  assert.ok(actions.includes('Apply all'))
  assert.ok(actions.includes('Keep original'))
})

test('review falls back to whole proposal only when bounded diff complexity overflows',()=>{
  const Domain=review(),domain=new Domain({maxTokens:2})
  const proposal=domain.create({owner,surface:{surfaceId:'s',editor:'e'},original:'one two three',prompt:{body:'rewrite'},route:{kind:'session'},proposed:'four five six'})
  assert.equal(proposal.mode,'whole')
  assert.deepEqual(proposal.groups,[])
  assert.equal(domain.compose(proposal,['anything']),proposal.proposed)
})

test('review rejects an over-limit original instead of truncating the draft basis',()=>{
  const Domain=review(),domain=new Domain({maxText:4})
  assert.throws(()=>domain.create({owner,surface:{surfaceId:'s'},original:'abcde',prompt:{id:'p',name:'Prompt',body:'Rewrite'},route:{kind:'session'},proposed:'done'}),/too large/i)
})

test('review rejects over-limit identity and basis fields instead of capturing prefixes',()=>{
  const Domain=review(),domain=new Domain({maxText:10}),base={owner:{connectionId:'c',profile:'p',runtimeSessionId:'r',storedSessionId:'s'},surface:{surfaceId:'s'},original:'draft',prompt:{id:'p',name:'Prompt',body:'Rewrite'},route:{kind:'session'},proposed:'done'}
  for(const [name,value] of [
    ['owner',{connectionId:'connection-id',profile:'test',runtimeSessionId:'run',storedSessionId:'store'}],
    ['surface',{surfaceId:'surface-identity'}],
    ['prompt',{id:'prompt-identity',name:'Prompt',body:'Rewrite'}],
    ['route',{kind:'model',provider:'provider-identity',model:'model',reasoningEffort:'high'}]
  ])assert.throws(()=>domain.create({...base,[name]:value}),/too large/i,name)
})
