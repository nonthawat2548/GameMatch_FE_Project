import AdminNav from './AdminNav';

export default function AdminLayout({ header, children }) {
  return (
    <>
      {header}
      <AdminNav />
      {children}
    </>
  );
}
