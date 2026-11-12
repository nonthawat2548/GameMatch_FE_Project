import { useEffect, useState } from 'react';
import { api } from '../api/backend';
import { gameSource } from '../utils/gameSource';

const labels = {
  'Overwhelmingly Positive': 'แง่บวกอย่างท่วมท้น',
  'Very Positive': 'แง่บวกเป็นอย่างมาก',
  'Positive': 'แง่บวก',
  'Mostly Positive': 'แง่บวกเป็นส่วนมาก',
  'Mixed': 'ผสมกัน',
  'Mostly Negative': 'แง่ลบเป็นส่วนมาก',
  'Negative': 'แง่ลบ',
  'Very Negative': 'แง่ลบเป็นอย่างมาก',
  'Overwhelmingly Negative': 'แง่ลบอย่างท่วมท้น',
};
const number = new Intl.NumberFormat('th-TH');

export default function SteamRating({ game }) {
  const source = gameSource(game);
  const steam = source?.name === 'Steam';
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(steam);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!steam) return;
    const controller = new AbortController();
    setLoading(true);
    setRating(null);
    setError(false);
    api('/api/games/' + game.id + '/steam-rating', { signal: controller.signal })
      .then(data => {
        if (!controller.signal.aborted) setRating(data);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [game.id, steam, retry]);

  if (!steam) return null;
  const hasReviews = rating && Number.isInteger(rating.positivePercent) &&
    rating.positivePercent >= 0 && rating.positivePercent <= 100 && rating.total > 0;
  return (
    <section className="steam-rating" aria-label="คะแนนจาก Steam">
      <div className="steam-rating-header">
        <strong>คะแนนจาก Steam</strong>
        <a href={source.href + '#app_reviews_hash'} target="_blank" rel="noreferrer">ดูรีวิวบน Steam ↗</a>
      </div>
      {loading ? <p className="muted">กำลังโหลดคะแนนจาก Steam…</p> : error ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="muted">โหลดคะแนนไม่ได้ในตอนนี้</p>
          <button type="button" className="secondary" onClick={() => setRetry(n => n + 1)}>โหลดคะแนนใหม่</button>
        </div>
      ) : hasReviews ? (
        <>
          <div className="steam-rating-main">
            <div className="steam-rating-percent">{rating.positivePercent}%</div>
            <div className="min-w-0">
              <strong>{labels[rating.description] || (rating.score > 0 ? rating.description : 'ยังไม่มีระดับคะแนน')}</strong>
              <p className="muted">{number.format(rating.total)} รีวิว · รีวิวเชิงบวก</p>
            </div>
          </div>
          <div className="steam-rating-track" role="progressbar" aria-label="สัดส่วนรีวิวเชิงบวก" aria-valuemin={0} aria-valuemax={100} aria-valuenow={rating.positivePercent}>
            <span style={{width: rating.positivePercent + '%'}} />
          </div>
          <div className="steam-rating-counts">
            <span>แนะนำ {number.format(rating.positive)} คน</span>
            <span>ไม่แนะนำ {number.format(rating.negative)} คน</span>
          </div>
          <p className="steam-rating-caption">รีวิวทุกภาษา จากผู้เล่นที่ได้รับเกมผ่าน Steam ตามตัวกรองคะแนนของ Steam ไม่ใช่คะแนนรีวิว GameMatch</p>
        </>
      ) : <p className="muted">ยังไม่มีคะแนนรีวิวจาก Steam</p>}
    </section>
  );
}
