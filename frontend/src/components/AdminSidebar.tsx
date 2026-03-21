'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

type AdminNavItem = {
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ReactNode;
};

const links: AdminNavItem[] = [
  {
    label: 'Overview',
    shortLabel: 'Overview',
    href: '/admin',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Users',
    shortLabel: 'Users',
    href: '/admin/users',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6" />
        <path d="M23 11h-6" />
      </svg>
    ),
  },
  {
    label: 'Draw Control',
    shortLabel: 'Draws',
    href: '/admin/draws',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
  {
    label: 'Charities',
    shortLabel: 'Charity',
    href: '/admin/charities',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    label: 'Winners',
    shortLabel: 'Winners',
    href: '/admin/winners',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        <path d="M12 15v7" />
        <path d="M8 22h8" />
      </svg>
    ),
  },
];

function getInitials(email?: string | null, fullName?: string | null) {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'AD';
  }

  if (!email) return 'AD';

  const [name] = email.split('@');
  return (
    name
      .split(/[.\-_]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'AD'
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initials = getInitials(user?.email, user?.full_name);

  return (
    <>
      <aside className="hidden md:flex flex-col w-[240px] bg-[#0f0f0f] border-r border-[#1e1e1e] h-screen shrink-0 z-40">
        <div className="h-20 flex items-center px-6 border-b border-[#1e1e1e]">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 text-zinc-100 font-semibold text-lg tracking-tight hover:opacity-90 transition-opacity"
          >
            <Logo size={32} className="drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
            <span>GolfCharity</span>
          </Link>
        </div>

        <nav className="flex-1 py-8 flex flex-col gap-1.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-6 py-2.5 relative group ${
                  isActive ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 transition-colors'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full transition-colors ${
                    isActive
                      ? 'bg-[#10b981] shadow-[2px_0_8px_rgba(16,185,129,0.4)]'
                      : 'bg-transparent group-hover:bg-[#1e1e1e]'
                  }`}
                />
                <span className={`size-5 ${isActive ? 'text-[#10b981]' : ''}`}>{link.icon}</span>
                <span className="font-medium text-sm">{link.label}</span>
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
              <p className="text-xs text-[#10b981] truncate font-medium mt-0.5">Administrator</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg border border-transparent hover:border-[#1e1e1e] hover:bg-[#141414] mb-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

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
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 w-16 p-1 transition-colors relative ${
                isActive ? 'text-[#10b981]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="size-5">{link.icon}</span>
              <span className="text-[10px] font-medium">{link.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
