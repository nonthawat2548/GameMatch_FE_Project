// Browser QA only; Playwright is installed outside the application dependency tree.
// Local mode uses disposable PostgreSQL and a real Go server. Production mode is read-only.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.GM_PLAYWRIGHT_MODULE);
const production = process.env.GM_QA_MODE === 'production';
const origin = production ? 'https://gamematch-projectweb-befe.vercel.app' : 'http://localhost:4173';
const api = production ? 'https://gamematch-api-hzv6.onrender.com' : 'http://localhost:8080';
const root = path.resolve(__dirname, '../../build');
const server = http.createServer((req, res) => {
  let file = path.resolve(root, '.' + new URL(req.url, origin).pathname);
  if (!file.startsWith(root + path.sep) && file !== root) return res.writeHead(403).end();
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) file = path.join(root, 'index.html');
  const types = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml' };
  res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
async function call(method, endpoint, body, token, expected=200) {
  const response = await fetch(api + endpoint, {
    method, headers: { ...(body ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:'Bearer '+token} : {}) },
    ...(body ? {body:JSON.stringify(body)} : {}), signal:AbortSignal.timeout(60000)
  });
  assert.equal(response.status, expected, method+' '+endpoint);
  return response.json();
}
const token = (page) => page.evaluate(() => localStorage.getItem('gamematch_token'));
const pass = (message) => console.log('PASS '+message);
async function login(page, email, password) {
  await page.goto(origin+'/login');
  await page.getByLabel('อีเมลหรือชื่อผู้ใช้').fill(email);
  await page.getByLabel('รหัสผ่าน', {exact:true}).fill(password);
  await page.getByRole('button', {name:'เข้าสู่ระบบ',exact:true}).click();
  await page.getByRole('button', {name:'ออกจากระบบ'}).waitFor();
}
async function layout(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+2), 'horizontal overflow '+page.url());
}
async function quiz(page) {
  await page.goto(origin+'/match');
  await page.getByRole('button',{name:'ถัดไป'}).click();
  await page.getByRole('button',{name:'ถัดไป'}).click();
  await page.getByRole('button',{name:'แนะนำเกมให้ฉัน'}).click();
  await page.getByRole('heading',{name:'เกมที่น่าจะถูกใจคุณ'}).waitFor();
  assert((await page.locator('.game-card').count()) > 0);
}
(async()=>{
  let browser;
  try {
    if(!production) await new Promise(resolve=>server.listen(4173,resolve));
    assert.equal((await call('GET','/healthz')).status,'ok');
    const games = await call('GET','/api/games');
    assert(games.length >= 2);
    const game=games.find(g=>g.genres.includes('rpg')) || games[0];
    const other=games.find(g=>g.id!==game.id);
    await call('GET','/api/admin/stats',undefined,undefined,401);
    assert(Array.isArray(await call('GET','/api/games/'+game.id+'/reviews')));
    assert(Array.isArray(await call('GET','/api/games/'+game.id+'/similar')));
    browser=await chromium.launch({headless:true});
    const errors=[];
    for(const width of [1366,390,320]){
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      const page=await context.newPage();page.setDefaultTimeout(30000);
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(origin);await page.locator('.game-card').first().waitFor();
      const search=page.getByRole('searchbox');
      await page.evaluate(() => document.fonts.ready);
      await search.focus();
      const before=await page.locator('.cinematic-hero').boundingBox();
      await search.fill(game.title);await page.locator('#home-search-results').waitFor();
      assert.equal(await page.locator('#home-search-results').evaluate(el=>getComputedStyle(el).position),'absolute');
      const after=await page.locator('.cinematic-hero').boundingBox();
      assert(Math.abs(after.height-before.height)<=2, 'search dropdown must not resize hero: '+before.height+' → '+after.height);
      await search.press('Escape');await layout(page);
      await page.getByRole('button',{name:'สลับเป็นธีมสว่าง'}).click();await page.reload();
      await page.locator('.game-card').first().waitFor();
      assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await layout(page);
      await page.goto(origin+'/discover');await page.locator('.game-card').first().waitFor();
      await page.getByRole('searchbox').fill(game.title);
      await page.getByRole('link',{name:game.title,exact:true}).waitFor();await layout(page);
      await quiz(page);await layout(page);
      await page.goto(origin+'/compare?game='+game.id);
      await page.getByLabel('เกมที่ 2').selectOption(String(other.id));await page.getByRole('table').waitFor();await layout(page);
      await page.goto(origin+'/games/'+game.id);await page.getByRole('heading',{name:game.title,exact:true}).waitFor();await layout(page);
      pass('Guest search / themes / catalog / quiz / comparison / detail at '+width+'px');
      await context.close();
    }
    if(production){
      // Do not let the earlier reduced-motion layout checks hide video errors.
      const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'no-preference'});
      const page=await ctx.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      // The CI workflow may start before Vercel finishes the new deployment.
      for(let i=0;i<10;i++){
        await page.goto(origin);
        await page.locator('.game-card').first().waitFor();
        if(await page.locator('.hero-media-toggle').count()) break;
        await page.waitForTimeout(5000);
      }
      await page.locator('.hero-media-toggle').waitFor();
      const dots=page.locator('.hero-dot');
      const count=await dots.count();
      let played=0, fallback=0;
      for(let i=0;i<count;i++){
        await dots.nth(i).click();
        const video=page.locator('.cinematic-video');
        if(!await video.count()){fallback++;continue;}
        const initialSrc=await video.getAttribute('src');
        try{
          await page.waitForFunction((src)=>{
            const v=document.querySelector('.cinematic-video');
            return v && v.currentSrc.split('.').slice(0,-1).join('.')===src.split('.').slice(0,-1).join('.') &&
              v.videoWidth>0 && v.currentTime>0 && v.classList.contains('is-playing');
          },initialSrc,{timeout:6500});
          const info=await video.evaluate(v=>({width:v.videoWidth,height:v.videoHeight,muted:v.muted,paused:v.paused}));
          assert(info.muted&&!info.paused);
          console.log('VIDEO '+initialSrc+' '+info.width+'x'+info.height);
          played++;
        }catch(e){
          // A missing external clip must never remove the existing game artwork.
          assert(await page.locator('.cinematic-art').count());
          console.log('FALLBACK '+initialSrc+' '+e.message.split('\n')[0]);
          fallback++;
        }
      }
      assert(played>0,'at least one official preview must play');
      console.log('PREVIEWS '+played+'/'+count+' playing, '+fallback+' still fallbacks');
      // Regression: actual playback plus repeated loop/buffering events must advance.
      await dots.first().click();
      const firstLink = await page.locator('.hero-feature').getAttribute('href');
      await page.waitForFunction(() => {
        const v=document.querySelector('.cinematic-video');
        return v && v.currentTime>0 && v.classList.contains('is-playing');
      },undefined,{timeout:7500});
      await page.evaluate(() => {
        const v=document.querySelector('.cinematic-video');
        let n=0;
        const timer=setInterval(()=>{
          if(!v.isConnected || ++n>20){clearInterval(timer);return;}
          v.dispatchEvent(new Event('waiting'));
          v.dispatchEvent(new Event('stalled'));
          v.dispatchEvent(new Event('playing'));
        },500);
      });
      await page.waitForFunction(href => document.querySelector('.hero-feature')?.getAttribute('href') !== href,firstLink,{timeout:13500});
      pass('video auto-advance despite repeated loop/buffering events');
      await dots.first().click();
      await page.getByRole('button',{name:'ใช้ภาพนิ่ง'}).click();
      assert.equal(await page.locator('video').count(),0);
      await page.getByRole('button',{name:'ใช้คลิปตัวอย่าง'}).click();
      await page.locator('video').waitFor({state:'attached'});
      await page.getByRole('button',{name:'หยุดสไลด์อัตโนมัติ'}).click();
      assert(await page.locator('video').evaluate(v=>v.paused));
      await layout(page);
      pass('Steam motion previews / still toggle / pause');
      const steamGames=games.filter(g=>g.steamId);
      const checks=[steamGames.find(g=>g.steamId===4262460),steamGames[10],steamGames[40],steamGames[80],steamGames.find(g=>g.steamId===70)].filter(Boolean);
      let detailPlayed=0;
      for(const g of checks){
        const trailers=await call('GET','/api/games/'+g.id+'/trailers');
        assert(Array.isArray(trailers));
        await page.goto(origin+'/games/'+g.id);
        await page.getByRole('heading',{name:g.title,exact:true}).waitFor();
        await page.getByRole('link',{name:/ดู Trailer เต็มบน Steam/}).waitFor();
        if(trailers.length){
          try{
            await page.waitForFunction(()=>{const v=document.querySelector('.detail-trailer-video');return v&&v.videoWidth>0;},undefined,{timeout:15000});
            detailPlayed++;
            console.log('DETAIL VIDEO '+g.title);
          }catch(e){console.log('DETAIL FALLBACK '+g.title+' '+e.message.split('\n')[0]);}
        } else {
          await page.getByText('ยังไม่มีคลิปที่เล่นบนเว็บได้', {exact:true}).waitFor();
          assert.equal(await page.locator('.detail-trailer-video').count(), 0);
          assert(await page.locator('.game-trailer-stage img, .game-trailer-stage .detail-placeholder').count());
          console.log('DETAIL NO TRAILER '+g.title+' (cover fallback verified)');
        }
        await layout(page);
      }
      assert(detailPlayed>0,'at least one detail trailer must load');
      console.log('DETAIL TRAILERS '+detailPlayed+'/'+checks.length+' sampled playable');

      await ctx.close();
    }
    if(!production){
      const ctx=await browser.newContext({viewport:{width:1366,height:900}});const page=await ctx.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(origin+'/register');
      await page.getByLabel('ชื่อที่แสดง').fill('QA Member');
      await page.getByLabel('อีเมล',{exact:true}).fill('member@example.test');
      await page.getByLabel('รหัสผ่าน',{exact:true}).fill('Password123!');
      await page.getByRole('button',{name:'สมัครและเข้าสู่ระบบ'}).click();
      await page.getByRole('button',{name:'ออกจากระบบ'}).waitFor();
      let memberToken=await token(page);
      const member=await call('GET','/api/me',undefined,memberToken);
      assert.equal(member.role,'member');
      const claims=JSON.parse(Buffer.from(memberToken.split('.')[1],'base64url').toString());
      assert.equal(claims.exp-claims.iat,3600);
      await call('GET','/api/admin/stats',undefined,memberToken,403);
      await page.goto(origin+'/games/'+game.id);
      await page.getByRole('button',{name:'เพิ่มในเกมโปรด'}).click();
      await page.getByText('เพิ่มในเกมโปรดแล้ว').waitFor();
      await page.getByRole('button',{name:'เขียนรีวิว',exact:true}).click();
      await page.getByRole('button',{name:'ให้คะแนน 5 ดาว'}).click();
      await page.getByLabel('ความคิดเห็น').fill('This is a test review from the browser.');
      await page.getByRole('button',{name:'ส่งรีวิว'}).click();
      await page.getByText('โพสต์รีวิวแล้ว').waitFor();
      await page.getByRole('button',{name:'แก้ไขรีวิว'}).click();
      await page.getByLabel('ความคิดเห็น').fill('Edited review from the real browser.');
      await page.getByRole('button',{name:'บันทึกการแก้ไข'}).click();
      await page.getByText('บันทึกการแก้ไขแล้ว').waitFor();
      await page.goto(origin+'/me/favorites');
      await page.getByRole('link',{name:game.title,exact:true}).waitFor();
      await page.reload();await page.getByRole('link',{name:game.title,exact:true}).waitFor();
      await page.goto(origin+'/me/profile');
      await page.getByLabel('ชื่อที่แสดง').fill('QA Updated');
      await page.getByRole('button',{name:'บันทึกโปรไฟล์'}).click();await page.getByText('บันทึกชื่อแล้ว').waitFor();
      await page.getByLabel('รหัสผ่านปัจจุบัน').fill('Password123!');
      await page.getByLabel('รหัสผ่านใหม่').fill('Password456!');
      await page.getByRole('button',{name:'เปลี่ยนและเข้าสู่ระบบใหม่'}).click();
      await page.getByRole('heading',{name:'เข้าสู่ระบบ'}).waitFor();
      await call('GET','/api/me',undefined,memberToken,401);
      await login(page,'member@example.test','Password456!');
      memberToken=await token(page);
      await page.getByRole('button',{name:'ออกจากระบบ'}).click();
      await page.getByRole('heading',{name:'เข้าสู่ระบบ'}).waitFor();
      await call('GET','/api/me',undefined,memberToken,401);
      pass('Member registration / JWT 1 hour / ownership / favorite / review / profile / password / logout');
      await login(page,'admin@example.test','Password123!');
      const adminToken=await token(page);
      await page.goto(origin+'/admin/dashboard');await page.getByText('รีวิวทั้งหมด',{exact:true}).waitFor();
      await page.goto(origin+'/admin/members');
      await page.getByRole('button',{name:'เลื่อนเป็น Admin: QA Updated'}).click();
      await page.getByRole('button',{name:'ยืนยันเปลี่ยนบทบาท'}).click();
      await page.getByRole('button',{name:'ลดเป็น Member: QA Updated'}).waitFor();
      const newLogin=await call('POST','/api/auth/login',{email:'member@example.test',password:'Password456!'});
      assert.equal(newLogin.user.role,'admin');
      await page.getByRole('button',{name:'ลดเป็น Member: QA Updated'}).click();
      await page.getByRole('button',{name:'ยืนยันเปลี่ยนบทบาท'}).click();
      await page.getByRole('button',{name:'เลื่อนเป็น Admin: QA Updated'}).waitFor();
      await call('GET','/api/admin/stats',undefined,newLogin.token,401);
      await page.goto(origin+'/admin');
      await page.getByLabel('ชื่อเกม',{exact:true}).fill('QA browser game');
      await page.getByLabel('Genres เช่น rpg, action').fill('rpg,action');
      await page.getByLabel('คำอธิบายภาษาไทย').fill('ทดสอบการเพิ่มเกม');
      await page.getByLabel('คำอธิบายต้นฉบับ').fill('Test game');
      await page.getByRole('button',{name:'บันทึกเกม'}).click();
      await page.getByText('บันทึกข้อมูลแล้ว').waitFor();
      const row=page.getByRole('row').filter({hasText:'QA browser game'});
      await row.waitFor();
      await row.getByRole('button',{name:'แก้ไข'}).click();
      await page.getByLabel('คำอธิบายภาษาไทย').fill('แก้ไขเฉพาะภาษาไทย');
      assert.equal(await page.getByLabel('คำอธิบายต้นฉบับ').inputValue(),'Test game');
      await page.getByRole('button',{name:'บันทึกเกม'}).click();
      await page.getByText('บันทึกข้อมูลแล้ว').waitFor();
      const saved=(await call('GET','/api/admin/games',undefined,adminToken)).find(g=>g.title==='QA browser game');
      assert.equal(saved.description,'Test game');assert.equal(saved.descriptionTh,'แก้ไขเฉพาะภาษาไทย');assert.deepEqual(saved.genres,['rpg','action']);
      page.once('dialog',d=>d.accept());await row.getByRole('button',{name:'ลบ',exact:true}).click();
      await page.getByText('ลบเกมแล้ว').waitFor();
      await call('GET','/api/games/'+saved.id,undefined,undefined,404);
      pass('Admin dashboard / role promotion and demotion / session revocation / game create edit delete');
      await ctx.close();
    }
    assert.deepEqual(errors,[]);
    pass(production?'Production public read-only smoke':'Real isolated React → Go → PostgreSQL browser integration');
  }finally{if(browser)await browser.close();if(!production)server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
