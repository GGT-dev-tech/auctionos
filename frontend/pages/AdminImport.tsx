
import React, { useState } from 'react';
import { InventoryService } from '../services/inventoryService';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminImport() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
            setStats(null);
        }
    };

    const handleUpload = async (type: 'properties' | 'calendar') => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setStats(null);

        try {
            const result = await InventoryService.importParcelFairCsv(file, type);
            setStats(result.stats || result); // Handle varying response structure
        } catch (err: any) {
            setError(err.message || "Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Data Import</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Section 1: Property Import */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <Upload size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Import Properties</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Upload CSV with property details</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors mb-4 relative group">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {file ? file.name : "Click to select Properties CSV"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Drag and drop or click to browse"}
                            </p>
                        </div>
                        <button
                            onClick={() => handleUpload('properties')}
                            disabled={uploading || !file}
                            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all shadow-sm ${uploading || !file
                                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                }`}
                        >
                            {uploading ? 'Processing...' : 'Upload Properties'}
                        </button>
                        <div className="mt-4 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
                            <strong>Expected Columns:</strong> Parcel ID, Address, Owner Name, Amount Due, Next Auction, etc.
                        </div>
                    </div>
                </div>

                {/* Section 2: Calendar Import */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Import Calendar</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Upload CSV with auction history</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors mb-4 relative group">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-purple-500 transition-colors" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {file ? file.name : "Click to select Calendar CSV"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Drag and drop or click to browse"}
                            </p>
                        </div>
                        <button
                            onClick={() => handleUpload('calendar')}
                            disabled={uploading || !file}
                            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all shadow-sm ${uploading || !file
                                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                                }`}
                        >
                            {uploading ? 'Processing...' : 'Upload Calendar'}
                        </button>
                        <div className="mt-4 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
                            <strong>Expected Columns:</strong> Auction Name, Date, Where, Listed As, Taxes Due, Info Link, List Link
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-start gap-3 border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold">Import Failed</h4>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Success Stats */}
            {stats && (
                <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800 shadow-sm animate-fadeIn">
                    <div className="flex items-center gap-2 mb-6 text-green-800 dark:text-green-300">
                        <CheckCircle className="w-6 h-6" />
                        <h4 className="text-lg font-bold">Import Status</h4>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Rows</div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.total_rows}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Added</div>
                            <div className="text-2xl font-black text-green-600">{stats.added}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Updated</div>
                            <div className="text-2xl font-black text-blue-600">{stats.updated}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Errors</div>
                            <div className={`text-2xl font-black ${stats.errors > 0 ? 'text-red-600' : 'text-slate-400'}`}>{stats.errors}</div>
                        </div>
                    </div>

                    {stats.error_messages && stats.error_messages.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-900/50 overflow-hidden">
                            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/50 text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                                Error Logs
                            </div>
                            <div className="p-4 max-h-48 overflow-y-auto text-xs font-mono text-slate-600 dark:text-slate-400">
                                {stats.error_messages.map((msg: string, i: number) => (
                                    <div key={i} className="mb-1 pb-1 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0">
                                        {msg}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
