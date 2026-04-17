import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ConsultantService } from '../services/company.service';

// ─── Feature Card ─────────────────────────────────────────────────────────────

const FeatureCard: React.FC<{ icon: string; title: string; description: string; color: string }> = ({ icon, title, description, color }) => (
    <div className="group relative p-8 rounded-3xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 relative z-10 ${color}`}>
            <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white relative z-10">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm relative z-10">{description}</p>
    </div>
);

// ─── Pillar Card ──────────────────────────────────────────────────────────────

const PillarCard: React.FC<{
    eyebrow: string;
    title: string;
    description: string;
    features: string[];
    cta: string;
    ctaAction: () => void;
    gradient: string;
    border: string;
    icon: string;
}> = ({ eyebrow, title, description, features, cta, ctaAction, gradient, border, icon }) => (
    <div className={`group relative rounded-3xl overflow-hidden border ${border} ${gradient} p-8 flex flex-col gap-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
        <div className="relative z-10">
            <span className="text-xs font-extrabold uppercase tracking-widest opacity-70 mb-3 block">{eyebrow}</span>
            <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[32px]">{icon}</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{title}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">{description}</p>
            <ul className="space-y-2.5 mb-8">
                {features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                        <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0 text-emerald-500">check_circle</span>
                        {f}
                    </li>
                ))}
            </ul>
            <button
                onClick={ctaAction}
                className="w-full py-3.5 font-bold rounded-2xl text-sm transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
                {cta}
            </button>
        </div>
    </div>
);

// ─── Consultant Registration Form ─────────────────────────────────────────────

const ConsultantRegisterForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await ConsultantService.register({ name, email, phone });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center p-8">
                <span className="material-symbols-outlined text-emerald-500 text-5xl mb-3 block">check_circle</span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Application Received!</h3>
                <p className="text-slate-600 dark:text-slate-400">Our team will review your profile and reach out within 2–3 business days.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input
                        value={name} onChange={e => setName(e.target.value)} required
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Business Email *</label>
                    <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="consultant@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone (Optional)</label>
                <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
            </div>
            {error && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
                type="submit" disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {submitting && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                {submitting ? 'Sending Application…' : 'Apply as Consultant Partner →'}
            </button>
        </form>
    );
};

// ─── Main Landing Page ────────────────────────────────────────────────────────

export const Landing: React.FC = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = 'GoAuct | Real Estate Intelligence Platform';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 'GoAuct is the premier intelligence platform for real estate investors, consultants, and community builders. Discover tax deeds, liens, foreclosures and build profitable partnerships.');
        }
    }, []);

    const features = [
        { icon: 'query_stats', title: 'A.I. Deal Scoring', description: 'Every property is instantly evaluated with our proprietary scoring engine, flagging risks and calculating estimated ARV before you look.', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
        { icon: 'notifications_active', title: 'Smart Watchlists', description: 'Personalized My Lists with auction proximity alerts — get notified when a saved property is days away from going to auction.', color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
        { icon: 'public', title: 'National Yield Heatmap', description: 'Interactive map visualizing deal density and quality across all 50 states, updated dynamically from real property data.', color: 'bg-gradient-to-br from-violet-500 to-violet-600' },
        { icon: 'handshake', title: 'Consultant Network', description: 'Connect with verified real estate consultants who conduct field research and facilitate off-market property acquisition.', color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
        { icon: 'school', title: 'Training Academy', description: 'Structured video modules, playbooks, and certification paths to master tax deed investing from beginner to expert.', color: 'bg-gradient-to-br from-amber-500 to-orange-500' },
        { icon: 'groups', title: 'Investor Community', description: 'Join mastermind groups and collaborate with like-minded investors sharing strategies, county insights, and deal flow.', color: 'bg-gradient-to-br from-pink-500 to-rose-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070d1a] font-sans text-slate-900 dark:text-slate-50 overflow-hidden selection:bg-emerald-500 selection:text-white">

            {/* BG Ambience */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[40%] rounded-full bg-blue-500/15 dark:bg-blue-600/10 blur-[130px]" />
                <div className="absolute top-[30%] right-[-5%] w-[35%] h-[35%] rounded-full bg-emerald-500/15 dark:bg-emerald-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[25%] w-[40%] h-[30%] rounded-full bg-violet-500/10 dark:bg-violet-600/8 blur-[140px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 bg-white/70 dark:bg-[#070d1a]/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-white text-2xl">gavel</span>
                            </div>
                            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">GoAuct</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/connect/tax-systems" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Ecosystem</Link>
                            <Link to="/connect/training" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Training</Link>
                            <button onClick={() => document.getElementById('consultants')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">For Consultants</button>
                            <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Sign In</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/signup')} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
                                Get Started Free
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────────────────────────────── */}
            <main className="relative z-10 pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-8">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase">GoAuct Platform V2 — Now Live</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-500 leading-[1.05] max-w-5xl">
                    The Complete Real Estate <br className="hidden md:block" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500">Intelligence Ecosystem.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
                    For investors chasing tax deed auctions. For consultants building referral businesses. For a community mastering alternative real estate together.
                </p>
                <div className="flex flex-wrap gap-4 justify-center items-center">
                    <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] hover:-translate-y-1">
                        Start as Investor — Free
                    </button>
                    <button onClick={() => document.getElementById('consultants')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 rounded-2xl font-bold text-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:-translate-y-1">
                        Apply as Consultant →
                    </button>
                </div>

                {/* Stats */}
                <div className="mt-20 pt-10 border-t border-slate-200/50 dark:border-slate-800/50 grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-3xl">
                    {[
                        { value: '$4B+', label: 'Assessed Value Tracked' },
                        { value: '120k+', label: 'Distressed Assets' },
                        { value: '50', label: 'States Monitored' },
                        { value: '24/7', label: 'Market Surveillance' },
                    ].map(s => (
                        <div key={s.label} className="flex flex-col items-center gap-1">
                            <div className="text-3xl font-extrabold text-slate-800 dark:text-white">{s.value}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">{s.label}</div>
                        </div>
                    ))}
                </div>
            </main>

            {/* ── Features Grid ───────────────────────────────────────────────── */}
            <section id="features" className="relative z-10 py-28 bg-slate-50 dark:bg-[#070d1a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold tracking-widest text-sm uppercase block mb-3">Platform Capabilities</span>
                        <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">Everything You Need to Win</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">Six integrated systems working together to give investors and consultants an unfair competitive advantage.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map(f => <FeatureCard key={f.title} {...f} />)}
                    </div>
                </div>
            </section>

            {/* ── Three Pillars ───────────────────────────────────────────────── */}
            <section className="relative z-10 py-28 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-emerald-600 font-extrabold tracking-widest text-sm uppercase block mb-3">Three Paths. One Ecosystem.</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Choose Your Role</h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">GoAuct serves three distinct profiles — each with a dedicated experience.</p>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-6">
                        <PillarCard
                            eyebrow="🏦 For Investors"
                            title="Tax Auction Intelligence"
                            description="Access institutional-grade data on tax deeds, liens, and foreclosures. Our AI engine scores every property and calculates estimated returns."
                            features={[
                                'AI deal scoring & ARV estimates',
                                'My Lists with auction alerts',
                                'National Yield Heatmap',
                                'Real-time auction tracking',
                                'Multi-company portfolio management',
                            ]}
                            cta="Start Investing — Free Trial"
                            ctaAction={() => navigate('/signup')}
                            gradient="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20"
                            border="border-blue-200/60 dark:border-blue-800/40"
                            icon="trending_up"
                        />
                        <PillarCard
                            eyebrow="🤝 For Consultants"
                            title="Referral & Partnership"
                            description="Build a real estate referral business. Connect investors with distressed properties, complete paid due diligence tasks, and negotiate your commission."
                            features={[
                                'Access off-market property listings',
                                'Negotiate commission per sale',
                                'Paid field research tasks',
                                'Direct owner connection tools',
                                'Certification & verification program',
                            ]}
                            cta="Apply as Consultant Partner"
                            ctaAction={() => document.getElementById('consultants')?.scrollIntoView({ behavior: 'smooth' })}
                            gradient="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20"
                            border="border-emerald-200/60 dark:border-emerald-800/40"
                            icon="handshake"
                        />
                        <PillarCard
                            eyebrow="🎓 For the Community"
                            title="Training & Mastermind"
                            description="Learn tax deed investing from scratch or sharpen your strategy with structured modules, live groups, and a network of serious investors."
                            features={[
                                'Structured video training modules',
                                'State-by-state tax system guides',
                                'Investor mastermind groups',
                                'Exclusive deal-flow community',
                                'Free 2026 Investor Blueprint PDF',
                            ]}
                            cta="Explore Training Resources"
                            ctaAction={() => navigate('/connect/training')}
                            gradient="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20"
                            border="border-amber-200/60 dark:border-amber-800/40"
                            icon="school"
                        />
                    </div>
                </div>
            </section>

            {/* ── Ecosystem Flow ──────────────────────────────────────────────── */}
            <section className="relative z-10 py-28 bg-slate-50 dark:bg-[#070d1a]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold tracking-widest text-sm uppercase block mb-3">How It Works</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">The Complete Cycle</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mb-16 max-w-2xl mx-auto">Every participant benefits. Every transaction creates value across the network.</p>

                    <div className="grid sm:grid-cols-4 gap-0 items-center">
                        {[
                            { icon: 'gavel', label: 'Tax Auctions', desc: 'Distressed properties enter the market', color: 'bg-blue-500' },
                            { icon: 'search', label: 'Discovery', desc: 'GoAuct AI surfaces top opportunities', color: 'bg-indigo-500' },
                            { icon: 'handshake', label: 'Consulting', desc: 'Partners connect sellers with investors', color: 'bg-emerald-500' },
                            { icon: 'payments', label: 'Returns', desc: 'Investors profit, consultants earn commissions', color: 'bg-amber-500' },
                        ].map((step, i) => (
                            <React.Fragment key={step.label}>
                                <div className="flex flex-col items-center gap-3">
                                    <div className={`size-14 rounded-2xl ${step.color} flex items-center justify-center shadow-lg`}>
                                        <span className="material-symbols-outlined text-white text-2xl">{step.icon}</span>
                                    </div>
                                    <p className="font-bold text-slate-800 dark:text-white">{step.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-[100px]">{step.desc}</p>
                                </div>
                                {i < 3 && (
                                    <div className="hidden sm:flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl">arrow_forward</span>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Consultant Registration ────────────────────────────────────── */}
            <section id="consultants" className="relative z-10 py-28 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left — Info */}
                        <div>
                            <span className="text-emerald-600 font-extrabold tracking-widest text-sm uppercase block mb-3">Consultant Partners</span>
                            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                                Join the GoAuct Partner Network
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
                                Real estate professionals who partner with GoAuct gain exclusive access to investor deal flow, get compensated for due diligence tasks, and earn negotiable commissions on every closed transaction.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { icon: 'verified', title: 'Verification Program', desc: 'Complete our vetting process and earn a Verified Partner badge, increasing your visibility to investors.' },
                                    { icon: 'task_alt', title: 'Paid Field Tasks', desc: "GoAuct publishes due diligence tasks weekly — property visits, owner interviews, and research reports with fixed compensation." },
                                    { icon: 'payments', title: 'Negotiable Commission', desc: 'Set your own commission percentage for closed deals. We facilitate the introduction and you negotiate the terms.' },
                                ].map(item => (
                                    <div key={item.title} className="flex gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 mt-0.5 shrink-0">{item.icon}</span>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm">{item.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — Form */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Apply Now</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Fill in your details and our team will reach out within 2–3 business days.</p>
                            <ConsultantRegisterForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Knowledge Center ───────────────────────────────────────────── */}
            <section className="relative z-10 py-28 bg-slate-50 dark:bg-[#070d1a] border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold tracking-widest text-sm uppercase block mb-3">Knowledge Center</span>
                            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                                Dominate Every Market.<br />Free Resources Inside.
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
                                Tax sales are complex and vary state by state. That's why we maintain the most comprehensive investor resource library in the space — free for all GoAuct members.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { icon: 'account_balance', title: 'Tax Systems DB', desc: 'State-by-state laws decoded', path: '/connect/tax-systems', color: 'text-blue-500' },
                                    { icon: 'school', title: 'Training Core', desc: 'Video modules & playbooks', path: '/connect/training', color: 'text-amber-500' },
                                    { icon: 'groups', title: 'Mastermind Groups', desc: 'Investor community & partners', path: '/client/community', color: 'text-emerald-500' },
                                    { icon: 'library_books', title: 'Free Blueprint', desc: '40-page investor guide PDF', path: '#', color: 'text-indigo-500' },
                                ].map(item => (
                                    <div key={item.title} onClick={() => navigate(item.path)} className="cursor-pointer flex gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all group">
                                        <span className={`material-symbols-outlined ${item.color} mt-0.5 shrink-0 text-2xl`}>{item.icon}</span>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-primary transition-colors">{item.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Quick Sign-Up CTA */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-3xl text-white text-center shadow-2xl shadow-blue-500/20">
                            <span className="material-symbols-outlined text-5xl mb-4 block opacity-80">gavel</span>
                            <h3 className="text-3xl font-extrabold mb-3">Ready to Start?</h3>
                            <p className="text-blue-200 font-medium mb-8 leading-relaxed">
                                Join thousands of investors already using GoAuct to discover below-market properties across the nation.
                            </p>
                            <button onClick={() => navigate('/signup')} className="w-full py-4 bg-white text-blue-700 font-extrabold rounded-2xl hover:bg-blue-50 transition-all text-lg shadow-lg">
                                Create Free Account
                            </button>
                            <div className="mt-4 flex justify-center gap-4 text-xs text-blue-300 font-semibold">
                                <span>✓ No Credit Card</span>
                                <span>✓ Instant Access</span>
                                <span>✓ Cancel Anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            <footer className="relative z-10 bg-slate-900 dark:bg-[#04080f] border-t border-slate-800 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="material-symbols-outlined text-blue-500 text-3xl">gavel</span>
                                <span className="font-extrabold text-white text-2xl">GoAuct</span>
                            </div>
                            <p className="text-slate-400 font-medium max-w-sm leading-relaxed text-sm">
                                The premier intelligence platform connecting real estate investors, consultants, and community — all within one powerful ecosystem.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Investors</h4>
                            <ul className="space-y-3 text-slate-400 text-sm">
                                <li><Link to="/signup" className="hover:text-blue-400 transition-colors">Sign Up Free</Link></li>
                                <li><Link to="/client/auctions" className="hover:text-blue-400 transition-colors">Live Auctions</Link></li>
                                <li><Link to="/client/properties" className="hover:text-blue-400 transition-colors">Property Search</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Ecosystem</h4>
                            <ul className="space-y-3 text-slate-400 text-sm">
                                <li><Link to="/connect/tax-systems" className="hover:text-blue-400 transition-colors">Tax Systems</Link></li>
                                <li><Link to="/connect/training" className="hover:text-blue-400 transition-colors">Training</Link></li>
                                <li><button onClick={() => document.getElementById('consultants')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">Become a Consultant</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Legal</h4>
                            <ul className="space-y-3 text-slate-400 text-sm">
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} GoAuct Intelligence OS. All rights reserved.</p>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors hover:bg-slate-700 text-xs font-bold">X</div>
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors hover:bg-slate-700 text-xs font-bold">in</div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
