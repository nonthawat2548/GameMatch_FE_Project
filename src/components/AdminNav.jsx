import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  return (
    <nav className="admin-tabs" aria-label="เมนูผู้ดูแลระบบ">
      <NavLink to="/admin/dashboard">ภาพรวม</NavLink>
      <NavLink to="/admin" end>จัดการคลังเกม</NavLink>
      <NavLink to="/admin/members">จัดการสมาชิก</NavLink>
    </nav>
  );
}
