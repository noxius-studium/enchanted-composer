import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
const source = await readFile(process.argv[2], 'utf8')
const required = ['COMPOSER_AREAS.actions','COMPOSER_AREAS.top','class OwnerRouter','class LiveTranscriptBuffer','class DelegationBridge','class ComposerDraftAdapter','class AudioDeviceController','class LiveVoiceSessionController','composerBridge']
for (const token of required) if (!source.includes(token)) throw new Error(`Missing desktop runtime contract: ${token}`)
const imports = [...source.matchAll(/^import\s+.+?\s+from\s+['"]([^'"]+)['"];?$/gm)].map(match=>match[1])
for (const item of imports) if (!['@hermes/plugin-sdk','react','react/jsx-runtime'].includes(item)) throw new Error(`Forbidden runtime import: ${item}`)
if (/area:\s*COMPOSER_AREAS\.(?!(?:actions|top)\b)/.test(source)) throw new Error('Desktop UI contributes outside approved Composer areas')
if (source.includes('composer-rich-input') || source.includes('execCommand')) throw new Error('Draft operations must use the public composer API')
for (const method of ['composer.getDraft','composer.setDraft','composer.insertText']) if (!source.includes(method)) throw new Error(`Missing public draft API: ${method}`)
if (source.includes('prompt.submit')) throw new Error('Live Voice must not submit through the active chat')
for (const route of ['/v1/run/start','/v1/run/status','/v1/run/stop','/v1/run/steer']) if (!source.includes(route)) throw new Error(`Missing Live Voice run route: ${route}`)
const checked=spawnSync(process.execPath,['--check',process.argv[2]],{encoding:'utf8'})
if (checked.status!==0) throw new Error(checked.stderr)
console.log('desktop runtime verified')
