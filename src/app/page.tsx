'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, query, collection, where, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Product, ProductWithCategory, ProductCategory, COLLECTION_MAP, CATEGORY_LABELS } from '@/lib/firestore-types';
import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';

const CATEGORIES: ProductCategory[] = ['base-code', 'design-grafis', 'project-preset'];

const ICONS: Record<string, string> = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.05 2C6.523 2 2.05 6.473 2.05 12c0 1.99.583 3.845 1.588 5.407L2.05 22l4.72-1.55A9.93 9.93 0 0 0 12.05 22c5.527 0 10-4.473 10-10s-4.473-10-10-10zm0 18.2a8.16 8.16 0 0 1-4.161-1.137l-.298-.177-3.09 1.016 1.033-3.013-.194-.31A8.17 8.17 0 1 1 20.22 12a8.18 8.18 0 0 1-8.17 8.2zm4.485-6.128c-.246-.123-1.454-.718-1.68-.8-.225-.082-.389-.123-.553.124-.164.246-.635.8-.778.964-.143.164-.287.185-.532.062-.246-.123-1.038-.383-1.977-1.221-.731-.652-1.224-1.457-1.367-1.703-.143-.246-.015-.379.108-.502.11-.11.246-.287.369-.43.123-.144.164-.246.246-.41.082-.164.041-.308-.02-.43-.062-.124-.554-1.334-.759-1.827-.2-.48-.403-.415-.554-.423l-.472-.008a.907.907 0 0 0-.656.308c-.226.246-.86.84-.86 2.05s.881 2.38 1.004 2.544c.123.164 1.736 2.65 4.206 3.716.587.253 1.045.404 1.402.518.589.187 1.126.16 1.55.097.473-.071 1.454-.595 1.659-1.169.205-.574.205-1.067.144-1.169-.062-.103-.226-.164-.472-.287z"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18M3 12h18"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
};

function getCategoryIcon(cat: ProductCategory): string {
  switch (cat) {
    case 'base-code': return ICONS.code;
    case 'design-grafis': return ICONS.palette;
    case 'project-preset': return ICONS.folder;
    default: return ICONS.folder;
  }
}

export default function HomePage() {
  const [bestProducts, setBestProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <>
    <div className="ambient-bg" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
    </div>
    <div className="app" style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
      {/* TOPBAR */}
      <header id="home" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
          letterSpacing: '0.02em', color: 'var(--ink)',
        }}>Mathaoduoyu</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Buka menu"
            style={{
              width: 38, height: 38,
              border: '1.5px solid var(--ink)', borderRadius: 'var(--radius-pill)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 5px' }}>
              <span style={{
                display: 'block', width: 14, height: 1.5,
                background: 'var(--ink)', borderRadius: 1,
                transition: menuOpen ? 'transform 0.2s' : 'none',
                transform: menuOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none',
              }} />
              <span style={{
                display: 'block', width: 14, height: 1.5,
                background: 'var(--ink)', borderRadius: 1,
                opacity: menuOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block', width: 14, height: 1.5,
                background: 'var(--ink)', borderRadius: 1,
                transition: menuOpen ? 'transform 0.2s' : 'none',
                transform: menuOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none',
              }} />
            </div>
          </button>
        </div>
      </header>

      {/* NAV DRAWER */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}
      <nav style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
        background: 'var(--surface)', borderRight: '1.5px solid var(--border)',
        padding: '70px 20px 20px', zIndex: 45,
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {[
          { href: '#home', label: 'Home' },
          { href: '#linktree', label: 'Linktree' },
          { href: '#best-produk', label: 'Best Product' },
          { href: '#my-profile', label: 'My Profile' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
              padding: '10px 14px', borderRadius: 8, color: 'var(--ink)',
              transition: 'background 0.15s',
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '20px 20px 0' }}>
        <div style={{
          height: 140, borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16,
          border: '1.5px solid var(--border)',
        }}>
          <img
            src="/media/profile/banner-cover.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--muted)', marginBottom: 12,
        }}>
          Programmer &middot; Editor &middot; Gamer
        </div>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
            border: '2.5px solid var(--ink)',
          }}>
            <img src="/media/profile/profile-avatar.png" alt="Mathaoduoyu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: 2, right: 2, width: 14, height: 14,
            borderRadius: '50%', background: '#4ade80', border: '2px solid var(--bg)',
          }} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
          letterSpacing: '0.04em', color: 'var(--ink)', marginBottom: 16,
        }}>
          MATHAODUOYU
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          {[
            { href: 'https://instagram.com/mathaa.archive', label: 'Instagram', icon: ICONS.whatsapp },
            { href: 'https://t.me/mathaoduoyu', label: 'Telegram', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>' },
            { href: 'https://wa.me/6283879355042', label: 'WhatsApp', icon: ICONS.whatsapp },
            { href: 'https://tiktok.com/@mathaoduoyu', label: 'TikTok', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.83 1.55V6.79a4.85 4.85 0 0 1-1.06-.1z"/></svg>' },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              dangerouslySetInnerHTML={{ __html: s.icon }}
              style={{
                width: 40, height: 40, color: 'var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-pill)',
                border: '1.2px solid var(--border)',
                transition: 'background 0.15s',
              }}
            />
          ))}
        </div>
      </section>

      {/* LINKTREE */}
      <section id="linktree" style={{ padding: '26px 20px 6px' }}>
        <div className="eyebrow">my linktree</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { href: 'https://mathabot.my.id', title: 'Mathabot', sub: 'Web sewa bot WhatsApp by matha', external: true, icon: ICONS.whatsapp },
            { href: '/store-base-code', title: 'Base Code', sub: 'Store kumpulan script & tools mat\'ha', external: false, icon: ICONS.code },
            { href: '/store-desain-grafis', title: 'Design Grafis', sub: 'Store kumpulan desain kreatifitas mat\'ha', external: false, icon: ICONS.palette },
          ].map((link) => (
            <Link
              key={link.title}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: '3px 3px 0 var(--shadow)',
                position: 'relative', overflow: 'hidden',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
            >
              <div
                style={{
                  position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
                  width: 60, height: 60, color: 'var(--ink)', opacity: 0.06,
                  pointerEvents: 'none',
                }}
                dangerouslySetInnerHTML={{ __html: link.icon }}
              />
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                border: '1.2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink)', flexShrink: 0,
                background: 'var(--surface-alt)',
              }}
                dangerouslySetInnerHTML={{ __html: link.icon }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                  color: 'var(--ink)', marginBottom: 2,
                }}>
                  {link.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{link.sub}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: 'var(--muted)', flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <Link
            href="/store-project-preset"
            style={{
              display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px',
              background: 'var(--surface)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)', boxShadow: '3px 3px 0 var(--shadow)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
                width: 50, height: 50, color: 'var(--ink)', opacity: 0.06, pointerEvents: 'none',
              }}
              dangerouslySetInnerHTML={{ __html: ICONS.folder }}
            />
            <div style={{
              width: 32, height: 32, borderRadius: 6, border: '1.2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink)', background: 'var(--surface-alt)',
            }}
              dangerouslySetInnerHTML={{ __html: ICONS.folder }}
            />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>
              Project &amp; Preset
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Koleksi editan free</div>
          </Link>
          <a
            href="https://whatsapp.com/channel/0029VbCw1ZW9hXFCWI1DN02T"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px',
              background: 'var(--surface)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)', boxShadow: '3px 3px 0 var(--shadow)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 6, border: '1.2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink)', background: 'var(--surface-alt)',
            }}
              dangerouslySetInnerHTML={{ __html: ICONS.whatsapp }}
            />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>
              Channel
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Update &amp; pengumuman</div>
          </a>
        </div>
      </section>

      {/* BEST PRODUK */}
      <section id="best-produk" style={{ padding: '30px 20px 6px' }}>
        <div className="eyebrow">best produk</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                overflow: 'hidden', background: 'var(--surface)',
              }}>
                <div style={{ height: 96, background: 'var(--surface-alt)' }} />
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ height: 14, width: '60%', background: 'var(--surface-alt)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 10, width: '90%', background: 'var(--surface-alt)', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ height: 28, width: '100%', background: 'var(--surface-alt)', borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        ) : bestProducts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px', color: 'var(--muted)',
            fontFamily: 'var(--font-mono)', fontSize: 13,
          }}>
            Belum ada rekomendasi produk.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bestProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                  overflow: 'hidden', background: 'var(--surface)',
                  boxShadow: '3px 3px 0 var(--shadow)',
                }}
              >
                <div style={{
                  position: 'relative', height: 96,
                  background: 'linear-gradient(160deg, var(--surface-alt), var(--surface))',
                  borderBottom: '1.5px solid var(--border)', overflow: 'hidden',
                }}>
                  <div
                    style={{
                      position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
                      width: 96, height: 96, color: 'var(--ink)', opacity: 0.16,
                    }}
                    dangerouslySetInnerHTML={{ __html: getCategoryIcon(p.category) }}
                  />
                  <span style={{
                    position: 'absolute', bottom: 8, left: 10,
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                    letterSpacing: '0.05em', color: 'var(--muted)',
                  }}>
                    PREVIEW
                  </span>
                  <span style={{
                    position: 'absolute', top: 8, right: 10,
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                    letterSpacing: '0.04em', padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)',
                    color: 'var(--muted)', background: 'var(--surface)',
                  }}>
                    {p.categoryLabel}
                  </span>
                </div>
                <div style={{ padding: '16px 18px 18px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                    color: 'var(--ink)', marginBottom: 5,
                  }}>{p.title}</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.55, marginBottom: 12 }}>
                    {p.description}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {(p.tags || []).map((tag) => (
                      <span key={tag} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                        border: '1.2px solid var(--border)', borderRadius: 'var(--radius-pill)',
                        padding: '3px 10px', color: 'var(--ink)', opacity: 0.8,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={p.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block', width: '100%', textAlign: 'center',
                      border: '1.2px solid var(--border)', borderRadius: 8,
                      background: 'var(--ink)', color: 'var(--bg)',
                      fontFamily: 'var(--font-mono)', fontSize: '11.5px', fontWeight: 600,
                      padding: 12,
                    }}
                  >
                    Beli di Lynk.id &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MY PROFILE */}
      <section id="my-profile" style={{ padding: '30px 20px 6px' }}>
        <div className="eyebrow">my profile</div>
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 24, textAlign: 'center',
          boxShadow: '3px 3px 0 var(--shadow)', marginBottom: 24,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
            border: '2px solid var(--border)', margin: '0 auto 12px',
          }}>
            <img src="/media/profile/profile-avatar.png" alt="Mathaoduoyu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            MATHAODUOYU
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
            Menghadirkan koleksi desain grafis modern, koleksi base script, serta berbagai solusi digital yang simpel, rapi, berkualitas, dan mudah digunakan.
          </p>
        </div>

        <div className="eyebrow" id="jelajahi">Jelajahi</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {[
            { href: 'https://mathabot.my.id', label: 'Website sewa bot', icon: ICONS.globe, external: true },
            { href: 'https://whatsapp.com/channel/0029VbCw1ZW9hXFCWI1DN02T', label: 'Channels', icon: ICONS.whatsapp, external: true },
            { href: '#best-produk', label: 'Products', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>', external: false },
            { href: '/store-project-preset', label: 'Projects', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>', external: false },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'var(--surface)',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
              }}
            >
              <div
                style={{ width: 18, height: 18, color: 'var(--ink)', flexShrink: 0 }}
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              <span style={{ flex: 1, fontSize: 14 }}>{item.label}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, color: 'var(--muted)' }}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center', padding: '30px 20px 24px',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)',
      }}>
        &copy; 2026 Mathaoduoyu. All rights reserved.
      </footer>
    </div>
    </>
  );
}
