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
