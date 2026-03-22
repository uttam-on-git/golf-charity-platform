'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

type NavItem = {
  label: string;
  shortLabel: string;
  href: string;
  badge?: string;
  showMobileDot?: boolean;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: 'Overview',
    shortLabel: 'Overview',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'My Scores',
    shortLabel: 'Scores',
    href: '/dashboard/scores',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    label: 'Draws',
    shortLabel: 'Draws',
    href: '/dashboard/draws',
    badge: 'NEW',
    showMobileDot: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    ),
  },
  {
    label: 'Charity',
    shortLabel: 'Charity',
    href: '/dashboard/charity',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    label: 'Notifications',
    shortLabel: 'Alerts',
    href: '/dashboard/notifications',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.268 21a2 2 0 0 0 3.464 0" />
        <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .738-1.674C19.41 13.868 18 12.2 18 8A6 6 0 0 0 6 8c0 4.2-1.411 5.868-2.738 7.326" />
      </svg>
    ),
  },
  {
    label: 'Subscription',
    shortLabel: 'Profile',
    href: '/dashboard/subscription',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
];

function getInitials(email?: string | null, fullName?: string | null) {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'JD';
  }

  if (!email) return 'JD';

  const [name] = email.split('@');
  return (
    name
      .split(/[.\-_]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'JD'
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initials = getInitials(user?.email, user?.full_name);
  const memberLabel = user?.role === 'admin' ? 'Administrator' : 'Founding Member';

  return (
    <>
      <aside className="hidden md:flex flex-col w-[240px] bg-[#0f0f0f] border-r border-[#1e1e1e] h-screen shrink-0 z-40">
        <div className="h-20 flex items-center px-6 border-b border-[#1e1e1e]">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-100 font-semibold text-lg tracking-tight hover:opacity-90 transition-opacity"
          >
            <Logo size={32} className="drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
            <span>GolfCharity</span>
          </Link>
        </div>

        <nav className="flex-1 py-8 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-2.5 relative group ${
                  isActive
                    ? 'text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 transition-colors'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full transition-colors ${
                    isActive
                      ? 'bg-[#10b981] shadow-[2px_0_8px_rgba(16,185,129,0.4)]'
                      : 'bg-transparent group-hover:bg-[#1e1e1e]'
                  }`}
                />
                <span className={`size-5 ${isActive ? 'text-[#10b981]' : ''}`}>{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto bg-[#1e1e1e] text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-[#1e1e1e] mt-auto shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#141414] border border-[#1e1e1e] flex items-center justify-center text-[#10b981] font-semibold text-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{user?.email}</p>
              <p className="text-xs text-[#10b981] truncate font-medium mt-0.5">{memberLabel}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg border border-transparent hover:border-[#1e1e1e] hover:bg-[#141414]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f]/95 backdrop-blur-md border-t border-[#1e1e1e] flex justify-around items-center h-16 px-2 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isProfile = item.href === '/dashboard/subscription';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 w-16 p-1 transition-colors relative ${
                isActive ? 'text-[#10b981]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item.showMobileDot && !isActive ? (
                <div className="absolute top-1 right-2 w-2 h-2 bg-[#10b981] rounded-full" />
              ) : null}
              {isProfile ? (
                <div className="w-6 h-6 rounded-full bg-[#141414] border border-[#1e1e1e] flex items-center justify-center text-[#10b981] font-semibold text-[10px]">
                  {initials}
                </div>
              ) : (
                <span className="size-5">{item.icon}</span>
              )}
              <span className="text-[10px] font-medium">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
