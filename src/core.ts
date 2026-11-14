import {lessons,questions,type Question} from './content.ts';
export type AnswerRecord={at:string;qid:string;value:string;correct:boolean;assisted:boolean;self:boolean};
export type Card={attempts:number;successes:number;streak:number;due:string};
export type Prefs={goal:number;accent:string;motion:boolean;cat:string;environment:string;volume:number;spotify:string};
export type Progress={version:2;xp:number;completed:string[];learned:string[];history:AnswerRecord[];cards:Record<string,Card>;days:Record<string,number>;drafts:Record<string,string>;cursor:{lesson:string;index:number};prefs:Prefs;savedAt:string|null};
export const defaultPrefs:Prefs={goal:20,accent:'#8a72bc',motion:true,cat:'lavanda',environment:'aurora',volume:0.25,spotify:''};
export const fresh=():Progress=>({version:2,xp:0,completed:[],learned:[],history:[],cards:{},days:{},drafts:{},cursor:{lesson:'l1',index:0},prefs:{...defaultPrefs},savedAt:null});
export function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function streak(days:Record<string,number>,now=new Date()){let n=0;const d=new Date(now);if(!days[dayKey(d)]) d.setDate(d.getDate()-1);while((days[dayKey(d)]??0)>0){n++;d.setDate(d.getDate()-1);}return n;}
export function unlocked(p:Progress,lid:string){const index=lessons.findIndex(l=>l.id===lid);return index===0 || (index>0 && p.completed.includes(lessons[index-1].id));}
export function mastered(c?:Card){return !!c && c.successes>=3 && c.streak>=2;}
export function record(p:Progress,q:Question,value:string,correct:boolean,assisted=false,self=false,now=new Date()):Progress{
 const prev=p.cards[q.id]??{attempts:0,successes:0,streak:0,due:now.toISOString()};
 // Hints/reference remain useful participation but do not establish independent mastery.
 const independent=correct&&!assisted;
 const eligible=prev.attempts===0||now.getTime()>=Date.parse(prev.due);
 const nextStreak=independent?(eligible?prev.streak+1:prev.streak):0;
 const due=independent&&!eligible?prev.due:new Date(now.getTime()+(independent?[1,3,7,14,30][Math.min(nextStreak-1,4)]*86400000:10*60000)).toISOString();
 return {...p,xp:p.xp+5,history:[...p.history,{at:now.toISOString(),qid:q.id,value,correct,assisted,self}],cards:{...p.cards,[q.id]:{attempts:prev.attempts+1,successes:prev.successes+(independent&&eligible?1:0),streak:nextStreak,due}}};
}
const normalize=(s:string)=>s.trim().replace(/\r/g,'');
// A deliberately bounded structural checker, NOT a C# interpreter or compiler.
export function check(q:Question,input:string):boolean{
 const value=normalize(input);
 if(q.kind==='explain')return false;
 if(!q.rule)return value===q.answer;
 const source=value.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').trim();
 const print=(text:string)=>new RegExp('^(?:System\\.)?Console\\s*\\.\\s*WriteLine\\s*\\(\\s*"'+text+'"\\s*\\)\\s*;$').test(source);
 switch(q.rule){
 case 'print-course':return print('Meu primeiro curso');
 case 'comment-course':return /^\s*\/\/[^\n]*\n/.test(value)&&print('Meu primeiro curso');
 case 'print-book':return print('Livro');
 case 'string-course':return /^(?:string|var|System\.String)\s+curso\s*=\s*"C#"\s*;$/.test(source);
 case 'total':return /^(?:int|var|System\.Int32)\s+total\s*=\s*(?:3\s*\*\s*4|4\s*\*\s*3|12)\s*;$/.test(source);
 case 'if-equals':return /^if\s*\(\s*quantidade\s*==\s*3\s*\)\s*(?:\{\s*(?:System\.)?Console\.WriteLine\("Três"\);\s*\}|(?:System\.)?Console\.WriteLine\("Três"\);)$/.test(source.replace(/\s*([.;])\s*/g,'$1'));
 case 'if-and':{
 const m=source.match(/^if\s*\((.*?)\)\s*(?:\{\s*)?((?:System\.)?Console\s*\.\s*WriteLine\s*\(\s*"Pode cadastrar"\s*\)\s*;)(\s*\})?$/s);
 if(!m||source.includes('{')!==!!m[3])return false;
 const parts=m[1].replace(/\s/g,'').split('&&');
 return parts.length===2 && parts.some(x=>x==='valido'||x==='valido==true'||x==='true==valido')&&parts.some(x=>x==='aulas>0'||x==='0<aulas');
 }
 default:return false;
 }
}
function obj(v:unknown):v is Record<string,unknown>{return !!v&&typeof v==='object'&&!Array.isArray(v);}
const date=(s:unknown)=>typeof s==='string'&&Number.isFinite(Date.parse(s));
const nonnegative=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
const integer=(x:unknown)=>nonnegative(x)&&Number.isSafeInteger(x);
const ids=new Set(questions.map(q=>q.id));const lids=new Set(lessons.map(l=>l.id));
export function validate(raw:unknown):Progress {
 if(!obj(raw))throw Error('O backup não contém um objeto válido.');
 const data=obj(raw.progress)?raw.progress:raw;
 // v1 already used these fields. Migration adds learned/drafts/preferences without dropping history.
 if(data.version!==1&&data.version!==2)throw Error('Versão de backup incompatível.');
 const p={...data} as Record<string,unknown>;
 if(p.version===1){p.version=2;p.learned=p.learned??[];p.drafts=p.drafts??{};p.prefs={...defaultPrefs,...(obj(p.prefs)?p.prefs:{})};}
 if(!integer(p.xp)||!Array.isArray(p.completed)||!p.completed.every(x=>typeof x==='string'&&lids.has(x))||new Set(p.completed).size!==p.completed.length)throw Error('Progresso ou XP inválido.');
 if(!Array.isArray(p.learned)||!p.learned.every(x=>typeof x==='string'&&lids.has(x)))throw Error('Caderno inválido.');
 if(!Array.isArray(p.history)||!p.history.every(a=>obj(a)&&ids.has(a.qid as string)&&date(a.at)&&typeof a.value==='string'&&a.value.length<=20000&&typeof a.correct==='boolean'&&typeof a.assisted==='boolean'&&typeof a.self==='boolean'))throw Error('Histórico inválido.');
 if(!obj(p.cards)||!Object.entries(p.cards).every(([key,c])=>ids.has(key)&&obj(c)&&integer(c.attempts)&&integer(c.successes)&&integer(c.streak)&&(c.successes as number)<=(c.attempts as number)&&(c.streak as number)<=(c.successes as number)&&date(c.due)))throw Error('Revisões inválidas.');
 if(!obj(p.days)||!Object.entries(p.days).every(([k,v])=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&dayKey(new Date(k+'T12:00:00'))===k&&nonnegative(v)&&v<=86400))throw Error('Tempo de estudo inválido.');
 if(!obj(p.drafts)||!Object.entries(p.drafts).every(([k,v])=>ids.has(k)&&typeof v==='string'&&v.length<=20000))throw Error('Rascunhos inválidos.');
 if(!obj(p.cursor)||!lids.has(p.cursor.lesson as string)||!integer(p.cursor.index)||(p.cursor.index as number)>=5)throw Error('Posição da lição inválida.');
 const f=p.prefs;
 if(!obj(f)||!nonnegative(f.goal)||f.goal<1||f.goal>240||!Number.isInteger(f.goal)||typeof f.accent!=='string'||!/^#[0-9a-f]{6}$/i.test(f.accent)||typeof f.motion!=='boolean'||!['lavanda','pessego','azul'].includes(f.cat as string)||!['aurora','noite','bosque'].includes(f.environment as string)||!nonnegative(f.volume)||f.volume>1||typeof f.spotify!=='string'||f.spotify.length>1000)throw Error('Configurações inválidas.');
 if(p.savedAt!==null&&!date(p.savedAt))throw Error('Data de salvamento inválida.');
 // Enforce prerequisites, including imported data.
 for(const id of p.completed as string[]){const i=lessons.findIndex(l=>l.id===id);if(i>0&&!(p.completed as string[]).includes(lessons[i-1].id))throw Error('Pré-requisitos inconsistentes no backup.');}
 const safe=JSON.parse(JSON.stringify(p)) as Progress;
 if(!unlocked(safe,safe.cursor.lesson))throw Error('A posição salva está em uma lição bloqueada.');
 return {version:2,xp:safe.xp,completed:safe.completed,learned:safe.learned,history:safe.history,cards:safe.cards,days:safe.days,drafts:safe.drafts,cursor:safe.cursor,prefs:safe.prefs,savedAt:safe.savedAt};
}
export function spotifyEmbed(value:string){try{const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='open.spotify.com')return null;const m=u.pathname.match(/^\/(?:intl-[a-z]+\/)?(track|playlist|album)\/([a-zA-Z0-9]+)\/?$/);return m?`https://open.spotify.com/embed/${m[1]}/${m[2]}`:null;}catch{return null;}}
export function activeSeconds(elapsed:number,visible:boolean,paused:boolean,idleMs:number){return visible&&!paused&&idleMs<60000?Math.min(Math.max(elapsed,0),2):0;}
