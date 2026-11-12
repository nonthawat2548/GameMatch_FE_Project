const assert=require('node:assert/strict');
const origin='https://gamematch-api-hzv6.onrender.com';
async function request(url){
  const r=await fetch(url,{signal:AbortSignal.timeout(30000)});
  const raw=await r.text();
  let data;try{data=JSON.parse(raw)}catch{data=raw.slice(0,160)}
  return {status:r.status,data};
}
(async()=>{
 const catalog=await request(origin+'/api/games');
 assert.equal(catalog.status,200);
 const games=catalog.data.filter(g=>g.steamId);
 const sample=[games.find(g=>g.steamId===730),games.find(g=>g.steamId===4262460),games[20],games[80]].filter(Boolean);
 let passed=0;
 for(const g of sample){
  const api=await request(origin+'/api/games/'+g.id+'/steam-rating');
  console.log('RATING API',g.title,g.id,g.steamId,api.status,JSON.stringify(api.data));
  const steam=await request('https://store.steampowered.com/appreviews/'+g.steamId+'?json=1&filter=all&language=all&review_type=all&purchase_type=steam&num_per_page=1&cursor=%2A');
  console.log('STEAM SUMMARY',g.title,steam.status,JSON.stringify(typeof steam.data==='object'?{success:steam.data.success,summary:steam.data.query_summary}:steam.data));
  if(api.status===200&&api.data&&typeof api.data.total==='number')passed++;
 }
 assert.equal(passed,sample.length);
})().catch(e=>{console.error(e);process.exitCode=1});
