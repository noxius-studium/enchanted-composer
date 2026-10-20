import assert from 'node:assert/strict'
import test from 'node:test'
import {runtime,source,storage,owner} from './runtime-helper.mjs'

test('Enchanted Composer registers new and legacy routes with a single settings navigation',async()=>{
  const {plugin}=runtime(),registrations=[];let dispose
  plugin.register({storage:storage(),rest:async()=>({ok:true}),register:item=>registrations.push(item),onDispose:fn=>{dispose=fn}})
  assert.equal(plugin.name,'Enchanted Composer')
  assert.equal(plugin.id,'composer-enhancements') // preserve installed storage namespace
  assert.equal(registrations.find(r=>r.id==='voice-transcript').area,'composer.top')
  assert.equal(registrations.find(r=>r.id==='route').data.path,'/enchanted-composer')
  assert.equal(registrations.find(r=>r.id==='legacy-route').data.path,'/composer-enhancements')
  assert.equal(registrations.find(r=>r.id==='sidebar-nav').data.label,'Enchanted Composer')
  const controller=registrations.find(r=>r.id==='route').render().props.controller
  let voice=0;controller.voice.dispose=async()=>{voice++};await dispose();assert.equal(voice,1)
})

test('dynamic model catalog retains provider capability constraints',()=>{
  const r=runtime(),catalog=r.normalizeModelCatalog({provider:'openai',model:'dynamic',providers:[{slug:'openai',models:['dynamic','other'],capabilities:{dynamic:{reasoning:false},other:{can_disable_reasoning:false}}}]})
  assert.equal(catalog.models[0].capability.reasoning,false)
  assert.equal(catalog.models[1].capability.canDisableReasoning,false)
  assert.deepEqual(r.enhancementThinkingLevels('openai','dynamic',catalog.models[0].capability),[''])
  assert.ok(!r.enhancementThinkingLevels('openai','other',catalog.models[1].capability).includes('none'))
})

test('control page mounts with real controller and SDK-shaped hook surfaces',()=>{
  const r=runtime(),controller=r.createController({storage:storage(),rest:async()=>({ok:true})})
  const tree=r.EnchantedComposerPage({controller})
  assert.equal(tree.type,'main');assert.equal(tree.props.className,'ec-settings')
  for(const label of ['Retry save','All changes saved','Prompt instructions','Detect audio devices','Account & usage'])assert.ok(source.includes(label),label)
  for(const label of ['Save voice settings','Save audio settings','Save enhancement settings','Save prompt library'])assert.ok(!source.includes(label),label)
  assert.ok(source.includes("'aria-label':'Search enhancement models'"))
  assert.ok(source.includes("role:'tabpanel'"))
})

test('every settings dropdown uses the shared themed picker instead of a native select',()=>{
  const settings=source.slice(source.indexOf('/* SETTINGS_UI_START */'),source.indexOf('/* SETTINGS_UI_END */'))
  assert.match(settings,/function ThemedSelect/)
  assert.doesNotMatch(settings,/jsx\('select'/)
  for(const label of ['Enhancement provider','Thinking level','Active prompt library','Prompt library destination','Voice connection','Live voice provider','Live voice engine','Voice','Voice language','Billing lane'])assert.ok(settings.includes(label),label)
  assert.ok(settings.includes('ariaLabel:`${label} device`'))
})

test('composer bar settings let each icon be shown or hidden independently',()=>{
  for(const id of ['voice','voice-mode','prompt-library','draft-shelf','review','enhance','undo','redo','settings'])assert.ok(source.includes(`id:'${id}'`),id)
  assert.ok(source.includes("['composer','Composer bar']"))
  assert.ok(source.includes('setComposerControlVisibility'))
  assert.ok(source.includes('subscribeComposerControls'))
  assert.ok(source.includes("type:'checkbox'"))
})

test('composer bar settings include a live icon preview and compact themed checkboxes',()=>{
  assert.ok(source.includes('function ComposerBarPreview'))
  assert.ok(source.includes("'aria-label':'Composer bar preview'"))
  assert.ok(source.includes('ec-toggle-input'))
  assert.ok(source.includes('ec-toggle-box'))
  assert.ok(source.includes('Live preview'))
})

test('composer control visibility is bounded, persistent, and live',async()=>{
  const r=runtime(),mem=storage({'composer-control-visibility':{voice:false,unknown:false}}),controller=r.createController({storage:mem,rest:async()=>({ok:true})})
  assert.equal(Object.keys(controller.composerControls).length,r.COMPOSER_CONTROL_DEFINITIONS.length)
  assert.equal(controller.composerControls.voice,false)
  assert.equal(controller.composerControls.enhance,true)
  assert.equal(controller.composerControls.unknown,undefined)
  let observed
  const unsubscribe=controller.subscribeComposerControls(value=>{observed=value})
  controller.setComposerControlVisibility('enhance',false)
  assert.equal(observed.enhance,false)
  assert.equal(mem.map.get('composer-control-visibility').enhance,false)
  assert.throws(()=>controller.setComposerControlVisibility('unknown',false),/Unknown composer control/)
  unsubscribe();await controller.dispose()
})

test('audio autosave works with no voice readiness and controller updates real settings',async()=>{
  const r=runtime(),saved=r.settingsWire(r.DEFAULT_SETTINGS),calls=[],ctx={storage:storage(),rest:async(path,options)=>{calls.push(path);if(path==='/v1/settings')Object.assign(saved,options.body.settings);return {ok:true,exists:true,settings:{...saved}}}}
  const controller=r.createController(ctx);await controller.settingsStore.load(owner);controller.settingsOwner=owner
  await controller.saveSettings({inputDeviceId:'mic-1'});await controller.settingsStore.flush(owner)
  assert.equal(saved.input_device_id,'mic-1');assert.equal(controller.settings.inputDeviceId,'mic-1')
  assert.deepEqual(calls,['/v1/settings/read','/v1/settings','/v1/settings/read'])
  await controller.dispose()
})

test('account surface keeps Codex credential ownership outside the plugin',()=>{
  assert.ok(source.includes('does not read, refresh, back up, or write Codex OAuth files'))
  assert.ok(source.includes('Run codex login outside Hermes'))
  assert.ok(!source.includes('/v1/codex/login/start'))
})
