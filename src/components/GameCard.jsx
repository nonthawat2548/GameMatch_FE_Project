import { useState } from 'react';
import { Link } from 'react-router-dom';
import { genreLabel, friendlyReason, matchPartLabel } from '../utils/gameLabels';
import { gameSource, gameDate } from '../utils/gameSource';

export default function GameCard({ game, action }) {
  const [failedImage, setFailedImage] = useState('');
  const source = gameSource(game);
  const released = gameDate(game.releaseDate);
  return (
    <article className="game-card">
      <Link
        className="card-image-link"
        to={'/games/' + game.id}
        aria-label={'ดูรายละเอียด ' + game.title}
      >
        {game.imageUrl && failedImage !== game.imageUrl ? (
          <img
            src={game.imageUrl}
            alt={game.title}
            loading="lazy"
            onError={() => setFailedImage(game.imageUrl)}
          />
        ) : (
          <div className="placeholder" aria-label="ไม่มีภาพเกม">
            ไม่มีภาพเกม
          </div>
        )}
      </Link>
      <div className="card-body">
        <h2>
          <Link to={'/games/' + game.id}>{game.title}</Link>
        </h2>
        <p className="card-genres">{game.genres.map(genreLabel).join(' / ') || 'ไม่ระบุแนว'}</p>
        {game.descriptionTh && <p className="card-description">{game.descriptionTh}</p>}
        {game.matchScore > 0 && (
          <strong className="score">ตรงกับความชอบ {game.matchScore}/100</strong>
        )}
        {game.matchBreakdown?.length > 0 && (
          <div className="match-breakdown" aria-label="คะแนนจับคู่แยกรายด้าน">
            {game.matchBreakdown.map((part) => (
              <div key={matchPartLabel(part.label)}>
                <span>{matchPartLabel(part.label)}</span><b>{part.points}/{part.max}</b>
                <div className="match-track"><div style={{ width: (part.points / part.max * 100) + '%' }} /></div>
              </div>
            ))}
            <small className="muted">0 คะแนน = ยังไม่เจอข้อมูลที่ตรงกับคำตอบข้อนี้</small>
          </div>
        )}
        {game.reasons?.map((x) => (
          <p className="reason" key={x}>
            {friendlyReason(x)}
          </p>
        ))}
        <p className="muted">{game.platforms.join(' · ') || 'ยังไม่รู้ว่าเล่นบนเครื่องไหนได้'}</p>
        {released && (
          <p className="muted">
            วางจำหน่าย <time dateTime={game.releaseDate}>{released}</time>
          </p>
        )}
        {source && (
          <a className="source-link" href={source.href} target="_blank" rel="noreferrer">
            ข้อมูลและภาพจาก {source.name} ↗
          </a>
        )}
        <Link className="card-compare" to={'/compare?game=' + game.id} aria-label={'เปรียบเทียบ ' + game.title}>เปรียบเทียบเกม ↗</Link>
        {action}
      </div>
    </article>
  );
}
