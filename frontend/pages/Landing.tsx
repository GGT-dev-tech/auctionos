import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';

const FeatureCard = ({ icon, title, description, delay }: { icon: string, title: string, description: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="p-8 rounded-3xl bg-white/5 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group"
    >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 shadow-inner block relative z-10">
            <span className="material-symbols-outlined text-3xl font-light">{icon}</span>
        </div>
        <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white relative z-10">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium relative z-10">{description}</p>
    </motion.div>
);

export const Landing: React.FC = () => {
    const navigate = useNavigate();

    // Setup SEO Meta Tags dynamically
    useEffect(() => {
        document.title = "GoAuct | Intelligent Real Estate Auction Intelligence";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "A premium, data-driven operating system to discover, track, and manage US real estate tax auctions. Find highly profitable deals with ease.");
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] font-sans text-slate-900 dark:text-slate-50 overflow-hidden selection:bg-blue-500 selection:text-white">
            
            {/* Background Ambience Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 dark:bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/20 dark:bg-emerald-600/10 blur-[150px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/70 dark:bg-[#0B1120]/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-white text-2xl">gavel</span>
                            </div>
                            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                                GoAuct
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/connect/tax-systems" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-wide">
                                Ecosystem
                            </Link>
                            <Link to="/connect/training" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-wide">
                                Training
                            </Link>
                            <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-wide">
                                Sign In
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/signup')}
                                className="relative group overflow-hidden rounded-xl p-[1px]"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <div className="relative bg-white dark:bg-slate-900 px-5 py-2.5 rounded-xl transition-all duration-300 group-hover:bg-opacity-0">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors duration-300 tracking-wide">
                                        Get Started Free
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 mb-8 backdrop-blur-md">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase">
                            GoAuct Engine V2 Now Live
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-500 leading-[1.1]">
                        Master the Auction. <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
                            Automate the Profit.
                        </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                        The ultimate data operating system giving real estate investors institutional-grade intelligence on tax deeds, liens, and foreclosures nationwide.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] hover:-translate-y-1 transform"
                        >
                            Start Free Trial
                        </button>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-md hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold text-lg text-slate-800 dark:text-white transition-all hover:-translate-y-1 transform flex items-center justify-center gap-2"
                        >
                            Explore Intelligence <span className="material-symbols-outlined text-xl">arrow_downward</span>
                        </button>
                    </div>

                    {/* Social Proof Placeholder */}
                    <div className="mt-20 pt-10 border-t border-slate-200/50 dark:border-slate-800/50">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by Top Tier Investors Processing</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            {[
                                '$4B+ Assessed Value',
                                '120k+ Distressed Assets',
                                '50+ States Tracked',
                                '24/7 Market Surveillance'
                            ].map((stat, i) => (
                                <div key={i} className="font-extrabold text-xl text-slate-800 dark:text-slate-300">
                                    {stat}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Features Grid */}
            <section id="features" className="relative z-10 py-32 bg-slate-50 dark:bg-[#0B1120]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                            Unfair Algorithmic Advantage
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                            Stop using spreadsheets. Start deploying capital alongside a machine-learning powered valuation engine specifically built for auctions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            delay={0.1}
                            icon="query_stats"
                            title="A.I. Deal Scoring"
                            description="Every imported property is instantly evaluated. We calculate estimated ARV, Yields, and flag systemic risks before you even look."
                        />
                        <FeatureCard
                            delay={0.2}
                            icon="notifications_active"
                            title="Smart Watchlists"
                            description="Organize your portfolio into semantic folders. Our Celery-based workers automatically track your targets and ping you when action is needed."
                        />
                        <FeatureCard
                            delay={0.3}
                            icon="map"
                            title="Interactive Clustering"
                            description="Don't just read data — see it. Our Unified Opportunity Map instantly visualizes the density and quality of upcoming inventory."
                        />
                    </div>
                </div>
            </section>

            {/* Content Marketing / Funnel Structure Section */}
            <section className="relative z-10 py-32 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-emerald-500 font-extrabold tracking-widest text-sm uppercase mb-4 block">Knowledge Center</span>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white leading-tight">
                                Level up your strategy. <br/> Free resources to dominate.
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 font-medium">
                                Real estate tax sales are highly localized and complex. That's why we maintain the industry's most comprehensive Tax System guides and investor training modules.
                            </p>
                            
                            <form className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50" onSubmit={(e) => e.preventDefault()}>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Get the 2026 Developer Blueprint</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enter your email to receive our free 40-page technical guide to algorithmic real-estate investing.</p>
                                <div className="flex gap-2">
                                    <input type="email" placeholder="investor@example.com" className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white font-medium" />
                                    <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity">
                                        Send It
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:border-blue-500/50 transition-colors group" onClick={() => navigate('/connect/tax-systems')}>
                                <span className="material-symbols-outlined text-4xl text-blue-500 mb-4">account_balance</span>
                                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">Tax Systems</h3>
                                <p className="text-slate-500 text-sm font-medium">State-by-state laws, redemption periods, and hidden risks decoded.</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:emerald-orange-500/50 transition-colors group sm:mt-12" onClick={() => navigate('/connect/training')}>
                                <span className="material-symbols-outlined text-4xl text-emerald-500 mb-4">school</span>
                                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Training Core</h3>
                                <p className="text-slate-500 text-sm font-medium">Video modules & tactical playbooks for utilizing GoAuct.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-slate-900 dark:bg-[#070b14] border-t border-slate-800 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-blue-500 text-3xl">gavel</span>
                                <span className="font-extrabold text-white tracking-tight text-2xl">GoAuct</span>
                            </div>
                            <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                                Building the definitive algorithmic layer for alternative real estate markets. Empowering investors to make data-backed plays.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-wide">Ecosystem</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link to="/connect/tax-systems" className="hover:text-blue-400 transition-colors">Tax Systems DB</Link></li>
                                <li><Link to="/connect/training" className="hover:text-blue-400 transition-colors">Investor Training</Link></li>
                                <li><Link to="/connect/community" className="hover:text-blue-400 transition-colors">Mastermind Groups</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-wide">Legal</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-500 text-sm font-medium">
                            &copy; {new Date().getFullYear()} GoAuct Intelligence OS. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer transition-colors"><span className="text-xs font-bold">X</span></div>
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer transition-colors"><span className="text-xs font-bold">in</span></div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
