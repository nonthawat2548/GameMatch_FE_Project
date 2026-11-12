import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/backend';
import { characterCount, utf8Length } from '../utils/validation';

function Stars({ rating }) {
  return (
    <span className="review-stars" aria-label={`คะแนน ${rating} จาก 5`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

function ReviewCard({ item, own, canDelete, busy, onEdit, onDelete }) {
  const name = item.displayName || 'สมาชิก';
  return (
    <article className={`review-card${own ? ' review-own' : ''}`}>
      <div className="review-heading">
        <div className="review-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div>
        <div className="review-author">
          <strong>{name}</strong>
          {own && <span className="review-you">คุณ</span>}
          <div><Stars rating={item.rating} /> <span className="muted">{item.rating}/5</span></div>
        </div>
        {item.createdAt && (
          <time className="muted" dateTime={item.createdAt}>
            {new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
          </time>
        )}
      </div>
      <p className="review-comment">{item.comment}</p>
      {(own || canDelete) && (
        <div className="review-actions">
          {own && <button type="button" className="review-secondary" disabled={busy} onClick={() => onEdit(item)}>แก้ไขรีวิว</button>}
          {canDelete && <button type="button" className="review-delete" disabled={busy} onClick={() => onDelete(item)}>ลบรีวิว</button>}
        </div>
      )}
    </article>
  );
}

export default function GameReviews({ gameId, user, reviews, setReviews, loading, loadError, onRetry }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const own = user ? reviews.find((r) => r.memberId === user.id) : undefined;
  const others = reviews.filter((r) => r.id !== own?.id);
  const average = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '—';
  const base = '/api/games/' + gameId + '/reviews';
  const commentLength = characterCount(comment.trim());
  const commentValid = commentLength >= 10 && utf8Length(comment.trim()) <= 2000;

  function begin(item) {
    setEditing(Boolean(item));
    setWriting(true);
    setRating(item ? item.rating : 5);
    setComment(item ? item.comment : '');
    setError('');
    setNotice('');
    setDeleteTarget(null);
  }

  async function submit(e) {
    e.preventDefault();
    if (busy || !commentValid || (editing && !own)) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const saved = await api(editing ? base + '/' + own.id : base, {
        method: editing ? 'PUT' : 'POST',
        body: { rating, comment: comment.trim() },
      });
      setReviews((current) => editing
        ? current.map((r) => r.id === saved.id ? saved : r)
        : [saved, ...current.filter((r) => r.id !== saved.id)]);
      setWriting(false);
      setEditing(false);
      setComment('');
      setNotice(editing ? 'บันทึกการแก้ไขแล้ว' : 'โพสต์รีวิวแล้ว');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy || !deleteTarget) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api(base + '/' + deleteTarget.id, { method: 'DELETE' });
      setReviews((current) => current.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      setWriting(false);
      setEditing(false);
      setNotice('ลบรีวิวแล้ว');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function card(item) {
    return (
      <ReviewCard key={item.id} item={item} own={item.id === own?.id}
        canDelete={Boolean(user && (item.memberId === user.id || user.role === 'admin'))}
        busy={busy || writing || Boolean(deleteTarget)}
        onEdit={begin} onDelete={(target) => { setDeleteTarget(target); setError(''); setNotice(''); }} />
    );
  }

  return (
    <section className="panel reviews" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading">รีวิวจากผู้เล่น</h2>
      {loading ? (
        <p role="status">กำลังโหลดรีวิว…</p>
      ) : loadError ? (
        <div className="review-feedback">
          <p role="alert">{loadError}</p>
          <button type="button" onClick={onRetry}>ลองโหลดรีวิวใหม่</button>
        </div>
      ) : (
        <>
          <div className="review-summary">
            <div className="review-score">
              <strong>{average}</strong>
              <Stars rating={reviews.length ? Math.round(Number(average)) : 0} />
              <span className="muted">{reviews.length} รีวิว</span>
            </div>
            <div className="review-breakdown">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = reviews.filter((r) => r.rating === n).length;
                return (
                  <div className="review-bar-row" key={n}>
                    <span>{n} ดาว</span>
                    <div className="review-track"><div style={{ width: reviews.length ? (count / reviews.length * 100) + '%' : '0%' }} /></div>
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {notice && <p role="status">{notice}</p>}
          {error && <p role="alert">{error}</p>}
          {deleteTarget && (
            <div className="review-confirm" role="group" aria-label="ยืนยันการลบรีวิว">
              <p>ลบรีวิวนี้เลยไหม? ลบแล้วเอากลับมาไม่ได้นะ</p>
              <div className="review-actions">
                <button type="button" className="review-delete" disabled={busy} onClick={remove}>{busy ? 'กำลังลบ…' : 'ยืนยันลบ'}</button>
                <button type="button" className="review-secondary" disabled={busy} onClick={() => { setDeleteTarget(null); setError(''); }}>ยกเลิก</button>
              </div>
            </div>
          )}
          {own && <div className="review-mine"><h3>รีวิวของคุณ</h3>{card(own)}</div>}
          {user && !own && !writing && !deleteTarget && (
            <button type="button" onClick={() => begin(null)}>เขียนรีวิว</button>
          )}
          {user && writing && (
            <form className="review-form" onSubmit={submit}>
              <h3>{editing ? 'แก้ไขรีวิวของคุณ' : 'เขียนรีวิว'}</h3>
              <fieldset disabled={busy}>
                <legend>คะแนน</legend>
                <div className="review-rating-picker">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} aria-label={`ให้คะแนน ${n} ดาว`} aria-pressed={rating === n}
                      className={n <= rating ? 'star-selected' : ''} onClick={() => setRating(n)}>★</button>
                  ))}
                  <span>{rating}/5</span>
                </div>
              </fieldset>
              <label>ความคิดเห็น
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} required maxLength={2000}
                  disabled={busy} placeholder="เล่นแล้วเป็นยังไงบ้าง? สนุกไหม มีอะไรอยากบอกคนอื่น?" rows={4} />
              </label>
              <p className="muted form-hint">เขียนอย่างน้อย 10 ตัวอักษร · {commentLength} ตัวอักษร{utf8Length(comment.trim()) > 2000 ? ' · ข้อความยาวเกินไป' : ''}</p>
              <div className="review-actions">
                <button disabled={busy || !commentValid}>{busy ? 'กำลังบันทึก…' : editing ? 'บันทึกการแก้ไข' : 'ส่งรีวิว'}</button>
                <button type="button" className="review-secondary" disabled={busy} onClick={() => { setWriting(false); setEditing(false); setError(''); }}>ยกเลิก</button>
              </div>
            </form>
          )}
          {!user && <p><Link to="/login" state={{ from: '/games/' + gameId }}>เข้าสู่ระบบ</Link> เพื่อเขียนรีวิว</p>}
          <h3 className="review-list-title">รีวิวจากผู้เล่น{own ? 'คนอื่น' : 'ทั้งหมด'} ({others.length})</h3>
          {others.length ? <div className="review-list">{others.map(card)}</div> : (
            <p className="muted">{own ? 'ยังไม่มีรีวิวจากผู้เล่นคนอื่น' : 'ยังไม่มีรีวิว เป็นคนแรกที่รีวิวเกมนี้'}</p>
          )}
        </>
      )}
    </section>
  );
}
