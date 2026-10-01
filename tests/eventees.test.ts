import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_VISIBILITY, fanMatches, filterEvents, validateTicketFile, visibleFan } from '../lib/eventees/domain';
import { DEMO_EVENTS, DEMO_FANS, DEMO_VIEWER } from '../lib/eventees/fixtures';
test('default visibility is private', () => assert.ok(Object.values(DEFAULT_VISIBILITY).every(v => !v)));
test('hidden city and area cannot match through filters', () => {
 const fan = { ...DEMO_FANS[0], visibility: { ...DEMO_FANS[0].visibility, area:false, city:false, interests:false } };
 for (const filter of ['city','area','interests'] as const) assert.equal(fanMatches(fan, DEMO_VIEWER,filter), false);
 const projection = visibleFan(fan)!;
 for (const field of ['city','area','row','seat','interests']) assert.equal(field in projection,false);
});
test('seat consent requires area consent too', () => {
 const fan={...DEMO_FANS[0],visibility:{...DEMO_FANS[0].visibility,seat:true,area:false}};
 assert.equal('seat' in visibleFan(fan)!,false);
 fan.visibility.area=true;assert.equal(visibleFan(fan)!.seat,'16');
});
test('invisible profiles and self are excluded',()=>{
 assert.equal(visibleFan(DEMO_VIEWER),null);
 assert.equal(fanMatches({...DEMO_VIEWER,visibility:{...DEMO_FANS[0].visibility}},DEMO_VIEWER,'all'),false);
});
test('matching normalizes whitespace and case',()=>assert.equal(fanMatches(DEMO_FANS[0],{...DEMO_VIEWER,city:' HALLE '},'city'),true));
test('event search intersects category city and query',()=>{
 assert.deepEqual(filterEvents(DEMO_EVENTS,' LEIPZIG ','Sport','Leipzig').map(e=>e.id),['stadion']);
 assert.equal(filterEvents(DEMO_EVENTS,'','Musik','Berlin').length,0);
});
test('ticket metadata rejects oversized, empty or unsupported files',()=>{
 assert.ok(validateTicketFile({type:'text/html',size:12}));assert.ok(validateTicketFile({type:'image/png',size:0}));assert.ok(validateTicketFile({type:'application/pdf',size:10485761}));assert.equal(validateTicketFile({type:'application/pdf',size:10485760}),null);
});
