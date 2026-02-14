import React, { useState, useEffect } from 'react';
import USMap from './USMap';
import { AuctionService } from '../services/api';

interface Office {
    name?: string;
    phone?: string;
    online_url?: string;
}

interface County {
    id: number;
    state_code: string;
    county_name: string;
    offices?: Office[];
}

interface CountySelectorProps {
    mode: 'filter' | 'select';
    onSelect?: (state: string, county: string, countyData?: County) => void;
    onClose: () => void;
}

const CountySelector: React.FC<CountySelectorProps> = ({ mode, onSelect, onClose }) => {
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [counties, setCounties] = useState<County[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleStateSelect = async (stateCode: string) => {
        setSelectedState(stateCode);
        setLoading(true);
        try {
            const data = await AuctionService.getCounties(stateCode);
            setCounties(data);
        } catch (error) {
            console.error("Failed to fetch counties", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCounties = counties.filter(c =>
        c.county_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCountyClick = (county: County) => {
        if (onSelect) {
            onSelect(county.state_code, county.county_name, county);
        }

        if (mode === 'select') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex overflow-hidden">

                {/* Left Side: Map or Back Button */}
                <div className={`flex flex-col ${selectedState ? 'w-1/3 border-r border-slate-200 dark:border-slate-700' : 'w-full'} transition-all duration-300`}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            {selectedState ? `Select County in ${selectedState}` : 'Select State'}
                        </h2>
                        {selectedState && (
                            <button
                                onClick={() => setSelectedState(null)}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                                Back to Map
                            </button>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-center">
                        {!selectedState ? (
                            <USMap onStateSelect={handleStateSelect} />
                        ) : (
                            <div className="text-center p-8 text-slate-500">
                                <div className="text-6xl font-bold opacity-20 mb-4">{selectedState}</div>
                                <p>Select a county from the list to proceed.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: County List / Grid */}
                {selectedState && (
                    <div className="w-2/3 flex flex-col h-full">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <input
                                type="text"
                                placeholder="Search counties..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {filteredCounties.map(county => (
                                        <div
                                            key={county.id}
                                            onClick={() => handleCountyClick(county)}
                                            className="group p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800 hover:shadow-md cursor-pointer transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                    {county.county_name}
                                                </h3>
                                                {mode === 'select' && (
                                                    <span className="text-xs font-medium text-white bg-blue-600 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                                                )}
                                            </div>

                                            {/* Offices List */}
                                            <div className="space-y-3 mt-2">
                                                {county.offices && county.offices.map((office, idx) => (
                                                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                                        <div className="font-medium text-slate-700 dark:text-slate-300 mb-1 md:mb-0">
                                                            {office.name}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs">
                                                            {office.phone && (
                                                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">call</span>
                                                                    {office.phone}
                                                                </span>
                                                            )}
                                                            {office.online_url && (
                                                                <a
                                                                    href={office.online_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-500 hover:underline flex items-center gap-1"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">public</span>
                                                                    Visit
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!county.offices || county.offices.length === 0) && (
                                                    <div className="text-xs text-slate-400 italic">No specific office data available</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CountySelector;
