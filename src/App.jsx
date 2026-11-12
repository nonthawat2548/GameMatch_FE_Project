import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Discover from './pages/Discover';
import MatchQuiz from './pages/MatchQuiz';
import Login from './pages/Login';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/AdminMembers';
import Home from './pages/Home';
import About from './pages/About';
import Compare from './pages/Compare';
const THEME_KEY = 'gamematch_theme';

function Shell() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ยังสลับธีมได้หากเบราว์เซอร์ไม่อนุญาตให้เก็บค่า
    }
    return () => document.documentElement.removeAttribute('data-theme');
  }, [theme]);
  const { user, logout, error, retrySession, canRetrySession } = useAuth();
  return (
    <>
      <a className="skip-link" href="#main-content">
        ข้ามไปเนื้อหา
      </a>
      <Navbar user={user} logout={logout} theme={theme} onToggle={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} />
      <main id="main-content" tabIndex={-1}>
        {error && (
          <div>
            <p role="alert">{error}</p>
            {canRetrySession && (
              <button className="secondary" onClick={retrySession}>
                ตรวจสอบบัญชีอีกครั้ง
              </button>
            )}
          </div>
        )}
        <Routes key={user?.id || 'guest'}>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/match" element={<MatchQuiz />} />
          <Route path="/about" element={<About />} />
          <Route path="/games/:id" element={<Detail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login key="register" register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/me/favorites" element={<Favorites />} />
            <Route path="/me/profile" element={<Profile />} />
          </Route>
          <Route element={<ProtectedRoute admin />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/members" element={<AdminMembers />} />
          </Route>
          <Route
            path="*"
            element={
              <section>
                <h1>404 — ไม่พบหน้านี้</h1>
                <p className="muted">
                  ลิงก์อาจไม่ถูกต้อง เลือกกลับไปดูเกมหรือเริ่มจากหน้าแรกได้เลย
                </p>
                <div className="home-actions">
                  <Link className="button" to="/discover">
                    ดูเกมทั้งหมด
                  </Link>
                  <Link className="button secondary" to="/">
                    กลับหน้าแรก
                  </Link>
                </div>
              </section>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
