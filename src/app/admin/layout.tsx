import AdminGuard from '@/lib/admin-guard';

export const metadata = {
  title: 'Admin — Mathaoduoyu',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}