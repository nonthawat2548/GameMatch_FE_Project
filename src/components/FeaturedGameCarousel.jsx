import { gameUrl } from '../utils/gameUrl';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroArtwork from './HeroArtwork';
import HeroVideo from './HeroVideo';
import { heroVideoCandidates } from '../utils/heroVideos';
import { heroImageCandidates } from '../utils/heroImages';

const SLIDE_MS = 4000;
const VIDEO_SLIDE_MS = 12000;
const VIDEO_LOAD_TIMEOUT_MS = 8000;
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function allowVideo() {
  return !window.matchMedia?.(MOTION_QUERY).matches && !navigator.connection?.saveData;
}

export default function FeaturedGameCarousel({ games }) {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [startedID, setStartedID] = useState(null);
  const [motionEnabled, setMotionEnabled] = useState(allowVideo);
  const [useVideo, setUseVideo] = useState(true);
  const total = games.length;
  const index = total ? page % total : 0;
  const featured = games[index];
  const videoAvailable = heroVideoCandidates(featured).length > 0;
  const showVideo = motionEnabled && useVideo && videoAvailable;
  const featuredID = featured?.id;
  const playing = showVideo && startedID === featuredID;
  const slideDuration = showVideo ? (playing ? VIDEO_SLIDE_MS : VIDEO_LOAD_TIMEOUT_MS) : SLIDE_MS;
  const playbackStarted = useCallback(() => {
    setStartedID(featuredID);
  }, [featuredID]);

  useEffect(() => {
    const query = window.matchMedia?.(MOTION_QUERY);
    const connection = navigator.connection;
    const update = () => setMotionEnabled(allowVideo());
    query?.addEventListener?.('change', update);
    connection?.addEventListener?.('change', update);
    return () => {
      query?.removeEventListener?.('change', update);
      connection?.removeEventListener?.('change', update);
    };
  }, []);

  useEffect(() => {
    if (total < 2 || paused) return;
    const timer = setInterval(() => {
      if (!document.hidden) {
        setStartedID(null);
        setPage((p) => (p + 1) % total);
      }
    }, slideDuration);
    return () => clearInterval(timer);
  }, [total, paused, slideDuration, rotation, featuredID, playing]);

  const nextImage = total > 1 ? heroImageCandidates(games[(index + 1) % total])[0] : '';
  useEffect(() => {
    if (!nextImage || paused) return;
    const image = new Image();
    image.src = nextImage;
  }, [nextImage, paused]);

  if (!featured) {
    return (
      <div className="hero-feature" aria-hidden="true">
        <div className="hero-placeholder">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <span>G<span>+</span></span>
          <small>DISCOVER · MATCH · PLAY</small>
        </div>
      </div>
    );
  }

  function select(next) {
    if ((next + total) % total !== index) setStartedID(null);
    setPage((next + total) % total);
    setRotation((n) => n + 1);
  }

  return (
    <section className={paused ? "featured-carousel is-paused" : "featured-carousel"} aria-label="เกมเด่น">
      <Link
        className="hero-feature"
        to={gameUrl(featured)}
        aria-label="เปิดรายละเอียดเกมเด่น"
      >
        <div key={featured.id} className="hero-slide">
          <HeroArtwork key={featured.id} game={featured} />
          {showVideo && <HeroVideo key={'video-' + featured.id} game={featured} paused={paused} onPlaybackStarted={playbackStarted} />}
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
      {(total > 1 || (motionEnabled && videoAvailable)) && (
        <>
          <div className="hero-carousel-top">
            {motionEnabled && videoAvailable && (
              <button type="button" className="hero-carousel-control hero-media-toggle"
                aria-label={useVideo ? 'ใช้ภาพนิ่ง' : 'ใช้คลิปตัวอย่าง'}
                title={useVideo ? 'ใช้ภาพนิ่ง' : 'ใช้คลิปตัวอย่าง'}
                aria-pressed={useVideo} onClick={() => { setStartedID(null); setUseVideo((v) => !v); }}>
                <span aria-hidden="true">{useVideo ? '▣' : '▶'}</span>
              </button>
            )}
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
          {total > 1 && <div className="hero-carousel-nav">
            <button type="button" className="hero-carousel-control" onClick={() => select(index - 1)} aria-label="เกมก่อนหน้า">
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="hero-carousel-control" onClick={() => select(index + 1)} aria-label="เกมถัดไป">
              <span aria-hidden="true">›</span>
            </button>
          </div>}
          {total > 1 && <div className="hero-carousel-dots" role="group" aria-label="เลือกสไลด์เกมเด่น">
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
          </div>}
        </>
      )}
    </section>
  );
}
