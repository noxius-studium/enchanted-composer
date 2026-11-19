import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { runtime, storage } from './runtime-helper.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))
const source = await readFile(`${root}/desktop/plugin.js`, 'utf8')
function between(a, b) { const start = source.indexOf(a), end = source.indexOf(b); assert.ok(start >= 0 && end > start, `markers ${a}`); return source.slice(start + a.length, end) }
function compatRuntime(hostStub) {
  const code = between('/* HOST_COMPAT_START */', '/* HOST_COMPAT_END */')
  return new Function('now', 'host', `${code}\nreturn {hostCompatibility,REQUIRED_HOST_SEAMS,OPTIONAL_BROWSER_SEAMS,PLUGIN_REQUIRES_HERMES,HOST_COMPAT_VERSION}`)(() => Date.now(), hostStub)
}
const fullHost = {
  composer: { getDraft: async () => '', setDraft: async () => true, insertText: async () => true },
  state: { focusedSessionOwner: { get: () => ({}) }, focusedSessionId: { get: () => '' }, focusedStoredSessionId: { get: () => '' } },
  profileRoutes: async () => [], requestProfile: async () => ({}), notify: () => {}, navigate: () => {}, openSession: async () => {},
}

test('durability: only public SDK imports, no private core seams anywhere in the bundle', () => {
  const imports = [...source.matchAll(/^import\s+.+?\s+from\s+['"]([^'"]+)['"];?$/gm)].map(m => m[1])
  assert.deepEqual(imports.sort(), ['@hermes/plugin-sdk', 'react', 'react/jsx-runtime'].sort())
  assert.doesNotMatch(source, /execCommand|composer-rich-input|prompt\.submit/)
  assert.doesNotMatch(source, /document\.addEventListener\(['"](?:input|focusin)/)
  assert.doesNotMatch(source, /__hermes|hermesCore|privateApi|internalApi/)
})

test('host compatibility probe reports exact missing seams and never throws on absent browser APIs', () => {
  const ok = compatRuntime(fullHost).hostCompatibility(fullHost)
  assert.equal(ok.ok, true)
  assert.deepEqual(ok.missingCritical, [])
  assert.ok(ok.seams.length >= 8 && ok.optional.length >= 2)
  const broken = { ...fullHost, composer: { getDraft: async () => '', insertText: async () => true } }
  const report = compatRuntime(broken).hostCompatibility(broken)
  assert.equal(report.ok, false)
  assert.deepEqual(report.missingCritical, ['composer.setDraft'])
  const nodeReport = compatRuntime(fullHost).hostCompatibility(fullHost)
  assert.ok(nodeReport.optional.every(seam => typeof seam.available === 'boolean'), 'optional probes are guarded in non-browser environments')
})

test('a host update that removes a public seam degrades visibly without touching user data', () => {
  const r = runtime({ host: { state: {}, notify: () => {} } })
  const registrations = []
  const ctx = { storage: storage({ library: undefined }), rest: async () => ({ ok: true }), register: entry => registrations.push(entry), onDispose: () => {} }
  r.plugin.register(ctx)
  const ids = registrations.map(entry => entry.id)
  assert.ok(ids.includes('host-compat-notice'), 'explicit update notice is shown')
  assert.ok(ids.includes('route') && ids.includes('sidebar-nav'), 'settings/diagnostics stay reachable')
  assert.ok(!ids.includes('actions') && !ids.includes('compose-inline'), 'draft-dependent actions are not registered against a missing API')
})

test('persisted state is versioned and validated so host/plugin updates cannot corrupt it silently', () => {
  assert.ok(source.includes('const LIBRARY_VERSION = 3') || source.includes('const LIBRARY_VERSION=3'))
  assert.ok(source.includes('const BRIEF_VERSION = 1') || source.includes('const BRIEF_VERSION=1'))
  assert.ok(source.includes('validateLibrary(ctx.storage.get'))
  assert.ok(source.includes('validateBrief(ctx.storage.get'))
  assert.ok(source.includes('controller.saveBrief(validateBrief(item))'), 'saved briefs are validated on open')
  assert.ok(source.includes('migrateRendererVoiceDefaults'), 'legacy settings migrate instead of resetting')
  assert.ok(source.includes('{...DEFAULT_SETTINGS,...settingsLocal(result.settings)}'), 'unknown/missing settings fields fall back to defaults, not crashes')
})

test('requires_hermes floor in plugin.yaml matches the runtime compatibility contract', async () => {
  const yaml = await readFile(`${root}/plugin.yaml`, 'utf8')
  const match = yaml.match(/requires_hermes:\s*"([^"]+)"/)
  assert.ok(match, 'plugin.yaml declares requires_hermes')
  const { PLUGIN_REQUIRES_HERMES } = compatRuntime(fullHost)
  assert.equal(match[1], PLUGIN_REQUIRES_HERMES)
})

test('diagnostics surface and recovery procedure exist for post-update verification', async () => {
  const settings = between('/* SETTINGS_UI_START */', '/* SETTINGS_UI_END */')
  for (const token of ['Host compatibility', 'Re-check compatibility', 'Missing · required', 'Only public Hermes seams are used']) assert.ok(settings.includes(token), token)
  const doc = await readFile(`${root}/docs/plans/composer-redesign/DURABILITY.md`, 'utf8')
  for (const token of ['import_kanban.py', 'Idempotency', 'boards export', 'git', 'requires_hermes', 'compareAndReplace']) assert.ok(doc.includes(token), token)
})
