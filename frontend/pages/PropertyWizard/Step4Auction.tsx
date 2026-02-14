import React, { useEffect } from 'react';
import { Property } from '../../types';

interface Props {
   data: Partial<Property>;
   update: (data: Partial<Property>) => void;
}

export const Step4Auction: React.FC<Props> = ({ data, update }) => {

   // Automated Status Logic
   useEffect(() => {
      if (data.auction_details?.auction_date) {
         const auctionDate = new Date(data.auction_details.auction_date);
         const today = new Date();
         // Reset time for accurate date comparison
         today.setHours(0, 0, 0, 0);
         auctionDate.setHours(0, 0, 0, 0);

         const newStatus = auctionDate >= today ? 'active' : 'sold';

         // Only update if status is different to avoid infinite loop
         if (data.status !== newStatus) {
            update({ status: newStatus });
         }
      }
   }, [data.auction_details?.auction_date]);

   return (
      <div className="p-8 max-w-4xl mx-auto">
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 space-y-8">

            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-6">
               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                  <span className="material-symbols-outlined text-2xl">event</span>
               </div>
               <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Auction Schedule</h2>
                  <p className="text-sm text-slate-500">Set the date for the auction. Status will be automatically updated.</p>
               </div>
               <div className="ml-auto">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${data.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        data.status === 'sold' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'
                     }`}>
                     {data.status || 'Draft'}
                  </span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                     Auction Date
                     <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div className="relative">
                     <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <span className="material-symbols-outlined">calendar_today</span>
                     </span>
                     <input
                        className="pl-10 w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        type="date"
                        value={data.auction_details?.auction_date ? new Date(data.auction_details.auction_date).toISOString().slice(0, 10) : ''}
                        onChange={e => update({
                           auction_details: {
                              ...data.auction_details,
                              auction_date: e.target.value,
                              // Keep start/end for backend compatibility if needed, mirror date
                              auction_start: e.target.value,
                              auction_end: e.target.value
                           } as any
                        })}
                     />
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                     <span className="material-symbols-outlined text-[14px]">info</span>
                     Future dates set status to <strong className="text-emerald-600">Active</strong>. Past dates set to <strong className="text-slate-600">Sold</strong>.
                  </p>
               </div>

               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-slate-400">auto_awesome</span>
                  <div>
                     <h3 className="font-semibold text-slate-900 dark:text-white">Automated Status</h3>
                     <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                        The property status is derived automatically from the auction date. Manual status selection is disabled to ensure consistency.
                     </p>
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};