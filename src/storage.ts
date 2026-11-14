import {fresh,validate,type Progress} from './core';
const DB='code-bloom';const STORE='progress';
let db:IDBDatabase;
export async function openDB(){
 return new Promise<IDBDatabase>((resolve,reject)=>{const req=indexedDB.open(DB,2);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};req.onerror=()=>reject(Error('Não foi possível abrir o IndexedDB.'));req.onblocked=()=>reject(Error('Feche outras abas do Code Bloom para atualizar o salvamento.'));req.onsuccess=()=>{db=req.result;db.onversionchange=()=>db.close();resolve(db);};});
}
export async function readProgress():Promise<Progress>{await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get('main');r.onsuccess=()=>{try{if(r.result)resolve(validate(r.result));else{let initial=fresh();try{const prefs=JSON.parse(localStorage.getItem('code-bloom-preferences')??'null');if(prefs)initial=validate({...initial,prefs});}catch{/* Invalid preference cache falls back to defaults. */}resolve(initial);}}catch(e){reject(e);}};r.onerror=()=>reject(r.error);});}
export function writeProgress(p:Progress):Promise<string>{return new Promise((resolve,reject)=>{if(!db){reject(Error('Armazenamento indisponível.'));return;}const stamp=new Date().toISOString();const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({...p,savedAt:stamp},'main');tx.oncomplete=()=>resolve(stamp);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??Error('Salvamento interrompido.'));});}
