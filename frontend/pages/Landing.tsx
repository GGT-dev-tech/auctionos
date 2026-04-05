import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-50">
            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
                            <span className="font-bold text-xl tracking-tight">GoAuct</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                                Sign In
                            </Link>
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold tracking-wider mb-6">
                        THE FUTURE OF AUCTIONS
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Intelligent Property <br className="hidden sm:block" /> Auction Management
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        A comprehensive operating system to discover, track, and manage real estate auctions. Built for administrators and investors to streamline the entire lifecycle.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-3.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                        >
                            Create Free Account
                        </button>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-semibold text-lg transition-all"
                        >
                            Explore Features
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-white dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need to succeed</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Powerful tools designed specifically for the complexities of property auctions.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="monitoring"
                            title="Real-time Analytics"
                            description="Track property values, auction statuses, and market trends with beautiful, live-updating dashboards."
                        />
                        <FeatureCard
                            icon="folder_special"
                            title="Personalized Lists"
                            description="Save properties to custom folders, add private notes, and organize your investment pipeline securely."
                        />
                        <FeatureCard
                            icon="campaign"
                            title="Instant Broadcasts"
                            description="Receive direct system announcements from auction administrators so you never miss a critical update."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-800 py-12 text-center text-slate-400">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <div className="flex justify-center items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
                        <span className="font-bold text-white tracking-tight text-xl">GoAuct</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium">
                        <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
                        <Link to="/support" className="hover:text-white transition-colors">Support</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
                    </div>

                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} GoAuct Inc. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm"
    >
        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-primary">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
);
