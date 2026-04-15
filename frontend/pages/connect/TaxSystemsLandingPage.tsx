import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TaxSystemsLandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] font-sans text-slate-900 dark:text-slate-50">
            {/* Simple Navbar */}
            <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <button onClick={() => navigate('/')} className="font-bold flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to GoAuct
                    </button>
                    <button onClick={() => navigate('/signup')} className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Create Account
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-2 block">Knowledge Base</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6">U.S. Tax Sale Systems</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
                        Understand the legal structures of tax liens, deeds, and redeemable deeds across all 50 states.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">The Complexity of State Laws</h2>
                    <p className="mb-6 leading-relaxed text-slate-700 dark:text-slate-300">
                        Unlike traditional real estate, property tax enforcement is uniquely governed at the state and county level. If a property owner defaults on their tax obligations, the county enforces the sovereign right to recover those funds. 
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-8 my-10">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/30">
                            <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-2 text-lg">Tax Lien States</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Investors purchase the right to collect the tax debt plus a statutory interest rate (up to 36% in some states). If unredeemed, the investor can foreclose.</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800/30">
                            <h3 className="font-bold text-purple-800 dark:text-purple-400 mb-2 text-lg">Tax Deed States</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">The county directly forecloses and auctions the deed to the property to the highest bidder, meaning instant ownership (with caveats like quiet title).</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">GoAuct Integration</h2>
                    <p className="mb-6 leading-relaxed text-slate-700 dark:text-slate-300">
                        Instead of manually tracking which county uses which system, our algorithm inherently understands the geographic rules. The platform scores deals based on state-specific yield maximums and structural risks.
                    </p>

                    <div className="mt-12 text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-emerald-500 mb-4">dataset</span>
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Want the full state-by-state matrix?</h3>
                        <p className="text-slate-500 mb-6">Our investors get access to the actual internal knowledge graphs driving our engine.</p>
                        <button onClick={() => navigate('/signup')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">
                            Join GoAuct Hub
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
