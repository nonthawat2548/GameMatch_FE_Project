import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/backend';
import { gameUrl } from '../utils/gameUrl';
export default function GlobalSearch(){
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[games,setGames]=useState(null),[error,setError]=useState(''),[active,setActive]=useState(0),[retry,setRetry]=useState(0);
 const input=useRef(null),root=useRef(null),button=useRef(null);
 const navigate=useNavigate(),location=useLocation();
 useEffect(()=>{setOpen(false);setQuery('');},[location.pathname,location.search]);
 useEffect(()=>{
   function key(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setOpen(true);}}
   window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[]);
 useEffect(()=>{if(open)input.current?.focus();},[open]);
 useEffect(()=>{
   if(!open||games!==null)return;
   const c=new AbortController();setError('');
   api('/api/games',{signal:c.signal}).then(data=>{if(!c.signal.aborted)setGames(Array.isArray(data)?data:[]);}).catch(e=>{if(!c.signal.aborted)setError(e.message);});
   return()=>c.abort();
 },[open,games,retry]);
 useEffect(()=>{if(!open)return;const outside=e=>{if(!root.current?.contains(e.target))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 const q=query.trim().toLowerCase(),results=q?(games||[]).filter(g=>g.title.toLowerCase().includes(q)).slice(0,6):[];
 function choose(game){setOpen(false);navigate(gameUrl(game));}
 function submit(e){e.preventDefault();if(results[active])choose(results[active]);else if(q){setOpen(false);navigate('/discover?q='+encodeURIComponent(query.trim()));}}
 function key(e){
  if(e.key==='Escape'){e.stopPropagation();setOpen(false);button.current?.focus();}
  if(e.key==='ArrowDown'&&results.length){e.preventDefault();setActive(n=>(n+1)%results.length);}
  if(e.key==='ArrowUp'&&results.length){e.preventDefault();setActive(n=>(n+results.length-1)%results.length);}
 }
 return <div className="global-search" ref={root}>
  <button type="button" ref={button} className="global-search-trigger secondary" aria-label="ค้นหาเกมทั่วเว็บไซต์" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><span>ค้นหาเกม</span><kbd>Ctrl K</kbd></button>
  {open&&<form className="global-search-popup" onSubmit={submit} onKeyDown={key}>
   <input ref={input} role="combobox" aria-label="ค้นหาเกมด่วน" aria-expanded="true" aria-controls="global-results" aria-autocomplete="list" aria-activedescendant={results[active]?'global-result-'+active:undefined} value={query} onChange={e=>{setQuery(e.target.value);setActive(0);}} placeholder="พิมพ์ชื่อเกม…"/>
   {error?<p role="alert">{error} <button type="button" onClick={()=>setRetry(n=>n+1)}>ลองใหม่</button></p>:games===null?<div className="skeleton-block global-search-loading" aria-label="กำลังโหลดคลังเกม"/>:q&&!results.length?<p className="muted">ไม่พบเกมที่ค้นหา</p>:null}
   <div id="global-results" role="listbox" aria-label="ผลค้นหา">{results.map((g,i)=><button type="button" role="option" id={'global-result-'+i} aria-selected={i===active} key={g.id} className="global-result" onClick={()=>choose(g)}>{g.imageUrl&&<img src={g.imageUrl} alt=""/>}<span>{g.title}</span></button>)}</div>
   {q&&<button type="button" className="secondary global-all" onClick={()=>{setOpen(false);navigate('/discover?q='+encodeURIComponent(query.trim()));}}>ดูผลค้นหาทั้งหมด</button>}
  </form>}
 </div>;
}
