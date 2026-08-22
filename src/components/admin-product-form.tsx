'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/firestore-types';

interface AdminProductFormProps {
  initialData?: Product;
  onSubmit: (data: {
    title: string;
    description: string;
    tags: string[];
    link: string;
    isRecommended: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function AdminProductForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: AdminProductFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [tagsInput, setTagsInput] = useState(
    (initialData?.tags || []).join(', ').replace(/^#|,\s*#/g, (m) => m === ', ' ? ', ' : '')
  );
  const [link, setLink] = useState(initialData?.link || '');
  const [isRecommended, setIsRecommended] = useState(initialData?.isRecommended || false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function parseTags(input: string): string[] {
    return input
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (title.trim().length < 3) e.title = 'Judul minimal 3 karakter.';
    if (!description.trim()) e.description = 'Deskripsi wajib diisi.';
    if (!link.trim()) {
      e.link = 'Link wajib diisi.';
    } else {
      try {
        new URL(link.trim());
      } catch {
        e.link = 'URL tidak valid.';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        tags: parseTags(tagsInput),
        link: link.trim(),
        isRecommended,
      });
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-body)',
    color: 'var(--ink)', outline: 'none',
    boxShadow: '2px 2px 0 var(--shadow)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
    fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--muted)', marginBottom: 6,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: 12, color: '#ef4444', marginTop: 4,
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--surface)', border: '2px solid var(--border)',
      borderRadius: 14, padding: '24px 20px',
      boxShadow: '3px 3px 0 var(--shadow)', marginBottom: 24,
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
        color: 'var(--ink)', marginBottom: 20,
      }}>
        {initialData ? 'Edit Produk' : 'Tambah Produk Baru'}
      </h3>

      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Judul Produk *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Minimal 3 karakter"
          style={{ ...inputStyle, borderColor: errors.title ? '#ef4444' : 'var(--border)' }}
        />
        {errors.title && <div style={errorStyle}>{errors.title}</div>}
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Deskripsi Produk *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi produk"
          rows={3}
          style={{
            ...inputStyle, resize: 'vertical', minHeight: 80,
            borderColor: errors.description ? '#ef4444' : 'var(--border)',
          }}
        />
        {errors.description && <div style={errorStyle}>{errors.description}</div>}
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Tag</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="#whatsapp, #nodejs, #bot"
          style={inputStyle}
        />
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          Pisahkan dengan koma. Tanda # ditambahkan otomatis.
        </div>
      </div>

      {/* Link */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Link Produk Lynk.id *</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://lynk.id/..."
          style={{ ...inputStyle, borderColor: errors.link ? '#ef4444' : 'var(--border)' }}
        />
        {errors.link && <div style={errorStyle}>{errors.link}</div>}
      </div>

      {/* isRecommended */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: 'var(--surface-alt)',
        border: '1.5px solid var(--border)', borderRadius: 10, marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Tampilkan di Best Produk</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Produk akan tampil sebagai rekomendasi di halaman utama.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsRecommended(!isRecommended)}
          style={{
            width: 48, height: 26, borderRadius: 13,
            background: isRecommended ? 'var(--ink)' : 'var(--border)',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: isRecommended ? 'var(--bg)' : 'var(--surface)',
            position: 'absolute', top: 3,
            left: isRecommended ? 25 : 3,
            transition: 'left 0.2s',
            boxShadow: '1px 1px 2px rgba(0,0,0,0.15)',
          }} />
        </button>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            flex: 1, padding: '13px 24px', borderRadius: 10,
            border: '2px solid var(--ink)',
            background: saving ? 'var(--surface-alt)' : 'var(--ink)',
            color: saving ? 'var(--muted)' : 'var(--bg)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            boxShadow: '3px 3px 0 var(--shadow-strong)',
            cursor: saving ? 'wait' : 'pointer',
          }}
        >
          {saving ? 'Menyimpan...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          style={{
            padding: '13px 24px', borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--surface)', color: 'var(--ink)',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
            boxShadow: '2px 2px 0 var(--shadow)',
          }}
        >
          Batal
        </button>
      </div>
    </form>
  );
}