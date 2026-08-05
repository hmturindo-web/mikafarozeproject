'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

type Step = 'form' | 'verify';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Pendaftaran gagal.');
        return;
      }

      setEmail(form.email);
      setStep('verify');
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setError('Kode harus 6 digit.'); return; }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Verifikasi gagal.');
        return;
      }

      // Save token to localStorage
      localStorage.setItem('mik_token', data.token);
      localStorage.setItem('mik_user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) setError(data.error || 'Gagal mengirim ulang kode.');
      else setError(null);
    } catch {
      setError('Gagal mengirim ulang kode.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">MIKAFAROZE</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {step === 'form' ? 'Buat Akun Baru' : 'Verifikasi Email'}
          </h1>
          <p className="text-slate-400 text-sm">
            {step === 'form'
              ? 'Mulai 7 hari gratis — tanpa kartu kredit'
              : `Kami kirim kode ke ${email}`}
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">

          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
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
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Perusahaan <span className="text-slate-500">(opsional)</span></label>
                <input
                  type="text"
                  placeholder="PT Contoh Indonesia"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                  value={form.companyName}
                  onChange={e => setForm({ ...form, companyName: e.target.value })}
                />
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Daftar Gratis'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-center text-slate-400 text-sm">
                Sudah punya akun?{' '}
                <Link href="/sign-in" className="text-violet-400 hover:text-violet-300 font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center">
                <CheckCircle className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                <p className="text-slate-300 text-sm">
                  Masukkan kode 6 digit yang kami kirim ke<br />
                  <strong className="text-white">{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Kode Verifikasi</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-600 text-white text-center text-2xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:border-violet-500 transition font-mono"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verifikasi'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-slate-400 hover:text-violet-400 text-sm transition"
                >
                  Kirim ulang kode
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => { setStep('form'); setCode(''); setError(null); }}
                  className="text-slate-400 hover:text-violet-400 text-sm transition"
                >
                  Ganti email
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Trust signals */}
        {step === 'form' && (
          <div className="mt-6 flex items-center justify-center gap-6 text-slate-500 text-xs">
            <span>🔒 Data aman</span>
            <span>📧 Verifikasi email</span>
            <span>🚫 Tanpa spam</span>
          </div>
        )}
      </div>
    </div>
  );
}
