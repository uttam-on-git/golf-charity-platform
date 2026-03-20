'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const links = [
  { label: 'Overview',      href: '/dashboard' },
  { label: 'My Scores',     href: '/dashboard/scores' },
  { label: 'Draws',         href: '/dashboard/draws' },
  { label: 'Charity',       href: '/dashboard/charity' },
  { label: 'Subscription',  href: '/dashboard/subscription' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <span className="text-white font-bold text-lg">GolfCharity</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition
              ${pathname === link.href
                ? 'bg-green-500/10 text-green-400 font-medium'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 truncate mb-3">{user?.email}</p>
        <button
          onClick={logout}
          className="w-full text-sm text-red-400 hover:text-red-300 text-left transition"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}