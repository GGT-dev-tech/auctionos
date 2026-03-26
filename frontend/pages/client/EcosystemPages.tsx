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

export const TrainingPage: React.FC = () => (
  <PlaceholderPage
    icon="school"
    badge="Coming Soon"
    title="Training Center"
    description="Video tutorials, guides, and best practices for mastering tax property investing with AuctionOS. Launching soon."
  />
);

export const CommunityPage: React.FC = () => (
  <PlaceholderPage
    icon="groups"
    badge="Coming Soon"
    title="Community"
    description="Connect with other AuctionOS investors, share strategies, and learn from real deal experiences. Community features are coming soon."
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
