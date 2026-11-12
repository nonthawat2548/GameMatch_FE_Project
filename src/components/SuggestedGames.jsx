import { useEffect, useState } from 'react';
import { api } from '../api/backend';
import GameGrid from './GameGrid';

export default function SuggestedGames({ path, title, description, emptyText }) {
  const [games, setGames] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    setGames(null);
    setError('');
    api(path, { signal: c.signal }).then((data) => {
      if (!c.signal.aborted) setGames(Array.isArray(data) ? data : []);
    }).catch((e) => {
      if (!c.signal.aborted && e.name !== 'AbortError') setError(e.message);
    });
    return () => c.abort();
  }, [path, retry]);
  return (
    <section className="suggested-games" aria-label={title}>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {error ? <div className="empty"><p>โหลดคำแนะนำไม่ได้: {error}</p><button type="button" className="secondary" onClick={() => setRetry((n) => n + 1)}>โหลดคำแนะนำอีกครั้ง</button></div>
        : games === null ? <p className="muted" aria-live="polite">กำลังหาเกมน่าเล่นให้คุณ…</p>
        : <GameGrid games={games} emptyText={emptyText} />}
    </section>
  );
}
