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
  async insert(text,surface=this.capture()) {
    if(this.capture().surfaceId!==surface.surfaceId)throw new Error('The focused draft changed.')
    if(!await this.api.composer.insertText(surface.address,String(text).slice(0,12000),{mode:'block'}))throw new Error('Hermes did not accept the prompt insertion.')
  }
}
/* DRAFT_ADAPTER_END */
