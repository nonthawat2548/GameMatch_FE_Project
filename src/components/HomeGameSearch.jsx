import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { genreLabel } from '../utils/gameLabels';

export default function HomeGameSearch({ games, loading, error }) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  useEffect(() => {
    if (!expanded) return;
    function outside(e) {
      if (!searchRef.current?.contains(e.target)) setExpanded(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [expanded]);
  const term = query.trim();
  const matches = term ? games.filter((game) => game.title.toLowerCase().includes(term.toLowerCase())) : [];
  const destination = '/discover' + (term ? '?q=' + encodeURIComponent(term) : '');
  const showResults = expanded && Boolean(term);

  function submit(e) {
    e.preventDefault();
    setExpanded(false);
    navigate(destination);
  }

  return (
    <div
      className="home-game-search"
      ref={searchRef}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false); }}
      onKeyDown={(e) => { if (e.key === 'Escape') setExpanded(false); }}
    >
      <form role="search" aria-label="ค้นหาเกมจากหน้าแรก" onSubmit={submit} className="hero-search-form">
        <label htmlFor="home-game-query" className="hero-search-label">ค้นหาเกม</label>
        <div className="hero-search-field">
          <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" strokeLinecap="round" />
          </svg>
          <input
            id="home-game-query"
            type="search"
            placeholder="ค้นหาชื่อเกม เช่น Dota 2..."
            value={query}
            autoComplete="off"
            onFocus={() => setExpanded(true)}
            onClick={() => setExpanded(true)}
            onChange={(e) => { setQuery(e.target.value); setExpanded(true); }}
            aria-controls={showResults ? 'home-search-results' : undefined}
          />
          <button type="submit">ค้นหา</button>
        </div>
      </form>
      {showResults && (
        <div className="hero-search-results" id="home-search-results">
          {loading ? <p>กำลังโหลดคลังเกม…</p> : error ? <p>ยังโหลดคลังเกมไม่ได้ ลองค้นหาจากหน้ารายการเกม</p> : (
            <>
              <div className="hero-search-result-head">
                <span aria-live="polite">พบ {matches.length} เกม</span>
                <button type="button" className="text-button" onClick={() => setExpanded(false)}>ปิด</button>
              </div>
              {matches.length ? (
                <ul className="hero-search-list">
                  {matches.slice(0, 4).map((game) => (
                    <li key={game.id}>
                      <Link to={'/games/' + game.id} className="hero-search-item" aria-label={'เปิดเกม ' + game.title}>
                        <div className="hero-search-thumb" aria-hidden="true">
                          {game.imageUrl && <img src={game.imageUrl} alt="" onError={(e) => { e.currentTarget.hidden = true; }} />}
                        </div>
                        <span className="hero-search-title">
                          <strong>{game.title}</strong>
                          <small>{game.genres.map(genreLabel).join(' · ') || 'ไม่ระบุแนวเกม'}</small>
                        </span>
                        <span className="hero-search-arrow" aria-hidden="true">↗</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="hero-search-empty">ไม่พบเกมที่ตรงกับคำค้น ลองใช้ชื่อเกมอื่น</p>}
            </>
          )}
          <Link className="hero-search-all" to={destination}>ดูผลการค้นหาทั้งหมด <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </div>
  );
}
