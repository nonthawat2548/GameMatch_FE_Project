import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/backend';
import AdminLayout from '../components/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStats(null);
    setError('');
    api('/api/admin/stats', { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setStats(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [retry]);

  return (
    <AdminLayout header={
      <div className="page-banner">
        <h1>ภาพรวมระบบ</h1>
        <p className="muted">ดูจำนวนเกม สมาชิก และรีวิวทั้งหมดจากฐานข้อมูล</p>
      </div>
      }>
      {error ? (
        <div className="panel">
          <p role="alert">{error}</p>
          <button type="button" onClick={() => setRetry((n) => n + 1)}>ลองใหม่</button>
        </div>
      ) : stats === null ? (
        <p role="status">กำลังโหลดข้อมูล…</p>
      ) : (
        <div className="admin-metrics">
          {[
            ['เกมทั้งหมด', stats.games],
            ['เผยแพร่แล้ว', stats.published],
            ['ซ่อนอยู่', stats.games - stats.published],
            ['บัญชีทั้งหมด', stats.members],
            ['Admin', stats.admins],
            ['Member', stats.members - stats.admins],
            ['รีวิวทั้งหมด', stats.reviews],
          ].map(([label, value]) => (
            <div key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
      )}
      <div className="home-paths">
        <Link className="home-path" to="/admin">
          <div><strong>จัดการเกม</strong><p>เพิ่ม แก้ไข ซ่อน หรือลบเกม</p></div><span aria-hidden="true">→</span>
        </Link>
        <Link className="home-path" to="/admin/members">
          <div><strong>จัดการสมาชิก</strong><p>ค้นหาสมาชิกและเปลี่ยนยศ</p></div><span aria-hidden="true">→</span>
        </Link>
      </div>
    </AdminLayout>
  );
}
