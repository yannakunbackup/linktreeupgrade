'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('mathaoduoyu-theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('mathaoduoyu-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label="Ganti tema"
      style={{
        width: 38, height: 38,
        border: '1.5px solid var(--ink)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)',
        boxShadow: '3px 3px 0 var(--shadow-strong)',
        transition: 'all 0.1s',
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
