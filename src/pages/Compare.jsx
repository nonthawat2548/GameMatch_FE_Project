import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/backend';
import { genreLabel, tagLabel } from '../utils/gameLabels';
import { gameDate, gameSource } from '../utils/gameSource';

export default function Compare() {
  const { search } = useLocation();
  const [games, setGames] = useState(null);
  const [selected, setSelected] = useState(['', '', '']);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    setSelected([new URLSearchParams(search).get('game') || '', '', '']);
  }, [search]);
  useEffect(() => {
    const c = new AbortController();
    setError('');
    setGames(null);
    api('/api/games', { signal: c.signal }).then((data) => {
      if (!c.signal.aborted) setGames(data);
    }).catch((e) => {
      if (!c.signal.aborted && e.name !== 'AbortError') setError(e.message);
    });
    return () => c.abort();
  }, [retry]);
  const sorted = [...(games || [])].sort((a, b) => a.title.localeCompare(b.title));
  const chosen = selected.map((id) => sorted.find((g) => String(g.id) === id)).filter(Boolean);
  function update(index, id) {
    if (id && selected.some((v, i) => i !== index && v === id)) return;
    setSelected((prev) => prev.map((v, i) => i === index ? id : v));
  }
  function list(values, label = (x) => x) {
    return values?.length ? values.map(label).join(' · ') : 'ไม่พบข้อมูล';
  }
  function mode(g, options) {
    return options.some((tag) => g.tags?.includes(tag)) ? 'เล่นได้' : 'ยังไม่แน่ใจ';
  }
  const rows = [
    ['แนวเกม', (g) => list(g.genres, genreLabel)],
    ['เล่นบน', (g) => list(g.platforms)],
    ['เล่นคนเดียว', (g) => mode(g, ['singleplayer', 'single-player'])],
    ['เล่นกับเพื่อน', (g) => mode(g, ['co-op', 'online-co-op', 'local-co-op', 'co-op-campaign', 'cooperative'])],
    ['เล่นแข่งกับคนอื่น (PvP)', (g) => mode(g, ['pvp', 'online-pvp', 'local-pvp'])],
    ['เล่นฟรี', (g) => g.genres?.includes('free-to-play') || g.tags?.includes('free-to-play') ? 'เล่นฟรี' : 'ยังไม่แน่ใจ'],
    ['วันวางจำหน่าย', (g) => gameDate(g.releaseDate) || 'ไม่พบข้อมูล'],
    ['จุดเด่นของเกม', (g) => list(g.tags, tagLabel)],
    ['คำอธิบาย', (g) => g.descriptionTh || g.description || 'ยังไม่มีคำอธิบาย'],
  ];
  return (
    <>
      <div className="page-banner">
        <h1>เปรียบเทียบเกม</h1>
        <p className="muted">เลือก 2–3 เกมเพื่อเปรียบเทียบข้อมูล</p>
      </div>
      {error ? <div><p role="alert">{error}</p><button onClick={() => setRetry((n) => n + 1)}>ลองใหม่</button></div> : !games ? <p role="status">กำลังโหลดคลังเกม…</p> : (
        <>
          <div className="panel compare-selects">
            {selected.map((id, i) => (
              <label key={i}>เกมที่ {i + 1}
                <select aria-label={`เกมที่ ${i + 1}`} value={sorted.some((g) => String(g.id) === id) ? id : ''} onChange={(e) => update(i, e.target.value)}>
                  <option value="">เลือกเกม</option>
                  {sorted.map((g) => <option key={g.id} value={g.id} disabled={selected.some((v, n) => n !== i && v === String(g.id))}>{g.title}</option>)}
                </select>
              </label>
            ))}
            <button className="secondary" type="button" onClick={() => setSelected(['', '', ''])}>ล้างการเลือก</button>
          </div>
          {chosen.length < 2 ? <p className="empty">เลือกอย่างน้อย 2 เกมเพื่อเริ่มเปรียบเทียบ</p> : (
            <div className="panel table-wrap compare-table">
              <table>
                <thead><tr><th scope="col">ข้อมูลเกม</th>{chosen.map((g) => (
                  <th scope="col" key={g.id}>
                    {g.imageUrl && <img src={g.imageUrl} alt="" onError={(e) => { e.currentTarget.hidden = true; }} />}
                    <Link to={'/games/' + g.id}>{g.title}</Link>
                    {gameSource(g) && <a className="source-link" href={gameSource(g).href} target="_blank" rel="noreferrer">ข้อมูลจาก {gameSource(g).name} ↗</a>}
                  </th>
                ))}</tr></thead>
                <tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{chosen.map((g) => <td key={g.id}>{value(g)}</td>)}</tr>)}</tbody>
              </table>
              <p className="muted">คำว่า ‘ยังไม่แน่ใจ’ หมายถึงเรายังไม่มีข้อมูลยืนยัน ไม่ได้แปลว่าเกมเล่นแบบนั้นไม่ได้</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
