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
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600 text-[28px]">gavel</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">GoAuct Intelligence OS</h1>
                            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">Version 2.0.4 — Build 4982</p>
                        </div>
                    </div>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
                        The ultimate data layer for tax delinquent and distressed property investors. 
                        GoAuct utilizes advanced data aggregation to pull from thousands of local municipalities, standardizing the chaos of the U.S. property tax system into a single intelligence pipeline.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-emerald-400 mb-2">storage</span>
                            <h3 className="font-bold text-white mb-1">Data Providers</h3>
                            <p className="text-sm text-slate-400">Direct ETL pipelines connected to 47 State Treasury Departments and 3,100+ local county assessors.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-blue-400 mb-2">psychology</span>
                            <h3 className="font-bold text-white mb-1">Valuation Engine</h3>
                            <p className="text-sm text-slate-400">Yield and ARV logic built natively on localized property tax assessments and standardized comps matching.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
                <Link to="/client/support" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group">
                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-500 mb-2 transition-colors">support_agent</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Contact Support</span>
                </Link>
                <Link to="/client/training" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group">
                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-emerald-500 mb-2 transition-colors">school</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Training Center</span>
                </Link>
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl opacity-50 cursor-not-allowed">
                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">api</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Developer API (Soon)</span>
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
