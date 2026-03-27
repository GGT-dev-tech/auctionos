import React from 'react';
import { Typography } from '@mui/material';

export const InvestmentHeatmap: React.FC = () => {
    // Mock data for the heatmap placeholder
    const states = [
        { name: 'Alabama', score: 85, volume: 1240, color: 'bg-emerald-500' },
        { name: 'Florida', score: 72, volume: 850, color: 'bg-emerald-400' },
        { name: 'Georgia', score: 65, volume: 420, color: 'bg-emerald-300' },
        { name: 'Texas', score: 90, volume: 1500, color: 'bg-emerald-600' },
        { name: 'Tennessee', score: 58, volume: 210, color: 'bg-amber-400' }
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">distance</span>
                        Investment Heatmap
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Market intensity & deal quality by state</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> High Score
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span> Emerging
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Visual Placeholder for a real map */}
                <div className="relative h-48 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 grayscale group-hover:grayscale-0 transition-all duration-700 scale-125 group-hover:scale-100 bg-[url('https://upload.wikimedia.org/wikipedia/commons/3/32/USA_States_with_labels.svg')] bg-no-repeat bg-center bg-contain"></div>
                    <div className="relative z-10 flex flex-col items-center text-center px-6">
                        <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2 animate-pulse">map</span>
                        <Typography variant="subtitle2" className="font-bold text-slate-700 dark:text-slate-300">Interactive Map Layer</Typography>
                        <Typography variant="caption" className="text-slate-500">ML-driven yield prediction coming soon</Typography>
                    </div>
                </div>

                {/* State Ranking List */}
                <div className="grid grid-cols-1 gap-2 pt-2">
                    {states.map((state) => (
                        <div key={state.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className={`w-10 h-10 rounded-lg ${state.color} flex items-center justify-center text-white font-bold text-xs`}>
                                {state.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{state.name}</span>
                                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{state.score}% Score</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${state.color} transition-all duration-1000`} 
                                        style={{ width: `${state.score}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase font-bold leading-none">Volume</div>
                                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{state.volume}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase tracking-widest">
                Full Market Reports
            </button>
        </div>
    );
};
