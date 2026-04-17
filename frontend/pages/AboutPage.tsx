import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/Footer';

interface AboutPageProps {
  standalone?: boolean;
}

// ─── Embedded Client View (Logged In) ────────────────────────────────────────────────────────
const ClientAboutView: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600 text-[28px]">account_balance</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">About AuctionOS</h1>
                            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">Tax Property Intelligence Platform</p>
                        </div>
                    </div>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
                        A unified platform for discovering, analyzing, and acting on tax delinquent property opportunities across the United States.
                        <br/><br/>Access the platform: <a href="https://auctionos.up.railway.app.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">auctionos.up.railway.app.com</a>
                    </p>

                    <h3 className="font-bold text-white mb-4 uppercase tracking-widest text-sm text-blue-400">AuctionOS : By the Numbers</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { v: '1', l: 'Integrated Intelligence Platform' },
                            { v: '50', l: 'States Covered' },
                            { v: '3,147', l: 'Counties Mapped' },
                            { v: '3,895', l: 'Data Sources Connected' },
                            { v: '3,508', l: 'Days of Historical Tracking' },
                            { v: '51,146', l: 'Active Tax Auction Parcels' },
                            { v: '588,647', l: 'Active Tax Delinquent Parcels*' },
                            { v: '2,727,819', l: 'Historical Tax Delinquent Parcels' },
                            { v: '248,723,791+', l: 'Structured Data Points' }
                        ].map(stat => (
                            <div key={stat.l} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <h4 className="text-2xl font-black text-white">{stat.v}</h4>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{stat.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-emerald-500">travel_explore</span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Discovery</h2>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        AuctionOS empowers investors, researchers, and institutions to identify high-value opportunities in tax liens, tax deeds, land bank properties, and foreclosures — all in one place.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 list-disc pl-4">
                        <li>Nationwide interactive mapping of tax delinquent properties and auctions</li>
                        <li>Cross-state search across active and redeemed parcels</li>
                        <li>Property visualization through map overlays and street-level imagery</li>
                        <li>Intelligent transformation of geospatial data into structured, actionable lists</li>
                        <li>Real-time parcel tracking and portfolio monitoring</li>
                        <li>Custom list creation for pipeline and acquisition strategy management</li>
                        <li>Centralized workspace to attach notes, documents, and images to each asset</li>
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-blue-500">analytics</span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analysis</h2>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        Built for scale, AuctionOS transforms fragmented public data into actionable intelligence — reducing research time and increasing decision accuracy.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 list-disc pl-4">
                        <li>Export-ready datasets (CSV) for integration with internal systems</li>
                        <li>Detailed parcel intelligence reports covering over 2.7 million properties</li>
                        <li>High-performance analysis across 248+ million structured data points</li>
                        <li>Historical auction insights across major U.S. counties</li>
                        <li>Deep-link integration with official county and state data sources</li>
                        <li>Multi-year inventory tracking up to 8 years</li>
                        <li>Direct access to state-level pricing and valuation requests</li>
                        <li>Accelerated due diligence (Probate, Obituaries, Comps, Public notices, News)</li>
                    </ul>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3 block">Positioning</h2>
                    <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed mb-4">
                        AuctionOS is designed to bridge the gap between fragmented public records and scalable real estate investment strategies.
                        By combining data aggregation, automation, and intelligent analysis, the platform enables:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-bold rounded-full">Faster deal discovery</span>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-bold rounded-full">Smarter investment decisions</span>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-bold rounded-full">Scalable acquisition pipelines</span>
                    </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-3 block flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">visibility</span> Vision
                    </h2>
                    <p className="text-sm text-emerald-800 dark:text-emerald-400 leading-relaxed">
                        Our mission is to build the foundational data infrastructure for tax delinquent property investment in the United States — enabling individuals, companies, and institutions to operate with clarity, speed, and confidence.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ─── Standalone Public View (Logged Out) ──────────────────────────────────────────────────
const PublicAboutView: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
            <Header />
            
            <main className="flex-1 pt-24 pb-16">
                {/* Hero */}
                <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-bold uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Our Mission
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-tight">
                        Democratizing the <br className="hidden md:block" /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Distressed Market</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                        The real estate tax sale space has historically been guarded by institutional players and local insiders. We built GoAuct to change that.
                    </p>
                </section>

                {/* The Problem / Solution Pattern */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 p-8 rounded-3xl">
                            <span className="material-symbols-outlined text-red-500 text-4xl mb-4">cancel</span>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">The Old Way</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                Investors spend hundreds of hours scrubbing through 3,000+ county websites, reading poorly formatted PDFs, calculating yields on spreadsheets, and blindly driving out to properties. Data is stale by the time action is required.
                            </p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/50 p-8 rounded-3xl">
                            <span className="material-symbols-outlined text-emerald-500 text-4xl mb-4">check_circle</span>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">The GoAuct Way</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                A fully aggregated intelligence platform. We ingest local county datasets, normalize the statuses, run automated Yield and ARV calculations, and present action-ready alerts via a pristine dashboard interface.
                            </p>
                        </div>
                    </div>
                </section>


                {/* Data Stats */}
                <section className="bg-slate-900 py-24 mb-24 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 to-transparent"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { value: "3,100+", label: "Counties Indexed" },
                                { value: "$12B+", label: "Total Opportunity Value" },
                                { value: "real-time", label: "Auction Syncing" },
                                { value: "100%", label: "Data-Driven" }
                            ].map(stat => (
                                <div key={stat.label}>
                                    <h4 className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</h4>
                                    <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="text-center px-4 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Stop researching. Start acquiring.</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium text-lg">Join GoAuct today and secure your unfair advantage in the distressed real estate market.</p>
                    <button 
                        onClick={() => navigate('/signup')}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 transition-transform hover:-translate-y-1"
                    >
                        Start Your Free Trial
                    </button>
                </section>
            </main>

            <Footer />
        </div>
    );
};

// ─── Main Switch ────────────────────────────────────────────────────────
const AboutPage: React.FC<AboutPageProps> = ({ standalone = true }) => {
  if (!standalone) {
    return <ClientAboutView />;
  }

  return <PublicAboutView />;
};

export default AboutPage;
