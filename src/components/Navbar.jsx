import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

// Navigation is presentational; Shell owns the auth session and theme.
export default function Navbar({ user, logout, theme, onToggle }) {
  return (
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/">
            <span className="brand-mark" aria-hidden="true">G<span>+</span></span>
            <span>Game<span className="brand-accent">Match</span></span>
          </Link>
          <nav aria-label="เมนูหลัก">
            <div className="primary-links">
              <NavLink to="/" end>
                หน้าแรก
              </NavLink>
              <NavLink to="/discover">เกมทั้งหมด</NavLink>
              <NavLink to="/match">แนะนำเกม</NavLink>
              <NavLink to="/compare">เปรียบเทียบ</NavLink>
              <NavLink to="/about">เกี่ยวกับ</NavLink>
              {user && <NavLink to="/me/favorites">เกมโปรด</NavLink>}
              {user?.role === 'admin' && <NavLink to="/admin">จัดการเกม</NavLink>}
            </div>
            <div className="account-links">
              <ThemeToggle theme={theme} onToggle={onToggle} />
              {user ? (
                <>
                  <NavLink to="/me/profile">{user.displayName}</NavLink>
                  <button
                    className="text-button"
                    onClick={() =>
                      logout().catch(() =>
                        window.alert(
                          'ล้างข้อมูลในเครื่องแล้ว แต่ติดต่อ Server เพื่อยกเลิก Token ไม่สำเร็จ',
                        ),
                      )
                    }
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <NavLink className="login-link" to="/login">
                  เข้าสู่ระบบ
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      </header>
  );
}
