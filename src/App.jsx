import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
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

const ROUTE_SEO = {
  '/': {
    title: 'GameMatch | ค้นหาและแนะนำเกมจาก Steam',
    description: 'ค้นหา เปรียบเทียบ อ่านรีวิว และแนะนำเกมที่เหมาะกับสไตล์การเล่นของคุณจากข้อมูลเกมจริง',
  },
  '/discover': {
    title: 'เกมทั้งหมด | GameMatch',
    description: 'สำรวจคลังเกมทั้งหมด ค้นหา กรองตามแนวเกม และเรียงตามความนิยมหรือวันที่วางจำหน่าย',
  },
  '/match': {
    title: 'แนะนำเกมตามความชอบ | GameMatch',
    description: 'ตอบคำถาม 3 ขั้นตอนเพื่อรับคำแนะนำเกมที่ตรงกับแนวเกมและสไตล์การเล่นของคุณ',
  },
  '/compare': {
    title: 'เปรียบเทียบเกม | GameMatch',
    description: 'เปรียบเทียบรายละเอียด แนวเกม จุดเด่น แพลตฟอร์ม และวันวางจำหน่ายของเกม 2–3 เกม',
  },
  '/about': {
    title: 'เกี่ยวกับ GameMatch | GameMatch',
    description: 'ข้อมูลโปรเจกต์ GameMatch ระบบแนะนำและสำรวจเกมจากแหล่งข้อมูลจริง',
  },
  '/login': {
    title: 'เข้าสู่ระบบ | GameMatch',
    description: 'เข้าสู่ระบบ GameMatch เพื่อบันทึกเกมโปรดและเขียนรีวิวเกม',
  },
  '/register': {
    title: 'สมัครสมาชิก | GameMatch',
    description: 'สมัครสมาชิก GameMatch ฟรีเพื่อบันทึกเกมโปรดและความชอบส่วนตัว',
  },
  '/me/favorites': {
    title: 'เกมโปรดของฉัน | GameMatch',
    description: 'รายการเกมที่คุณบันทึกไว้และคำแนะนำจากเกมโปรดของคุณ',
  },
  '/me/profile': {
    title: 'โปรไฟล์และการตั้งค่า | GameMatch',
    description: 'จัดการข้อมูลโปรไฟล์และเปลี่ยนรหัสผ่านบัญชี GameMatch ของคุณ',
  },
  '/admin': {
    title: 'จัดการคลังเกม | GameMatch',
    description: 'หน้าจัดการคลังเกมสำหรับผู้ดูแลระบบ GameMatch',
  },
  '/admin/dashboard': {
    title: 'ภาพรวมระบบ | GameMatch',
    description: 'สถิติและภาพรวมระบบสำหรับผู้ดูแล GameMatch',
  },
  '/admin/members': {
    title: 'จัดการสมาชิก | GameMatch',
    description: 'ตรวจสอบรายชื่อสมาชิกและจัดการสิทธิ์บทบาทในระบบ GameMatch',
  },
};

function Shell() {
  const location = useLocation();
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
    }
    return () => document.documentElement.removeAttribute('data-theme');
  }, [theme]);
  useEffect(() => {
    if (location.pathname.startsWith('/games/')) return;
    const metaInfo = ROUTE_SEO[location.pathname] || {
      title: 'ไม่พบหน้านี้ | GameMatch',
      description: 'ไม่พบหน้าที่คุณต้องการบน GameMatch',
    };
    document.title = metaInfo.title;
    let desc = document.querySelector('meta[name="description"]');
    let createdDesc = false;
    if (!desc) {
      desc = document.createElement('meta');
      desc.name = 'description';
      document.head.appendChild(desc);
      createdDesc = true;
    }
    desc.content = metaInfo.description;

    let canonical = document.querySelector('link[rel="canonical"]');
    let createdCanonical = false;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
      createdCanonical = true;
    }
    canonical.href = window.location.origin + location.pathname;

    return () => {
      if (createdDesc) desc.remove();
      if (createdCanonical) canonical.remove();
    };
  }, [location.pathname]);
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
