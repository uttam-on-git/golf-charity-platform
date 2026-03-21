import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import GolfCharityLanding from '@/components/landing/GolfCharityLanding';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GolfCharity | The Modern Draw',
  description:
    'Enter your last five Stableford scores, compete for monthly prizes, and donate part of every subscription to charity.',
};

export default function HomePage() {
  return (
    <div className={inter.className}>
      <GolfCharityLanding />
    </div>
  );
}
