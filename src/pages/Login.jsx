import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { passwordError, characterCount } from '../utils/validation';
import { returnPath } from '../auth/returnPath';
import { TOKEN_KEY } from '../auth/session';
export default function Login({ register = false }) {
  const { login } = useAuth(),
    nav = useNavigate(),
    location = useLocation(),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const destination = returnPath(location.state?.from);
  async function submit(e) {
    e.preventDefault();
    setError('');
    const previousToken = localStorage.getItem(TOKEN_KEY);
    const f = new FormData(e.target),
      identity = f.get('identity').trim(),
      password = f.get('password');
    const displayName = (f.get('name') || '').trim();
    if (register) {
      const validationError = passwordError(password);
      if (validationError) {
        setError(validationError);
        return;
      }
      if (!displayName || characterCount(displayName) > 50) {
        setError('กรุณาระบุชื่อที่แสดง ไม่เกิน 50 ตัวอักษร');
        return;
      }
    }
    setBusy(true);
    try {
      if (register) {
        await api('/api/auth/register', {
          method: 'POST',
          body: { email: identity.toLowerCase(), password, displayName },
        });
        if (localStorage.getItem(TOKEN_KEY) !== previousToken) return;
        // สมัครสำเร็จแล้ว หาก auto-login ล้มเหลว ให้ลอง login แทนสมัครบัญชีซ้ำ
        try {
          await login(identity, password);
        } catch {
          nav('/login', {
            replace: true,
            state: {
              notice: 'สมัครสมาชิกสำเร็จแล้ว กรุณาลองเข้าสู่ระบบอีกครั้ง',
              from: destination,
              intent: location.state?.intent,
            },
          });
          return;
        }
      } else {
        await login(identity, password);
      }
      nav(destination, { replace: true, state: {intent: location.state?.intent === 'review' ? 'review' : undefined} });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel narrow auth-form" onSubmit={submit} aria-busy={busy}>
      <div className="auth-brand" aria-hidden="true"><span className="brand-mark">G<span>+</span></span> GameMatch</div>
      <h1>{register ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h1>
      <p className="muted">{register ? "สร้างบัญชีเพื่อบันทึกเกมและเขียนรีวิว" : "เข้าสู่บัญชี GameMatch ของคุณ"}</p>
      {!register && location.state?.notice && <p role="status">{location.state.notice}</p>}
      <fieldset disabled={busy}>
        {register && (
          <label>
            ชื่อที่แสดง
            <input name="name" required />
          </label>
        )}
        <label>
          {register ? 'อีเมล' : 'อีเมลหรือชื่อผู้ใช้'}
          <input name="identity" type={register ? 'email' : 'text'} autoComplete={register ? 'email' : 'username'} maxLength={register ? 255 : 320} required />
        </label>
        <label>
          รหัสผ่าน
          <input
            name="password"
            type="password"
            minLength={register ? 8 : undefined}
            autoComplete={register ? 'new-password' : 'current-password'}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="auth-actions">
          <Link to={register ? '/login' : '/register'} state={{ from: destination, intent: location.state?.intent }}>
            {register ? 'มีบัญชีแล้ว' : 'สร้างบัญชีใหม่'}
          </Link>
          <button disabled={busy}>
            {busy ? 'กำลังดำเนินการ…' : register ? 'สมัครและเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
