import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gameDate } from '../utils/gameSource';
import { genreLabel } from '../utils/gameLabels';
import { gameUrl } from '../utils/gameUrl';

export function GameHero({game,metadata}) {
  return <header className="game-backdrop">
    {(metadata?.backdrop || game.imageUrl) && <img alt="" src={metadata?.backdrop || game.imageUrl} onError={e=>{if(e.currentTarget.getAttribute("src")!==game.imageUrl&&game.imageUrl)e.currentTarget.src=game.imageUrl;else e.currentTarget.style.display="none";}}/>}
    <div className="game-backdrop-copy"><Link to="/discover">เกมทั้งหมด</Link><span aria-hidden="true"> / </span><span>{game.title}</span><h1>{game.title}</h1></div>
  </header>;
}
export function GameDetailSkeleton() {
  return <div className="detail-skeleton" role="status" aria-label="กำลังโหลดรายละเอียดเกม"><span className="sr-only">กำลังโหลด…</span><div className="skeleton-block skeleton-banner"/><div className="detail-layout"><div><div className="skeleton-block skeleton-video"/><div className="skeleton-thumbs">{[1,2,3,4].map(n=><div key={n} className="skeleton-block"/>)}</div></div><div className="skeleton-info">{[1,2,3,4,5].map(n=><div key={n} className="skeleton-block"/>)}</div></div></div>;
}
export function GameSeo({game}) {
  useEffect(()=>{
    const old=document.title;
    document.title=game.title+' | GameMatch';
    const nodes=[];
    for(const [name,content] of [['og:title',document.title],['og:image',game.imageUrl],['og:description',(game.descriptionTh||game.description||'').slice(0,160)],['og:url',window.location.origin+gameUrl(game)]]){
      if(!content)continue;
      const m=document.createElement('meta');m.setAttribute('property',name);m.content=content;document.head.appendChild(m);nodes.push(m);
    }
    const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=window.location.origin+gameUrl(game);document.head.appendChild(canonical);
    return ()=>{document.title=old;nodes.forEach(n=>n.remove());canonical.remove();};
  },[game]);
  return null;
}
function PlatformIcon({name}) {
  const n=name.toLowerCase();
  return <span className="platform-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">{n.includes('win')||n==='pc'?<path d="M2 4l9-1v8H2zm11-1 9-1v9h-9zM2 13h9v8l-9-1zm11 0h9v9l-9-1z"/>:n.includes('linux')?<path d="M12 2c-3 0-4 3-4 6l-3 7 1 5 5 2 2-2 5 1 2-4-4-9c0-4-1-6-4-6zm0 7 2 3-2 2-2-2z"/>:n.includes('mac')?<path d="M15 2c0 3-2 4-4 4 0-2 2-4 4-4zm4 8c-4-3-5-1-7-1s-4-2-7 0c-4 4 0 13 4 13 2 0 2-1 3-1s2 1 4 1c3 0 5-5 5-6-3-1-4-4-2-6z"/>:<path d="M3 4h18v13H3zm7 15h4v2h-4z"/>}</svg>{name}</span>;
}
export function GameInfo({game,metadata,error,onRetry}) {
 const free=metadata?.isFree===true || (metadata?.isFree==null&&(game.genres||[]).includes('free-to-play'));
 const price=metadata?.price;
 const released=metadata?.releaseDate||game.releaseDate;
 const format=n=>new Intl.NumberFormat('th-TH',{style:'currency',currency:'THB'}).format(n/100);
 return <section className="game-info-panel">
  {(metadata?.headerImage||game.imageUrl)&&<img className="game-info-cover" src={metadata?.headerImage||game.imageUrl} alt=""/>}
  <div className="game-price">{free?<strong className="free-price">เล่นฟรี <small>Free to Play</small></strong>:price?.currency==='THB'?<><strong>{format(price.final)}</strong>{price.discount>0&&<><del>{format(price.initial)}</del><span className="discount">−{price.discount}%</span></>}</>:<span className="muted">{metadata?.comingSoon?'ยังไม่วางจำหน่าย':'game.steamId?'ดูราคาบน Steam':'ยังไม่มีข้อมูลราคา'}</span>}</div>
  {price&&!free&&<small className="muted">ราคา Steam ประเทศไทย · อาจเปลี่ยนแปลง</small>}
  <dl className="game-facts">
    {metadata?.developers?.length>0&&<div><dt>ผู้พัฒนา</dt><dd>{metadata.developers.join(', ')}</dd></div>}
    {metadata?.publishers?.length>0&&<div><dt>ผู้จัดจำหน่าย</dt><dd>{metadata.publishers.join(', ')}</dd></div>}
    {metadata?.majorUpdateDate&&<div><dt>อัปเดต CS2</dt><dd>{gameDate(metadata.majorUpdateDate)}</dd></div>}
    {released&&<div><dt>{metadata?.majorUpdateDate?'เปิดตัวครั้งแรก':'วางจำหน่าย'}</dt><dd><time dateTime={released}>{gameDate(released)}</time></dd></div>}
    <div><dt>แนวเกม</dt><dd>{(game.genres||[]).filter(g=>g!=='free-to-play').map(genreLabel).join(' / ')||'ยังไม่มีข้อมูล'}</dd></div>
    <div><dt>แพลตฟอร์ม</dt><dd className="platform-icons">{(game.platforms||[]).map(p=><PlatformIcon key={p} name={p}/>)}</dd></div>
  </dl>
  {error&&<p className="muted">ยังโหลดข้อมูลเพิ่มเติมไม่ได้ <button className="secondary" onClick={onRetry}>ลองใหม่</button></p>}
 </section>;
}
export function SystemRequirements({metadata}) {
 const [mode,setMode]=useState('minimum');
 const specs=Object.entries(metadata?.requirements||{});
 if(!specs.length)return null;
 return <section className="game-specs"><h2>สเปกเครื่อง</h2><div className="spec-tabs"><button className="secondary" aria-pressed={mode==='minimum'} onClick={()=>setMode('minimum')}>ขั้นต่ำ</button><button className="secondary" aria-pressed={mode==='recommended'} onClick={()=>setMode('recommended')}>แนะนำ</button></div>{specs.map(([name,req])=><details key={name} open><summary>{name}</summary><p>{req[mode]||'ผู้พัฒนายังไม่ได้ระบุสเปกส่วนนี้'}</p></details>)}</section>;
}
