/* PURE_CONTRACT_SOURCE */
/* CONTRACTS_START */
const CONTRACT_VERSION = '1'
const MAX_IDENTIFIER_LENGTH = 128
const MAX_EVENT_STRING_LENGTH = 512
const MAX_PAYLOAD_DEPTH = 4
const MAX_PAYLOAD_ITEMS = 32
const BACKEND_IDS = Object.freeze({ ENCHANTED_REALTIME: 'enchanted-realtime', ENCHANTED_BRIDGE: 'enchanted-bridge' })
const BackendId = BACKEND_IDS
const EVENT_TYPES = new Set(['sessionStarted', 'transcript', 'sessionStopped', 'error'])
const SESSION_STATES = new Set(['created', 'starting', 'active', 'stopping', 'stopped', 'failed'])
const TRANSITIONS = Object.freeze({
  created: new Set(['starting', 'failed']),
  starting: new Set(['active', 'stopping', 'failed']),
  active: new Set(['stopping', 'failed']),
  stopping: new Set(['stopped', 'failed']),
  stopped: new Set(),
  failed: new Set(),
})
const SECRET_KEY = /(?:token|secret|credential|password|authorization|api[-_]?key|access[-_]?key|sdp|raw[-_]?provider)/i
const PUBLIC_MESSAGES = Object.freeze({
  invalid_contract: 'The supplied public contract is invalid.',
  invalid_event: 'The supplied voice event is invalid.',
  backend_not_ready: 'The selected backend is not ready.',
  engine_not_available: 'The selected engine is not available.',
  composer_bridge_required: 'The selected backend requires composerBridge.',
  illegal_session_transition: 'The requested session transition is not allowed.',
})

class ContractError extends Error {
  constructor(code) {
    super(PUBLIC_MESSAGES[code])
    this.name = 'ContractError'
    this.code = code
  }

  toJSON() {
    return { code: this.code, message: this.message }
  }
}

function reject(code) {
  throw new ContractError(code)
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function exactRecord(value, keys, code) {
  if (!isRecord(value) || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))) {
    reject(code)
  }
  return value
}

function boundedString(value, limit, code) {
  if (typeof value !== 'string' || value.length === 0 || value.length > limit) reject(code)
  return value
}

function normalizedBackend(value) {
  if (value === BACKEND_IDS.ENCHANTED_REALTIME || value === BACKEND_IDS.ENCHANTED_BRIDGE) return value
  return reject('invalid_contract')
}

function freezePublic(value, depth = 0) {
  if (depth > MAX_PAYLOAD_DEPTH) reject('invalid_event')
  if (value === null || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) reject('invalid_event')
    return value
  }
  if (typeof value === 'string') return boundedString(value, MAX_EVENT_STRING_LENGTH, 'invalid_event')
  if (Array.isArray(value)) {
    if (value.length > MAX_PAYLOAD_ITEMS) reject('invalid_event')
    return Object.freeze(value.map(item => freezePublic(item, depth + 1)))
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
    if (entries.length > MAX_PAYLOAD_ITEMS) reject('invalid_event')
    const copy = {}
    for (const [key, item] of entries) {
      if (key.length === 0 || key.length > MAX_IDENTIFIER_LENGTH || SECRET_KEY.test(key)) reject('invalid_event')
      Object.defineProperty(copy, key, {
        value: freezePublic(item, depth + 1),
        enumerable: true,
        writable: false,
        configurable: false,
      })
    }
    return Object.freeze(copy)
  }
  return reject('invalid_event')
}

function redactSecrets(value) {
  if (Array.isArray(value)) return value.map(redactSecrets)
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SECRET_KEY.test(key) ? '[REDACTED]' : redactSecrets(item)]))
  }
  return value
}

function normalizeOwnerBinding(value) {
  const owner = exactRecord(value, ['connectionId', 'profile', 'runtimeSessionId', 'storedSessionId'], 'invalid_contract')
  return Object.freeze({
    connectionId: boundedString(owner.connectionId, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    profile: boundedString(owner.profile, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    runtimeSessionId: boundedString(owner.runtimeSessionId, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    storedSessionId: boundedString(owner.storedSessionId, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
  })
}

function normalizeFeatureFlags(value) {
  const flags = exactRecord(value, ['composerBridge'], 'invalid_contract')
  if (typeof flags.composerBridge !== 'boolean') reject('invalid_contract')
  return Object.freeze({ composerBridge: flags.composerBridge })
}

function normalizeCapability(value) {
  const capability = exactRecord(value, ['backend', 'installed', 'compatible', 'supported', 'ready', 'featureFlags'], 'invalid_contract')
  const backend = normalizedBackend(capability.backend)
  for (const field of ['installed', 'compatible', 'supported', 'ready']) {
    if (typeof capability[field] !== 'boolean') reject('invalid_contract')
  }
  if (capability.ready && !(capability.installed && capability.compatible && capability.supported)) reject('invalid_contract')
  return Object.freeze({
    backend,
    installed: capability.installed,
    compatible: capability.compatible,
    supported: capability.supported,
    ready: capability.ready,
    featureFlags: normalizeFeatureFlags(capability.featureFlags),
  })
}

function normalizeCapabilities(value) {
  if (!Array.isArray(value)) reject('invalid_contract')
  const normalized = value.map(normalizeCapability)
  if (new Set(normalized.map(item => item.backend)).size !== normalized.length) reject('invalid_contract')
  return Object.freeze(normalized)
}

function normalizeEngine(value) {
  const engine = exactRecord(value, ['backend', 'engine', 'billingLane'], 'invalid_contract')
  return Object.freeze({
    backend: normalizedBackend(engine.backend),
    engine: boundedString(engine.engine, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    billingLane: boundedString(engine.billingLane, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
  })
}

function normalizeVoiceEvent(value) {
  const event = exactRecord(value, ['type', 'sessionId', 'payload'], 'invalid_event')
  if (typeof event.type !== 'string' || !EVENT_TYPES.has(event.type)) reject('invalid_event')
  if (!isRecord(event.payload)) reject('invalid_event')
  return Object.freeze({
    type: event.type,
    sessionId: boundedString(event.sessionId, MAX_IDENTIFIER_LENGTH, 'invalid_event'),
    payload: freezePublic(event.payload),
  })
}

function resolveEngine(request, capabilities, engines) {
  const target = normalizeEngine(request)
  const normalizedCapabilities = normalizeCapabilities(capabilities)
  const normalizedEngines = Array.isArray(engines) ? engines.map(normalizeEngine) : reject('invalid_contract')
  const capability = normalizedCapabilities.find(item => item.backend === target.backend)
  if (!capability || !capability.ready) reject('backend_not_ready')
  if (target.backend === BACKEND_IDS.ENCHANTED_BRIDGE && !capability.featureFlags.composerBridge) {
    reject('composer_bridge_required')
  }
  const engine = normalizedEngines.find(item => item.backend === target.backend && item.engine === target.engine && item.billingLane === target.billingLane)
  if (!engine) reject('engine_not_available')
  return engine
}

function createVoiceSession(backend, engine, owner) {
  return Object.freeze({
    backend: normalizedBackend(backend),
    engine: boundedString(engine, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    owner: normalizeOwnerBinding(owner),
    state: 'created',
  })
}

function transitionVoiceSession(session, state) {
  if (!isRecord(session) || !SESSION_STATES.has(session.state) || !SESSION_STATES.has(state) || !TRANSITIONS[session.state].has(state)) {
    reject('illegal_session_transition')
  }
  return Object.freeze({
    backend: normalizedBackend(session.backend),
    engine: boundedString(session.engine, MAX_IDENTIFIER_LENGTH, 'invalid_contract'),
    owner: normalizeOwnerBinding(session.owner),
    state,
  })
}

const CONTRACT_TEST_EXPORTS = Object.freeze({
  CONTRACT_VERSION,
  BackendId,
  ContractError,
  normalizeOwnerBinding,
  normalizeCapabilities,
  normalizeVoiceEvent,
  redactSecrets,
  resolveEngine,
  createVoiceSession,
  transitionVoiceSession,
})
/* CONTRACTS_END */
