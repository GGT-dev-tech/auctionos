import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/Footer';

const metrics = [
  { value: '500K+', label: 'Properties Tracked' },
  { value: '3,200+', label: 'Active Auctions' },
  { value: '47', label: 'States Covered' },
  { value: '98%', label: 'Data Accuracy' },
];

const sections = [
  {
    icon: 'search',
    title: 'Discovery',
    body:
      'GoAuct aggregates tax-delinquent and foreclosure auction data from county and municipal sources nationwide, giving you a unified view of opportunities before they hit the open market.',
  },
  {
    icon: 'analytics',
    title: 'Analysis',
    body:
      'Each property listing is enriched with public record data, estimated market values, ownership history, and lien information — everything you need to make confident investment decisions.',
  },
  {
    icon: 'emoji_events',
    title: 'Positioning',
    body:
      'Our platform is built for speed. Real-time auction calendars, customizable watchlists, and instant alerts ensure you are always first to act on newly surfaced opportunities.',
  },
  {
    icon: 'rocket_launch',
    title: 'Vision',
    body:
      'We are building the definitive intelligence layer for tax and distressed property investing — connecting data, community, and capital to accelerate outcomes for every investor on the platform.',
  },
];

interface AboutPageProps {
  standalone?: boolean;
}

const AboutPage: React.FC<AboutPageProps> = ({ standalone = true }) => {
  const content = (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-[#0e56b8] text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-20 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-widest mb-4">
            Tax Property Intelligence Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            GoAuct
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            The most comprehensive real-time platform for discovering, analyzing, and acting on
            tax-delinquent and distressed property auctions across the United States.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 rounded-xl bg-white text-primary font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/support"
              className="px-8 py-3 rounded-xl border-2 border-white/50 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-12">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-400 mb-8">
            By the Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-full mx-auto">
            {metrics.map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-4xl font-extrabold text-primary mb-1">{m.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-16">
        <div className="prose prose-slate dark:prose-invert max-w-full mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to GoAuct
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-4">
            We are dedicated to providing the most comprehensive and up-to-date real estate auction
            data and management tools for investors and agents. Our platform simplifies the process
            of discovering, researching, and tracking properties heading to auction, ensuring that
            our clients have the edge in the competitive real estate market.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            Founded by real estate professionals for real estate professionals, GoAuct
            centralizes public records, tax information, and property details into an easy-to-use
            interface — removing the friction between opportunity and action.
          </p>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="bg-white dark:bg-slate-800">
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Built for the Modern Tax Investor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full mx-auto">
            {sections.map((s) => (
              <div
                key={s.title}
                className="flex gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[24px]">{s.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Ready to find your next deal?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
          Join thousands of investors using GoAuct to source, analyze, and close on distressed
          property opportunities faster than ever.
        </p>
        <Link
          to="/signup"
          className="inline-block px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-md"
        >
          Start Free Trial
        </Link>
      </section>
    </>
  );

  if (!standalone) {
    return <div className="bg-slate-50 dark:bg-slate-900">{content}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  );
};

export default AboutPage;
