import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminGameForm from '../components/AdminGameForm';
import AdminGameList from '../components/AdminGameList';
import { api } from '../api/backend';
import { utf8Length } from '../utils/validation';
const blank = {
  title: '',
  description: '',
  descriptionTh: '',
  imageUrl: '',
  genres: [],
  tags: [],
  platforms: ['PC'],
  isPublished: true,
};
export default function Admin() {
  const [games, setGames] = useState(null),
    [g, setG] = useState(blank),
    [error, setError] = useState(''),
    [note, setNote] = useState(''),
    [busy, setBusy] = useState(false),
    [steam, setSteam] = useState({ loading: true, configured: false, error: '' }),
    [page, setPage] = useState({ nextAppId: 0, hasMore: false });
  const checkSteam = useCallback(async (signal) => {
    setSteam({ loading: true, configured: false, error: '' });
    try {
      const data = await api('/api/admin/sync/status', { signal });
      if (typeof data?.steamConfigured !== 'boolean') throw new Error('รูปแบบสถานะไม่ถูกต้อง');
      if (!signal?.aborted)
        setSteam({ loading: false, configured: data.steamConfigured, error: '' });
    } catch (e) {
      if (!signal?.aborted) setSteam({ loading: false, configured: false, error: e.message });
    }
  }, []);
  async function importSteam(after = 0) {
    await task(async () => {
      const data = await api('/api/admin/sync/steam' + (after ? '?after=' + after : ''), {
        method: 'POST',
      });
      setPage({ nextAppId: data.nextAppId, hasMore: data.hasMore === true });
      setNote(
        `นำเข้าจาก Steam ${data.imported} เกมแล้ว` +
          (data.hasMore ? ' กดนำเข้าชุดถัดไปเพื่อดึงต่อ' : ' ตรวจครบรายการแล้ว'),
      );
    });
  }
  async function load() {
    setGames(await api('/api/admin/games'));
  }
  useEffect(() => {
    const controller = new AbortController();
    checkSteam(controller.signal);
    api('/api/admin/games', { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setGames(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [checkSteam]);
  async function task(fn) {
    setBusy(true);
    setError('');
    setNote('');
    let completed = false;
    try {
      if (fn) {
        await fn();
        completed = true;
      }
      await load();
    } catch (e) {
      setError(
        completed ? 'ดำเนินการสำเร็จแล้ว แต่โหลดรายการล่าสุดไม่ได้: ' + e.message : e.message,
      );
    } finally {
      setBusy(false);
    }
  }
  async function save(e) {
    e.preventDefault();
    const title = g.title.trim();
    if (!title || utf8Length(title) > 250) {
      setNote('');
      setError('กรุณาระบุชื่อเกมไม่เกิน 250 ไบต์ ภาษาไทยนับหลายไบต์ต่อตัว');
      return;
    }
    const imageUrl = g.imageUrl.trim();
    if (imageUrl) {
      try {
        const url = new URL(imageUrl);
        if (url.protocol !== 'https:' || !url.hostname) throw new Error();
      } catch {
        setNote('');
        setError('รูปต้องเป็น HTTPS URL');
        return;
      }
    }
    // ทำความสะอาดตอน submit เสมอ แม้ผู้ใช้กด Enter โดยไม่ blur ช่องข้อมูล
    const list = (values) => values.map((value) => value.trim()).filter(Boolean);
    const body = {
      title,
      description: g.description,
      descriptionTh: g.descriptionTh.trim(),
      imageUrl,
      genres: list(g.genres),
      tags: list(g.tags),
      platforms: list(g.platforms),
      isPublished: g.isPublished,
    };
    await task(async () => {
      await api('/api/admin/games' + (g.id ? '/' + g.id : ''), {
        method: g.id ? 'PUT' : 'POST',
        body,
      });
      setG(blank);
      setNote('บันทึกข้อมูลแล้ว');
    });
  }
  function remove(game) {
    if (window.confirm(`ลบ ${game.title}?`)) {
      task(async () => {
        await api('/api/admin/games/' + game.id, { method: 'DELETE' });
        if (g.id === game.id) setG(blank);
        setNote('ลบเกมแล้ว');
      });
    }
  }
  function edit(game) {
    const { matchScore, reasons, ...data } = game;
    setG({ ...data, descriptionTh: data.descriptionTh || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  return (
    <AdminLayout header={
      <div className="section-head">
        <div>
          <h1>จัดการคลังเกม</h1>
        </div>
        <div className="admin-sync-actions">
          <button
            disabled={busy || games === null || !steam.configured || steam.loading}
            onClick={() => importSteam()}
          >
            นำเข้าเกม Steam
          </button>
          {page.hasMore && (
            <button
              className="secondary"
              disabled={busy || games === null || !steam.configured || steam.loading}
              onClick={() => importSteam(page.nextAppId)}
            >
              นำเข้าชุดถัดไป
            </button>
          )}
        </div>
      </div>
      }>
      {games && (
        <div className="admin-metrics">
          <div><span>เกมทั้งหมด</span><strong>{games.length}</strong></div>
          <div><span>เผยแพร่แล้ว</span><strong>{games.filter((item) => item.isPublished).length}</strong></div>
          <div><span>ซ่อนอยู่</span><strong>{games.filter((item) => !item.isPublished).length}</strong></div>
          <div><span>คำอธิบายไทย</span><strong>{games.filter((item) => item.descriptionTh).length}</strong></div>
        </div>
      )}
      <p className="muted">
        นำเข้ารายชื่อเกมจาก Steam Web API ทีละไม่เกิน 12 รายการ เรียงตาม AppID
        แล้วเติมรูปและรายละเอียดจาก Steam Store โดยคงคำอธิบายและสถานะเผยแพร่ที่ผู้ดูแลแก้ไว้
        จำนวนที่นำเข้าอาจน้อยกว่า 12 เกมตามข้อมูลที่พร้อมใช้งาน
      </p>
      <div className="panel">
        <p aria-live="polite">
          {steam.loading
            ? 'กำลังตรวจสอบการตั้งค่า Steam…'
            : steam.error
              ? `ตรวจสอบสถานะ Steam ไม่สำเร็จ: ${steam.error}`
              : steam.configured
                ? 'ตั้งค่า Steam API key แล้ว (การนำเข้าขึ้นอยู่กับสิทธิ์และการตอบกลับของ Steam)'
                : 'ยังไม่ได้ตั้งค่า STEAM_API_KEY บน Backend'}
        </p>
        <button
          type="button"
          className="secondary"
          disabled={busy || steam.loading}
          onClick={() => checkSteam()}
        >
          ตรวจสอบสถานะ Steam อีกครั้ง
        </button>
        <details>
          <summary>วิธีตั้งค่า Steam API key</summary>
          <p>
            ขอ key จาก{' '}
            <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noreferrer">
              Steam Web API
            </a>
            แล้วตั้ง STEAM_API_KEY ในไฟล์ .env ของ Backend หรือ Environment Variables ของโฮสต์
            จากนั้นรีสตาร์ต Backend และกดตรวจสอบสถานะอีกครั้ง เก็บ key ไว้ฝั่ง Backend เท่านั้น
          </p>
        </details>
      </div>
      {error && <p role="alert">{error}</p>}
      {error && (
        <button className="secondary" disabled={busy} onClick={() => task()}>
          โหลดรายการอีกครั้ง
        </button>
      )}
      {note && <p role="status">{note}</p>}
      <AdminGameForm g={g} setG={setG} busy={busy} loading={games === null} onSave={save} onReset={() => setG(blank)} />
      {games ? (
        <AdminGameList games={games} busy={busy} onEdit={edit} onDelete={remove} />
      ) : (
        !error && <p role="status">กำลังโหลด…</p>
      )}
    </AdminLayout>
  );
}
