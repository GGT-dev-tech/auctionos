import React from 'react';
import { Link } from 'react-router-dom';

const CancelSubscriptionPage: React.FC = () => {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Cancel Subscription</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
        We're sorry to see you go. Please read the information below before proceeding.
      </p>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
          <div className="text-sm text-red-700 dark:text-red-300">
            <p className="font-semibold mb-1">Before you cancel:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>You will lose access to all premium features</li>
              <li>Your saved lists and watchlists will be retained for 30 days</li>
              <li>Cancellation takes effect at the end of your current billing period</li>
            </ul>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          To cancel your subscription, please contact our support team. A representative will
          assist you and ensure a smooth offboarding experience.
        </p>

        <Link
          to="/client/contact-support"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">contact_support</span>
          Contact Support to Cancel
        </Link>
      </div>
    </div>
  );
};

export default CancelSubscriptionPage;
