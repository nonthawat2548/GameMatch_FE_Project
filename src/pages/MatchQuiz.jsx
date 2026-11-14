import { useEffect, useState } from 'react';
import { getPreferences, recommendGames, savePreferences } from '../api/endpoints';
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
    'เล่นกับใคร',
    [
      ['solo', 'เล่นคนเดียว'],
      ['coop', 'เล่นกับเพื่อน (Co-op)'],
      ['pvp', 'เล่นแข่งกับคนอื่น (PvP)'],
    ],
  ],
  [
    'style',
    'ฟีลเกมที่ชอบ',
    [
      ['story', 'เน้นเนื้อเรื่อง'],
      ['competitive', 'เน้นแข่งขัน'],
      ['relax', 'เล่นชิล ๆ'],
      ['challenge', 'ชอบเกมยาก ๆ'],
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
      getPreferences()
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
      setGames(await recommendGames(p));
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
      await savePreferences(p);
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
        <h1>แนะนำเกม</h1>
        <p className="muted">เลือกแนวเกม รูปแบบการเล่น และสิ่งที่ชอบ</p>
        <div className="quiz-weights" aria-label="สัดส่วนคะแนนจับคู่">
          <span><b>45%</b> แนวเกม</span><span><b>25%</b> เล่นกับใคร</span><span><b>30%</b> ฟีลเกม</span>
        </div>
      </div>
      {loading && <p role="status">กำลังตรวจสอบบัญชี…</p>}
      {!loading && restoring && <p role="status">กำลังโหลดความชอบที่บันทึกไว้…</p>}
      <form onSubmit={run} className="panel quiz-panel" aria-busy={formBusy}>
        <div className="finder-progress">
          <strong>{fields[step][1]}</strong>
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
            <legend>{['คุณชอบเกมแนวไหน?', 'ปกติคุณเล่นกับใคร?', 'เวลาเล่นเกม ชอบอะไรที่สุด?'][step]}</legend>
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
          <button disabled={formBusy}>{step < fields.length - 1 ? 'ถัดไป' : busy ? 'กำลังหาเกมให้คุณ…' : 'แนะนำเกมให้ฉัน'}</button>
          {user && step === fields.length - 1 && (
            <button type="button" className="secondary" onClick={save} disabled={formBusy}>
              {saving ? 'กำลังบันทึก…' : 'บันทึกความชอบ'}
            </button>
          )}
        </div>
      </form>
      {!loading && !user && (
        <p className="muted match-login-hint">
          <Link className="inline-link" to="/login" state={{ from: '/match' }}>
            เข้าสู่ระบบ
          </Link>{' '}
          ไว้เก็บคำตอบของคุณ ไม่ต้องเลือกใหม่ครั้งหน้า
        </p>
      )}
      <details className="match-explainer">
        <summary>คะแนนคิดอย่างไร?</summary>
        <p className="muted">
          คะแนนเต็ม 100 มาจากแนวเกม 45 คะแนน เล่นกับใคร 25 คะแนน และฟีลเกม 30 คะแนน
          ถ้าเราไม่มีข้อมูลว่าเกมตรงกับคำตอบข้อนั้น ก็จะไม่ให้คะแนนเพิ่ม
        </p>
      </details>
      {note && <p role="status">{note}</p>}
      {error && <p role="alert">{error}</p>}
      {games !== null && (
        <section className="match-results" aria-labelledby="match-results-heading">
          <h2 id="match-results-heading">เกมที่น่าจะถูกใจคุณ</h2>
          <p className="muted">
            เรียงตามคะแนนความตรงกับคำตอบของคุณ
          </p>
          {games.length > 0 && <div className="finder-best"><strong>อันดับ 1 · {games[0].matchScore}/100</strong> <span>เกมนี้ตรงกับคำตอบของคุณมากที่สุด</span></div>}
          <GameGrid games={games} emptyText="ยังไม่มีเกมที่ตรงเงื่อนไข ลองเปลี่ยนคำตอบดูนะ" />
        </section>
      )}
    </>
  );
}
