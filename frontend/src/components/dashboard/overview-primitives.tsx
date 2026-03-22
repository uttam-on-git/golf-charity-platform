type StatCardProps = {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
  accent?: React.ReactNode;
  className?: string;
};

type SectionCardProps = {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

type ScoreItemProps = {
  score: string;
  course: string;
  date: string;
  delta: string;
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function StatCard({ label, value, suffix, icon, accent, className }: StatCardProps) {
  return (
    <div
      className={cx(
        'bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 hover:border-[#2a2a2a] transition-all duration-300 relative group overflow-hidden',
        className,
      )}
    >
      <div className="absolute top-5 right-5 text-[#1e1e1e] group-hover:text-[#2a2a2a] transition-colors">
        <span className="size-12 block">{icon}</span>
      </div>
      <div className="relative z-10">
        <p className="text-xs md:text-sm font-medium text-zinc-500 mb-3">{label}</p>
        {accent ?? (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">
              {value}
            </span>
            {suffix ? <span className="text-sm text-zinc-500">{suffix}</span> : null}
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionCard({ title, icon, action, children, className }: SectionCardProps) {
  return (
    <section
      className={cx(
        'bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 hover:border-[#2a2a2a] transition-colors',
        className,
      )}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="min-w-0 text-base md:text-lg font-medium text-zinc-100 flex items-center gap-2">
          <span className="size-5 block">{icon}</span>
          <span className="truncate">{title}</span>
        </h2>
        {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function ScoreItem({ score, course, date, delta }: ScoreItemProps) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-3 md:p-4 flex items-center justify-between group cursor-pointer hover:border-[#2a2a2a] hover:bg-[#0f0f0f] transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#1e1e1e] flex items-center justify-center text-zinc-100 border border-[#2a2a2a] shrink-0">
          <span className="text-base md:text-lg font-bold">{score}</span>
        </div>
        <div>
          <p className="text-sm md:text-base font-medium text-zinc-200 group-hover:text-white transition-colors">
            {course}
          </p>
          <p className="text-[11px] md:text-xs text-zinc-500 mt-0.5">{date}</p>
        </div>
      </div>
      <div className="text-xs font-medium text-zinc-400 bg-[#141414] px-2 py-1 rounded border border-[#1e1e1e] group-hover:border-[#2a2a2a]">
        {delta}
      </div>
    </div>
  );
}
