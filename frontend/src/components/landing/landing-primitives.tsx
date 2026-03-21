import Link from 'next/link';
import type { ReactNode } from 'react';

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
};

type StatsItemProps = {
  value: string;
  label: string;
};

type StepCardProps = {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
  delayClass?: string;
};

type PrizeTierCardProps = {
  eyebrow: string;
  title: string;
  share: string;
  description: string;
  highlighted?: boolean;
  delayClass?: string;
};

type PricingCardProps = {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  ctaLabel: string;
  popular?: boolean;
  delayClass?: string;
};

type SectionHeadingProps = {
  title: string;
  description: string;
};

type IconProps = {
  className?: string;
  strokeWidth?: number;
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="text-center mb-24 reveal">
      <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-0.04em] mb-4 text-white">
        {title}
      </h2>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">{description}</p>
    </div>
  );
}

export function LinkButton({
  href,
  children,
  variant = 'primary',
  className,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]',
        variant === 'primary'
          ? 'bg-emerald-500 text-[#0a0a0a] font-semibold hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
          : 'bg-(--gc-surface) border border-(--gc-border) text-white font-medium hover:bg-(--gc-border)',
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function StatsItem({ value, label }: StatsItemProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-8 md:pt-0">
      <span className="text-4xl font-extrabold tracking-tight text-white mb-2">{value}</span>
      <span className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}

export function StepCard({
  number,
  title,
  description,
  icon,
  delayClass,
}: StepCardProps) {
  return (
    <article
      className={cx(
        'card-hover reveal bg-(--gc-surface) border border-(--gc-border) rounded-3xl p-10 relative overflow-hidden',
        delayClass,
      )}
    >
      <div className="absolute -right-4 -top-8 text-[180px] font-black text-white/3 select-none leading-none">
        {number}
      </div>
      <div className="w-14 h-14 bg-(--gc-background) border border-(--gc-border) rounded-2xl flex items-center justify-center mb-8 relative z-10 text-emerald-500">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 relative z-10 text-white tracking-tight">{title}</h3>
      <p className="text-gray-400 leading-relaxed relative z-10 text-base">{description}</p>
    </article>
  );
}

export function PrizeTierCard({
  eyebrow,
  title,
  share,
  description,
  highlighted,
  delayClass,
}: PrizeTierCardProps) {
  return (
    <article
      className={cx(
        'reveal rounded-3xl text-center',
        delayClass,
        highlighted
          ? 'bg-(--gc-surface) border border-emerald-500/50 p-12 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] lg:-translate-y-6 z-10'
          : 'card-hover bg-(--gc-surface) border border-(--gc-border) p-10',
      )}
    >
      {highlighted ? (
        <>
          <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-emerald-500 text-sm font-black tracking-[0.2em] uppercase mb-6 flex items-center justify-center gap-2">
              <StarIcon className="size-4.5" />
              {eyebrow}
            </div>
            <div className="text-6xl font-extrabold text-white mb-2 tracking-[-0.04em]">{title}</div>
            <div className="text-emerald-400 font-bold text-2xl mb-8">{share}</div>
            <p className="text-gray-300 mb-8 leading-relaxed">{description}</p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--gc-background) border border-(--gc-border) text-sm font-medium text-gray-300">
              Current estimated:
              <span className="text-white font-bold text-base">4,500</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-gray-500 text-sm font-bold tracking-[0.2em] uppercase mb-4">{eyebrow}</div>
          <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">{title}</div>
          <div className="text-emerald-500 font-bold text-xl mb-6">{share}</div>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </>
      )}
    </article>
  );
}

export function PricingCard({
  name,
  description,
  price,
  period,
  features,
  ctaLabel,
  popular,
  delayClass,
}: PricingCardProps) {
  return (
    <article
      className={cx(
        'reveal flex flex-col rounded-4xl p-10 relative overflow-hidden',
        delayClass,
        popular
          ? 'bg-(--gc-surface) border-2 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.15)]'
          : 'card-hover bg-(--gc-surface) border border-(--gc-border)',
      )}
    >
      {popular ? (
        <>
          <div className="absolute top-0 right-0 bg-emerald-500 text-[#0a0a0a] text-xs font-bold px-5 py-2 rounded-bl-2xl uppercase tracking-[0.2em]">
            Most Popular
          </div>
          <div className="absolute -inset-4 bg-linear-to-b from-emerald-500/10 to-transparent pointer-events-none" />
        </>
      ) : null}

      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-2xl font-bold mb-2 text-white">{name}</h3>
        <p
          className={cx(
            'text-sm mb-8 font-medium',
            popular ? 'text-emerald-400 font-semibold' : 'text-gray-400',
          )}
        >
          {description}
        </p>

        <div className="mb-10 flex items-baseline gap-1 text-white">
          <span className="text-6xl font-extrabold tracking-[-0.04em]">{price}</span>
          <span className="text-gray-500 font-medium">{period}</span>
        </div>

        <ul className="space-y-5 mb-12 grow">
          {features.map((feature, index) => (
            <li
              key={feature}
              className={cx(
                'flex items-start gap-4 text-sm',
                popular && index === features.length - 1 ? 'text-white font-bold' : 'text-gray-300 font-medium',
              )}
            >
              <CheckIcon className="size-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={cx(
            'w-full rounded-xl py-4 font-semibold transition-[transform,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]',
            popular
              ? 'bg-emerald-500 text-[#0a0a0a] font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'
              : 'bg-(--gc-background) border border-(--gc-border) text-white hover:border-gray-600',
          )}
        >
          {ctaLabel}
        </button>
      </div>
    </article>
  );
}

export function ArrowRightIcon({ className, strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function CheckIcon({ className, strokeWidth = 3 }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
