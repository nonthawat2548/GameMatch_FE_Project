import { gameUrl } from '../utils/gameUrl';
import { Link } from 'react-router-dom';
import { genreLabel } from '../utils/gameLabels';

export default function PopularGames({ games }) {
  if (!games.length) return null;
  return (
    <aside className="popular-list" aria-labelledby="popular-list-heading">
      <div className="popular-list-heading">
        <h2 id="popular-list-heading">คนเล่นเยอะบน Steam</h2>
        <a href="https://store.steampowered.com/charts/mostplayed" target="_blank" rel="noopener noreferrer">Steam ↗</a>
      </div>
      <ol>
        {games.slice(0, 5).map(game => (
          <li key={game.id}>
            <Link to={gameUrl(game)} aria-label={'อันดับ ' + game.popularityOrder + ': ' + game.title}>
              <span className="popular-rank">{game.popularityOrder}</span>
              <img src={game.imageUrl} alt="" loading="lazy" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
              <span className="popular-name"><strong>{game.title}</strong><small>{game.genres.slice(0, 2).map(genreLabel).join(' · ')}</small></span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="popular-note">อันดับจากข้อมูล Steam ที่นำเข้าล่าสุด ไม่ใช่จำนวนผู้เล่นสด</p>
    </aside>
  );
}
