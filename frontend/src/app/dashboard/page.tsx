'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ScoreItem, SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import { useAuth } from '@/context/AuthContext';

const recentScores = [
  { score: '82', course: 'Wentworth Club', date: '24 Oct 2023', delta: '+10' },
  { score: '79', course: 'Sunningdale (Old)', date: '12 Oct 2023', delta: '+7' },
  { score: '85', course: "Royal St George's", date: '28 Sep 2023', delta: '+13' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] ?? 'john.doe';

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Here&apos;s your latest subscription overview and draw status.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Subscription Status"
          value="Active"
          accent={
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-40" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </div>
              <span className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">
                Active
              </span>
            </div>
          }
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Draws Entered"
          value="24"
          suffix="tickets"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          }
        />
        <StatCard
          label="Total Winnings"
          value="0.00"
          className="sm:col-span-2 lg:col-span-1"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <section className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 hover:border-[#2a2a2a] transition-colors flex flex-col justify-center">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-base md:text-lg font-medium text-zinc-100 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-[#10b981]" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Next Major Draw
              </h2>
              <span className="text-[10px] md:text-xs font-semibold px-2.5 py-1 bg-[#1e1e1e] text-zinc-300 rounded-md tracking-wider uppercase border border-[#2a2a2a]">
                Nov Edition
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-8 pb-4">
              <div className="flex flex-col items-center">
                <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center mb-2 shadow-inner">
                  <span className="text-3xl sm:text-5xl font-semibold text-zinc-100 font-mono tracking-tighter">14</span>
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-medium">Days</span>
              </div>

              <span className="text-2xl sm:text-4xl text-[#2a2a2a] -mt-6 font-mono">:</span>

              <div className="flex flex-col items-center">
                <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center mb-2 shadow-inner">
                  <span className="text-3xl sm:text-5xl font-semibold text-zinc-100 font-mono tracking-tighter">08</span>
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-medium">Hours</span>
              </div>

              <span className="text-2xl sm:text-4xl text-[#2a2a2a] -mt-6 font-mono hidden sm:block">:</span>

              <div className="hidden sm:flex flex-col items-center">
                <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl w-20 h-24 flex items-center justify-center mb-2 shadow-inner">
                  <span className="text-5xl font-semibold text-zinc-100 font-mono tracking-tighter">45</span>
                </div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Mins</span>
              </div>
            </div>
          </section>

          <SectionCard
            title="Recent Scores"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" aria-hidden="true">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
            action={
              <Link
                href="/dashboard/scores"
                className="text-sm font-medium text-[#10b981] hover:text-[#059669] transition-colors flex items-center gap-1"
              >
                View all
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            }
          >
            <div className="flex flex-col gap-3">
              {recentScores.map((score) => (
                <ScoreItem key={`${score.course}-${score.date}`} {...score} />
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col">
          <section className="bg-[#141414] border border-[#1e1e1e] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-colors flex flex-col h-full">
            <div className="p-6 border-b border-[#1e1e1e] flex items-center justify-between bg-[#0f0f0f]/50">
              <h2 className="text-base md:text-lg font-medium text-zinc-100 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-rose-500" aria-hidden="true">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                Your Impact
              </h2>
              <div className="flex items-center gap-1.5 bg-[#10b981]/10 px-2.5 py-1 rounded-full border border-[#10b981]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                <span className="text-[10px] md:text-xs font-medium text-[#10b981]">5% Contribution</span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="w-full h-48 md:h-56 bg-[#1e1e1e] rounded-xl mb-6 overflow-hidden relative border border-[#2a2a2a] group">
                <Image
                  src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1200&h=800"
                  alt="Golf Charity Initiative"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 ease-in-out mix-blend-luminosity group-hover:mix-blend-normal"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white p-1.5 shadow-xl shrink-0">
                    <div className="w-full h-full bg-[#1e1e1e] rounded flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg shadow-sm leading-tight">The Golf Foundation</h3>
                    <p className="text-xs text-zinc-300">Supporting youth in sports</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Your monthly subscription actively supports The Golf Foundation. By choosing this charity, you&apos;re helping introduce young people from all backgrounds to the sport, teaching them valuable life skills and providing access to coaching facilities across the country.
              </p>

              <div className="mt-auto pt-5 border-t border-[#1e1e1e] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-0.5">Total Contributed</span>
                  <span className="text-xl font-semibold text-zinc-100">45.00</span>
                </div>
                <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-transparent hover:border-[#3f3f46] px-4 py-2 rounded-lg">
                  Manage Charity
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
