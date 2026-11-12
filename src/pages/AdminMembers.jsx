import { useEffect, useState } from 'react';
import { api } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import AdminNav from '../components/AdminNav';

export default function AdminMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setMembers(null);
    setError('');
    api('/api/admin/members', { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          if (!Array.isArray(data)) throw new Error('ข้อมูลสมาชิกไม่ถูกต้อง');
          setMembers(data);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [retry]);

  const term = query.trim().toLowerCase();
  const shown = (members || []).filter((m) =>
    (filter === 'all' || m.role === filter) &&
    [m.displayName, m.username, m.email].some((v) => (v || '').toLowerCase().includes(term))
  );
  const nextRole = target?.role === 'admin' ? 'member' : 'admin';

  async function changeRole() {
    if (!target || target.id === user?.id || busy) return;
    setBusy(true);
    setActionError('');
    setNotice('');
    try {
      const updated = await api('/api/admin/members/' + target.id + '/role', {
        method: 'PUT',
        body: { role: nextRole },
      });
      setMembers((items) => items.map((m) => m.id === updated.id ? updated : m));
      setNotice('เปลี่ยนบทบาท ' + updated.displayName + ' เป็น ' + updated.role.toUpperCase() + ' แล้ว');
      setTarget(null);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-banner">
        <span className="eyebrow">ADMIN WORKSPACE</span>
        <h1>จัดการสมาชิก</h1>
        <p className="muted">จัดการบทบาทและสิทธิ์การเข้าถึงระบบของสมาชิก GameMatch</p>
      </div>
      <AdminNav />
      {members && (
        <div className="admin-metrics member-metrics">
          <div><span>บัญชีทั้งหมด</span><strong>{members.length}</strong></div>
          <div><span>Admin</span><strong>{members.filter((m) => m.role === 'admin').length}</strong></div>
          <div><span>Member</span><strong>{members.filter((m) => m.role === 'member').length}</strong></div>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
      {error ? (
        <div className="panel">
          <p role="alert">{error}</p>
          <button type="button" className="secondary" onClick={() => setRetry((n) => n + 1)}>ลองใหม่</button>
        </div>
      ) : members === null ? (
        <p role="status">กำลังโหลดรายชื่อสมาชิก…</p>
      ) : (
        <section className="panel" aria-labelledby="members-heading">
          <div className="member-toolbar">
            <div><h2 id="members-heading">รายชื่อสมาชิก</h2><p className="muted">แสดง {shown.length} จาก {members.length} บัญชี</p></div>
            <label>ค้นหาสมาชิก
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ชื่อ, Username หรืออีเมล" />
            </label>
            <label>บทบาท
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">ทั้งหมด</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </label>
          </div>
          <div className="table-wrap member-table">
            <table>
              <thead><tr><th scope="col">สมาชิก</th><th scope="col">Username</th><th scope="col">บทบาท</th><th scope="col">จัดการ</th></tr></thead>
              <tbody>
                {shown.map((m) => {
                  const isMe = m.id === user?.id;
                  return (
                    <tr key={m.id}>
                      <td><div className="member-identity">
                        <span className="member-avatar" aria-hidden="true">{(m.displayName || m.username || '?').slice(0,1).toUpperCase()}</span>
                        <div><strong>{m.displayName} {isMe && <small className="muted">(คุณ)</small>}</strong><small className="muted">{m.email}</small></div>
                      </div></td>
                      <td>{m.username}</td>
                      <td><span className={'member-role ' + m.role}>{m.role === 'admin' ? 'Admin' : 'Member'}</span></td>
                      <td><button type="button" className={m.role === 'admin' ? 'danger' : 'secondary'} disabled={isMe || busy || Boolean(target)} onClick={() => { setTarget(m); setActionError(''); setNotice(''); }} aria-label={(m.role === 'admin' ? 'ลดเป็น Member: ' : 'เลื่อนเป็น Admin: ') + m.displayName}>
                        {m.role === 'admin' ? 'ลดเป็น Member' : 'เลื่อนเป็น Admin'}
                      </button></td>
                    </tr>
                  );
                })}
                {!shown.length && <tr><td colSpan={4} className="muted">ไม่พบสมาชิกที่ตรงกับคำค้น</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="muted">ไม่สามารถเปลี่ยนบทบาทของบัญชีที่กำลังใช้งานได้</p>
        </section>
      )}
      {target && (
        <div className="member-confirm-overlay">
        <section className="panel member-confirm" role="dialog" aria-modal="true" aria-labelledby="role-confirm-title">
          <h2 id="role-confirm-title">ยืนยันการเปลี่ยนบทบาท</h2>
          <p><strong>{target.displayName}</strong> · {target.email}</p>
          <div className="member-role-change"><span className={'member-role ' + target.role}>{target.role}</span><span aria-hidden="true">→</span><span className={'member-role ' + nextRole}>{nextRole}</span></div>
          <p>{nextRole === 'admin' ? 'บัญชีนี้จะสามารถจัดการเกม สมาชิก และลบรีวิวที่ไม่เหมาะสมได้' : 'บัญชีนี้จะไม่สามารถเข้าถึงหน้าผู้ดูแลระบบหรือจัดการสมาชิกคนอื่นได้อีก'}</p>
          <p className="muted">เมื่อบทบาทเปลี่ยน Session เดิมของบัญชีนี้จะถูกยกเลิก และต้องเข้าสู่ระบบใหม่</p>
          {actionError && <p role="alert">{actionError}</p>}
          <div className="member-confirm-actions">
            <button type="button" className="secondary" disabled={busy} onClick={() => setTarget(null)}>ยกเลิก</button>
            <button type="button" className={nextRole === 'member' ? 'danger' : ''} disabled={busy} onClick={changeRole}>{busy ? 'กำลังบันทึก…' : 'ยืนยันเปลี่ยนบทบาท'}</button>
          </div>
        </section>
        </div>
      )}
    </>
  );
}
