/* VOICE_BACKEND_CONTRACT_START */
class VoiceBackendAdapter {
  async capabilities() { throw new Error('Adapter capabilities are not implemented.') }
  async start() { throw new Error('Adapter start is not implemented.') }
  async setMuted() {}
  async interrupt() {}
  async deliverDelegationResult() {}
  async stop() {}
  subscribe() { return () => {} }
}
class VoiceBackendResolver {
  constructor(adapters) { this.adapters = adapters }
  adapter(selection) { const adapter = this.adapters[selection.backend]; if (!adapter) throw new Error('Selected backend is not installed.'); return adapter }
  async resolve(selection) { const adapter = this.adapter(selection); const capability = await adapter.capabilities(selection); if (!capability || !capability.ready) throw new Error((capability && capability.unavailableReason && capability.unavailableReason.message) || 'Selected backend is not ready.'); if (selection.backend === 'enchanted-bridge' && !(capability.featureFlags && capability.featureFlags.composerBridge)) throw new Error('Selected backend requires composerBridge.'); return { adapter, capability, selection: Object.freeze({ ...selection }) } }
}
/* VOICE_BACKEND_CONTRACT_END */
