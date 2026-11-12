import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/backend';
import GameGrid from '../components/GameGrid';
import FeaturedGameCarousel from '../components/FeaturedGameCarousel';
import HomeGameSearch from '../components/HomeGameSearch';
import SuggestedGames from '../components/SuggestedGames';
import { gameDate } from '../utils/gameSource';
import { genreLabel } from '../utils/gameLabels';
import PopularGames from '../components/PopularGames';

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
  const browseGenres = [...new Set(games.flatMap(game => game.genres))].sort((a,b) => games.filter(g => g.genres.includes(b)).length - games.filter(g => g.genres.includes(a)).length || a.localeCompare(b)).slice(0, 8);
  return (
    <>
      <section className={mostPlayed.length ? "home-intro cinematic-hero storefront-hero with-ranking" : "home-intro cinematic-hero storefront-hero"}>
        <div className="hero-visual">
          <FeaturedGameCarousel games={featured} />
        </div>
        <PopularGames games={mostPlayed} />
        <div className="hero-copy">
          <h1>หาเกมที่อยากเล่น</h1>
          <p className="hero-description">ค้นหาจากชื่อเกม หรือเลือกแนวที่ชอบให้ GameMatch ช่วยแนะนำ</p>
          <HomeGameSearch games={games} loading={loading} error={error} />
          <div className="home-actions">
            <Link className="button" to="/discover">ดูเกมทั้งหมด <span aria-hidden="true">↗</span></Link>
            <Link className="button secondary" to="/match">ลองจับคู่เกม <span aria-hidden="true">→</span></Link>
          </div>
          {!loading && !error && games.length > 0 && (
            <div className="hero-stats">
              <div><strong>{games.length}</strong><span>เกมในคลัง</span></div>
              <div><strong>{genreCount}</strong><span>แนวเกม</span></div>
              </div>
          )}
        </div>
      </section>
      {!loading && !error && browseGenres.length > 0 && (
        <nav className="browse-genres" aria-label="เลือกดูตามแนวเกม">
          <span>แนวเกม</span>
          {browseGenres.map(genre => <Link key={genre} to={"/discover?genre=" + encodeURIComponent(genre)}>{genreLabel(genre)}</Link>)}
        </nav>
      )}
      {user && <SuggestedGames key={user.id} path="/api/me/recommendations" title="จากเกมโปรดของคุณ" description="เกมแนวเดียวกับที่คุณบันทึกไว้" emptyText="ลองเก็บเกมที่ชอบไว้ก่อน เราจะได้หาเกมแนวคล้ายกันให้" />}
      <section className="home-catalog" aria-labelledby="home-games-heading" aria-busy={loading}>
        <div className="section-head">
          <div>
            <h2 id="home-games-heading">
              {games.some((game) => game.popularityOrder)
                ? 'เกมยอดนิยมบน Steam'
                : games.some((game) => game.steamId)
                  ? 'เกมออกใหม่จาก Steam'
                  : 'เลือกดูจากคลังเกม'}
            </h2>
            {!games.some(game => game.popularityOrder) && syncedOn && <p className="muted">อัปเดต {syncedOn}</p>}
            {games.some((game) => game.popularityOrder) && (
              <p className="muted">จาก Steam Most Played และ Top Sellers{syncedOn ? ` · อัปเดต ${syncedOn}` : ""}</p>
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
