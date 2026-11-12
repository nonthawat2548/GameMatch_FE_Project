import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/backend';
import GameGrid from '../components/GameGrid';
import FeaturedGameCarousel from '../components/FeaturedGameCarousel';
import { gameDate } from '../utils/gameSource';

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    api('/api/games')
      .then((list) => {
        if (!ignore) setGames(list);
      })
      .catch((e) => {
        if (!ignore) setError(e.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [retry]);

  const steamSync = games.find((game) => game.steamId && game.syncedAt)?.syncedAt;
  const syncedOn = gameDate(steamSync?.slice(0, 10));
  const featured = games.filter((game) => game.imageUrl).slice(0, 5);
  const genreCount = new Set(games.flatMap((game) => game.genres)).size;
  return (
    <>
      <section className="home-intro">
        <div className="hero-copy">
          <span className="eyebrow"><span aria-hidden="true" /> YOUR NEXT GAME STARTS HERE</span>
          <h1>หาเกมที่อยากเล่น</h1>
          <p className="hero-tagline">เกมที่ใช่ <span>ในสไตล์ของคุณ</span></p>
          <p className="hero-description">เลือกดูเกมในคลัง หรือบอกแนวเกมและสไตล์ที่ชอบให้ GameMatch ช่วยเลือก</p>
          <div className="home-actions">
            <Link className="button" to="/discover">ดูเกมทั้งหมด <span aria-hidden="true">↗</span></Link>
            <Link className="button secondary" to="/match">ลองจับคู่เกม <span aria-hidden="true">→</span></Link>
          </div>
          {!loading && !error && games.length > 0 && (
            <div className="hero-stats">
              <div><strong>{games.length}</strong><span>เกมในคลัง</span></div>
              <div><strong>{genreCount}</strong><span>แนวเกม</span></div>
              <div><strong>3</strong><span>ตัวเลือกจับคู่</span></div>
            </div>
          )}
        </div>
        <div className="hero-visual">
          <FeaturedGameCarousel games={featured} />
        </div>
      </section>
      <div className="home-paths">
        <Link to="/discover" className="home-path">
          <span className="path-number" aria-hidden="true">01</span>
          <div><strong>สำรวจคลังเกม</strong><p>ค้นหาและกรองเกมตามแนวที่สนใจ</p></div>
          <span aria-hidden="true">→</span>
        </Link>
        <Link to="/match" className="home-path">
          <span className="path-number" aria-hidden="true">02</span>
          <div><strong>จับคู่ความชอบ</strong><p>เลือก 3 ข้อ แล้วรับเกมที่เหมาะกับคุณ</p></div>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <section aria-labelledby="home-games-heading" aria-busy={loading}>
        {syncedOn && <p className="muted">ข้อมูล Steam อัปเดต {syncedOn}</p>}
        <div className="section-head">
          <div>
            <h2 id="home-games-heading">
              {games.some((game) => game.popularityOrder)
                ? 'เกมยอดนิยมบน Steam'
                : games.some((game) => game.steamId)
                  ? 'เกมออกใหม่จาก Steam'
                  : 'เลือกดูจากคลังเกม'}
            </h2>
            <p className="muted">ดูรายละเอียดก่อนเก็บเกมที่สนใจไว้ในรายการเกมโปรด</p>
            {games.some((game) => game.popularityOrder) && (
              <p className="muted">คัดจาก Steam Most Played และ Top Sellers ตามรอบอัปเดต</p>
            )}
          </div>
          <Link className="inline-link" to="/discover">
            ดูทั้งหมด
          </Link>
        </div>
        {loading ? (
          <p role="status" className="catalog-message">
            กำลังโหลดเกม…
          </p>
        ) : error ? (
          <>
            <p role="alert">{error}</p>
            <button className="secondary" onClick={() => setRetry((n) => n + 1)}>
              ลองใหม่
            </button>
          </>
        ) : (
          <GameGrid
            games={games.slice(0, 4)}
            emptyText="ยังไม่มีเกมในคลัง กลับมาดูใหม่ได้ภายหลัง"
          />
        )}
      </section>
    </>
  );
}
