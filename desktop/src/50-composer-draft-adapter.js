/* DRAFT_ADAPTER_START */
class ComposerDraftAdapter {
  constructor(api=host) { this.api=api }
  capture() {
    if(!this.api.composer?.getDraft||!this.api.composer?.setDraft)throw new Error('Update Hermes Desktop: Enchanted Composer requires the public composer API.')
    const owner=this.api.state.focusedSessionOwner.get(),stored=this.api.state.focusedStoredSessionId.get(),runtime=this.api.state.focusedSessionId.get()
    if(!owner)throw new Error('The focused chat owner is unavailable.')
    if(stored&&!runtime)throw new Error('Wait for this chat to finish loading.')
    const address=stored||runtime||'new',surfaceId=JSON.stringify([owner.connectionId||owner.connection_id,owner.profile,address])
    return Object.freeze({address,surfaceId,editor:surfaceId})
  }
  async read(surface=this.capture()) {
    const text=await this.api.composer.getDraft(surface.address)
    if(typeof text!=='string')throw new Error('The captured composer is not available.')
    return text.replace(/\r\n/g,'\n')
  }
  async replace(text,surface=this.capture()) {
    if(this.capture().surfaceId!==surface.surfaceId)throw new Error('The focused draft changed. Your text was not replaced.')
    if(!await this.api.composer.setDraft(surface.address,String(text).slice(0,12000)))throw new Error('Hermes did not accept the draft change. Reopen this chat and try again.')
  }
  async compareAndReplace(expectedText,text,surface=this.capture(),revalidate=()=>{}) {
    if(typeof expectedText!=='string'||typeof revalidate!=='function')throw new Error('Draft restore requires an exact current draft check.')
    const target=String(text).slice(0,12000),checkSurface=()=>{const current=this.capture();if(current.surfaceId!==surface.surfaceId||current.address!==surface.address)throw new Error('The focused draft changed. Your text was not replaced.')}
    checkSurface();revalidate()
    // The public Composer API has separate read/write calls, not an atomic CAS. Re-read
    // immediately before its acknowledged write, then verify the written value by read-back.
    const current=await this.read(surface);if(current!==expectedText)throw new Error('Current draft changed; restore was not applied.')
    revalidate();checkSurface()
    if(!await this.api.composer.setDraft(surface.address,target))throw new Error('Hermes did not accept the draft change. Reopen this chat and try again.')
    revalidate();checkSurface()
    if(await this.read(surface)!==target)throw new Error('Hermes did not preserve the restored draft. Reopen this chat and try again.')
    revalidate();checkSurface()
  }
  async insert(text,surface=this.capture()) {
    if(this.capture().surfaceId!==surface.surfaceId)throw new Error('The focused draft changed.')
    if(!await this.api.composer.insertText(surface.address,String(text).slice(0,12000),{mode:'block'}))throw new Error('Hermes did not accept the prompt insertion.')
  }
}
/* DRAFT_ADAPTER_END */
