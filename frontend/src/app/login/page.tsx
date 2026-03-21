'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const registered = searchParams.get('registered') === 'true';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="grain-overlay" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[5%] w-[45%] h-[65%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[10%] w-[28%] h-[38%] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 xl:p-20 border-r border-white/[0.04] bg-[#0a0a0b]/60 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Logo size={28} />
              </div>
              <span className="text-xl font-semibold tracking-tight">GolfCharity</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.15] mb-6">
              Welcome back <br className="hidden lg:block" />
              to the draw.
            </h1>
            <p className="text-lg text-zinc-400 mb-12 leading-relaxed max-w-lg">
              Sign in to manage your scores, track your impact, and stay ready for the next monthly draw.
            </p>

            <div className="relative h-40 mb-16">
              <svg viewBox="0 0 400 160" className="absolute inset-0 w-full h-full" fill="none">
                <defs>
                  <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
                    <stop offset="20%" stopColor="#10B981" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#10B981" stopOpacity="0.8" />
                    <stop offset="80%" stopColor="#10B981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path d="M0 80 Q200 80 400 80" stroke="#10B981" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.3" />
                <path d="M0 40 Q200 40 400 40" stroke="#10B981" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.1" />
                <path d="M0 120 Q200 120 400 120" stroke="#10B981" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.1" />
                <path
                  d="M-20 80 C 80 160 180 0 280 80 C 330 120 380 120 420 80"
                  stroke="url(#glowGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#neonGlow)"
                />
                <path
                  d="M-20 80 C 80 0 180 160 280 80 C 330 40 380 40 420 80"
                  stroke="url(#glowGradient)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.6"
                  filter="url(#neonGlow)"
                />
                <circle cx="280" cy="80" r="3" fill="#10B981" filter="url(#neonGlow)" />
                <circle cx="130" cy="80" r="2" fill="#10B981" opacity="0.5" />
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                ['10%', 'Charity built in'],
                ['500+', 'Players joined'],
                ['24/7', 'Secure access'],
              ].map(([value, label]) => (
                <div key={label} className="glass-card rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                  <div className="relative z-10 flex flex-col gap-1">
                    <span className="text-2xl font-bold">{value}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-zinc-500 font-medium tracking-wide">
            2024 GolfCharity. All rights reserved.
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-14">
          <div className="relative w-full max-w-md glass-card rounded-[2rem] p-8 sm:p-10">
            <div className="absolute top-0 left-1/2 w-[70%] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent -translate-x-1/2" />
            <div className="absolute -top-10 left-1/2 w-1/2 h-20 bg-emerald-500/10 blur-2xl rounded-full -translate-x-1/2 pointer-events-none" />

            <div className="flex items-center justify-center gap-2 mb-8">
              <Logo size={32} />
              <span className="text-xl font-semibold">GolfCharity</span>
            </div>

            <h2 className="text-2xl font-semibold text-white text-center mb-2">Sign In</h2>
            <p className="text-sm text-zinc-400 text-center mb-6">
              Enter your details to access your account.
            </p>

            {registered && (
              <div className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#8ef0c6] text-sm rounded-xl px-4 py-3 mb-4 text-center">
                Account created successfully. You can log in now.
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 input-glow rounded-xl border border-zinc-800 bg-[#0d0d0f]">
                <label htmlFor="login-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2 input-glow rounded-xl border border-zinc-800 bg-[#0d0d0f]">
                <div className="flex items-center justify-between px-4 pt-3 text-xs font-medium text-zinc-300">
                  <label htmlFor="login-password">Password</label>
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors text-[11px]">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-glow rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-[#0a0a0a] transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-white font-medium hover:text-emerald-300 transition-colors underline decoration-white/20 underline-offset-4"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
