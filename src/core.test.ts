import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units,lessons,questions} from './content.ts';
import {fresh,check,record,mastered,validate,unlocked,activeSeconds,dayKey,streak,spotifyEmbed} from './core.ts';
test('todas as respostas de referência objetivas passam; respostas vazias falham',()=>{
 assert.equal(units.length,3);assert.equal(lessons.length,9);assert.equal(questions.length,45);assert.equal(new Set(questions.map(q=>q.id)).size,45);
 for(const q of questions){if(q.kind==='explain'){assert.ok(q.criteria?.length);continue;}assert.equal(check(q,q.answer!),true,q.id);assert.equal(check(q,''),false,q.id);}
});
test('checagem guiada aceita alternativas e rejeita erros relevantes',()=>{
 const get=(id:string)=>questions.find(q=>q.id===id)!;
 for(const s of ['Console . WriteLine ( "Meu primeiro curso" ) ;','System.Console.WriteLine("Meu primeiro curso");','/* explica */\nConsole.WriteLine("Meu primeiro curso");'])assert.ok(check(get('q5'),s),s);
 for(const s of ['console.WriteLine("Meu primeiro curso");','Console.WriteLine("Outro curso");','Console.WriteLine("Meu primeiro curso")','Console.WriteLine("Meu primeiro curso"); Console.WriteLine("extra");'])assert.ok(!check(get('q5'),s),s);
 assert.ok(check(get('q20'),'var curso = "C#";'));assert.ok(check(get('q25'),'int total = 4 * 3;'));assert.ok(!check(get('q25'),'int total = 3 + 4;'));
 assert.ok(check(get('q40'),'if (aulas > 0 && valido == true) Console.WriteLine("Pode cadastrar");'));
 assert.ok(!check(get('q40'),'if (aulas > 0 || valido) { Console.WriteLine("Pode cadastrar"); }'));
 assert.ok(!check(get('q40'),'if (aulas > 0 && valido) { Console.WriteLine("Pode cadastrar");'));
});
test('participação, reforço por dificuldade e domínio por revisões independentes',()=>{
 const q=questions[0],now=new Date('2026-11-14T12:00:00Z');let p=fresh();
 p=record(p,q,'x',false,false,false,now);assert.equal(p.xp,5);assert.equal(p.cards.q1.due,'2026-11-14T12:10:00.000Z');
 p=record(p,q,q.answer!,true,true,false,now);assert.equal(p.cards.q1.successes,0);assert.equal(p.cards.q1.streak,0);
 for(const d of ['2026-11-15T12:00:00Z','2026-11-16T12:00:00Z','2026-11-19T12:00:00Z'])p=record(p,q,q.answer!,true,false,false,new Date(d));
 assert.ok(mastered(p.cards.q1));assert.equal(p.xp,25);assert.equal(p.history.length,5);assert.equal(p.cards.q1.due,'2026-11-26T12:00:00.000Z');
 p=record(p,q,'x',false,false,false,now);assert.ok(!mastered(p.cards.q1));
});
test('backup roundtrip preserva respostas, revisões, tempo, preferências e rascunhos',()=>{
 let p=fresh();p=record(p,questions[0],'Minha resposta',true);p.days[dayKey()]=123;p.learned=['l1'];p.drafts.q2='teste';p.prefs.goal=45;p.completed=['l1'];p.cursor={lesson:'l2',index:2};
 const restored=validate(JSON.parse(JSON.stringify({app:'code-bloom',progress:p})));assert.deepEqual(restored,p);assert.ok(unlocked(restored,'l2'));assert.ok(!unlocked(restored,'l3'));
});
test('backup malformado e versões futuras são rejeitados antes de substituir',()=>{
 for(const change of [{version:99},{xp:-2},{history:[{qid:'missing'}]},{cards:{q1:{attempts:0,successes:2,streak:1,due:'bad'}}},{days:{'2026-02-31':1}},{prefs:{goal:0}},{completed:['l3']},{cursor:{lesson:'l9',index:0}},{drafts:{q1:33}}])assert.throws(()=>validate({...fresh(),...change}));
});
test('migração v1 preserva o histórico anterior',()=>{
 const p=record(fresh(),questions[0],'texto antigo',false);const old={...p,version:1,learned:undefined,drafts:undefined};const migrated=validate(JSON.parse(JSON.stringify(old)));assert.equal(migrated.version,2);assert.deepEqual(migrated.history,p.history);assert.deepEqual(migrated.drafts,{});
});
test('tempo ativo: aba oculta, pausa, inatividade e suspensão longa',()=>{
 assert.equal(activeSeconds(1,true,false,1000),1);assert.equal(activeSeconds(1,false,false,1000),0);assert.equal(activeSeconds(1,true,true,1000),0);assert.equal(activeSeconds(1,true,false,60000),0);assert.equal(activeSeconds(120,true,false,1000),2);
});
test('sequência usa dias locais e permite hoje ainda não estudado',()=>{
 const d=new Date(2026,10,14,10);assert.equal(dayKey(d),'2026-11-14');assert.equal(streak({'2026-11-13':2,'2026-11-12':2},d),2);assert.equal(streak({'2026-11-12':2},d),0);
});
test('Spotify só permite player oficial e links compatíveis',()=>{
 assert.equal(spotifyEmbed('https://open.spotify.com/playlist/123AbC?si=abc'),'https://open.spotify.com/embed/playlist/123AbC');assert.equal(spotifyEmbed('https://open.spotify.com/intl-pt/track/123'),'https://open.spotify.com/embed/track/123');assert.equal(spotifyEmbed('https://example.com/track/123'),null);assert.equal(spotifyEmbed('javascript:alert(1)'),null);
});

test('prática antes da revisão não acelera domínio nem adia o vencimento',()=>{let p=record(fresh(),questions[0],'ok',true,false,false,new Date('2026-11-14T12:00:00Z'));const due=p.cards.q1.due;p=record(p,questions[0],'ok',true,false,false,new Date('2026-11-14T12:01:00Z'));assert.equal(p.cards.q1.successes,1);assert.equal(p.cards.q1.due,due);assert.equal(p.xp,10);});
