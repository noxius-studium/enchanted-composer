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
