'use client';

import * as motion from 'motion/react-client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="bg-gray-950 min-h-screen text-white">

      {/* ── Nav ───────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="font-bold text-lg">⛳ GolfCharity</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold bg-green-500/10 text-green-400 px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
            Play · Win · Give Back
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight"
        >
          Golf that actually{' '}
          <span className="text-green-400">means something</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Track your Stableford scores, enter monthly prize draws,
          and support a charity you care about - all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3.5 rounded-xl text-sm transition"
          >
            Start for free →
          </Link>
          <Link href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">
            How it works
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 gap-6 mt-24 border border-gray-800 rounded-2xl p-8 bg-gray-900"
        >
          {[
            { value: '£10,000+', label: 'Given to charity' },
            { value: '500+',     label: 'Active players' },
            { value: '12',       label: 'Draws completed' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-green-400">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section id="how-it-works" className="bg-gray-900 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">Three simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01', icon: '💳', title: 'Subscribe',
                desc: 'Choose a monthly or yearly plan. A portion of every payment goes straight to your charity.',
              },
              {
                step: '02', icon: '⛳', title: 'Enter your scores',
                desc: 'Log your last 5 Stableford scores. Your numbers automatically enter you into the monthly draw.',
              },
              {
                step: '03', icon: '🎲', title: 'Win & give back',
                desc: 'Match 3, 4 or all 5 numbers to win prizes. The jackpot rolls over if unclaimed.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-gray-950 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-xs text-gray-600 font-bold">{item.step}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prize tiers ───────────────────────────────── */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Prize tiers</h2>
          <p className="text-gray-400">Every draw has three ways to win</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { match: '5 Numbers', icon: '🏆', pool: '40% of pool', note: 'Jackpot - rolls over if unclaimed', highlight: true },
            { match: '4 Numbers', icon: '🥈', pool: '35% of pool', note: 'Split equally among winners', highlight: false },
            { match: '3 Numbers', icon: '🥉', pool: '25% of pool', note: 'Split equally among winners', highlight: false },
          ].map((tier, i) => (
            <motion.div
              key={tier.match}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl p-6 border cursor-default ${
                tier.highlight
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-gray-800 bg-gray-900'
              }`}
            >
              <span className="text-3xl mb-4 block">{tier.icon}</span>
              <h3 className="text-white font-bold text-lg mb-1">{tier.match}</h3>
              <p className="text-green-400 font-semibold text-sm mb-2">{tier.pool}</p>
              <p className="text-gray-500 text-xs">{tier.note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/*Charity section*/}
      <section className="bg-gray-900 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-4xl block mb-6">h</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Every subscription gives back
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
              A minimum of 10% of your subscription goes to a charity of your choice.
              You can choose to give more - up to 100%.
            </p>
            <Link
              href="/register"
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3.5 rounded-xl text-sm transition"
            >
              Choose your charity →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing*/}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Simple pricing</h2>
          <p className="text-gray-400">No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { plan: 'Monthly', price: '£9.99', period: 'per month', note: 'Billed monthly',   highlight: false },
            { plan: 'Yearly',  price: '£99.99', period: 'per year', note: 'Save ~17% vs monthly', highlight: true },
          ].map((p, i) => (
            <motion.div
              key={p.plan}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ scale: 1.01 }}
              className={`rounded-2xl p-8 border ${
                p.highlight
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-gray-800 bg-gray-900'
              }`}
            >
              <p className="text-white font-bold text-lg mb-1">{p.plan}</p>
              <p className="text-gray-500 text-xs mb-6">{p.note}</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-extrabold text-white">{p.price}</span>
                <span className="text-gray-500 text-sm mb-1">{p.period}</span>
              </div>
              <Link
                href="/register"
                className={`block text-center text-sm font-semibold py-3 rounded-xl transition ${
                  p.highlight
                    ? 'bg-green-500 hover:bg-green-400 text-black'
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                Get started
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/*Final CTA*/}
      <section className="py-24 bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto px-6 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to play with purpose?
          </h2>
          <p className="text-gray-400 mb-8">
            Join hundreds of golfers making every round count.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-block">
            <Link
              href="/register"
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold px-10 py-4 rounded-xl text-sm transition"
            >
              Create your free account →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/*Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} GolfCharity · Built with
        </p>
      </footer>

    </main>
  );
}