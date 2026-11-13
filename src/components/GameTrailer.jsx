import { useEffect, useState, useRef } from 'react';
import { api } from '../api/backend';
import { gameSource } from '../utils/gameSource';
import { heroVideoCandidates } from '../utils/heroVideos';

export default function GameTrailer({ game, children, screenshots = [] }) {
  const steam = gameSource(game)?.name === 'Steam';
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(steam);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [shot, setShot] = useState(null);
  const lightbox = useRef(null);
  const [autoplay] = useState(() =>
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches &&
    !navigator.connection?.saveData
  );
  useEffect(() => {
    if (!steam) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setSelected(0);
    setShot(null);
    setAttempt(0);
    const fallback = () => {
      const sources = heroVideoCandidates(game);
      return sources.length ? [{ id: 0, title: 'ตัวอย่างเกม', sources, preview: true }] : [];
    };
    api('/api/games/' + game.id + '/trailers', { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        const list = Array.isArray(data) ? data.filter(t => Array.isArray(t.sources) && t.sources.length) : [];
        setTrailers(list.length ? list : fallback());
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTrailers(fallback());
          setError('โหลดคลิปจาก Steam ไม่สำเร็จ');
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [game, steam, retry]);

  const trailer = trailers[selected];
  const src = trailer?.sources[attempt];
  function select(index) {
    setShot(null);
    setSelected(index);
    setAttempt(0);
  }
  if (!steam) return <>{children}</>;
  return (
    <section className="game-trailer" aria-label="ตัวอย่างเกม">
      <div className="game-trailer-stage">
        {shot ? <button className="gallery-image-button" onClick={()=>lightbox.current?.showModal()} aria-label="ขยายภาพ"><img src={shot.path_full} alt="ภาพจากเกม"/></button> : src && !loading ? (
          <video
            key={src + ':' + selected}
            className="detail-trailer-video"
            src={src}
            poster={game.imageUrl || undefined}
            controls
            autoPlay={autoplay}
            muted
            playsInline
            preload={autoplay ? 'metadata' : 'none'}
            aria-label={'คลิปตัวอย่าง ' + game.title}
            onError={() => setAttempt(n => n + 1)}
          />
        ) : children}
      </div>
      <div className="game-trailer-info">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <strong>{src && !loading ? (trailer.preview ? 'คลิปตัวอย่างสั้น' : 'ตัวอย่างเกม') : 'ตัวอย่างเกม'}</strong>
          <a href={gameSource(game).href} target="_blank" rel="noopener noreferrer">ดู Trailer เต็มบน Steam ↗</a>
        </div>
        {loading ? <p className="muted">กำลังโหลดคลิป…</p> : (
          <>
            {src ? <p className="muted">{trailer.title}{trailer.preview ? ' · ดูคลิปเต็มได้บน Steam' : ''}</p>
              : <p className="muted">{error || (trailer ? 'คลิปนี้เล่นไม่ได้ ลองเลือกคลิปอื่นหรือดูบน Steam' : 'ยังไม่มีคลิปที่เล่นบนเว็บได้')}</p>}
            {(trailers.length > 0 || screenshots.length > 0) && (
              <div className="game-trailer-options media-thumbnails" aria-label="เลือกคลิปตัวอย่าง">
                {trailers.map((item, i) => (
                  <button key={item.id + ':' + i} type="button" className="secondary" aria-label={item.title} aria-pressed={!shot && i === selected} onClick={() => select(i)}>
                    <img src={item.thumbnail || game.imageUrl} alt=""/><span className="media-play">▶</span><span>{item.title}</span>
                  </button>
                ))}
                {screenshots.map((s,i)=><button type="button" key={s.path_full} className="secondary" aria-label={'ภาพเกม '+(i+1)} aria-pressed={shot===s} onClick={()=>setShot(s)}><img src={s.path_thumbnail} alt=""/><span>ภาพ {i+1}</span></button>)}
              </div>
            )}
            {(error || (trailer && !src)) && <button type="button" className="secondary" onClick={() => setRetry(n => n + 1)}>โหลดคลิปใหม่</button>}
          </>
        )}
      </div>
      <dialog ref={lightbox} className="media-lightbox" onClick={e=>{if(e.target===e.currentTarget)lightbox.current.close();}}><button onClick={()=>lightbox.current.close()} aria-label="ปิดภาพ">×</button>{shot&&<img src={shot.path_full} alt="ภาพจากเกมขนาดเต็ม"/>}</dialog>
    </section>
  );
}
