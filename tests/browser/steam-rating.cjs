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
  let api=await request(origin+'/api/games/'+g.id+'/steam-rating');
  if(api.status!==200){await new Promise(resolve=>setTimeout(resolve,5000));api=await request(origin+'/api/games/'+g.id+'/steam-rating');}
  console.log('RATING API',g.title,g.id,g.steamId,api.status,JSON.stringify(api.data));
  const input={appid:g.steamId,filter:1,languages:['all'],review_type:0,purchase_type:0,num_per_page:1,filter_offtopic_activity:true,display_language:'english'};
  const steam=await request('https://api.steampowered.com/IUserReviewsService/GetAppReviews/v1/?input_json='+encodeURIComponent(JSON.stringify(input)));
  console.log('STEAM SUMMARY',g.title,steam.status,JSON.stringify(typeof steam.data==='object'?{summary:steam.data.response?.query_summary,other:steam.data.response?.query_summary?undefined:steam.data}:steam.data));
  if(api.status===200&&api.data&&typeof api.data.total==='number')passed++;
 }
 assert.equal(passed,sample.length);
})().catch(e=>{console.error(e);process.exitCode=1});
