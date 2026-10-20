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
