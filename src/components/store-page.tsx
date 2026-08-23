'use client';

import { useEffect, useState, useMemo } from 'react';
import { onSnapshot, query, collection, orderBy } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Product } from '@/lib/firestore-types';
import Link from 'next/link';

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
    const q = query(collection(getDb(), collectionName), orderBy('createdAt', 'desc'));
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

  return (
    <>
      <div className="ambient-bg" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
      <div className="app-store">
        {/* Header */}
        <div className="store-topbar">
          <Link href="/" aria-label="Kembali" className="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </Link>
          <button
            className="theme-toggle-store"
            aria-label="Ganti tema"
            onClick={() => {
              const isDark = document.documentElement.classList.toggle('dark');
              localStorage.setItem('mathaoduoyu-theme', isDark ? 'dark' : 'light');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          </button>
        </div>

        {/* Title */}
        <div className="store-title">
          <h1>{title}</h1>
          <div className="subtitle">{subtitle}</div>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              className="search-input"
              type="text"
              placeholder="Cari produk atau #tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            {search && (
              <button
                className="search-clear"
                onClick={() => { setSearch(''); }}
                aria-label="Hapus pencarian"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          {showCount && (
            <div className="search-count">
              {filtered.length} produk ditemukan
            </div>
          )}
        </div>

        {/* Product List */}
        <div className="store-list">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="store-card">
                <div className="store-visual" style={{ background: 'var(--surface-alt)' }} />
                <div className="store-info">
                  <div style={{ height: 19, width: '50%', background: 'var(--shadow)', borderRadius: 4, marginBottom: 12, opacity: 0.3 }} />
                  <div style={{ height: 13, width: '90%', background: 'var(--shadow)', borderRadius: 4, marginBottom: 20, opacity: 0.2 }} />
                  <div style={{ height: 44, width: 120, background: 'var(--shadow)', borderRadius: 999, opacity: 0.2, marginLeft: 'auto' }} />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="store-empty">
              {hasProducts ? 'Gak ada yang cocok. Coba kata lain.' : 'Belum ada produk di sini. Coming soon.'}
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="store-card">
                <div className="store-visual">
                  <svg className="ghost-folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>
                </div>
                <div className="store-info">
                  <h3>{p.title}</h3>
                  <div className="store-tag-row">
                    {(p.tags || []).map((tag) => (
                      <span key={tag} className="store-tag">{tag}</span>
                    ))}
                  </div>
                  <p className="store-desc">{p.description}</p>
                  <div className="store-price-row">
                    <div>
                      <div className="store-price-label">Price</div>
                      <div className="store-price">Free</div>
                    </div>
                    <a
                      href={p.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-store-buy"
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
