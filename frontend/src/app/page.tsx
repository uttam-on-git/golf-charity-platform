import type { Metadata } from 'next';

import GolfCharityLanding from '@/components/landing/GolfCharityLanding';

export const metadata: Metadata = {
  title: 'GolfCharity | The Modern Draw',
  description:
    'Enter your last five Stableford scores, compete for monthly prizes, and donate part of every subscription to charity.',
};

export default function HomePage() {
  return <GolfCharityLanding />;
}
