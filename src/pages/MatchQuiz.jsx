import { useEffect, useState } from 'react';
import { api } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import GameGrid from '../components/GameGrid';
import { Link } from 'react-router-dom';
import { genreLabel } from '../utils/gameLabels';
const fields = [
  [
    'genre',
    'แนวเกม',
    [
      ['rpg', 'RPG'],
      ['action', 'Action'],
      ['strategy', 'Strategy'],
      ['simulation', 'Simulation'],
      ['adventure', 'Adventure'],
      ['indie', 'Indie'], ['casual', 'Casual'], ['sports', 'Sports'], ['racing', 'Racing'],
      ['massively-multiplayer', 'MMO'], ['early-access', 'Early Access'], ['free-to-play', 'Free to Play'],
      ['fps', 'FPS'], ['survival', 'Survival'], ['horror', 'Horror'], ['puzzle', 'Puzzle'], ['moba', 'MOBA'],
    ],
  ],
  [
    'mode',
    'รูปแบบการเล่น',
    [
      ['solo', 'เล่นคนเดียว'],
      ['coop', 'ร่วมมือกับเพื่อน'],
      ['pvp', 'แข่งขันกับผู้เล่น'],
    ],
  ],
  [
    'style',
    'สไตล์การเล่น',
    [
      ['story', 'เนื้อเรื่อง'],
      ['competitive', 'แข่งขัน'],
      ['relax', 'ผ่อนคลาย'],
      ['challenge', 'ความท้าทาย'],
    ],
  ],
];
export default function MatchQuiz() {
  const { user, loading } = useAuth(),
    [p, setP] = useState({ genre: 'rpg', mode: 'solo', style: 'story' }),
    [step, setStep] = useState(0),
    [games, setGames] = useState(null),
    [busy, setBusy] = useState(false),
    [saving, setSaving] = useState(false),
    [restoring, setRestoring] = useState(Boolean(user?.id)),
    [error, setError] = useState(''),
    [note, setNote] = useState('');
  const memberID = user?.id;
  const formBusy = loading || busy || saving || restoring;
  useEffect(() => {
    let active = true;
    setP({ genre: 'rpg', mode: 'solo', style: 'story' });
    setGames(null);
    setStep(0);
    setNote('');
    setError('');
    setRestoring(Boolean(memberID));
    if (memberID)
      api('/api/me/preferences')
        .then((d) => {
          if (active) setP(d);
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setRestoring(false);
        });
    return () => {
      active = false;
    };
  }, [memberID]);
  async function run(e) {
    e.preventDefault();
    if (step < fields.length - 1) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    setError('');
    setGames(null);
    setNote('');
    try {
      setGames(await api('/api/recommendations', { method: 'POST', body: p }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setSaving(true);
    setError('');
    setNote('');
    try {
      await api('/api/me/preferences', { method: 'PUT', body: p });
      setNote('บันทึกความชอบแล้ว');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="page-banner">
        <span className="eyebrow">PERSONAL MATCH</span>
        <h1>แนะนำเกม</h1>
        <p className="muted">เลือกแนวเกม วิธีเล่น และสิ่งที่คุณชอบ แล้วดูเกมที่ตรงกับตัวเลือกของคุณ</p>
        <div className="quiz-weights" aria-label="สัดส่วนคะแนนจับคู่">
          <span><b>45%</b> แนวเกม</span><span><b>25%</b> รูปแบบการเล่น</span><span><b>30%</b> สไตล์</span>
        </div>
      </div>
      {loading && <p role="status">กำลังตรวจสอบบัญชี…</p>}
      {!loading && restoring && <p role="status">กำลังโหลดความชอบที่บันทึกไว้…</p>}
      <form onSubmit={run} className="panel quiz-panel" aria-busy={formBusy}>
        <div className="finder-progress">
          <span className="eyebrow">GAME FINDER</span>
          <span className="muted">คำถาม {step + 1} / {fields.length}</span>
        </div>
        <div className="finder-track" aria-hidden="true"><div style={{ width: ((step + 1) / fields.length * 100) + '%' }} /></div>
        <div className="finder-steps">
          {fields.map(([key, label, options], i) => (
            <button key={key} type="button" disabled={formBusy || i > step} className="secondary" aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)}>
              {i + 1}. {label}<small>{key === 'genre' ? genreLabel(p[key]) : options.find(([v]) => v === p[key])?.[1]}</small>
            </button>
          ))}
        </div>
        {fields.filter((_, i) => i === step).map(([key, label, options]) => (
          <fieldset className="finder-question" key={key} disabled={formBusy}>
            <legend>{['คุณชอบเกมแนวไหน?', 'ปกติคุณเล่นกับใคร?', 'คุณอยากได้ประสบการณ์แบบไหน?'][step]}</legend>
            <p className="muted">เลือก {label} ที่ตรงกับคุณมากที่สุด</p>
            <div className="finder-options">
              {options.map(([v, text]) => (
                <label key={v} className={p[key] === v ? 'finder-option selected' : 'finder-option'}>
                  <input type="radio" name={key} value={v} checked={p[key] === v}
                    onChange={() => { setP({ ...p, [key]: v }); setNote(''); setGames(null); }} />
                  <span>{key === 'genre' ? genreLabel(v) : text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="finder-actions">
          <button type="button" className="secondary" disabled={formBusy || step === 0} onClick={() => setStep(step - 1)}>ย้อนกลับ</button>
          <button disabled={formBusy}>{step < fields.length - 1 ? 'ถัดไป' : busy ? 'กำลังจับคู่…' : 'แนะนำเกมให้ฉัน'}</button>
          {user && step === fields.length - 1 && (
            <button type="button" className="secondary" onClick={save} disabled={formBusy}>
              {saving ? 'กำลังบันทึก…' : 'บันทึกความชอบ'}
            </button>
          )}
        </div>
      </form>
      {!loading && !user && (
        <p className="muted">
          <Link className="inline-link" to="/login" state={{ from: '/match' }}>
            เข้าสู่ระบบ
          </Link>{' '}
          เพื่อบันทึกความชอบไว้ใช้ครั้งต่อไป
        </p>
      )}
      <details className="match-explainer">
        <summary>คะแนนคิดอย่างไร?</summary>
        <p className="muted">
          เทียบกับข้อมูลเกม: แนวเกม 45 + รูปแบบการเล่น 25 + สไตล์ 30 คะแนน
          หากไม่มีข้อมูลที่ยืนยันได้จะไม่ได้คะแนนในส่วนนั้น
        </p>
      </details>
      {note && <p role="status">{note}</p>}
      {error && <p role="alert">{error}</p>}
      {games !== null && (
        <section className="match-results" aria-labelledby="match-results-heading">
          <h2 id="match-results-heading">ผลลัพธ์สำหรับคุณ</h2>
          <p className="muted">
            คะแนนแสดงความตรงกับตัวเลือกจากข้อมูลเกม ไม่ใช่การรับประกันว่าจะชอบเกม
          </p>
          {games.length > 0 && <div className="finder-best"><strong>อันดับ 1 · {games[0].matchScore}/100</strong> <span>เกมที่ตรงกับคำตอบของคุณที่สุดจากผลลัพธ์นี้</span></div>}
          <GameGrid games={games} />
        </section>
      )}
    </>
  );
}
