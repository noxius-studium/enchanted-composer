import {readFile} from 'node:fs/promises'
export const source=await readFile(new URL('../../desktop/plugin.js',import.meta.url),'utf8')
export const owner={connectionId:'local',profile:'default',runtimeSessionId:'runtime',storedSessionId:'stored'}
export function storage(initial={}) {const map=new Map(Object.entries(initial));return {map,get:(key,fallback)=>map.has(key)?map.get(key):fallback,set:(key,value)=>map.set(key,structuredClone(value)),remove:key=>map.delete(key)}}
export function runtime(overrides={}) {
  const jsx=(type,props)=>({type,props}),Component=()=>null
  const env={jsx,jsxs:jsx,Fragment:Symbol('fragment'),useState:initial=>[typeof initial==='function'?initial():initial,()=>{}],useEffect:()=>{},useRef:value=>({current:value}),COMPOSER_AREAS:{top:'composer.top',actions:'composer.actions'},ROUTES_AREA:'routes',SIDEBAR_NAV_AREA:'sidebar.nav',Codicon:Component,Button:Component,Popover:Component,PopoverContent:Component,PopoverTrigger:Component,RowButton:Component,Tabs:Component,TabsList:Component,TabsTrigger:Component,icons:{Mic:Component,MicOff:Component,X:Component},host:{state:{},notify:()=>{}},...overrides}
  const code=source.replace(/^import .*$/gm,'').replace('export default {','const plugin = {')
  return new Function(...Object.keys(env),`${code};return {plugin,createController,OwnerRouter,ComposerDraftAdapter,PromptEnhancer,ComposerSettingsStore,DEFAULT_SETTINGS,settingsWire,settingsLocal,LiveVoiceSessionController,RealtimeVoiceAdapter,VoiceBackendAdapter,LiveTranscriptBuffer,EnchantedComposerPage,normalizeModelCatalog,normalizeVoiceCatalog,voiceSelectionStatus,enhancementThinkingLevels};`)(...Object.values(env))
}
export const tick=()=>new Promise(resolve=>setImmediate(resolve))
