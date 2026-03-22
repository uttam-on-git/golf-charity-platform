import Logo from '@/components/Logo';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cx('loading-shimmer rounded-xl bg-[#141414]', className)} aria-hidden="true" />;
}

export function CenteredAppLoader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden flex items-center justify-center px-6">
      <div className="grain-overlay" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] left-[8%] h-[34rem] w-[34rem] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[4%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/8 blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/8 bg-[#0a0a0b]/80 p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
          <Logo size={34} />
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400/90">GolfCharity</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{subtitle}</p>

        <div className="mt-8 flex items-center justify-center gap-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 loading-dot" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 loading-dot [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 loading-dot [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export function AuthPageLoader({ mode }: { mode: 'login' | 'register' }) {
  const title = mode === 'login' ? 'Preparing your sign-in experience' : 'Preparing your account setup';
  const subtitle =
    mode === 'login'
      ? 'We are loading your login flow and checking the latest session state.'
      : 'We are setting up the registration flow so you can get started smoothly.';

  return <CenteredAppLoader title={title} subtitle={subtitle} />;
}

export function SectionCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-5 w-5 rounded-md" />
          <SkeletonBlock className="h-5 w-40" />
        </div>
        <SkeletonBlock className="h-4 w-20" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
              <SkeletonBlock className="h-8 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
            <SkeletonBlock className="h-8 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardPageLoader({
  title = 'Loading your dashboard',
  subtitle = 'Pulling together your scores, draws, and membership details.',
  variant = 'generic',
}: {
  title?: string;
  subtitle?: string;
  variant?: 'overview' | 'subscription' | 'generic';
}) {
  const heroLabel =
    variant === 'overview'
      ? 'Member cockpit'
      : variant === 'subscription'
        ? 'Billing deck'
        : 'Dashboard sync';

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_48%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_40%)]" />

      <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[linear-gradient(135deg,rgba(12,12,12,0.96),rgba(18,30,24,0.9)_50%,rgba(10,10,10,0.98))] px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_32%)]" />
        <div className="pointer-events-none absolute -right-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-emerald-500/10" />
        <div className="pointer-events-none absolute right-14 top-6 h-2 w-2 rounded-full bg-emerald-400/70 shadow-[0_0_24px_rgba(52,211,153,0.75)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/80">{heroLabel}</p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100">{title}</h1>
            <p className="mt-2 text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed">{subtitle}</p>
          </div>

          <div className="grid max-w-sm grid-cols-3 gap-2 self-start lg:min-w-[250px]">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-white/[0.06] bg-black/20 px-3 py-3 backdrop-blur-sm">
                <SkeletonBlock className="mb-2 h-2.5 w-10 rounded-full" />
                <SkeletonBlock className="h-5 w-14 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="relative overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#141414] p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-3.5 w-24 rounded-full" />
                <SkeletonBlock className="h-8 w-24 rounded-xl" />
              </div>
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            </div>
            <SkeletonBlock className="h-3 w-36 rounded-full" />
          </div>
        ))}
      </div>

      {variant === 'subscription' ? (
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-5 w-5 rounded-md" />
                <SkeletonBlock className="h-5 w-44" />
              </div>
              <SkeletonBlock className="h-9 w-32 rounded-xl" />
            </div>
            <div className="rounded-[1.5rem] border border-[#1e1e1e] bg-[#0a0a0a] p-5">
              <SkeletonBlock className="mb-3 h-3 w-24 rounded-full" />
              <SkeletonBlock className="mb-3 h-8 w-40 rounded-xl" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-full rounded-full" />
                <SkeletonBlock className="h-3 w-[88%] rounded-full" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <SkeletonBlock className="h-7 w-28 rounded-full" />
                <SkeletonBlock className="h-7 w-36 rounded-full" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-6">
            <div className="mb-5 flex items-center gap-3">
              <SkeletonBlock className="h-5 w-5 rounded-md" />
              <SkeletonBlock className="h-5 w-36" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] p-5">
                  <SkeletonBlock className="mb-3 h-8 w-32 rounded-xl" />
                  <SkeletonBlock className="mb-2 h-3 w-40 rounded-full" />
                  <SkeletonBlock className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <SectionCardSkeleton rows={3} />
          <SectionCardSkeleton rows={4} />
        </div>
      )}

      {variant === 'overview' ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 lg:grid-cols-[1.15fr_0.85fr] md:gap-6">
          <section className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-7 w-24 rounded-full" />
            </div>
            <div className="flex flex-wrap justify-center gap-3 pb-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-20 w-14 rounded-2xl md:h-24 md:w-20" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-[#1e1e1e] pt-4">
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-16 rounded-full" />
                <SkeletonBlock className="h-4 w-20 rounded-full" />
              </div>
              <div className="space-y-2 text-right">
                <SkeletonBlock className="ml-auto h-3 w-16 rounded-full" />
                <SkeletonBlock className="ml-auto h-4 w-20 rounded-full" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-8 w-28 rounded-xl" />
            </div>
            <div className="rounded-[1.5rem] border border-[#1e1e1e] bg-[#0a0a0a] p-5">
              <div className="mb-5 flex items-center gap-3">
                <SkeletonBlock className="h-12 w-12 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-32 rounded-full" />
                  <SkeletonBlock className="h-3 w-24 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-full rounded-full" />
                <SkeletonBlock className="h-3 w-[82%] rounded-full" />
                <SkeletonBlock className="h-3 w-[74%] rounded-full" />
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function AdminPageLoader() {
  return (
    <DashboardPageLoader
      title="Loading the admin dashboard"
      subtitle="Syncing platform metrics, draw controls, and operating data."
    />
  );
}
