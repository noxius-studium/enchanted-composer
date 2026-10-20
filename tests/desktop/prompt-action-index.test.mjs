import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const indexPath=fileURLToPath(new URL('../../desktop/src/42-prompt-action-index.js',import.meta.url))
const composerPath=fileURLToPath(new URL('../../desktop/src/95-composer-actions.js',import.meta.url))

async function indexRuntime() {
  const source=await readFile(indexPath,'utf8')
  return new Function(`${source}\nreturn {buildPromptActionIndex,normalizePalettePreferences,updatePalettePreferences,PALETTE_PREFERENCE_INSPECTION_LIMIT}`)()
}

function findNode(node,predicate) {
  if(!node||typeof node!=='object')return undefined
  if(predicate(node))return node
  const children=node.props?.children
  for(const child of Array.isArray(children)?children:[children]){const found=findNode(child,predicate);if(found)return found}
}

function findNodes(node,predicate,nodes=[]) {
  if(!node||typeof node!=='object')return nodes
  if(predicate(node))nodes.push(node)
  const children=node.props?.children
  for(const child of Array.isArray(children)?children:[children])findNodes(child,predicate,nodes)
  return nodes
}

async function paletteTree({open=true}={}) {
  const source=await readFile(composerPath,'utf8')
  const jsx=(type,props)=>({type,props}),Component=()=>null,state=[]
  let cursor=0
  const useState=initial=>{const index=cursor++,initialValue=initial===false?open:typeof initial==='function'?initial():initial,value=index in state?state[index]:state[index]=initialValue;return [value,next=>{state[index]=typeof next==='function'?next(state[index]):next}]}
  const controller={library:{activePromptId:'one',folders:[],prompts:[{id:'one',name:'One',body:'first',folderId:'',tags:[]},{id:'two',name:'Two',body:'second',folderId:'',tags:[]}]},libraryListeners:new Set(),ctx:{storage:{get:()=>({favorites:[],recent:[]}),set:()=>{}}},saveLibrary:()=>{controller.saveCount=(controller.saveCount||0)+1},enhancer:{insert:()=>Promise.resolve()}}
  const env={jsx,jsxs:jsx,Fragment:Symbol('fragment'),useState,useEffect:()=>{},useRef:value=>({current:value}),Button:Component,Popover:Component,PopoverContent:Component,PopoverTrigger:Component,Codicon:Component,icons:{},ACTION_CLASS:'',normalizePalettePreferences:value=>({favorites:Array.isArray(value?.favorites)?value.favorites:[],recent:Array.isArray(value?.recent)?value.recent:[]}),updatePalettePreferences:(current,update)=>update(current),buildPromptActionIndex:(library,preferences,query,actions=[])=>query?[]:[...library.prompts.map(prompt=>({kind:'prompt',id:prompt.id,title:prompt.name,subtitle:'',prompt})),...actions.map(action=>({kind:'action',id:action.id,title:action.title,subtitle:action.subtitle,action}))],libraryChange:()=>({}),host:{notify:()=>{}},queueMicrotask:()=>{}}
  const Menu=new Function(...Object.keys(env),`${source}\nreturn ComposerPromptMenu`)(...Object.values(env))
  const render=()=>{cursor=0;return Menu({controller,paletteActions:{history:{canUndo:true,canRedo:true,busy:false},enhance:()=>{},review:()=>{},undo:()=>{},redo:()=>{},voice:()=>{},settings:()=>{}}})}
  return {tree:render(),controller,render}
}

test('palette search matches prompt name body library and tags with active favorite and recent prompts first',async()=>{
  const {buildPromptActionIndex}=await indexRuntime()
  const library={folders:[{id:'work',name:'Work notes'},{id:'personal',name:'Personal'}],activePromptId:'retro',prompts:[{id:'retro',folderId:'work',name:'Retrospective',body:'Summarize delivery outcomes',order:2,tags:['weekly']},{id:'plan',folderId:'work',name:'Plan',body:'Create implementation milestones',order:1,tags:['favorite']},{id:'journal',folderId:'personal',name:'Journal',body:'Capture daily reflection',order:0,tags:['recent']}]}
  const rows=buildPromptActionIndex(library,{favorites:['plan'],recent:['journal']},'')
  assert.deepEqual(rows.filter(row=>row.kind==='prompt').map(row=>row.id),['retro','plan','journal'])
  assert.deepEqual(buildPromptActionIndex(library,{},'delivery').map(row=>row.id),['retro'])
  assert.deepEqual(buildPromptActionIndex(library,{},'work notes').map(row=>row.id),['retro','plan'])
  assert.deepEqual(buildPromptActionIndex(library,{},'weekly').map(row=>row.id),['retro'])
  assert.deepEqual(buildPromptActionIndex({...library,activePromptId:'missing'},{recent:['plan','journal']},'').filter(row=>row.kind==='prompt').map(row=>row.id),['plan','journal','retro'])
})

test('palette search input handles ArrowUp ArrowDown and Enter for palette navigation and activation',async()=>{
  const {tree,controller}=await paletteTree()
  const handler=findNode(tree,node=>typeof node.props?.onKeyDown==='function').props.onKeyDown
  const searchInput={closest:selector=>selector.includes('input')?{}:null}
  const handled=[]
  for(const key of ['ArrowDown','ArrowUp','Enter']){
    let prevented=false
    handler({key,target:searchInput,preventDefault:()=>{prevented=true}})
    handled.push(prevented)
  }
  assert.deepEqual(handled,[true,true,true])
  assert.equal(controller.saveCount,1)
})

test('palette interactive result controls retain native Enter handling without palette activation',async()=>{
  const {tree,controller}=await paletteTree()
  const handler=findNode(tree,node=>typeof node.props?.onKeyDown==='function').props.onKeyDown
  let prevented=false
  handler({key:'Enter',target:{closest:selector=>selector.includes('button')?{}:null},preventDefault:()=>{prevented=true}})
  assert.equal(prevented,false)
  assert.equal(controller.saveCount,undefined)
})

test('palette combobox announces its active result and listbox owns only stable options',async()=>{
  const {tree}=await paletteTree()
  const search=findNode(tree,node=>node.type==='input'&&node.props?.['aria-label']==='Search prompts')
  const listbox=findNode(tree,node=>node.props?.role==='listbox')
  const options=findNodes(listbox,node=>node.props?.role==='option')
  assert.equal(search.props.role,'combobox')
  assert.equal(search.props['aria-expanded'],true)
  assert.equal(search.props['aria-controls'],listbox.props.id)
  assert.equal(search.props['aria-activedescendant'],options[0].props.id)
  assert.ok(options.every(option=>typeof option.props.id==='string'&&option.props.id))
  assert.ok(options.every(option=>option.props.id.includes('-prompt-')))
  assert.equal(findNodes(listbox,node=>node.type==='button').length,0)
})

test('palette navigation updates the combobox active descendant to the visual result',async()=>{
  const {tree,render}=await paletteTree()
  const handler=findNode(tree,node=>typeof node.props?.onKeyDown==='function').props.onKeyDown
  handler({key:'ArrowDown',target:{closest:()=>null},preventDefault:()=>{}})
  const updatedSearch=findNode(render(),node=>node.type==='input'&&node.props?.role==='combobox')
  assert.equal(updatedSearch.props['aria-activedescendant'],'prompt-action-option-prompt-two')
})

test('palette leaves an empty listbox free of non-option content',async()=>{
  const {tree,render}=await paletteTree()
  findNode(tree,node=>node.type==='input'&&node.props?.role==='combobox').props.onChange({target:{value:'none'}})
  const updatedTree=render(),listbox=findNode(updatedTree,node=>node.props?.role==='listbox')
  const search=findNode(updatedTree,node=>node.type==='input'&&node.props?.role==='combobox')
  assert.equal(findNodes(listbox,node=>node.type==='p').length,0)
  assert.equal(search.props['aria-activedescendant'],undefined)
})

test('palette preferences normalize malformed persisted values into bounded string ID lists',async()=>{
  const {normalizePalettePreferences}=await indexRuntime()
  assert.deepEqual(normalizePalettePreferences(null),{favorites:[],recent:[]})
  assert.deepEqual(normalizePalettePreferences({favorites:['  one  ',7,'',null,'one'],recent:'bad'}),{favorites:['one'],recent:[]})
  assert.deepEqual(normalizePalettePreferences({favorites:Array.from({length:100},(_,index)=>` favorite-${index} `),recent:Array.from({length:50},(_,index)=>`recent-${index}`)}),{favorites:Array.from({length:64},(_,index)=>`favorite-${index}`),recent:Array.from({length:30},(_,index)=>`recent-${index}`)})
})

test('palette preference normalization bounds inspected malformed array entries',async()=>{
  const {normalizePalettePreferences,PALETTE_PREFERENCE_INSPECTION_LIMIT}=await indexRuntime()
  const reads=[]
  const values=new Proxy(Array.from({length:10_000},()=>null),{get(target,key,receiver){if(/^\d+$/.test(String(key)))reads.push(Number(key));return Reflect.get(target,key,receiver)}})
  assert.deepEqual(normalizePalettePreferences({favorites:values,recent:values}),{favorites:[],recent:[]})
  assert.ok(reads.length<=PALETTE_PREFERENCE_INSPECTION_LIMIT*2)
  assert.ok(Math.max(...reads)<PALETTE_PREFERENCE_INSPECTION_LIMIT)
})

test('async insertion completion updates recents against the latest favorite state',async()=>{
  const {normalizePalettePreferences,updatePalettePreferences}=await indexRuntime()
  let preferences=normalizePalettePreferences({favorites:[],recent:[]})
  let finishInsert
  const inserting=new Promise(resolve=>{finishInsert=resolve}).then(()=>{preferences=updatePalettePreferences(preferences,current=>({...current,recent:['one',...current.recent.filter(id=>id!=='one')]}))})
  preferences=updatePalettePreferences(preferences,current=>({...current,favorites:['one',...current.favorites]}))
  finishInsert()
  await inserting
  assert.deepEqual(preferences,{favorites:['one'],recent:['one']})
})

test('prompt-library validation preserves bounded prompt tags for palette search',async()=>{
  const source=await readFile(fileURLToPath(new URL('../../desktop/src/40-prompt-model.js',import.meta.url)),'utf8')
  const model=new Function('now','bounded',`${source}\nreturn {createLibrary,validateLibrary}`)(()=>1,(value,limit=8192)=>typeof value==='string'?value.trim().slice(0,limit):'')
  const library=model.createLibrary()
  library.prompts[0].tags=['work','  favorite  ','x'.repeat(80)]
  assert.deepEqual(model.validateLibrary(library).prompts[0].tags,['work','favorite','x'.repeat(64)])
})