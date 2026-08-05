'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Sign in gagal.');
        return;
      }

      localStorage.setItem('mik_token', data.token);
      localStorage.setItem('mik_user', JSON.stringify(data.user));

      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect || '/dashboard');
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">MIKAFAROZE</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Selamat Datang</h1>
          <p className="text-slate-400 text-sm">Sign in untuk akses dashboard</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="email@contoh.com"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition pr-12"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <p className="text-center text-slate-400 text-sm">
              Belum punya akun?{' '}
              <Link href="/sign-up" className="text-violet-400 hover:text-violet-300 font-medium">
                Daftar gratis
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
