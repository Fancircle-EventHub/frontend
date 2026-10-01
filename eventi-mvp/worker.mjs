import { HTML, CLIENT, CSS } from './ui.mjs';

const DAY = 86400000;
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
const text = (value, max, required = true) => {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) fail('Bitte prüfe deine Eingaben.');
  return value.trim();
};
const date = value => { const s = text(value, 30); if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) || !Number.isFinite(Date.parse(s))) fail('Bitte wähle Datum und Uhrzeit.'); return s; };
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
const hash = async value => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
const passwordHash = async (password, salt) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2', salt:new TextEncoder().encode(salt), iterations:100000, hash:'SHA-256'}, key, 256));
};
const safeUser = u => u && ({id:u.id, name:u.name, username:u.username, bio:u.bio, guest:!u.password_hash});
const publicUser = u => ({id:u.id,name:u.name,bio:u.bio});
const constantEqual = (a,b) => { let diff = a.length ^ b.length; for(let i=0;i<a.length;i++) diff |= a.charCodeAt(i) ^ (b.charCodeAt(i)||0); return diff===0; };
async function session(db,user) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await db.prepare('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(await hash(token),user.id,Date.now()+30*DAY).run();
  return json({user:safeUser(user)},200,{'Set-Cookie':`eventi_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`});
}
async function rateLimit(db,key,max=60) {
  const now=Date.now();
  await db.prepare('INSERT INTO rate_limits (key,hits,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN expires_at<? THEN 1 ELSE hits+1 END,expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END').bind(key,now+60000,now,now).run();
  const row=await db.prepare('SELECT hits FROM rate_limits WHERE key=?').bind(key).first();
  if(row.hits>max) fail('Zu viele Versuche. Bitte warte eine Minute.',429);
}
async function auth(req,db) {
  const token=(req.headers.get('Cookie')||'').match(/(?:^|;\s*)eventi_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if(!token) return null;
  return db.prepare('SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?').bind(await hash(token),Date.now()).first();
}
async function api(req,env,url) {
  const db=env.DB, path=url.pathname, method=req.method, write=!['GET','HEAD'].includes(method);
  if(write) {
    if(req.headers.get('Origin')!==url.origin) fail('Diese Anfrage ist nicht erlaubt.',403);
    if(!req.headers.get('Content-Type')?.startsWith('application/json')) fail('JSON erwartet.',415);
    if(Number(req.headers.get('Content-Length')||0)>300000) fail('Die Datei ist zu groß.',413);
    await rateLimit(db,`ip:${req.headers.get('CF-Connecting-IP')||'unknown'}`);
  }
  let body={};
  if(write) {
    const raw=await req.text(); if(raw.length>300000) fail('Die Datei ist zu groß.',413);
    try {body=JSON.parse(raw);} catch {fail('Ungültige Anfrage.');}
    if(!body || typeof body!=='object' || Array.isArray(body)) fail('Ungültige Anfrage.');
  }
  const user=await auth(req,db);
  if(path==='/api/session' && method==='GET') return json({user:safeUser(user)});
  if(path==='/api/health' && method==='GET') {await db.prepare('SELECT 1').first();return json({status:'ok',version:'eventi-test-1',database:'connected'});}
  if(['/api/auth/demo','/api/auth/register','/api/auth/login'].includes(path)&&method==='POST') {
    await rateLimit(db,`auth:${req.headers.get('CF-Connecting-IP')||'unknown'}`,10);
    if(path==='/api/auth/demo') {
      if(user) return json({user:safeUser(user)});
      const u={id:crypto.randomUUID(),name:text(body.name||'Testgast',50),username:null,bio:''};
      await db.prepare('INSERT INTO users (id,name) VALUES (?,?)').bind(u.id,u.name).run(); return session(db,u);
    }
    const username=text(body.username,40).toLowerCase();
    if(!/^[a-z0-9_.-]{3,40}$/.test(username)) fail('Benutzername: mindestens 3 Zeichen, Buchstaben, Zahlen, Punkt oder Unterstrich.');
    const password=text(body.password,128);
    if(path==='/api/auth/register') {
      if(password.length<10) fail('Dein Passwort braucht mindestens 10 Zeichen.');
      if(await db.prepare('SELECT id FROM users WHERE username=?').bind(username).first()) fail('Dieser Benutzername ist schon vergeben.',409);
      const u={id:user?.id||crypto.randomUUID(),name:text(body.name,50),username,bio:user?.bio||'',salt:crypto.randomUUID()};
      u.password_hash=await passwordHash(password,u.salt);
      if(user?.password_hash) fail('Du hast bereits einen Account.',409);
      if(user) await db.prepare('UPDATE users SET name=?,username=?,password_hash=?,salt=? WHERE id=?').bind(u.name,username,u.password_hash,u.salt,u.id).run();
      else await db.prepare('INSERT INTO users (id,name,username,password_hash,salt) VALUES (?,?,?,?,?)').bind(u.id,u.name,username,u.password_hash,u.salt).run();
      return session(db,u);
    }
    const u=await db.prepare('SELECT * FROM users WHERE username=?').bind(username).first();
    const candidate=await passwordHash(password,u?.salt||'missing-user-salt');
    if(!u?.password_hash || !constantEqual(candidate,u.password_hash)) fail('Benutzername oder Passwort stimmt nicht.',401);
    return session(db,u);
  }
  if(path==='/api/auth/logout'&&method==='POST') {
    const token=(req.headers.get('Cookie')||'').match(/eventi_session=([a-f0-9]{64})/)?.[1];
    if(token) await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hash(token)).run();
    return json({ok:true},200,{'Set-Cookie':'eventi_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'});
  }
  // Public invitation preview exposes event metadata only, never its community.
  const preview=path.match(/^\/api\/invite\/([A-Za-z0-9-]{1,60})$/);
  if(preview&&method==='GET') {
    const event=await db.prepare('SELECT id,code,title,description,location,starts_at,category,color FROM events WHERE code=?').bind(preview[1]).first();
    if(!event) fail('Dieser Einladungslink wurde nicht gefunden.',404); return json({event});
  }
  if(!user) fail('Bitte melde dich an oder starte den Schnelltest.',401);
  if(write) await rateLimit(db,`user:${user.id}`,30);
  if(path==='/api/profile'&&method==='PATCH') {
    await db.prepare('UPDATE users SET name=?,bio=? WHERE id=?').bind(text(body.name,50),text(body.bio||'',240,false),user.id).run();
    return json({user:safeUser(await db.prepare('SELECT * FROM users WHERE id=?').bind(user.id).first())});
  }
  if(path==='/api/events'&&method==='GET') {
    const {results}=await db.prepare('SELECT e.*,(SELECT COUNT(*) FROM members m WHERE m.event_id=e.id) member_count FROM events e JOIN members m ON m.event_id=e.id WHERE m.user_id=? ORDER BY e.starts_at').bind(user.id).all();return json({events:results});
  }
  if(path==='/api/events'&&method==='POST') {
    const count=await db.prepare('SELECT COUNT(*) AS n FROM events WHERE owner_id=?').bind(user.id).first();if(count.n>=20) fail('In der Testversion sind maximal 20 eigene Events möglich.',409);
    const e={id:crypto.randomUUID(),code:hex(crypto.getRandomValues(new Uint8Array(12))),title:text(body.title,100),description:text(body.description||'',2000,false),location:text(body.location,150),starts_at:date(body.starts_at),category:text(body.category||'Community',30),owner_id:user.id,color:'purple'};
    await db.batch([db.prepare('INSERT INTO events (id,code,owner_id,title,description,location,starts_at,category,color) VALUES (?,?,?,?,?,?,?,?,?)').bind(e.id,e.code,e.owner_id,e.title,e.description,e.location,e.starts_at,e.category,e.color),db.prepare('INSERT INTO members (event_id,user_id) VALUES (?,?)').bind(e.id,user.id)]);return json({event:e},201);
  }
  if(path==='/api/join'&&method==='POST') {
    const e=await db.prepare('SELECT id FROM events WHERE code=?').bind(text(body.code,60)).first();if(!e) fail('Einladung nicht gefunden.',404);
    await db.prepare('INSERT OR IGNORE INTO members (event_id,user_id) VALUES (?,?)').bind(e.id,user.id).run();return json({event_id:e.id});
  }
  if(path==='/api/network'&&method==='GET') {
    const {results}=await db.prepare('SELECT c.*,u.name,u.bio,u.id AS user_id FROM connections c JOIN users u ON u.id=CASE WHEN c.sender_id=? THEN c.recipient_id ELSE c.sender_id END WHERE c.sender_id=? OR c.recipient_id=? ORDER BY c.created_at DESC').bind(user.id,user.id,user.id).all();return json({connections:results});
  }
  if(path==='/api/network'&&method==='POST') {
    const recipient=text(body.user_id,60);if(recipient===user.id||recipient==='eventi-demo-team') fail('Dieses Profil kann keine Anfrage erhalten.');
    const common=await db.prepare('SELECT 1 FROM members a JOIN members b ON a.event_id=b.event_id WHERE a.user_id=? AND b.user_id=? LIMIT 1').bind(user.id,recipient).first();if(!common) fail('Verbindungen sind nur innerhalb eines gemeinsamen Events möglich.',403);
    const existing=await db.prepare('SELECT * FROM connections WHERE (sender_id=? AND recipient_id=?) OR (sender_id=? AND recipient_id=?)').bind(user.id,recipient,recipient,user.id).first();
    if(existing) {
      if(existing.recipient_id===user.id&&existing.status==='pending') await db.prepare("UPDATE connections SET status='accepted' WHERE sender_id=? AND recipient_id=?").bind(recipient,user.id).run();
      return json({ok:true});
    }
    await db.prepare("INSERT INTO connections (sender_id,recipient_id,status) VALUES (?,?,'pending')").bind(user.id,recipient).run();return json({ok:true},201);
  }
  const match=path.match(/^\/api\/events\/([a-zA-Z0-9-]+)(?:\/(posts|plans|images|leave|edit)(?:\/([a-zA-Z0-9-]+)(?:\/(like|join))?)?)?$/);
  if(!match) fail('Nicht gefunden.',404);
  const [,id,resource,item,action]=match;
  const event=await db.prepare('SELECT * FROM events WHERE id=?').bind(id).first();if(!event) fail('Event nicht gefunden.',404);
  const membership=await db.prepare('SELECT 1 FROM members WHERE event_id=? AND user_id=?').bind(id,user.id).first();if(!membership) fail('Bitte tritt diesem Event über den Einladungslink bei.',403);
  if(!resource&&method==='GET') {
    const [members,posts,plans]=await Promise.all([
      db.prepare('SELECT u.id,u.name,u.bio FROM users u JOIN members m ON u.id=m.user_id WHERE m.event_id=? ORDER BY m.joined_at').bind(id).all(),
      db.prepare('SELECT p.*,u.name,(SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id) likes,(SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id AND l.user_id=?) liked FROM posts p JOIN users u ON u.id=p.user_id WHERE p.event_id=? ORDER BY p.created_at DESC,p.rowid DESC LIMIT 100').bind(user.id,id).all(),
      db.prepare('SELECT p.*,u.name,(SELECT COUNT(*) FROM plan_members m WHERE m.plan_id=p.id) joined_count,(SELECT COUNT(*) FROM plan_members m WHERE m.plan_id=p.id AND m.user_id=?) joined FROM plans p JOIN users u ON u.id=p.user_id WHERE p.event_id=? ORDER BY p.starts_at').bind(user.id,id).all()
    ]);return json({event,members:members.results.map(publicUser),posts:posts.results,plans:plans.results});
  }
  if(resource==='edit'&&method==='PATCH') {
    if(event.owner_id!==user.id) fail('Nur der Veranstalter darf das Event bearbeiten.',403);
    await db.prepare('UPDATE events SET title=?,description=?,location=?,starts_at=?,category=? WHERE id=?').bind(text(body.title,100),text(body.description||'',2000,false),text(body.location,150),date(body.starts_at),text(body.category||'Community',30),id).run();return json({ok:true});
  }
  if(resource==='leave'&&method==='POST') {
    if(event.owner_id===user.id) fail('Als Veranstalter bleibst du Mitglied deines Events.');
    await db.batch([db.prepare('DELETE FROM plan_members WHERE user_id=? AND plan_id IN (SELECT id FROM plans WHERE event_id=?)').bind(user.id,id),db.prepare('DELETE FROM members WHERE event_id=? AND user_id=?').bind(id,user.id)]);return json({ok:true});
  }
  if(resource==='images'&&item&&method==='GET') {
    const image=await db.prepare('SELECT data FROM images WHERE id=? AND event_id=?').bind(item,id).first();if(!image) fail('Foto nicht gefunden.',404);
    const bytes=Uint8Array.from(atob(image.data.split(',')[1]),c=>c.charCodeAt(0));return new Response(bytes,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(resource==='posts'&&!item&&method==='POST') {
    const count=await db.prepare('SELECT COUNT(*) AS n FROM posts WHERE user_id=?').bind(user.id).first();if(count.n>=300) fail('Testlimit von 300 Beiträgen erreicht.',409);
    const content=text(body.body||'',2000,false);if(!content&&!body.image) fail('Schreib etwas oder wähle ein Foto.');
    let imageId=null, statements=[];
    if(body.image) {
      const data=text(body.image,250000);if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(data)) fail('Bitte wähle ein gültiges Foto.');
      const bytes=atob(data.split(',')[1]);if(bytes.length<4||bytes.charCodeAt(0)!==255||bytes.charCodeAt(1)!==216||bytes.charCodeAt(2)!==255) fail('Ungültiges JPEG.');
      imageId=crypto.randomUUID();statements.push(db.prepare('INSERT INTO images (id,event_id,user_id,data) VALUES (?,?,?,?)').bind(imageId,id,user.id,data));
    }
    const postId=crypto.randomUUID();statements.push(db.prepare('INSERT INTO posts (id,event_id,user_id,body,image_id) VALUES (?,?,?,?,?)').bind(postId,id,user.id,content,imageId));await db.batch(statements);return json({id:postId},201);
  }
  if(resource==='posts'&&item&&action==='like'&&method==='POST') {
    if(!await db.prepare('SELECT id FROM posts WHERE id=? AND event_id=?').bind(item,id).first()) fail('Beitrag nicht gefunden.',404);
    if(await db.prepare('SELECT 1 FROM likes WHERE post_id=? AND user_id=?').bind(item,user.id).first()) await db.prepare('DELETE FROM likes WHERE post_id=? AND user_id=?').bind(item,user.id).run();
    else await db.prepare('INSERT INTO likes (post_id,user_id) VALUES (?,?)').bind(item,user.id).run();return json({ok:true});
  }
  if(resource==='posts'&&item&&!action&&method==='DELETE') {
    const post=await db.prepare('SELECT * FROM posts WHERE id=? AND event_id=?').bind(item,id).first();if(!post) fail('Beitrag nicht gefunden.',404);
    if(post.user_id!==user.id) fail('Du kannst nur eigene Beiträge löschen.',403);
    await db.batch([db.prepare('DELETE FROM posts WHERE id=?').bind(item),...(post.image_id?[db.prepare('DELETE FROM images WHERE id=?').bind(post.image_id)]:[])]);return json({ok:true});
  }
  if(resource==='plans'&&!item&&method==='POST') {
    if(!['meetup','ride'].includes(body.kind)) fail('Ungültiger Typ.');
    const seats=body.kind==='ride'?Number(body.seats):0;if(!Number.isInteger(seats)||seats<0||seats>8||(body.kind==='ride'&&seats<1)) fail('Bitte gib 1 bis 8 freie Plätze an.');
    const planId=crypto.randomUUID();await db.prepare('INSERT INTO plans (id,event_id,user_id,kind,title,place,starts_at,details,seats) VALUES (?,?,?,?,?,?,?,?,?)').bind(planId,id,user.id,body.kind,text(body.title,100),text(body.place,150),date(body.starts_at),text(body.details||'',500,false),seats).run();return json({id:planId},201);
  }
  if(resource==='plans'&&item&&action==='join'&&method==='POST') {
    const p=await db.prepare('SELECT * FROM plans WHERE id=? AND event_id=?').bind(item,id).first();if(!p) fail('Angebot nicht gefunden.',404);
    if(p.user_id===user.id) fail('Du organisierst dieses Angebot bereits.');
    if(await db.prepare('SELECT 1 FROM plan_members WHERE plan_id=? AND user_id=?').bind(item,user.id).first()) await db.prepare('DELETE FROM plan_members WHERE plan_id=? AND user_id=?').bind(item,user.id).run();
    else {
      const r=await db.prepare("INSERT OR IGNORE INTO plan_members (plan_id,user_id) SELECT ?,? WHERE ?='meetup' OR (SELECT COUNT(*) FROM plan_members WHERE plan_id=?)<?").bind(item,user.id,p.kind,item,p.seats).run();if(!r.meta.changes) fail('Es sind keine Plätze mehr frei.',409);
    }return json({ok:true});
  }
  if(resource==='plans'&&item&&!action&&method==='DELETE') {
    const p=await db.prepare('SELECT user_id FROM plans WHERE id=? AND event_id=?').bind(item,id).first();if(!p) fail('Angebot nicht gefunden.',404);if(p.user_id!==user.id) fail('Du kannst nur eigene Angebote löschen.',403);
    await db.batch([db.prepare('DELETE FROM plan_members WHERE plan_id=?').bind(item),db.prepare('DELETE FROM plans WHERE id=?').bind(item)]);return json({ok:true});
  }
  fail('Nicht gefunden.',404);
}
export default {
  async fetch(req,env,ctx) {
    const url=new URL(req.url);
    try {
      let response;
      if(url.pathname.startsWith('/api/')) response=await api(req,env,url);
      else if(url.pathname==='/app.js') response=new Response(CLIENT,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-cache'}});
      else if(url.pathname==='/style.css') response=new Response(CSS,{headers:{'Content-Type':'text/css; charset=utf-8','Cache-Control':'no-cache'}});
      else if(url.pathname==='/manifest.webmanifest') response=json({name:'Eventi',short_name:'Eventi',start_url:'/',display:'standalone',background_color:'#0b0d16',theme_color:'#0b0d16',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]},200,{'Content-Type':'application/manifest+json'});
      else if(url.pathname==='/icon.svg') response=new Response('<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect width="192" height="192" rx="44" fill="#8b5cf6"/><text x="96" y="134" text-anchor="middle" font-size="140" font-family="Arial" font-weight="bold" fill="white">e</text><circle cx="149" cy="43" r="14" fill="#cbff7b"/></svg>',{headers:{'Content-Type':'image/svg+xml'}});
      else if(url.pathname==='/robots.txt') response=new Response('User-agent: *\nDisallow: /\n');
      else if(url.pathname==='/'||/^\/invite\/[A-Za-z0-9-]+$/.test(url.pathname)) response=new Response(HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
      else response=new Response('Nicht gefunden',{status:404});
      const headers=new Headers(response.headers);
      headers.set('X-Content-Type-Options','nosniff'); headers.set('Referrer-Policy','same-origin');
      headers.set('X-Frame-Options','DENY');headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
      headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
      return new Response(response.body,{status:response.status,headers});
    } catch(e) {if(!e.status) console.error('Eventi request failed',url.pathname,e.message);return json({error:e.status?e.message:'Das hat leider nicht geklappt. Bitte versuche es erneut.'},e.status||500);}
  },
  async scheduled(event,env,ctx) {ctx.waitUntil(env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(Date.now()),env.DB.prepare('DELETE FROM rate_limits WHERE expires_at<?').bind(Date.now())]));}
};
