import { useEffect, useState } from 'react';
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

function ReviewCard({ item, own, canDelete, busy, onEdit, onDelete, voted, onVote, voteReady, voteBusy, returnTo, user }) {
  const name = item.displayName || 'สมาชิก';
  return (
    <article className={`review-card${own ? ' review-own' : ''}`}>
      <div className="review-heading">
        <div className="review-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div>
        <div className="review-author">
          <strong>{name}</strong><small className="muted review-member">สมาชิก GameMatch</small>
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
      {!own && item.helpfulCount !== undefined && <div className="review-helpful"><span className="muted">รีวิวนี้มีประโยชน์ไหม?</span>{user ? <button className="secondary" aria-pressed={voted} disabled={!voteReady||voteBusy} onClick={()=>onVote(item)}>👍 มีประโยชน์ {item.helpfulCount}</button> : <Link className="button secondary" to="/login" state={{from:returnTo}}>👍 มีประโยชน์ {item.helpfulCount}</Link>}</div>}
      {(own || canDelete) && (
        <div className="review-actions">
          {own && <button type="button" className="review-secondary" disabled={busy} onClick={() => onEdit(item)}>แก้ไขรีวิว</button>}
          {canDelete && <button type="button" className="review-delete" disabled={busy} onClick={() => onDelete(item)}>ลบรีวิว</button>}
        </div>
      )}
    </article>
  );
}

export default function GameReviews({ gameId, user, reviews, setReviews, loading, loadError, onRetry, returnTo = '/games/' + gameId, autoWrite = false }) {
  const [rating, setRating] = useState(5);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [writing, setWriting] = useState(false);
  const [votedIDs,setVotedIDs]=useState([]);
  const [voteReady,setVoteReady]=useState(false);
  const [voteBusy,setVoteBusy]=useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const own = user ? reviews.find((r) => r.memberId === user.id) : undefined;
  const others = reviews.filter((r) => r.id !== own?.id);
  const counts = [5, 4, 3, 2, 1].map(n => reviews.filter(r => r.rating === n).length);
  const shown = others.filter(r => filter === 'all' || r.rating === Number(filter)).sort((a,b) => {
    const recent = (b.createdAt || '').localeCompare(a.createdAt || '') || b.id - a.id;
    return sort === 'highest' ? b.rating - a.rating || recent : sort === 'lowest' ? a.rating - b.rating || recent : recent;
  });
  const average = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '—';
  const base = '/api/games/' + gameId + '/reviews';
  const commentLength = characterCount(comment.trim());
  const commentValid = commentLength >= 10 && utf8Length(comment.trim()) <= 2000;

  useEffect(()=>{
    if(autoWrite&&user&&!loading&&!loadError&&!own)setWriting(true);
  },[autoWrite,user,loading,loadError,own]);
  const hasVotes=reviews.some(r=>r.helpfulCount!==undefined);
  useEffect(()=>{
    if(!user||!hasVotes)return;
    const c=new AbortController();
    api('/api/me/review-votes/'+gameId,{signal:c.signal}).then(ids=>{if(!c.signal.aborted){setVotedIDs(Array.isArray(ids)?ids:[]);setVoteReady(true);}}).catch(()=>{if(!c.signal.aborted)setError('ยังโหลดสถานะโหวตไม่ได้');});
    return()=>c.abort();
  },[user,gameId,hasVotes]);
  async function vote(item){
    if(!voteReady||voteBusy)return;
    setVoteBusy(true);setError('');
    try{
      const result=await api(base+'/'+item.id+'/helpful',{method:votedIDs.includes(item.id)?'DELETE':'PUT'});
      setVotedIDs(ids=>result.voted?[...new Set([...ids,item.id])]:ids.filter(id=>id!==item.id));
      setReviews(items=>items.map(r=>r.id===item.id?{...r,helpfulCount:result.helpfulCount}:r));
    }catch(e){setError(e.message);}finally{setVoteBusy(false);}
  }
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
        ? current.map((r) => r.id === saved.id ? { ...saved, helpfulCount: r.helpfulCount ?? saved.helpfulCount } : r)
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
        user={user} returnTo={returnTo} voted={votedIDs.includes(item.id)} voteReady={voteReady} voteBusy={voteBusy} onVote={vote}
        onEdit={begin} onDelete={(target) => { setDeleteTarget(target); setError(''); setNotice(''); }} />
    );
  }

  return (
    <section className="reviews community-reviews" aria-labelledby="reviews-heading">
      <div className="community-review-heading">
        <div><h2 id="reviews-heading">รีวิวจากผู้เล่น GameMatch</h2><p className="muted">คะแนนจากสมาชิกเว็บไซต์ แยกจากคะแนน Steam</p></div>
        {!loading && !loadError && !own && !writing && !deleteTarget && user && <button type="button" onClick={() => begin(null)}>เขียนรีวิว</button>}
      </div>
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
              <div className="review-average"><strong>{average}</strong>{reviews.length > 0 && <span>/5</span>}</div>
              <Stars rating={reviews.length ? Math.round(Number(average)) : 0} />
              <span className="muted">{reviews.length} รีวิว</span>
              {!reviews.length && <span className="muted">ยังไม่มีคะแนน</span>}
            </div>
            <div className="review-breakdown">
              {[5, 4, 3, 2, 1].map((n, i) => {
                const count = counts[i];
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
                  disabled={busy} placeholder="ความคิดเห็นของคุณหลังเล่นเกมนี้" rows={4} />
              </label>
              <p className="muted form-hint">เขียนอย่างน้อย 10 ตัวอักษร · {commentLength} ตัวอักษร{utf8Length(comment.trim()) > 2000 ? ' · ข้อความยาวเกินไป' : ''}</p>
              <div className="review-actions">
                <button disabled={busy || !commentValid}>{busy ? 'กำลังบันทึก…' : editing ? 'บันทึกการแก้ไข' : 'ส่งรีวิว'}</button>
                <button type="button" className="review-secondary" disabled={busy} onClick={() => { setWriting(false); setEditing(false); setError(''); }}>ยกเลิก</button>
              </div>
            </form>
          )}
          {!user && <div className="review-signin"><span>เคยเล่นเกมนี้แล้วหรือยัง? มาเขียนรีวิวแบ่งปันเพื่อน ๆ กัน</span><Link className="button secondary" to="/login" state={{ from: returnTo, intent:'review' }}>เขียนรีวิว</Link></div>}
          <div className="review-list-toolbar">
            <h3 className="review-list-title">รีวิว{own ? 'จากสมาชิกคนอื่น' : 'ทั้งหมด'} ({shown.length})</h3>
            {others.length > 0 && <div className="review-filters">
              <label>คะแนน<select value={filter} onChange={e => setFilter(e.target.value)} aria-label="กรองคะแนนรีวิว">
                <option value="all">ทุกคะแนน</option>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ดาว</option>)}
              </select></label>
              <label>เรียงตาม<select value={sort} onChange={e => setSort(e.target.value)} aria-label="เรียงรีวิว">
                <option value="newest">ล่าสุด</option><option value="highest">คะแนนสูงสุด</option><option value="lowest">คะแนนต่ำสุด</option>
              </select></label>
            </div>}
          </div>
          {shown.length ? <div className="review-list">{shown.map(card)}</div> : (
            <p className="muted review-empty">{others.length ? 'ไม่มีรีวิวที่ตรงกับตัวกรอง' : own ? 'ยังไม่มีรีวิวจากผู้เล่นคนอื่น' : 'ยังไม่มีรีวิว เป็นคนแรกที่รีวิวเกมนี้'}</p>
          )}
        </>
      )}
    </section>
  );
}
