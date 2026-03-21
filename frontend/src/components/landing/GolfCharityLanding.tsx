'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import Logo from '@/components/Logo';
import {
  ArrowRightIcon,
  CardIcon,
  CheckIcon,
  HeartIcon,
  LinkButton,
  ListIcon,
  PricingCard,
  PrizeTierCard,
  SectionHeading,
  StatsItem,
  StepCard,
} from './landing-primitives';

export default function GolfCharityLanding() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.15,
      },
    );

    const revealedElements = document.querySelectorAll('.reveal');
    revealedElements.forEach((element) => observer.observe(element));

    const fill = document.getElementById('demo-slider-fill');
    const handle = document.getElementById('demo-slider-handle');
    let returnTimer = 0;

    const kickOff = window.setTimeout(() => {
      fill?.style.setProperty('width', '30%');
      handle?.style.setProperty('left', '30%');

      returnTimer = window.setTimeout(() => {
        fill?.style.setProperty('width', '10%');
        handle?.style.setProperty('left', '10%');
      }, 1200);
    }, 1000);

    return () => {
      observer.disconnect();
      window.clearTimeout(kickOff);
      window.clearTimeout(returnTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white selection:bg-emerald-500/30 selection:text-white">
      <div className="grain-overlay" />

      <nav className="sticky top-0 z-40 w-full border-b border-(--gc-border) bg-[rgba(10,10,10,0.8)] backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size={36} />
            <span className="font-bold text-lg tracking-tight">GolfCharity</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0a] font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.97]"
            >
              Get Started
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex flex-col">
        <section className="relative bg-[#0a0a0a] pt-32 pb-20 md:pt-40 md:pb-32 px-6 flex flex-col items-center justify-center text-center max-w-4xl mx-auto min-h-[85vh]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--gc-border) bg-[rgba(17,17,17,0.5)] text-xs font-medium text-gray-300 mb-8 reveal">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Next draw in 14 days
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-[-0.04em] leading-[1.05] text-white mb-8 reveal reveal-delay-1">
            Play the numbers.
            <br />
            <span className="text-emerald-500">Fund the future.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed reveal reveal-delay-2">
            The modern subscription draw. Enter your last 5 Stableford scores, match the monthly draw to win huge prizes, and automatically donate 10% to a charity of your choice.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto reveal reveal-delay-3">
            <LinkButton href="/register" className="w-full sm:w-auto">
              Subscribe Now
              <ArrowRightIcon className="size-4.5" />
            </LinkButton>
            <LinkButton href="#how-it-works" variant="secondary" className="w-full sm:w-auto">
              How it works
            </LinkButton>
          </div>
        </section>

        <section className="border-y border-(--gc-border) bg-[rgba(17,17,17,0.3)]">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-(--gc-border) reveal">
              <StatsItem value="10,000+" label="Given to Charity" />
              <StatsItem value="500+" label="Active Players" />
              <StatsItem value="12" label="Draws Completed" />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-[#0a0a0a] py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              title="A simpler way to play & give"
              description="No complex rules. Just numbers, prizes, and impact."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StepCard
                number="1"
                title="Subscribe"
                description="Choose a monthly or yearly plan. Your subscription secures your guaranteed entry into every single draw."
                icon={<CardIcon className="size-6" />}
              />
              <StepCard
                number="2"
                title="Enter Scores"
                description="Input your last 5 Stableford scores (between 1 and 45). These automatically become your unique draw numbers."
                icon={<ListIcon className="size-6" />}
                delayClass="reveal-delay-1"
              />
              <StepCard
                number="3"
                title="Win & Give Back"
                description="Match 3, 4, or 5 numbers to win the prize pool. 10% of your subscription automatically goes to your chosen charity."
                icon={<HeartIcon className="size-6" />}
                delayClass="reveal-delay-2"
              />
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-[#0c0c0c] border-y border-(--gc-border)">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              title="Transparent prize pool"
              description="See exactly how the winnings are distributed every month."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <PrizeTierCard
                eyebrow="Tier 3"
                title="3 Match"
                share="25% of pool"
                description="Shared equally among all players who match exactly 3 numbers in the draw."
              />
              <PrizeTierCard
                eyebrow="The Jackpot"
                title="5 Match"
                share="40% of pool"
                description="Match all 5 numbers to win the ultimate prize. If there are no winners, the jackpot rolls over to the next month."
                highlighted
                delayClass="reveal-delay-1"
              />
              <PrizeTierCard
                eyebrow="Tier 2"
                title="4 Match"
                share="35% of pool"
                description="Shared equally among all players who match exactly 4 numbers in the draw."
                delayClass="reveal-delay-2"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#0a0a0a] py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="reveal">
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-[-0.04em] mb-6 text-white leading-tight">
                  Play with
                  <br />
                  purpose.
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                  We believe platforms should give back by default. That&apos;s why <strong className="text-white">10% of every single subscription</strong> goes directly to a registered charity that you select during checkout. No hidden fees, no complex math. Just direct impact.
                </p>
                <ul className="space-y-6">
                  {[
                    'Choose from over 1,000 vetted charities',
                    'Change your chosen charity anytime',
                    'Track your total lifetime contribution',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-4 text-gray-300 font-medium">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckIcon className="size-4" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-(--gc-surface) border border-(--gc-border) rounded-3xl p-8 lg:p-12 reveal reveal-delay-1 relative overflow-hidden shadow-2xl">
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div>
                    <h3 className="font-bold text-2xl text-white tracking-tight">Your Contribution</h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Subscription portion donated</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-emerald-500 tracking-tight">10%</div>
                    <div className="text-xs font-bold px-2.5 py-1 mt-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-[0.2em]">
                      Guaranteed
                    </div>
                  </div>
                </div>

                <div className="relative pt-6 pb-6 z-10">
                  <div className="h-3 bg-(--gc-background) rounded-full border border-(--gc-border) w-full relative overflow-hidden">
                    <div
                      id="demo-slider-fill"
                      className="absolute left-0 top-0 h-full w-[15%] bg-emerald-500 rounded-full transition-[width] duration-1000 ease-out"
                    />
                  </div>
                  <div
                    id="demo-slider-handle"
                    className="absolute top-5 left-[15%] w-7 h-7 bg-white rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] border-4 border-emerald-500 -ml-3.5 flex items-center justify-center transition-[left,transform] duration-1000 ease-out hover:scale-110 cursor-pointer"
                  >
                    <div className="w-1.5 h-3 bg-emerald-500/20 rounded-full flex gap-0.5">
                      <div className="w-px h-full bg-emerald-500" />
                      <div className="w-px h-full bg-emerald-500" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-600 mt-5 px-1 tracking-[0.2em] uppercase">
                    <span>10%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="mt-8 p-5 rounded-2xl bg-(--gc-background) border border-(--gc-border) flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0 flex items-center justify-center text-emerald-500">
                    <HeartIcon className="size-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-[0.2em]">Currently supporting</div>
                    <div className="font-bold text-lg text-white">Charity Water</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-32 px-6 bg-[#0c0c0c] border-y border-(--gc-border)">
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              title="Simple, transparent pricing"
              description="Choose how you want to play. Cancel anytime."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <PricingCard
                name="Monthly"
                description="Flexible entry, billed every month."
                price="9.99"
                period="/mo"
                features={[
                  '1 entry per monthly draw',
                  '10% guaranteed charity donation',
                  'Access to member dashboard',
                  'Cancel anytime',
                ]}
                ctaLabel="Subscribe Monthly"
              />
              <PricingCard
                name="Yearly"
                description="Save 19.89 compared to monthly."
                price="99.99"
                period="/yr"
                features={[
                  '1 entry per monthly draw',
                  '10% guaranteed charity donation',
                  'Access to member dashboard',
                  '2 months absolutely free',
                ]}
                ctaLabel="Subscribe Yearly"
                popular
                delayClass="reveal-delay-1"
              />
            </div>
          </div>
        </section>

        <section className="py-32 px-6 relative overflow-hidden border-b border-(--gc-border)">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 reveal">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-[-0.04em] mb-8 text-white">
              Ready to make
              <br />
              your numbers count?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Join 500+ players making a difference every single month. Subscribe today and enter your first draw.
            </p>

            <LinkButton href="/register" className="text-lg px-10 py-5 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              Subscribe Now
              <ArrowRightIcon className="size-5" strokeWidth={2.5} />
            </LinkButton>
          </div>
        </section>
      </main>

      <footer className="bg-[#0a0a0a] py-10 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <Logo size={28} />
            <span className="font-bold text-white tracking-tight">GolfCharity</span>
          </div>

          <div className="text-sm font-medium text-gray-500 flex items-center gap-8">
            <Link href="/" className="hover:text-emerald-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-emerald-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-emerald-500 transition-colors">
              Contact
            </Link>
          </div>

          <div className="text-sm font-medium text-gray-600">2026 GolfCharity. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
