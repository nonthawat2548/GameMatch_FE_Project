import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/backend';
import GameGrid from '../components/GameGrid';
import FeaturedGameCarousel from '../components/FeaturedGameCarousel';
import HomeGameSearch from '../components/HomeGameSearch';
import SuggestedGames from '../components/SuggestedGames';
import { gameDate } from '../utils/gameSource';

export default function Home({ user } = {}) {
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
  // แสดงอันดับผู้เล่นจาก Steam Most Played เท่านั้น ไม่ปะปนกับ Top Sellers
  const withImages = games.filter((game) => game.imageUrl?.trim() && game.isPublished !== false);
  const mostPlayed = withImages
    .filter((game) => game.steamId && game.popularitySource === 'Steam Most Played' &&
      Number.isInteger(game.popularityOrder) && game.popularityOrder > 0)
    .sort((a, b) => a.popularityOrder - b.popularityOrder || a.id - b.id);
  // หากยังไม่มีข้อมูลอันดับ ให้แสดงเกมเด่นจากคลังโดยไม่อ้างว่าเป็นอันดับผู้เล่น
  const featured = (mostPlayed.length ? mostPlayed : withImages).slice(0, 10);
  const genreCount = new Set(games.flatMap((game) => game.genres)).size;
  return (
    <>
      <section className="home-intro cinematic-hero">
        <div className="hero-copy">
          <span className="eyebrow"><span aria-hidden="true" /> เกมต่อไปของคุณ เริ่มที่นี่</span>
          <h1>หาเกมที่อยากเล่น</h1>
          <p className="hero-tagline">เกมที่ใช่ <span>ในสไตล์ของคุณ</span></p>
          <p className="hero-description">ยังไม่รู้จะเล่นเกมอะไร? ลองค้นหาหรือตอบ 3 ข้อ ให้เราช่วยเลือกเกมที่น่าจะถูกใจ</p>
          <HomeGameSearch games={games} loading={loading} error={error} />
          <div className="home-actions">
            <Link className="button" to="/discover">ดูเกมทั้งหมด <span aria-hidden="true">↗</span></Link>
            <Link className="button secondary" to="/match">ลองจับคู่เกม <span aria-hidden="true">→</span></Link>
          </div>
          {!loading && !error && games.length > 0 && (
            <div className="hero-stats">
              <div><strong>{games.length}</strong><span>เกมในคลัง</span></div>
              <div><strong>{genreCount}</strong><span>แนวเกม</span></div>
              <div><strong>3</strong><span>คำถามหาเกม</span></div>
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
          <div><strong>สำรวจคลังเกม</strong><p>หาเกมแนวที่คุณชอบได้เลย</p></div>
          <span aria-hidden="true">→</span>
        </Link>
        <Link to="/match" className="home-path">
          <span className="path-number" aria-hidden="true">02</span>
          <div><strong>หาเกมที่ใช่</strong><p>ตอบ 3 ข้อ แล้วมาดูว่ามีเกมไหนน่าเล่นบ้าง</p></div>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      {user && <SuggestedGames key={user.id} path="/api/me/recommendations" title="ถ้าชอบเกมเหล่านี้ ลองดูเกมอื่น ๆ" description="เกมที่มีแนวคล้าย ๆ กับเกมที่คุณเก็บไว้" emptyText="ลองเก็บเกมที่ชอบไว้ก่อน เราจะได้หาเกมแนวคล้ายกันให้" />}
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
            <p className="muted">เจอเกมที่น่าสนใจแล้ว? กดดูรายละเอียดหรือเก็บไว้เล่นทีหลังก็ได้</p>
            {games.some((game) => game.popularityOrder) && (
              <p className="muted">อ้างอิงจากเกมที่คนเล่นเยอะและเกมขายดีบน Steam</p>
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
