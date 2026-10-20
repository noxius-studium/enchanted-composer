import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {spawnSync} from 'node:child_process'
import {source} from './runtime-helper.mjs'

test('combined desktop bundle parses as an ES module',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'enchanted-composer-esm-')),file=join(dir,'plugin.mjs')
  try {
    await writeFile(file,source,'utf8')
    const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'})
    assert.equal(result.status,0,result.stderr)
  } finally { await rm(dir,{recursive:true,force:true}) }
})

test('combined Composer registers review, draft shelf, and truthful voice task inspector',()=>{
  assert.match(source,/id:'enhancement-review',area:COMPOSER_AREAS\.top/)
  assert.match(source,/ComposerDraftShelf/)
  assert.match(source,/function VoiceTaskInspector/)
  assert.match(source,/id:'voice-task-inspector',area:COMPOSER_AREAS\.top/)
  assert.match(source,/controller\.delegation\.subscribe/)
  assert.match(source,/controller\.delegation\.cancel/)
  assert.match(source,/controller\.delegation\.request/)
})

test('voice interaction chooser fails closed for chained mode and gates push to talk locally',()=>{
  assert.match(source,/VoiceInteractionMode/)
  assert.match(source,/Chained voice requires a public Hermes seam/)
  assert.match(source,/Chained \(unavailable\)/)
  assert.match(source,/Push to talk/)
  assert.match(source,/End Live Voice · stops provider usage/)
  assert.match(source,/Voice mode · \$\{label\}/)
  assert.doesNotMatch(source,/function VoiceInteractionModeChooser[^]*?return jsx\('select'/)
  assert.match(source,/interaction\.start\(\)/)
  assert.match(source,/interaction\.cancel\(\)/)
  assert.match(source,/onPointerDown/)
  assert.match(source,/onPointerUp/)
  assert.match(source,/voice\.setMuted/)
})
