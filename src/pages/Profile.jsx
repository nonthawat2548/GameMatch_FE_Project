import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { updateProfile, changePassword } from '../api/endpoints';
import { passwordError, characterCount } from '../utils/validation';
import { TOKEN_KEY } from '../auth/session';
export default function Profile() {
  const { user, refresh, logout } = useAuth(),
    [name, setName] = useState(user.displayName),
    [currentPassword, setCurrentPassword] = useState(''),
    [newPassword, setNewPassword] = useState(''),
    [note, setNote] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    nav = useNavigate();
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setNote('');
    const displayName = name.trim();
    if (!displayName || characterCount(displayName) > 50) {
      setError('กรุณาระบุชื่อที่แสดง ไม่เกิน 50 ตัวอักษร');
      setBusy(false);
      return;
    }
    try {
      await updateProfile(displayName);
      await refresh();
      setNote('บันทึกชื่อแล้ว');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function password(e) {
    e.preventDefault();
    if (busy) return;
    const token = localStorage.getItem(TOKEN_KEY);
    setBusy(true);
    setError('');
    setNote('');
    const validationError = passwordError(newPassword);
    if (validationError) {
      setError(validationError);
      setBusy(false);
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      if (localStorage.getItem(TOKEN_KEY) !== token) return;
      nav('/login', {
        replace: true,
        state: {
          from: '/me/profile',
          notice: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
        },
      });
      await logout().catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-banner profile-banner">
        <div className="profile-avatar" aria-hidden="true">{(user.displayName || 'G').slice(0, 1).toUpperCase()}</div>
        <div>
          <h1>โปรไฟล์</h1>
          <p className="muted">{user.email?.endsWith('@local.invalid') ? user.username : user.email} · {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}</p>
        </div>
      </div>
      <div className="profile-forms">
        <form className="panel" onSubmit={save} aria-busy={busy}>
          <fieldset disabled={busy}>
            <h2>ข้อมูลส่วนตัว</h2>
            <label>
              ชื่อที่แสดง
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <button disabled={busy}>บันทึกโปรไฟล์</button>
          </fieldset>
        </form>
        <form className="panel" onSubmit={password} aria-busy={busy}>
          <fieldset disabled={busy}>
            <h2>เปลี่ยนรหัสผ่าน</h2>
            <label>
              รหัสผ่านปัจจุบัน
              <input name="current" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </label>
            <label>
              รหัสผ่านใหม่
              <input
                name="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>
            <button disabled={busy}>เปลี่ยนและเข้าสู่ระบบใหม่</button>
            <p className="muted form-hint">เปลี่ยนรหัสผ่านแล้ว ต้องเข้าสู่ระบบใหม่ทุกเครื่อง</p>
          </fieldset>
        </form>
      </div>
      {note && <p role="status">{note}</p>}
      {error && <p role="alert">{error}</p>}
    </>
  );
}
