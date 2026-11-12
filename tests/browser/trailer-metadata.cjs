// Read-only focused production trailer check. No writes to the catalog.
const assert=require('node:assert/strict');
const api='https://gamematch-api-hzv6.onrender.com';
const origin='https://gamematch-projectweb-befe.vercel.app';
async function get(path){
  const response=await fetch(api+path,{signal:AbortSignal.timeout(30000)});
  const data=await response.json();
  return {status:response.status,data};
}
(async()=>{
  const catalog=await get('/api/games');
  assert.equal(catalog.status,200);
  const games=catalog.data.filter(g=>g.steamId);
  const ids=[games.find(g=>g.steamId===4262460),games[10],games[40],games[80],games.find(g=>g.steamId===70)].filter(Boolean);
  const candidates=[];
  for(const g of ids){
    const detail=await get('/api/games/'+g.id);
    const trailers=await get('/api/games/'+g.id+'/trailers');
    console.log('DETAIL METADATA',g.title,'detail',detail.status,'trailers',trailers.status,Array.isArray(trailers.data)?trailers.data.length:JSON.stringify(trailers.data));
    assert.equal(detail.status,200);
    assert.equal(trailers.status,200,'trailer metadata '+g.title);
    assert(Array.isArray(trailers.data));
    if(trailers.data.length) candidates.push(g);
    else console.log('DETAIL NO TRAILER',g.title,'confirmed empty metadata');
  }
  assert(candidates.some(g=>g.steamId!==4262460),'non-featured game must return native video metadata');
  if(!process.env.GM_PLAYWRIGHT_MODULE)return;
  const {chromium}=require(process.env.GM_PLAYWRIGHT_MODULE);
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'no-preference'});
    page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
    let played=0;
    for(const g of candidates){
      await page.goto(origin+'/games/'+g.id);
      try{
        await page.getByRole('heading',{name:g.title,exact:true}).waitFor({timeout:15000});
        await page.waitForFunction(()=>{const v=document.querySelector('.detail-trailer-video');return v&&v.videoWidth>0&&v.currentTime>0;},undefined,{timeout:15000});
        console.log('DETAIL VIDEO',g.title,await page.locator('.detail-trailer-video').evaluate(v=>v.videoWidth+'x'+v.videoHeight));
        played++;
      }catch(e){console.log('DETAIL FAILURE',g.title,e.message.split('\n')[0],(await page.locator('body').innerText()).slice(0,500));}
    }
    assert(played>0,'at least one video must actually play');
    console.log('DETAIL TRAILERS',played+'/'+ids.length,'sampled playable');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
