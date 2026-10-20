/* PROMPT_ACTION_INDEX_START */
const PALETTE_QUERY_LIMIT=256
const PALETTE_RESULT_LIMIT=50
const PALETTE_FAVORITE_LIMIT=64
const PALETTE_RECENT_LIMIT=30
const PALETTE_PREFERENCE_INSPECTION_LIMIT=256
function paletteText(value,limit=12000){return typeof value==='string'?value.slice(0,limit).trim():''}
function palettePreferenceIds(value,limit){const ids=[];if(!Array.isArray(value))return ids;for(let index=0;index<Math.min(value.length,PALETTE_PREFERENCE_INSPECTION_LIMIT);index++){const id=paletteText(value[index],64);if(id&&!ids.includes(id))ids.push(id);if(ids.length===limit)break}return ids}
function normalizePalettePreferences(value){return {favorites:palettePreferenceIds(value?.favorites,PALETTE_FAVORITE_LIMIT),recent:palettePreferenceIds(value?.recent,PALETTE_RECENT_LIMIT)}}
function updatePalettePreferences(current,update){return normalizePalettePreferences(typeof update==='function'?update(normalizePalettePreferences(current)):update)}
function paletteTerms(query){return paletteText(query,PALETTE_QUERY_LIMIT).toLocaleLowerCase().split(/\s+/).filter(Boolean)}
function paletteMatches(terms,fields){if(!terms.length)return true;const haystack=fields.map(field=>paletteText(field).toLocaleLowerCase()).join('\n');return terms.every(term=>haystack.includes(term))}
function buildPromptActionIndex(library,preferences={},query='',actions=[]){
  const terms=paletteTerms(query),folders=new Map((Array.isArray(library?.folders)?library.folders:[]).map(folder=>[folder.id,paletteText(folder.name,128)])),favorites=new Set(Array.isArray(preferences?.favorites)?preferences.favorites:[]),recent=new Set(Array.isArray(preferences?.recent)?preferences.recent:[]),recentOrder=new Map((Array.isArray(preferences?.recent)?preferences.recent:[]).map((id,index)=>[id,index])),prompts=Array.isArray(library?.prompts)?library.prompts:[],active=paletteText(library?.activePromptId,64)
  const rows=[]
  for(const prompt of prompts){const id=paletteText(prompt?.id,64),name=paletteText(prompt?.name,128),body=paletteText(prompt?.body),libraryName=folders.get(prompt?.folderId)||'',tags=Array.isArray(prompt?.tags)?prompt.tags.map(tag=>paletteText(tag,64)).filter(Boolean):[];if(!id||!name||!paletteMatches(terms,[name,body,libraryName,...tags]))continue;rows.push({id,kind:'prompt',title:name,subtitle:libraryName||'Prompt library',prompt,tags,rank:id===active?0:favorites.has(id)?1:recent.has(id)?2:3,recentOrder:recentOrder.get(id)??Number.MAX_SAFE_INTEGER,order:Number.isInteger(prompt?.order)?prompt.order:0})}
  for(const action of Array.isArray(actions)?actions:[]){const id=paletteText(action?.id,64),title=paletteText(action?.title,128),keywords=Array.isArray(action?.keywords)?action.keywords.map(keyword=>paletteText(keyword,64)).filter(Boolean):[];if(!id||!title||!paletteMatches(terms,[title,action?.subtitle,...keywords]))continue;rows.push({id,kind:'action',title,subtitle:paletteText(action?.subtitle,128),action,rank:4,order:0})}
  return rows.sort((left,right)=>left.rank-right.rank||(left.recentOrder??Number.MAX_SAFE_INTEGER)-(right.recentOrder??Number.MAX_SAFE_INTEGER)||left.order-right.order||left.title.localeCompare(right.title)).slice(0,PALETTE_RESULT_LIMIT)
}
/* PROMPT_ACTION_INDEX_END */
