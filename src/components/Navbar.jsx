import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ user, logout, theme, onToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const location = useLocation();
  useEffect(() => { setMenuOpen(false); }, [location.pathname, location.search]);
  function closeMenu() { setMenuOpen(false); }
  function escapeMenu(event) {
    if (event.key === 'Escape' && menuOpen) {
      closeMenu();
      menuButton.current?.focus();
    }
  }
  return (
    <header className="site-header" onKeyDown={escapeMenu}>
      <div className="header-inner">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">G<span>+</span></span>
          <span>Game<span className="brand-accent">Match</span></span>
        </Link>
        <button type="button" ref={menuButton} className="mobile-menu-toggle"
          aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
          aria-expanded={menuOpen} aria-controls="main-navigation"
          onClick={() => setMenuOpen(open => !open)}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
        <nav id="main-navigation" className={menuOpen ? 'mobile-menu-open' : 'mobile-menu-closed'} aria-label="เมนูหลัก"
          onClick={event => { if (event.target.closest('a')) closeMenu(); }}>
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
                  onClick={() => {
                    closeMenu();
                    logout().catch(() =>
                      window.alert(
                        'ล้างข้อมูลในเครื่องแล้ว แต่ติดต่อ Server เพื่อยกเลิก Token ไม่สำเร็จ',
                      ),
                    );
                  }}
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
