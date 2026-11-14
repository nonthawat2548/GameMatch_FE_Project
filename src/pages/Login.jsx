import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { register as registerMember } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { passwordError, characterCount } from '../utils/validation';
import { returnPath } from '../auth/returnPath';
import { TOKEN_KEY } from '../auth/session';
export default function Login({ register = false }) {
  const { login } = useAuth(),
    nav = useNavigate(),
    location = useLocation(),
    [identity, setIdentity] = useState(''),
    [password, setPassword] = useState(''),
    [name, setName] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [showPassword, setShowPassword] = useState(false);
  const destination = returnPath(location.state?.from);
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    const previousToken = localStorage.getItem(TOKEN_KEY);
    const emailOrUsername = identity.trim();
    const displayName = name.trim();
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
        await registerMember(emailOrUsername.toLowerCase(), password, displayName);
        if (localStorage.getItem(TOKEN_KEY) !== previousToken) return;
        try {
          await login(emailOrUsername, password);
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
        await login(emailOrUsername, password);
      }
      nav(destination, { replace: true, state: {intent: location.state?.intent === 'review' ? 'review' : undefined} });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-showcase" aria-hidden="true">
          <div className="auth-showcase-top">
            <div className="auth-brand">
              <span className="brand-mark">G</span>
              <span>Game<span className="brand-accent">Match</span></span>
            </div>
            <span className="eyebrow">{register ? 'เริ่มต้นใช้งานฟรี' : 'บัญชีสมาชิก GameMatch'}</span>
            <h2>{register ? 'สร้างโปรไฟล์สายเกมของคุณ' : 'กลับมาค้นหาเกมที่ใช่ต่อจากเดิม'}</h2>
            <p className="muted">
              {register
                ? 'สมัครครั้งเดียวเพื่อบันทึกเกมที่สนใจ เขียนรีวิวจากประสบการณ์จริง และรับคำแนะนำที่แม่นยำขึ้น'
                : 'เข้าสู่ระบบเพื่อซิงค์คลังเกมโปรด คำตอบแนะนำเกม และรีวิวของคุณไว้ในที่เดียว'}
            </p>
          </div>
          <ul className="auth-perks">
            <li>
              <span className="auth-perk-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </span>
              <div>
                <strong>บันทึกเกมโปรดไว้เปรียบเทียบ</strong>
                <p className="muted">รวมเกมที่อยากเล่นและเปิดเทียบข้อมูลได้ทันที</p>
              </div>
            </li>
            <li>
              <span className="auth-perk-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v3M12 18v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M3 12h3M18 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                </svg>
              </span>
              <div>
                <strong>จำคำตอบจากการจับคู่เกม</strong>
                <p className="muted">ไม่ต้องเลือกแนวเกมและสไตล์การเล่นใหม่ทุกครั้ง</p>
              </div>
            </li>
            <li>
              <span className="auth-perk-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <div>
                <strong>เขียนรีวิวและโหวตความคิดเห็น</strong>
                <p className="muted">แบ่งปันรีวิวจากผู้เล่นจริงแยกจากคะแนน Steam</p>
              </div>
            </li>
          </ul>
          <p className="auth-showcase-foot">ข้อมูลบัญชีปลอดภัย · ใช้งานได้ทุกอุปกรณ์</p>
        </aside>

        <form className="auth-form" onSubmit={submit} aria-busy={busy}>
          <div className="auth-brand auth-brand-mobile" aria-hidden="true">
            <span className="brand-mark">G</span>
            <span>Game<span className="brand-accent">Match</span></span>
          </div>
          <h1>{register ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h1>
          <p className="muted auth-subtitle">
            {register ? 'สร้างบัญชีเพื่อบันทึกเกมและเขียนรีวิว' : 'เข้าสู่บัญชี GameMatch ของคุณ'}
          </p>
          {!register && location.state?.notice && <p role="status">{location.state.notice}</p>}
          <fieldset disabled={busy}>
            {register && (
              <div className="auth-field">
                <label htmlFor="auth-name">ชื่อที่แสดง</label>
                <input id="auth-name" name="name" autoComplete="nickname" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อที่จะแสดงบนโปรไฟล์และรีวิว" required />
              </div>
            )}
            <div className="auth-field">
              <label htmlFor="auth-identity">{register ? 'อีเมล' : 'อีเมลหรือชื่อผู้ใช้'}</label>
              <input
                id="auth-identity"
                name="identity"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                type={register ? 'email' : 'text'}
                autoComplete={register ? 'email' : 'username'}
                maxLength={register ? 255 : 320}
                placeholder={register ? 'name@example.com' : 'กรอกอีเมลหรือชื่อผู้ใช้'}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="auth-password">รหัสผ่าน</label>
              <div className="auth-password-wrap">
                <input
                  id="auth-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  minLength={register ? 8 : undefined}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  placeholder={register ? 'อย่างน้อย 8 ตัวอักษร' : 'กรอกรหัสผ่านของคุณ'}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && <p role="alert">{error}</p>}
            <button className="auth-submit" disabled={busy}>
              {busy ? 'กำลังดำเนินการ…' : register ? 'สมัครและเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}
            </button>
          </fieldset>
          <div className="auth-switch">
            <span className="muted">{register ? 'เคยสมัครใช้งานแล้ว?' : 'ยังไม่มีบัญชีใช่ไหม?'}</span>
            <Link className="inline-link" to={register ? '/login' : '/register'} state={{ from: destination, intent: location.state?.intent }}>
              {register ? 'มีบัญชีแล้ว' : 'สร้างบัญชีใหม่'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
