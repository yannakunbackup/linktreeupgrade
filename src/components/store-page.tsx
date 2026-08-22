'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { onSnapshot, query, collection, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/firestore-types';
import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';

interface StorePageProps {
  collectionName: string;
  title: string;
  subtitle: string;
}

export default function StorePage({ collectionName, title, subtitle }: StorePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 180);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(items);
      setLoading(false);
    });
    return () => unsub();
  }, [collectionName]);

  const normalise = (s: string) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  const filtered = useMemo(() => {
    const q = normalise(debouncedSearch);
    if (!q) return products;
    if (q.startsWith('#')) {
      const tag = q.slice(1);
      return products.filter((p) => (p.tags || []).some((t) => normalise(t).replace(/^#/, '').includes(tag)));
    }
    return products.filter((p) =>
      normalise([p.title, p.description, ...(p.tags || [])].join(' ')).includes(q)
    );
  }, [products, debouncedSearch]);

  const showCount = debouncedSearch && products.length > 0;
  const hasProducts = products.length > 0;

  const FOLDER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>';

  return (
    <>
      <div className="ambient-bg" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <Link href="/" aria-label="Kembali" style={{
            width: 38, height: 38,
            border: '1.5px solid var(--ink)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink)', background: 'var(--surface-alt)',
            boxShadow: '3px 3px 0 var(--shadow-strong)',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 17, height: 17 }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 44,
            letterSpacing: '0.02em', color: 'var(--muted)', lineHeight: 1,
          }}>{title}</h1>
          <div style={{
            fontFamily: 'var(--font-script)', fontWeight: 600, fontSize: 32,
            color: 'var(--ink)', marginTop: -10, transform: 'rotate(-2deg)',
          }}>{subtitle}</div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--surface)', border: '2px solid var(--border)',
            borderRadius: 999, padding: '11px 16px',
            boxShadow: '3px 3px 0 var(--shadow)',
          }}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 15, height: 15, color: 'var(--muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Cari produk atau #tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              style={{
                flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none',
                fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)',
              }}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); }}
                aria-label="Hapus pencarian"
                style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 13, height: 13 }}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {showCount && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.04em', color: 'var(--muted)', marginTop: 10, paddingLeft: 6,
            }}>
              {filtered.length} produk ditemukan
            </div>
          )}
        </div>

        {/* Product List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{
                border: '2px solid var(--border)', borderRadius: 16, overflow: 'hidden',
                background: 'var(--surface)', boxShadow: '3px 3px 0 var(--shadow)',
              }}>
                <div style={{ height: 180, background: 'var(--surface-alt)' }} />
                <div style={{ background: 'var(--ink)', padding: '20px 20px 22px' }}>
                  <div style={{ height: 19, width: '50%', background: 'var(--shadow)', borderRadius: 4, marginBottom: 12, opacity: 0.3 }} />
                  <div style={{ height: 13, width: '90%', background: 'var(--shadow)', borderRadius: 4, marginBottom: 20, opacity: 0.2 }} />
                  <div style={{ height: 44, width: 120, background: 'var(--shadow)', borderRadius: 999, opacity: 0.2, marginLeft: 'auto' }} />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontSize: 13 }}>
              {hasProducts ? 'Gak ada yang cocok. Coba kata lain.' : 'Belum ada produk di sini. Coming soon.'}
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} style={{
                border: '2px solid var(--border)', borderRadius: 16, overflow: 'hidden',
                boxShadow: '3px 3px 0 var(--shadow)',
              }}>
                <div style={{
                  position: 'relative', height: 180,
                  background: 'linear-gradient(165deg, var(--surface-alt), var(--surface))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  <div style={{ width: '60%', height: '60%', color: 'var(--ink)', opacity: 0.5 }} dangerouslySetInnerHTML={{ __html: FOLDER_SVG }} />
                </div>
                <div style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '20px 20px 22px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19,
                    letterSpacing: '0.01em', textTransform: 'uppercase', marginBottom: 12,
                  }}>{p.title}</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {(p.tags || []).map((tag) => (
                      <span key={tag} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 600,
                        border: '1.5px solid var(--bg)', borderRadius: 999, padding: '4px 12px', opacity: 0.9,
                      }}>{tag}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--shadow)', marginBottom: 20 }}>
                    {p.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <a
                      href={p.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'var(--surface-alt)', color: 'var(--ink)',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                        borderRadius: 999, padding: '11px 30px',
                        border: '1.5px solid var(--bg)',
                        boxShadow: '3px 3px 0 var(--shadow-strong)',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                      }}
                    >
                      Buy
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
