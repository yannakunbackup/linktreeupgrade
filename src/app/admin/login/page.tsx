'use client';

import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { getAuthInstance, getGoogleProvider } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';

export default function AdminLogin() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const denied = searchParams.get('denied') === '1';
  const [error, setError] = useState(denied ? 'Akses ditolak. Email Anda tidak terdaftar sebagai admin.' : '');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  async function handleLogin() {
    setSigningIn(true);
    setError('');
    try {
      const result = await signInWithPopup(getAuthInstance(), getGoogleProvider());
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
        .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
      if (!adminEmails.includes(result.user.email?.toLowerCase() || '')) {
        await getAuthInstance().signOut();
        setError('Akses ditolak. Email Anda tidak terdaftar sebagai admin.');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code !== 'auth/popup-closed-by-user') {
          setError('Gagal login. Silakan coba lagi.');
        }
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <>
      <div className="ambient-bg" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          maxWidth: 400, width: '100%', background: 'var(--surface)',
          border: '2px solid var(--border)', borderRadius: 16,
          boxShadow: '4px 4px 0 var(--shadow)', padding: '40px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: '2px solid var(--border)', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-alt)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24, color: 'var(--ink)' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24,
            color: 'var(--ink)', marginBottom: 8,
          }}>Admin Login</h1>
          <p style={{
            fontSize: 13, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.5,
          }}>
            Login dengan akun Google yang terdaftar sebagai admin.
          </p>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 20,
              border: '1.5px solid #ef4444', background: '#fef2f2', color: '#dc2626',
              fontSize: 13, textAlign: 'left',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={signingIn}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px 24px', borderRadius: 10,
              border: '2px solid var(--ink)',
              background: signingIn ? 'var(--surface-alt)' : 'var(--ink)',
              color: signingIn ? 'var(--muted)' : 'var(--bg)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
              boxShadow: '3px 3px 0 var(--shadow-strong)',
              transition: 'all 0.15s', cursor: signingIn ? 'wait' : 'pointer',
            }}
          >
            {signingIn ? (
              <div style={{
                width: 18, height: 18, border: '2.5px solid var(--muted)',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }} />
            ) : (
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {signingIn ? 'Memproses...' : 'Masuk dengan Google'}
          </button>

          <div style={{ marginTop: 20 }}>
            <a href="/" style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)',
            }}>
              &larr; Kembali ke beranda
            </a>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}