import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TrainingLandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] font-sans text-slate-900 dark:text-slate-50">
            {/* Simple Navbar */}
            <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <button onClick={() => navigate('/')} className="font-bold flex items-center gap-2 hover:text-emerald-500 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to GoAuct
                    </button>
                    <button onClick={() => navigate('/signup')} className="text-sm font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                        Create Account
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <span className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-2 block">Premium Education</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6">Investor Training Core</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
                        Master the tactical execution of algorithmic real estate acquisitions.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 shadow-sm">
                    
                    <div className="mb-12 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-4">Beyond the Data</h2>
                            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                                Having the best algorithms in the world is useless without operational precision. Our Training ecosystem provides deep-dive video modules on exactly how to deploy capital, handle OTC counter-parties, and navigate county clerk bureaucracies effectively.
                            </p>
                        </div>
                        <div className="w-full md:w-64 h-48 bg-slate-200 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                            <div className="absolute inset-0 bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors z-0"></div>
                            <span className="material-symbols-outlined text-6xl text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform">play_circle</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-6">Curriculum Highlights</h3>
                    <div className="space-y-4 mb-12">
                        {[
                            { title: 'Module 1: The Due Diligence Matrix', desc: 'Understanding title logic, super-liens, and structural risks the machine flags.' },
                            { title: 'Module 2: Remote Bidding Infrastructure', desc: 'Setting up proxy networks and capital deployment rails.' },
                            { title: 'Module 3: Portfolio Lifecycle', desc: 'What happens after you win. Post-auction quiet title and liquidation workflows.' }
                        ].map((m, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                <div className="mt-1 font-black text-emerald-500">0{i+1}</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{m.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{m.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/30">
                        <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400 mb-4">diamond</span>
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Included with Client Access</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">The full investor curriculum is automatically unlocked when you activate your GoAuct subscription.</p>
                        <button onClick={() => navigate('/signup')} className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transform">
                            Unlock Platform + Training
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
