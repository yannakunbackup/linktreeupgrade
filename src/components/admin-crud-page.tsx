'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, doc, Timestamp,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Product } from '@/lib/firestore-types';
import AdminProductForm from '@/components/admin-product-form';
import Link from 'next/link';

interface AdminCrudPageProps {
  collectionName: string;
  title: string;
  subtitle: string;
}

export default function AdminCrudPage({ collectionName, title, subtitle }: AdminCrudPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    const q = query(collection(getDb(), collectionName), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
      setLoading(false);
    });
    return () => unsub();
  }, [collectionName]);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function handleSave(data: {
    title: string;
    description: string;
    tags: string[];
    link: string;
    isRecommended: boolean;
  }) {
    if (editProduct) {
      await updateDoc(doc(getDb(), collectionName, editProduct.id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      showToast('Produk berhasil diperbarui.', true);
    } else {
      await addDoc(collection(getDb(), collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      showToast('Produk berhasil ditambahkan.', true);
    }
    setShowForm(false);
    setEditProduct(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(getDb(), collectionName, deleteTarget.id));
      showToast('Produk berhasil dihapus.', true);
    } catch {
      showToast('Gagal menghapus produk.', false);
    }
    setDeleteTarget(null);
  }

  return (
    <>
      <div className="ambient-bg" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <Link href="/admin/dashboard" style={{
            width: 38, height: 38, border: '1.5px solid var(--ink)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink)', background: 'var(--surface-alt)',
            boxShadow: '3px 3px 0 var(--shadow-strong)',
          }} aria-label="Kembali">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 17, height: 17 }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
            color: 'var(--muted)',
          }}>{products.length} produk</span>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28,
            color: 'var(--ink)', marginBottom: 4,
          }}>{title}</h1>
          <div style={{
            fontFamily: 'var(--font-script)', fontWeight: 600, fontSize: 22,
            color: 'var(--muted)', transform: 'rotate(-1deg)',
          }}>{subtitle}</div>
        </div>

        {/* Add Button */}
        {!showForm && !editProduct && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 10,
              border: '2px solid var(--ink)', background: 'var(--ink)', color: 'var(--bg)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
              boxShadow: '3px 3px 0 var(--shadow-strong)', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18 }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Produk Baru
          </button>
        )}

        {/* Form */}
        {(showForm || editProduct) && (
          <AdminProductForm
            initialData={editProduct || undefined}
            onSubmit={handleSave}
            onCancel={() => { setShowForm(false); setEditProduct(null); }}
            submitLabel={editProduct ? 'Perbarui' : 'Tambah'}
          />
        )}

        {/* Product List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{
                height: 64, background: 'var(--surface-alt)',
                border: '1.5px solid var(--border)', borderRadius: 10,
              }} />
            ))
          ) : products.length === 0 && !showForm ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              color: 'var(--muted)', fontSize: 13,
            }}>
              Belum ada produk. Klik tombol di atas untuk menambahkan.
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} style={{
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 12, padding: '16px 18px',
                boxShadow: '2px 2px 0 var(--shadow)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                        color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{p.title}</h3>
                      {p.isRecommended && (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                          padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                          border: '1px solid var(--ink)', color: 'var(--ink)',
                          flexShrink: 0, letterSpacing: '0.04em',
                        }}>BEST</span>
                      )}
                    </div>
                    <p style={{
                      fontSize: 12, color: 'var(--muted)', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{p.description}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {(p.tags || []).slice(0, 4).map((tag) => (
                        <span key={tag} style={{
                          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)',
                          padding: '2px 8px', color: 'var(--muted)',
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => setEditProduct(p)}
                      style={{
                        width: 34, height: 34, borderRadius: 8,
                        border: '1.2px solid var(--border)', background: 'var(--surface-alt)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      aria-label="Edit"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: 'var(--ink)' }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      style={{
                        width: 34, height: 34, borderRadius: 8,
                        border: '1.2px solid var(--border)', background: 'var(--surface-alt)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      aria-label="Hapus"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: '#ef4444' }}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(6px)',
          }} onClick={() => setDeleteTarget(null)} />
          <div style={{
            position: 'relative', zIndex: 1, maxWidth: 360, width: '100%',
            background: 'var(--surface)', border: '2px solid var(--border)',
            borderRadius: 16, padding: '28px 24px', textAlign: 'center',
            boxShadow: '4px 4px 0 var(--shadow-strong)',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '2px solid #ef4444', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: 22, height: 22 }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
              color: 'var(--ink)', marginBottom: 8,
            }}>Hapus Produk?</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
              &quot;{deleteTarget.title}&quot; akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: 10,
                  border: '1.5px solid var(--border)', background: 'var(--surface)',
                  color: 'var(--ink)', fontFamily: 'var(--font-display)',
                  fontWeight: 600, fontSize: 14,
                  boxShadow: '2px 2px 0 var(--shadow)',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: 10,
                  border: '2px solid #ef4444', background: '#ef4444', color: '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                  boxShadow: '3px 3px 0 #b91c1c',
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, padding: '12px 24px', borderRadius: 10,
          background: toast.ok ? 'var(--ink)' : '#ef4444',
          color: toast.ok ? 'var(--bg)' : '#fff',
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
          boxShadow: '3px 3px 0 var(--shadow-strong)',
          animation: 'slideUp 0.25s ease',
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}