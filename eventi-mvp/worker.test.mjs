import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from './dist/worker.mjs';

function fixture(){
  const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
  class Statement {
    constructor(sql,params=[]){this.sql=sql;this.params=params;}
    bind(...params){return new Statement(this.sql,params);}
    async first(){return sqlite.prepare(this.sql).get(...this.params)||null;}
    async all(){return {results:sqlite.prepare(this.sql).all(...this.params)};}
    async run(){return {meta:{changes:Number(sqlite.prepare(this.sql).run(...this.params).changes)}};}
  }
  const DB={prepare:sql=>new Statement(sql),async batch(statements){sqlite.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());sqlite.exec('COMMIT');return r;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
  let ip=0;
  function client(){const address='192.0.2.'+(++ip);let cookie='';return {async request(path,method='GET',body,origin='https://eventi.test'){const req=new Request('https://eventi.test/api'+path,{method,headers:{...(cookie?{Cookie:cookie}:{}),'CF-Connecting-IP':address,...(method!=='GET'?{Origin:origin,'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const r=await worker.fetch(req,{DB},{});const setCookie=r.headers.get('Set-Cookie');if(setCookie)cookie=setCookie.split(';')[0];const contentType=r.headers.get('Content-Type');return {status:r.status,data:contentType?.includes('json')?await r.json():await r.text(),headers:r.headers};}};}
  return {client,sqlite,DB};
}
const eventData={title:'QA Event',description:'A private test event',location:'Teststadt',starts_at:'2026-10-24T18:00',category:'Community'};
const quick=async(c,name)=>(await c.request('/auth/demo','POST',{name})).data.user;

test('private event membership, edit authorization, durable posts and reactions',async()=>{
  const f=fixture(),owner=f.client(),guest=f.client(),outsider=f.client();await quick(owner,'Owner');await quick(guest,'Guest');await quick(outsider,'Outside');
  const e=(await owner.request('/events','POST',eventData)).data.event;assert.ok(e.code.length>=24);
  assert.equal((await guest.request('/events/'+e.id)).status,403);
  const preview=await guest.request('/invite/'+e.code);assert.equal(preview.data.event.title,'QA Event');assert.equal(preview.data.members,undefined);
  assert.equal((await guest.request('/join','POST',{code:e.code})).status,200);
  assert.equal((await guest.request('/events/'+e.id+'/edit','PATCH',eventData)).status,403);
  const post=(await owner.request('/events/'+e.id+'/posts','POST',{body:'Hello <script>alert(1)</script>'})).data;
  assert.equal((await outsider.request('/events/'+e.id+'/posts/'+post.id+'/like','POST',{})).status,403);
  await guest.request('/events/'+e.id+'/posts/'+post.id+'/like','POST',{});
  let hub=(await guest.request('/events/'+e.id)).data;assert.equal(hub.posts[0].likes,1);assert.equal(hub.posts[0].liked,1);assert.equal(hub.members.length,2);
  assert.equal((await guest.request('/events/'+e.id+'/posts/'+post.id,'DELETE',{})).status,403);
  await owner.request('/events/'+e.id+'/posts/'+post.id,'DELETE',{});hub=(await guest.request('/events/'+e.id)).data;assert.equal(hub.posts.length,0);
  assert.equal((await owner.request('/events/'+e.id+'/leave','POST',{})).status,400);
  await guest.request('/events/'+e.id+'/leave','POST',{});assert.equal((await guest.request('/events/'+e.id)).status,403);
});
test('test profile upgrades to account and logs in on another device',async()=>{
  const f=fixture(),a=f.client(),b=f.client();const u=await quick(a,'A');const e=(await a.request('/events','POST',eventData)).data.event;
  const r=await a.request('/auth/register','POST',{name:'Alex',username:'qa.alex',password:'test-password-2026'});assert.equal(r.status,200);assert.equal(r.data.user.id,u.id);assert.equal(r.data.user.guest,false);
  assert.equal((await b.request('/auth/login','POST',{username:'qa.alex',password:'incorrect'})).status,401);
  assert.equal((await b.request('/auth/login','POST',{username:'qa.alex',password:'test-password-2026'})).data.user.id,u.id);
  assert.equal((await b.request('/events')).data.events[0].id,e.id);
  assert.match(r.headers.get('Set-Cookie'),/HttpOnly; Secure; SameSite=Lax/);
  await b.request('/auth/logout','POST',{});assert.equal((await b.request('/session')).data.user,null);assert.equal((await a.request('/session')).data.user.id,u.id);
  assert.equal(f.sqlite.prepare('SELECT password_hash FROM users WHERE id=?').get(u.id).password_hash.length,64);
});
test('connection requests require shared event and recipient acceptance',async()=>{
  const f=fixture(),a=f.client(),b=f.client(),c=f.client();const ua=await quick(a,'A'),ub=await quick(b,'B'),uc=await quick(c,'C');
  assert.equal((await a.request('/network','POST',{user_id:ub.id})).status,403);
  await a.request('/join','POST',{code:'EVENTI-DEMO'});await b.request('/join','POST',{code:'EVENTI-DEMO'});
  assert.equal((await a.request('/network','POST',{user_id:ub.id})).status,201);await a.request('/network','POST',{user_id:ub.id});assert.equal((await a.request('/network')).data.connections[0].status,'pending');
  await b.request('/network','POST',{user_id:ua.id});assert.equal((await a.request('/network')).data.connections[0].status,'accepted');assert.equal((await b.request('/network')).data.connections[0].status,'accepted');
  assert.equal((await c.request('/network','POST',{user_id:ua.id})).status,403);
});
test('ride capacity is enforced atomically, cancelling frees a seat',async()=>{
  const f=fixture(),a=f.client(),b=f.client(),c=f.client();for(const [client,name]of[[a,'A'],[b,'B'],[c,'C']]){await quick(client,name);await client.request('/join','POST',{code:'EVENTI-DEMO'});}
  const p=(await a.request('/events/eventi-demo/plans','POST',{kind:'ride',title:'Ride',place:'Station',starts_at:'2026-10-24T16:00',details:'QA',seats:1})).data;
  assert.equal((await b.request(`/events/eventi-demo/plans/${p.id}/join`,'POST',{})).status,200);
  assert.equal((await c.request(`/events/eventi-demo/plans/${p.id}/join`,'POST',{})).status,409);
  await b.request(`/events/eventi-demo/plans/${p.id}/join`,'POST',{});assert.equal((await c.request(`/events/eventi-demo/plans/${p.id}/join`,'POST',{})).status,200);
  assert.equal((await b.request(`/events/eventi-demo/plans/${p.id}`,'DELETE',{})).status,403);
  await a.request(`/events/eventi-demo/plans/${p.id}`,'DELETE',{});assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM plan_members WHERE plan_id=?').get(p.id).n,0);
});
test('photo access is membership scoped, invalid uploads rejected, CSRF blocked',async()=>{
  const f=fixture(),a=f.client(),b=f.client();await quick(a,'A');await quick(b,'B');const e=(await a.request('/events','POST',eventData)).data.event;
  assert.equal((await a.request('/events','POST',eventData,'https://evil.test')).status,403);
  assert.equal((await a.request(`/events/${e.id}/posts`,'POST',{image:'data:image/svg+xml;base64,PHN2Zz4='})).status,400);
  assert.equal((await a.request(`/events/${e.id}/posts`,'POST',{image:'data:image/jpeg;base64,YmFk'})).status,400);
  const jpeg='data:image/jpeg;base64,'+Buffer.from([255,216,255,224,0,1,255,217]).toString('base64');await a.request(`/events/${e.id}/posts`,'POST',{body:'Photo',image:jpeg});
  const p=(await a.request('/events/'+e.id)).data.posts[0];assert.ok(p.image_id);
  assert.equal((await a.request(`/events/${e.id}/images/${p.image_id}`)).status,200);assert.equal((await b.request(`/events/${e.id}/images/${p.image_id}`)).status,403);
});
test('session expiration and hourly rate window enforce limits',async()=>{
  const f=fixture(),a=f.client();const u=await quick(a,'A');f.sqlite.prepare('UPDATE sessions SET expires_at=0 WHERE user_id=?').run(u.id);assert.equal((await a.request('/session')).data.user,null);
  let last;for(let i=0;i<11;i++)last=await a.request('/auth/login','POST',{username:'missing',password:'whatever'});assert.equal(last.status,429);
});
