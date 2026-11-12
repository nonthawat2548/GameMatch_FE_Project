import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroArtwork from './HeroArtwork';
import { heroImageCandidates } from '../utils/heroImages';

const SLIDE_MS = 4000;

// วนตำแหน่งด้วย modulo เหมือน FeaturedCarousel ใน MovieHub
export default function FeaturedGameCarousel({ games }) {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = games.length;
  const index = total ? page % total : 0;
  const featured = games[index];

  useEffect(() => {
    if (total < 2 || paused) return;
    // เริ่มเลื่อนเองทุก 4 วินาทีหลังโหลดข้อมูล และหยุดเมื่อกดปุ่ม Pause เท่านั้น
    const timer = setInterval(() => setPage((p) => (p + 1) % total), SLIDE_MS);
    return () => clearInterval(timer);
  }, [total, paused]);

  // Preload only the next slide, so all ten large images are not fetched at once.
  const nextImage = total > 1 ? heroImageCandidates(games[(index + 1) % total])[0] : '';
  useEffect(() => {
    if (!nextImage || paused) return;
    const image = new Image();
    image.src = nextImage;
  }, [nextImage, paused]);

  if (!featured) {
    return (
      <div className="hero-placeholder" aria-hidden="true">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <span>G<span>+</span></span>
        <small>DISCOVER · MATCH · PLAY</small>
      </div>
    );
  }

  function select(next) {
    setPage((next + total) % total);
  }

  return (
    <section className={paused ? "featured-carousel is-paused" : "featured-carousel"} aria-label="เกมเด่น">
      <Link
        className="hero-feature"
        to={'/games/' + featured.id}
        aria-label="เปิดรายละเอียดเกมเด่น"
      >
        <div key={featured.id} className="hero-slide">
          <HeroArtwork key={featured.id} game={featured} />
          <div className="hero-feature-caption">
            <span className="eyebrow">
              {featured.popularitySource === 'Steam Most Played' && featured.popularityOrder > 0
                ? 'เกมฮิตบน Steam · #' + featured.popularityOrder
                : 'เกมน่าเล่น'}
            </span>
            <strong>{featured.title}</strong>
            <span>ดูเกมนี้ <span aria-hidden="true">↗</span></span>
          </div>
        </div>
      </Link>
      {total > 1 && (
        <>
          <div className="hero-carousel-top">
            <span className="hero-slide-count" aria-label={`สไลด์ ${index + 1} จาก ${total}`}>
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <button
              type="button"
              className="hero-carousel-control"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'เล่นสไลด์อัตโนมัติ' : 'หยุดสไลด์อัตโนมัติ'}
            >
              <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
            </button>
          </div>
          <div className="hero-carousel-nav">
            <button type="button" className="hero-carousel-control" onClick={() => select(index - 1)} aria-label="เกมก่อนหน้า">
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="hero-carousel-control" onClick={() => select(index + 1)} aria-label="เกมถัดไป">
              <span aria-hidden="true">›</span>
            </button>
          </div>
          <div className="hero-carousel-dots" role="group" aria-label="เลือกสไลด์เกมเด่น">
            {games.map((game, i) => (
              <button
                type="button"
                key={game.id}
                className="hero-dot"
                aria-label={'สไลด์ ' + (i + 1) + ': ' + game.title}
                aria-pressed={i === index}
                onClick={() => select(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
