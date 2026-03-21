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
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm md:text-base text-zinc-500">{subtitle}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-8 w-24" />
              </div>
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            </div>
            <SkeletonBlock className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <SectionCardSkeleton rows={3} />
        <SectionCardSkeleton rows={4} />
      </div>
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
