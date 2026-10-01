import { test, expect } from '@playwright/test';
test('search, save and reopen an event',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:/Du gehst hin/})).toBeVisible();
 await page.getByRole('button',{name:'Sport',exact:true}).click();await expect(page.locator('.ev-event-card')).toHaveCount(1);
 await page.getByRole('button',{name:'90 Minuten. Ein Wir. merken'}).click();
 await page.getByRole('link',{name:'Meine Events',exact:true}).filter({visible:true}).click();
 await expect(page.getByRole('heading',{name:'90 Minuten. Ein Wir.'})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'90 Minuten. Ein Wir.'})).toBeVisible();
});
test('private attributes do not leak through matching filters',async({page})=>{
 await page.goto('/community');await page.getByRole('button',{name:'Mein Bereich',exact:true}).click();
 await expect(page.locator('.ev-fan-card')).toHaveCount(2);await expect(page.locator('.ev-fan-card').filter({hasText:'Marie'})).toHaveCount(0);
 await page.getByRole('button',{name:'Meine Region',exact:true}).click();await expect(page.locator('.ev-fan-card')).toHaveCount(2);await expect(page.locator('.ev-fan-card').filter({hasText:'Sam'})).toHaveCount(0);
});
test('ticket selection never grants verified access',async({page})=>{
 await page.goto('/events/sommernacht/ticket');await page.locator('input[type=file]').last().setInputFiles({name:'sample.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 demo')});
 await page.getByRole('button',{name:'Prüfablauf ansehen'}).click();await expect(page.getByRole('status')).toContainText('noch nicht verifiziert');
 await page.locator('input[type=file]').last().setInputFiles({name:'wrong.txt',mimeType:'text/plain',buffer:Buffer.from('demo')});await expect(page.locator('p[role=alert]')).toContainText('JPG, PNG');
});
test('local chat and meetup creation work',async({page})=>{
 await page.goto('/events/sommernacht');await page.getByRole('button',{name:'Chat',exact:true}).click();await page.getByRole('textbox',{name:'Chatnachricht'}).fill('Vorfreude aus Halle!');await page.getByRole('button',{name:'Nachricht in Vorschau hinzufügen'}).click();await expect(page.getByText('Vorfreude aus Halle!',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Meetups',exact:true}).click();await page.getByRole('button',{name:'Meetup erstellen',exact:true}).click();await page.getByLabel('Titel',{exact:true}).fill('Unsere Runde');await page.getByLabel('Treffpunkt',{exact:true}).fill('Eingang West');await page.getByLabel('Uhrzeit',{exact:true}).fill('18:00');await page.getByRole('button',{name:'In der Vorschau erstellen',exact:true}).click();await expect(page.getByRole('heading',{name:'Unsere Runde'})).toBeVisible();
});
test('navigation has no horizontal overflow or page errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/events/sommernacht','/events/sommernacht/ticket','/community','/profile']){await page.goto(path);await expect(page.locator('h1,h2').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 expect(errors).toEqual([]);
});
