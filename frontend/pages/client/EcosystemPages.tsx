import React from 'react';

const PlaceholderPage: React.FC<{
  icon: string;
  title: string;
  description: string;
  badge?: string;
}> = ({ icon, title, description, badge }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
      <span className="material-symbols-outlined text-primary text-[36px]">{icon}</span>
    </div>
    {badge && (
      <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-widest mb-3">
        {badge}
      </span>
    )}
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{title}</h1>
    <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">{description}</p>
  </div>
);

const VIDEOS = [
  { title: "System Navigation & Baseline", length: "14:20", id: "system_nav", desc: "How to use the dashboard, understand routing, and configure basic filters." },
  { title: "Building Intelligent Watchlists", length: "08:45", id: "lists_setup", desc: "Using the My List feature to get notifications and track opportunities systematically." },
  { title: "The Estimates Engine", length: "22:10", id: "rvn_logic", desc: "Understanding how RVN and Yield percentages are calculated from county models." }
];

export const TrainingPage: React.FC = () => {
  const [activeVideo, setActiveVideo] = React.useState(VIDEOS[0]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
            <div className="w-full aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-md border border-slate-700/50">
               <span className="material-symbols-outlined text-6xl text-white/50 group-hover:text-emerald-500 transition-colors cursor-pointer group-hover:scale-110 drop-shadow-xl z-10 transition-transform">play_circle</span>
               <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
               <div className="absolute bottom-4 left-4 text-white font-mono text-sm bg-black/60 px-2 py-1 rounded">00:00 / {activeVideo.length}</div>
            </div>
            <div className="mt-6 px-2">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{activeVideo.title}</h2>
                <p className="text-slate-600 dark:text-slate-400">{activeVideo.desc}</p>
            </div>
        </div>

        {/* Video List */}
        <div className="w-full md:w-80 flex flex-col gap-3 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pl-2">System Tutorials</h3>
            {VIDEOS.map((v, i) => (
                <button
                    key={v.id}
                    onClick={() => setActiveVideo(v)}
                    className={`flex gap-4 p-4 rounded-xl items-start transition-all text-left ${activeVideo.id === v.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'}`}
                >
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeVideo.id === v.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[16px]">{activeVideo.id === v.id ? 'play_arrow' : 'lock_open'}</span>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{i+1}. {v.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">{v.length}</div>
                    </div>
                </button>
            ))}
        </div>
    </div>
  );
};

// -- TAX SYSTEMS CONNECT (EMBEDDED VIEWER) --

const TAX_CHAPTERS = [
  {
    title: "1. The Foundation of Property Taxes",
    content: "Unlike many countries with centralized property tax systems, the United States relies heavily on local governance. Property taxes are the primary financial engine for local municipalities (schools, police, infrastructure). Property taxes are calculated using Assessed Value and Mill Rates."
  },
  {
    title: "2. Foreclosures vs Tax Sales",
    content: "Mortgage Foreclosure occurs when an owner defaults on a private loan. Tax Foreclosure occurs when an owner defaults on local taxes. The government holds the supreme lien position, often wiping out mortgages."
  },
  {
    title: "3. The Tax Lien System (Yields)",
    content: "The county sells the tax debt as a certificate. Investors pay the debt, and the county guarantees a statutory interest rate (8% to 36%). If unredeemed, investors can foreclose to take ownership."
  },
  {
    title: "4. The Tax Deed System (Direct)",
    content: "The county directly forecloses and auctions the deed to the property to the highest bidder. Immediate ownership is acquired, but investors inherit the property 'as-is' and face title clouds."
  },
  {
    title: "5. Redeemable Deeds (Hybrid)",
    content: "States like Texas and Georgia sell the deed, but the original owner retains a redemption right for a specific period, paying a massive flat penalty rate (e.g., 25% in TX) to redeem."
  },
  {
    title: "6. Leveraging GoAuct Data",
    content: "With over 3,000 counties in the U.S., compiling auction lists manually is impossible. GoAuct tracks 500,000+ properties across 47 states, identifying high-probability targets with integrated data."
  }
];

export const TaxSystemsPage: React.FC = () => {
    const [openChapter, setOpenChapter] = React.useState<number | null>(0);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-10 max-w-4xl mx-auto">
            <div className="mb-10 text-center">
               <span className="material-symbols-outlined text-4xl text-blue-500 mb-3 block">menu_book</span>
               <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">U.S. Tax Sale Systems Matrix</h1>
               <p className="text-slate-500 max-w-xl mx-auto">Compiled insights from the GoAuct internal knowledge base on state regulations, differences between liens and deeds, and basic methodology.</p>
            </div>
            
            <div className="space-y-4">
                {TAX_CHAPTERS.map((chap, i) => {
                    const isOpen = openChapter === i;
                    return (
                        <div key={i} className={`border rounded-2xl overflow-hidden transition-colors ${isOpen ? 'border-primary dark:border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            <button
                                onClick={() => setOpenChapter(isOpen ? null : i)}
                                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isOpen ? 'bg-primary/5 dark:bg-blue-900/20' : 'bg-transparent'}`}
                            >
                                <span className="font-bold text-slate-800 dark:text-slate-100">{chap.title}</span>
                                <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`}>expand_more</span>
                            </button>
                            {isOpen && (
                                <div className="p-5 pt-2 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30">
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{chap.content}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const CommunityPage: React.FC = () => (
  <PlaceholderPage
    icon="groups"
    badge="Coming Soon"
    title="Community"
    description="Connect with other GoAuct investors, share strategies, and learn from real deal experiences. Community features are coming soon."
  />
);

export const GroupsPage: React.FC = () => (
  <PlaceholderPage
    icon="workspaces"
    badge="Coming Soon"
    title="Groups"
    description="Private investing groups and mastermind cohorts — collaborate with other investors on targeted markets. Launching soon."
  />
);
