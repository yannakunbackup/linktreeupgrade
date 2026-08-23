'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { onSnapshot, query, collection, where, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Product, ProductWithCategory, ProductCategory, COLLECTION_MAP, CATEGORY_LABELS } from '@/lib/firestore-types';
import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';

const CATEGORIES: ProductCategory[] = ['base-code', 'design-grafis', 'project-preset'];

const ICONS: Record<string, string> = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.05 2C6.523 2 2.05 6.473 2.05 12c0 1.99.583 3.845 1.588 5.407L2.05 22l4.72-1.55A9.93 9.93 0 0 0 12.05 22c5.527 0 10-4.473 10-10s-4.473-10-10-10zm0 18.2a8.16 8.16 0 0 1-4.161-1.137l-.298-.177-3.09 1.016 1.033-3.013-.194-.31A8.17 8.17 0 1 1 20.22 12a8.18 8.18 0 0 1-8.17 8.2zm4.485-6.128c-.246-.123-1.454-.718-1.68-.8-.225-.082-.389-.123-.553.124-.164.246-.635.8-.778.964-.143.164-.287.185-.532.062-.246-.123-1.038-.383-1.977-1.221-.731-.652-1.224-1.457-1.367-1.703-.143-.246-.015-.379.108-.502.11-.11.246-.287.369-.43.123-.144.164-.246.246-.41.082-.164.041-.308-.02-.43-.062-.124-.554-1.334-.759-1.827-.2-.48-.403-.415-.554-.423l-.472-.008a.907.907 0 0 0-.656.308c-.226.246-.86.84-.86 2.05s.881 2.38 1.004 2.544c.123.164 1.736 2.65 4.206 3.716.587.253 1.045.404 1.402.518.589.187 1.126.16 1.55.097.473-.071 1.454-.595 1.659-1.169.205-.574.205-1.067.144-1.169-.062-.103-.226-.164-.472-.287z"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.83 1.55V6.79a4.85 4.85 0 0 1-1.06-.1z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>',
  folderOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg>',
};

function getCategoryIcon(cat: ProductCategory): string {
  switch (cat) {
    case 'base-code': return ICONS.code;
    case 'design-grafis': return ICONS.palette;
    case 'project-preset': return ICONS.folder;
    default: return ICONS.folder;
  }
}

/* Carousel data */
const SLIDES = [
  {
    icon: ICONS.whatsapp,
    ghost: ICONS.whatsapp,
    title: 'Awal Mula Mathabot',
    desc: 'Iseng ngoprek script bot WhatsApp, pelan-pelan berkembang jadi Mathabot yang dipake sekarang.',
  },
  {
    icon: ICONS.users,
    ghost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    title: '500+ Pengguna Aktif',
    desc: 'Dari bot personal jadi layanan sewa yang dipake ratusan grup WhatsApp tiap hari.',
  },
  {
    icon: ICONS.bolt,
    ghost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    title: 'Sekarang: Build in Public',
    desc: 'Ngembangin sistem sewa SaaS, redesign branding, sambil tetep grinding game di waktu luang.',
  },
];

/* Nav items */
const NAV_ITEMS = [
  { href: '#home', label: 'Home', target: 'home' },
  { href: '#linktree', label: 'Linktree', target: 'linktree' },
  { href: '#best-produk', label: 'Best Product', target: 'best-produk' },
  { href: '#my-profile', label: 'My Profile', target: 'my-profile' },
  { href: '#jelajahi', label: 'Jelajahi', target: 'jelajahi' },
];

/* Linktree main links */
const MAIN_LINKS = [
  { href: 'https://mathabot.my.id', title: 'Mathabot', sub: 'Web sewa bot WhatsApp by matha', external: true, icon: ICONS.whatsapp },
  { href: '/store-base-code', title: 'Base Code', sub: "Store kumpulan script & tools mat'ha", external: false, icon: ICONS.code },
  { href: '/store-desain-grafis', title: 'Design Grafis', sub: "Store kumpulan desain kreatifitas mat'ha", external: false, icon: ICONS.palette },
];

/* Pair links */
const PAIR_LINKS = [
  { href: '/store-project-preset', title: 'Project & Preset', sub: 'Koleksi editan free', external: false, icon: ICONS.folder },
  { href: 'https://whatsapp.com/channel/0029VbCw1ZW9hXFCWI1DN02T', title: 'Channel', sub: 'Update & pengumuman', external: true, icon: ICONS.whatsapp },
];

/* Hero socials */
const HERO_SOCIALS = [
  { href: 'https://instagram.com/mathaa.archive', label: 'Instagram', icon: ICONS.instagram },
  { href: 'https://t.me/mathaoduoyu', label: 'Telegram', icon: ICONS.telegram },
  { href: 'https://wa.me/6283879355042', label: 'WhatsApp', icon: ICONS.whatsapp },
  { href: 'https://tiktok.com/@mathaoduoyu', label: 'TikTok', icon: ICONS.tiktok },
];

/* Jelajahi items */
const JELAJAHI_ITEMS = [
  { href: 'https://mathabot.my.id', label: 'Website sewa bot', icon: ICONS.globe, external: true },
  { href: 'https://whatsapp.com/channel/0029VbCw1ZW9hXFCWI1DN02T', label: 'Channels', icon: ICONS.whatsapp, external: true },
  { href: '#best-produk', label: 'Products', icon: ICONS.bag, external: false },
  { href: '/store-project-preset', label: 'Projects', icon: ICONS.folderOpen, external: false },
  { href: '#my-profile', label: 'Tentang kami', icon: ICONS.person, external: false },
  { href: '#', label: 'Social media', icon: ICONS.share, external: false },
];

export default function HomePage() {
  const [bestProducts, setBestProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  /* Firestore: load best products */
  useEffect(() => {
    const unsubscribes = CATEGORIES.map((cat) => {
      const colName = COLLECTION_MAP[cat];
      const q = query(
        collection(getDb(), colName),
        where('isRecommended', '==', true),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snap) => {
        const items: ProductWithCategory[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Product & { category: ProductCategory; categoryLabel: string }));

        setBestProducts((prev) => {
          const filtered = prev.filter((p) => p.category !== cat);
          const enriched = items.map((item) => ({
            ...item,
            category: cat,
            categoryLabel: CATEGORY_LABELS[cat],
          }));
          const combined = [...filtered, ...enriched];
          combined.sort((a, b) => {
            const aTime = (a.createdAt as Timestamp)?.toMillis?.() || 0;
            const bTime = (b.createdAt as Timestamp)?.toMillis?.() || 0;
            return bTime - aTime;
          });
          return combined.slice(0, 6);
        });
        setLoading(false);
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  /* Carousel scroll sync */
  const updateCarouselIndex = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setCarouselIndex(idx);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateCarouselIndex, { passive: true });
    return () => el.removeEventListener('scroll', updateCarouselIndex);
  }, [updateCarouselIndex]);

  const scrollToSlide = (idx: number) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' });
  };

  /* Nav scroll handler */
  const handleNavClick = (target: string) => {
    setMenuOpen(false);
    setActiveNav(target);
  };

  return (
    <>
    <div className="ambient-bg" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
    </div>

    <div className="app">
      {/* ── TOPBAR ────────────────────────────────────────── */}
      <header className="topbar" id="home">
        <span className="topbar-brand">Mathaoduoyu</span>
        <div className="topbar-actions">
          <ThemeToggle />
          <button
            className={`icon-btn${menuOpen ? ' nav-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Buka menu"
          >
            <div className="hamburger-lines"><span></span><span></span><span></span></div>
          </button>
        </div>
      </header>

      {/* ── NAV DRAWER ────────────────────────────────────── */}
      <div className={`nav-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />
      <nav className={`nav-drawer${menuOpen ? ' open' : ''}`}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.target}
            href={item.href}
            className={`nav-drawer-item${activeNav === item.target ? ' active' : ''}`}
            onClick={() => handleNavClick(item.target)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-pattern">
          <img src="/media/profile/banner-cover.png" alt="" loading="eager" />
        </div>

        <div className="title-chip">Programmer · Editor · Gamer</div>

        <div className="hero-avatar-wrap">
          <div className="hero-avatar">
            <img src="/media/profile/profile-avatar.png" alt="Mathaoduoyu" />
          </div>
          <div className="hero-status"></div>
        </div>

        <h1 className="hero-name">MATHAODUOYU</h1>

        <div className="hero-social">
          {HERO_SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener" aria-label={s.label} dangerouslySetInnerHTML={{ __html: s.icon }} />
          ))}
        </div>
      </section>

      {/* ── MY LINKTREE ───────────────────────────────────── */}
      <section className="section" id="linktree">
        <div className="eyebrow">my linktree</div>

        <div className="link-stack">
          {MAIN_LINKS.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="link-card"
            >
              <svg className="link-card-watermark" viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: link.icon.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '') }} />
              <div className="link-icon" dangerouslySetInnerHTML={{ __html: link.icon }} />
              <div className="link-text">
                <span className="link-title">{link.title}</span>
                <span className="link-sub">{link.sub}</span>
              </div>
              <div className="link-arrow" dangerouslySetInnerHTML={{ __html: ICONS.arrowRight }} />
              <div className="link-ripple"></div>
            </Link>
          ))}
        </div>

        <div className="link-pair">
          {PAIR_LINKS.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="link-card"
            >
              <svg className="link-card-watermark" viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: link.icon.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '') }} />
              <div className="link-icon" dangerouslySetInnerHTML={{ __html: link.icon }} />
              <span className="link-title">{link.title}</span>
              <span className="link-sub">{link.sub}</span>
              <div className="link-ripple"></div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BEST PRODUK ───────────────────────────────────── */}
      <section className="section" id="best-produk">
        <div className="eyebrow">best produk</div>
        <div className="products">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="product-card">
                  <div className="product-visual" style={{ background: 'var(--surface-alt)' }} />
                  <div className="product-body">
                    <div style={{ height: 14, width: '60%', background: 'var(--surface-alt)', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 10, width: '90%', background: 'var(--surface-alt)', borderRadius: 4, marginBottom: 12 }} />
                    <div style={{ height: 28, width: '100%', background: 'var(--surface-alt)', borderRadius: 8 }} />
                  </div>
                </div>
              ))}
            </>
          ) : bestProducts.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px', color: 'var(--muted)',
              fontFamily: 'var(--font-mono)', fontSize: 13,
            }}>
              Belum ada rekomendasi produk.
            </div>
          ) : (
            bestProducts.map((p) => (
              <div key={p.id} className="product-card">
                <div className="product-visual">
                  <svg viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: getCategoryIcon(p.category).replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '') }} />
                  <span className="visual-tag">PREVIEW</span>
                </div>
                <div className="product-body">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="tag-row">
                    {(p.tags || []).map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <a
                    href={p.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-buy"
                  >
                    Beli di Lynk.id →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── MY PROFILE ────────────────────────────────────── */}
      <section className="section" id="my-profile">
        <div className="eyebrow">my profile</div>

        <div className="about-block">
          <div className="about-avatar"><img src="/media/profile/profile-avatar.png" alt="Mathaoduoyu" /></div>
          <div className="about-name">MATHAODUOYU</div>
          <p className="about-desc">Menghadirkan koleksi desain grafis modern, koleksi base script, serta berbagai solusi digital yang simpel, rapi, berkualitas, dan mudah digunakan.</p>
        </div>

        <div className="carousel-wrap">
          <button className="carousel-arrow carousel-arrow-prev" onClick={() => scrollToSlide(Math.max(0, carouselIndex - 1))} aria-label="Slide sebelumnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button className="carousel-arrow carousel-arrow-next" onClick={() => scrollToSlide(Math.min(SLIDES.length - 1, carouselIndex + 1))} aria-label="Slide selanjutnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div className="carousel" ref={carouselRef}>
            {SLIDES.map((s, i) => (
              <div key={i} className="slide">
                <div className="slide-icon-badge" dangerouslySetInnerHTML={{ __html: s.icon }} />
                <svg className="slide-ghost" viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: s.ghost.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '') }} />
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="carousel-nav">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${i === carouselIndex ? ' active' : ''}`}
                aria-label={`Slide ${i + 1}`}
                onClick={() => scrollToSlide(i)}
              />
            ))}
          </div>
        </div>

        <div className="jelajahi-wrap" id="jelajahi">
          <div className="eyebrow">Jelajahi</div>
          <div className="jelajahi-list">
            {JELAJAHI_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="jelajahi-item"
              >
                <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                <span>{item.label}</span>
                <div className="chev" dangerouslySetInnerHTML={{ __html: ICONS.chevronRight }} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="site-footer">
        <p className="footer-copy">© 2026 Mathaoduoyu. All rights reserved.</p>
      </footer>
    </div>
    </>
  );
}
