import React from 'react';
import { Property } from '../../types';

interface Props {
    property: Property;
}

export const PropertyUserActions: React.FC<Props> = ({ property }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Dashboard</h3>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => alert('Notes integration pending.')}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col items-center justify-center gap-1 transition-colors group"
                >
                    <span className="material-symbols-outlined text-[24px] text-slate-400 group-hover:text-blue-500">edit_note</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notes (0)</span>
                </button>
                <button 
                    onClick={() => alert('Attachments integration pending.')}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col items-center justify-center gap-1 transition-colors group"
                >
                    <span className="material-symbols-outlined text-[24px] text-slate-400 group-hover:text-emerald-500">attach_file</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Files (0)</span>
                </button>
                <button 
                    onClick={() => alert('Favorites integration logic.')}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col items-center justify-center gap-1 transition-colors group"
                >
                    <span className="material-symbols-outlined text-[24px] text-slate-400 group-hover:text-red-500">favorite</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Favorite</span>
                </button>
                <button 
                    onClick={() => alert('Add to list logic.')}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col items-center justify-center gap-1 transition-colors group"
                >
                    <span className="material-symbols-outlined text-[24px] text-slate-400 group-hover:text-purple-500">playlist_add</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add to List</span>
                </button>
            </div>
        </div>
    );
};
