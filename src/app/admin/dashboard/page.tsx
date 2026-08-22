'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin/base-code', label: 'Kelola Base Code', icon: 'code' },
  { href: '/admin/design-grafis', label: 'Kelola Design Grafis', icon: 'palette' },
  { href: '/admin/project-preset', label: 'Kelola Project & Preset', icon: 'folder' },
];

const ICONS: Record<string, string> = {
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18M3 12h18"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
};

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.replace('/admin/login');
  }

  return (
    <>
      <div className="ambient-bg" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <Link href="/" style={{
            width: 38, height: 38, border: '1.5px solid var(--ink)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink)', background: 'var(--surface-alt)',
            boxShadow: '3px 3px 0 var(--shadow-strong)',
          }} aria-label="Kembali">
            <div style={{ width: 17, height: 17 }} dangerouslySetInnerHTML={{ __html: ICONS.back }} />
          </Link>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
            color: 'var(--muted)', padding: '8px 14px',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-pill)',
            transition: 'color 0.15s',
          }}>
            <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: ICONS.logout }} />
            Logout
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28,
            color: 'var(--ink)', marginBottom: 4,
          }}>Admin Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {user?.email}
          </p>
        </div>

        {/* Menu Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 20px', background: 'var(--surface)',
              border: '2px solid var(--border)', borderRadius: 14,
              boxShadow: '3px 3px 0 var(--shadow)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                border: '1.5px solid var(--border)', background: 'var(--surface-alt)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink)', flexShrink: 0,
              }} dangerouslySetInnerHTML={{ __html: ICONS[item.icon] }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                  color: 'var(--ink)', marginBottom: 2,
                }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>CRUD produk</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: 'var(--muted)' }}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          ))}

          {/* Best Produk info card */}
          <div style={{
            padding: '18px 20px', background: 'var(--surface-alt)',
            border: '1.5px solid var(--border)', borderRadius: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 20, height: 20, color: 'var(--muted)' }} dangerouslySetInnerHTML={{ __html: ICONS.star }} />
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                color: 'var(--ink)',
              }}>Best Produk</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Produk dengan toggle &quot;Tampilkan di Best Produk&quot; aktif akan otomatis tampil di halaman utama sebagai rekomendasi.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}