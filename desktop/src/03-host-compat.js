/* HOST_COMPAT_START */
// Host-update durability contract (user requirement 2026-11-19). The plugin
// binds only to public Hermes seams; when a host update removes one, it fails
// closed with an explicit update notice instead of scraping private APIs or
// touching user data. Mirrors plugin.yaml requires_hermes.
const HOST_COMPAT_VERSION = '1'
const PLUGIN_REQUIRES_HERMES = '>=0.21.5'
const REQUIRED_HOST_SEAMS = Object.freeze([
  { id: 'composer.getDraft', critical: true, probe: h => typeof h?.composer?.getDraft === 'function' },
  { id: 'composer.setDraft', critical: true, probe: h => typeof h?.composer?.setDraft === 'function' },
  { id: 'composer.insertText', critical: true, probe: h => typeof h?.composer?.insertText === 'function' },
  { id: 'state.focusedSessionOwner', critical: true, probe: h => typeof h?.state?.focusedSessionOwner?.get === 'function' },
  { id: 'state.focusedSessionId', critical: true, probe: h => typeof h?.state?.focusedSessionId?.get === 'function' },
  { id: 'state.focusedStoredSessionId', critical: true, probe: h => typeof h?.state?.focusedStoredSessionId?.get === 'function' },
  { id: 'profileRoutes', critical: true, probe: h => typeof h?.profileRoutes === 'function' },
  { id: 'requestProfile', critical: true, probe: h => typeof h?.requestProfile === 'function' },
  { id: 'notify', critical: false, probe: h => typeof h?.notify === 'function' },
  { id: 'navigate', critical: false, probe: h => typeof h?.navigate === 'function' },
  { id: 'openSession', critical: false, probe: h => typeof h?.openSession === 'function' },
])
const OPTIONAL_BROWSER_SEAMS = Object.freeze([
  { id: 'ResizeObserver', probe: () => typeof ResizeObserver !== 'undefined' },
  { id: 'clipboard', probe: () => typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function' },
])
function hostCompatibility(h = host) {
  const seams = REQUIRED_HOST_SEAMS.map(seam => ({ id: seam.id, critical: seam.critical, available: seam.probe(h) }))
  const optional = OPTIONAL_BROWSER_SEAMS.map(seam => ({ id: seam.id, available: seam.probe() }))
  const missingCritical = seams.filter(seam => seam.critical && !seam.available).map(seam => seam.id)
  return { version: HOST_COMPAT_VERSION, requiresHermes: PLUGIN_REQUIRES_HERMES, checkedAt: now(), seams, optional, missingCritical, ok: missingCritical.length === 0 }
}
function HostCompatNotice({ controller }) {
  const compat = controller.hostCompat || hostCompatibility()
  return jsxs('section', { role: 'alert', 'aria-label': 'Hermes compatibility notice', className: 'mx-2 mb-1 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-background) p-2 text-xs', children: [
    jsx('strong', { children: 'Enchanted Composer needs a Hermes Desktop update' }),
    jsxs('p', { className: 'mt-1 text-(--ui-text-secondary)', children: [`Missing public seams: ${compat.missingCritical.join(', ') || 'unknown'}.`, `Requires Hermes ${compat.requiresHermes}.`].join(' ') }),
    jsx('p', { className: 'mt-1 text-(--ui-text-tertiary)', children: 'Your drafts, prompt libraries, settings, and saved briefs are untouched. Composer actions stay hidden until the public API is available again; settings and diagnostics remain reachable from the sidebar.' }),
  ] })
}
/* HOST_COMPAT_END */
