import React, { useState } from 'react';
import { Info, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { redemptionRules, redemptionDefinitions, stateCodeToName } from '../../data/redemptionData';

interface RedemptionDisclaimerCardProps {
    state?: string;
    auctionType?: string;
}

export const RedemptionDisclaimerCard: React.FC<RedemptionDisclaimerCardProps> = ({ state, auctionType }) => {
    const [expanded, setExpanded] = useState(false);

    if (!state) return null;

    // Normalization logic: Handle state codes (e.g. "TX" -> "Texas")
    const searchState = state.length === 2 ? (stateCodeToName[state.toUpperCase()] || state) : state;

    // Matching logic
    // 1. Exact match on normalized state & auctionType
    let matchedRules = redemptionRules.filter(
        r => r.state.toLowerCase() === searchState.toLowerCase() &&
             (auctionType ? r.auction_type.toLowerCase() === auctionType.toLowerCase() : true)
    );

    // 2. Fallback to normalized state match only
    if (matchedRules.length === 0) {
        matchedRules = redemptionRules.filter(r => r.state.toLowerCase() === searchState.toLowerCase());
    }

    const hasSpecificData = matchedRules.length > 0;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
            {/* Header */}
            <div
                className="bg-slate-50 dark:bg-slate-900/50 p-4 px-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${hasSpecificData ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {hasSpecificData ? <AlertTriangle size={20} /> : <Info size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">
                            Important Redemption Information
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                            <span>Jurisdiction: {state} {auctionType ? `| ${auctionType}` : ''}</span>
                            {hasSpecificData && matchedRules.length === 1 && matchedRules[0].redemptionPeriod !== '0' && matchedRules[0].redemptionPeriod !== '-' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                    Redemption: {matchedRules[0].redemptionPeriod} Months
                                </span>
                            )}
                            {hasSpecificData && matchedRules.length === 1 && (matchedRules[0].redemptionPeriod === '0' || matchedRules[0].redemptionPeriod === '-') && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    Non-Redeemable
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="text-slate-400">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {/* Body */}
            {expanded && (
                <div className="p-6">
                    {hasSpecificData ? (
                        <>
                            <div className="overflow-x-auto mb-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">State</th>
                                            <th className="px-4 py-3">Auction Type</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Max Interest</th>
                                            <th className="px-4 py-3">Redemption (Months)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {matchedRules.map((rule, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{rule.state}</td>
                                                <td className="px-4 py-3">{rule.auction_type}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${rule.type === 'Deed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            rule.type === 'Lien' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {rule.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium">{rule.maxInterest}</td>
                                                <td className="px-4 py-3 font-bold">{rule.redemptionPeriod}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4 mb-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <p className="text-slate-600 dark:text-slate-400">
                                No specific redemption data on file for <strong>{state}</strong>.
                            </p>
                        </div>
                    )}

                    {/* Dictionary Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="space-y-3">
                            <div>
                                <strong className="text-slate-800 dark:text-slate-200">{redemptionDefinitions.taxDeed.title}: </strong>
                                <span className="text-slate-600 dark:text-slate-400">{redemptionDefinitions.taxDeed.content}</span>
                            </div>
                            <div>
                                <strong className="text-slate-800 dark:text-slate-200">{redemptionDefinitions.taxLien.title}: </strong>
                                <span className="text-slate-600 dark:text-slate-400">{redemptionDefinitions.taxLien.content}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <strong className="text-slate-800 dark:text-slate-200">{redemptionDefinitions.redemptionPeriod.title}: </strong>
                                <span className="text-slate-600 dark:text-slate-400">{redemptionDefinitions.redemptionPeriod.content}</span>
                            </div>
                            <div>
                                <strong className="text-slate-800 dark:text-slate-200">{redemptionDefinitions.foreclosure.title}: </strong>
                                <span className="text-slate-600 dark:text-slate-400">{redemptionDefinitions.foreclosure.content}</span>
                            </div>
                            <div>
                                <strong className="text-slate-800 dark:text-slate-200">{redemptionDefinitions.quietTitle.title}: </strong>
                                <span className="text-slate-600 dark:text-slate-400">{redemptionDefinitions.quietTitle.content}</span>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer Note */}
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 border-l-4 border-slate-300 dark:border-slate-600 rounded-r-lg text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                        <strong>Disclaimer:</strong> The information above is educational in nature and based on general state-level data. Rules may vary depending on the municipality and the specific case. Always consult an attorney specializing in real estate and tax law before making any investment.
                    </div>
                </div>
            )}
        </div>
    );
};
