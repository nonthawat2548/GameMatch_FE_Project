import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { tagLabel } from '../utils/gameLabels';
import { gameSource } from '../utils/gameSource';
import GameReviews from '../components/GameReviews';
import GameTrailer from '../components/GameTrailer';
import { GameHero, GameInfo, SystemRequirements, GameDetailSkeleton, GameSeo } from '../components/GameDetails';
import { gameUrl, gameID } from '../utils/gameUrl';
import SteamRating from '../components/SteamRating';
import SuggestedGames from '../components/SuggestedGames';
export default function Detail() {
  const { id } = useParams();
  // เปลี่ยนเกมแล้วสร้าง state ใหม่ ป้องกันผลคำขอของเกมก่อนหน้าค้างในหน้าใหม่
  const numeric = gameID(id);
  return <DetailContent key={numeric || id} id={numeric || id} />;
}
function DetailContent({ id }) {
  const location = useLocation();
  const { user } = useAuth(),
    [game, setGame] = useState(null),
    [error, setError] = useState(''),
    [note, setNote] = useState(''),
    [saving, setSaving] = useState(false),
    [reviews, setReviews] = useState([]),
    [reviewLoading, setReviewLoading] = useState(true),
    [reviewError, setReviewError] = useState(''),
    [imageFailed, setImageFailed] = useState(false),
    [retry, setRetry] = useState(0),
    [metadata, setMetadata] = useState(null),
    [metaError, setMetaError] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    setGame(null);
    setReviews([]);
    setReviewLoading(true);
    setReviewError('');
    setError('');
    setNote('');
    api('/api/games/' + id, { signal: c.signal })
      .then((data) => {
        if (c.signal.aborted) return;
        setGame(data);
        return Promise.resolve(api('/api/games/' + id + '/reviews', { signal: c.signal }))
          .then((reviewsData) => {
            if (!c.signal.aborted)
              setReviews(
                Array.isArray(reviewsData)
                  ? reviewsData
                  : Array.isArray(reviewsData?.reviews)
                    ? reviewsData.reviews
                    : [],
              );
          })
          .catch((e) => {
            if (!c.signal.aborted && e.name !== 'AbortError') setReviewError(e.message);
          })
          .finally(() => {
            if (!c.signal.aborted) setReviewLoading(false);
          });
      })
      .catch((e) => {
        if (!c.signal.aborted && e.name !== 'AbortError') setError(e.message);
      });
    return () => c.abort();
  }, [id, retry]);
  useEffect(() => {
    if (!game?.steamId) return;
    const c = new AbortController();
    setMetaError(false);
    api('/api/games/' + id + '/metadata', {signal:c.signal})
      .then(data => {if(!c.signal.aborted)setMetadata(data);})
      .catch(() => {if(!c.signal.aborted)setMetaError(true);});
    return () => c.abort();
  }, [game?.steamId, id, retry]);
  async function save() {
    setSaving(true);
    setError('');
    setNote('');
    try {
      await api('/api/me/favorites/' + id, { method: 'PUT' });
      setNote('เพิ่มในเกมโปรดแล้ว');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  if (!game)
    return (
      <>
        {error ? <p role="alert">{error}</p> : <GameDetailSkeleton />}
        {error && <button onClick={() => setRetry((n) => n + 1)}>ลองใหม่</button>}
      </>
    );
  const source = gameSource(game);
  return (
    <>
      <GameSeo game={game} />
      <GameHero game={game} metadata={metadata} />
      <article className="detail-layout">
        <div className="detail-media">
          <GameTrailer game={game} screenshots={metadata?.screenshots} >
          {game.imageUrl && !imageFailed ? (
            <img
              className="detail-image"
              src={game.imageUrl}
              alt={game.title}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="placeholder detail-placeholder" aria-label="ไม่มีภาพเกม">
              ไม่มีภาพเกม
            </div>
          )}
          </GameTrailer>
        </div>
        <div className="detail-content">
          <GameInfo game={game} metadata={metadata} error={metaError} onRetry={()=>setRetry(n=>n+1)} />
          <SteamRating key={game.id} game={game} />
          <div className="game-tags" aria-label="จุดเด่นของเกม">
            {game.tags.length ? (
              game.tags.filter(tag=>tag!=='free-to-play').map((tag) => <span key={tag}>{tagLabel(tag)}</span>)
            ) : (
              <p className="muted">ยังไม่มีข้อมูลจุดเด่นของเกม</p>
            )}
          </div>
          <div className="detail-actions">
          {source && <a className="button store-cta" href={source.href} target="_blank" rel="noopener noreferrer">ดูเกมบน {source.name} ↗</a>}
          {user ? (
            <button onClick={save} disabled={saving}>
              {saving ? 'กำลังบันทึก…' : 'เพิ่มในเกมโปรด'}
            </button>
          ) : (
            <Link className="button" to="/login" state={{ from: gameUrl(game) }}>
              ♡ บันทึกเกม
            </Link>
          )}
          <Link className="button secondary" to={'/compare?game=' + id}>เปรียบเทียบเกม</Link>
          </div>
          {source && (
            <p className="detail-source">
              ข้อมูลและภาพจาก{' '}
              <a href={source.href} target="_blank" rel="noopener noreferrer">
                {source.name}
              </a>
            </p>
          )}
          {note && <p role="status">{note}</p>}
          {error && <p role="alert">{error}</p>}
        </div>
      </article>
      <section className="game-overview"><h2>เกี่ยวกับเกม</h2><p className="detail-description">{game.descriptionTh || game.description || "ยังไม่มีคำอธิบายเพิ่มเติม"}</p></section>
      <SystemRequirements metadata={metadata} />
      <GameReviews
        key={user?.id ?? 'guest'}
        gameId={id}
        returnTo={gameUrl(game)}
        autoWrite={location.state?.intent === "review"}
        user={user}
        reviews={reviews}
        setReviews={setReviews}
        loading={reviewLoading}
        loadError={reviewError}
        onRetry={() => setRetry((n) => n + 1)}
      />
      <SuggestedGames path={'/api/games/' + id + '/similar'} title="เกมที่คล้ายกัน" description="แนวเกมและแท็กที่ใกล้เคียงกัน" emptyText="ยังไม่พบเกมที่คล้ายกันในคลัง" />
    </>
  );
}
