import React from 'react';
import { CountyContact } from '../../services/county.service';
import { Phone, Globe, Building2 } from 'lucide-react';

interface CountyContactCardProps {
    contacts: CountyContact[];
    countyName?: string;
}

export const CountyContactCard: React.FC<CountyContactCardProps> = ({ contacts, countyName }) => {
    if (!contacts || contacts.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <Building2 size={18} className="text-indigo-500" />
                County Official Contacts {countyName ? `(${countyName})` : ''}
            </h3>

            <div className="space-y-6">
                {contacts.map((contact, idx) => (
                    <div key={idx} className="border-b border-slate-50 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
                            {contact.name}
                        </p>
                        
                        <div className="flex flex-col gap-2">
                            {contact.phone && (
                                <a 
                                    href={`tel:${contact.phone}`} 
                                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors"
                                >
                                    <Phone size={14} className="text-slate-400" />
                                    {contact.phone}
                                </a>
                            )}
                            
                            {contact.url && (
                                <a 
                                    href={contact.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors group"
                                >
                                    <Globe size={14} className="text-slate-400" />
                                    <span className="truncate group-hover:underline">Visit Official Portal</span>
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-[10px] text-slate-500 italic leading-relaxed">
                Note: Contacts are derived from historical records. Please verify current office hours and locations before visiting.
            </div>
        </div>
    );
};
