/* ENHANCEMENT_REVIEW_START */
class EnhancementReview {
  constructor({maxText=12000,maxTokens=512,maxGroups=32}={}) { this.maxText=maxText;this.maxTokens=maxTokens;this.maxGroups=maxGroups }
  _text(value) { return typeof value==='string'?value.slice(0,this.maxText):'' }
  _exact(value,label) { if(typeof value!=='string')return '';if(value.length>this.maxText)throw new Error(`Enhancement proposal ${label} is too large.`);return value }
  _copy(value,keys,label) { const copy={};for(const key of keys)copy[key]=this._exact(value?.[key],`${label}.${key}`);return copy }
  _freeze(value) { if(Array.isArray(value))return Object.freeze(value.map(item=>this._freeze(item)));if(value&&typeof value==='object'){const copy={};for(const [key,item] of Object.entries(value))copy[key]=this._freeze(item);return Object.freeze(copy)}return value }
  _tokens(text) { return text.match(/\s+|[^\s]+/g)||[] }
  _changes(original,proposed) {
    const left=this._tokens(original),right=this._tokens(proposed)
    if(left.length>this.maxTokens||right.length>this.maxTokens||left.length*right.length>this.maxTokens*this.maxTokens)return null
    const rows=left.length+1,columns=right.length+1,table=Array.from({length:rows},()=>new Uint16Array(columns))
    for(let i=left.length-1;i>=0;i--)for(let j=right.length-1;j>=0;j--)table[i][j]=left[i]===right[j]?table[i+1][j+1]+1:Math.max(table[i+1][j],table[i][j+1])
    const actions=[];let i=0,j=0
    while(i<left.length||j<right.length){if(i<left.length&&j<right.length&&left[i]===right[j]){actions.push(['=',left[i]]);i++;j++}else if(j<right.length&&(i===left.length||table[i][j+1]>=table[i+1][j])){actions.push(['+',right[j++]])}else actions.push(['-',left[i++]])}
    const groups=[],offsets=[];let offset=0;for(const token of left){offsets.push(offset);offset+=token.length}offsets.push(offset)
    let leftAt=0,group=null
    for(const [kind,text] of actions){if(kind==='='){if(group){groups.push(group);group=null}leftAt++;continue}if(!group)group={start:leftAt,end:leftAt,replacement:''};if(kind==='-'){group.end++;leftAt++}else group.replacement+=text}
    if(group)groups.push(group)
    if(groups.length>this.maxGroups)return null
    return groups.map((group,index)=>({id:`change-${index+1}`,start:offsets[group.start],end:offsets[group.end],replacement:this._text(group.replacement)}))
  }
  create({owner,surface,original,prompt,route,proposed}) {
    const before=this._exact(original,'original'),after=this._text(proposed),groups=before===after?[]:this._changes(before,after),routeCopy={kind:this._exact(route?.kind,'route.kind')}
    if(routeCopy.kind==='model')Object.assign(routeCopy,this._copy(route,['provider','model','reasoningEffort'],'route'))
    return this._freeze({owner:this._copy(owner,['connectionId','profile','runtimeSessionId','storedSessionId'],'owner'),surface:this._copy(surface,['surfaceId','editor'],'surface'),original:before,prompt:this._copy(prompt,['id','name','body'],'prompt'),route:routeCopy,proposed:after,mode:groups===null?'whole':'groups',groups:groups||[]})
  }
  compose(proposal,selectedGroupIds=null) {
    if(!proposal||proposal.mode==='whole'||!Array.isArray(selectedGroupIds))return proposal?.proposed||''
    const selected=new Set(selectedGroupIds),groups=proposal.groups.filter(group=>selected.has(group.id))
    let cursor=0,result=''
    for(const group of groups){result+=proposal.original.slice(cursor,group.start)+group.replacement;cursor=group.end}
    return result+proposal.original.slice(cursor)
  }
}
/* ENHANCEMENT_REVIEW_END */
