import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { StateStat as StateStatData } from '../../services/scores.service';

interface StateStat extends StateStatData {
    color: string;
}

interface InvestmentHeatmapProps {
    stats: StateStatData[];
    onStateClick?: (stateCode: string) => void;
}

export const InvestmentHeatmap: React.FC<InvestmentHeatmapProps> = ({ stats: rawStats, onStateClick }) => {
    const displayStats = useMemo(() => {
        const mapped = rawStats.map(s => {
            let color = 'bg-amber-400';
            if (s.average_score > 85) color = 'bg-emerald-600';
            else if (s.average_score > 70) color = 'bg-emerald-500';
            else if (s.average_score > 50) color = 'bg-emerald-400';

            return {
                name: s.state_code,
                code: s.state_code,
                score: Math.round(s.average_score),
                volume: s.volume,
                color
            };
        });

        if (mapped.length > 0) return mapped;

        // Fallback static data if no live stats are available
        return [
            { name: 'NC', code: 'NC', score: 85, volume: 12, color: 'bg-emerald-500' },
            { name: 'FL', code: 'FL', score: 72, volume: 8, color: 'bg-emerald-400' },
            { name: 'GA', code: 'GA', score: 65, volume: 4, color: 'bg-emerald-300' }
        ];
    }, [rawStats]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500 text-2xl">distance</span>
                        Investment Heatmap
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Market intensity & deal quality by state</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> High Score
                    </div>
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-auto pr-1">
                {/* Visual Placeholder for a real map */}
                <div className="relative h-40 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden group mb-4">
                    <div className="absolute inset-0 opacity-10 grayscale group-hover:grayscale-0 transition-all duration-700 scale-125 group-hover:scale-100 bg-[url('https://upload.wikimedia.org/wikipedia/commons/3/32/USA_States_with_labels.svg')] bg-no-repeat bg-center bg-contain"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-6">
                        <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2 animate-pulse">map</span>
                        <Typography variant="subtitle2" className="font-bold text-slate-700 dark:text-slate-300">Market Coverage</Typography>
                        <Typography variant="caption" className="text-slate-500">Click a state to explore deals</Typography>
                    </div>
                </div>

                {/* State Ranking List */}
                <div className="grid grid-cols-1 gap-2">
                    {displayStats.map((state) => (
                        <div 
                            key={state.code} 
                            onClick={() => onStateClick?.(state.code)}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                        >
                            <div className={`w-10 h-10 rounded-lg ${state.color} flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                                {state.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{state.name}</span>
                                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{state.score}% Grade</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${state.color} transition-all duration-1000`} 
                                        style={{ width: `${state.score}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Vol.</div>
                                <div className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/50 px-2 py-0.5 rounded-md">{state.volume}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={() => onStateClick?.('')}
                className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined text-[14px]">analytics</span>
                View All Market Data
            </button>
        </div>
    );
};
