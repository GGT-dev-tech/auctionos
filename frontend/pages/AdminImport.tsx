import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { InventoryService } from '../services/api';
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

export const AdminImport: React.FC = () => {
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

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setStats(null);

        try {
            const result = await InventoryService.importParcelFairCsv(file);
            setStats(result.stats);
        } catch (err: any) {
            setError(err.message || "Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Admin Data Import</h1>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        Import ParcelFair CSV
                    </h2>

                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                        Upload a CSV file exported from ParcelFair. This process will create new properties,
                        update existing ones (matching by Parcel Number), and link them to auction events.
                    </p>

                    <div className="flex flex-col gap-4 max-w-lg">
                        <label className="block">
                            <span className="sr-only">Choose CSV file</span>
                            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                    <Upload className="w-10 h-10 text-slate-400 mb-3" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                        {file ? file.name : "Click to select or drag and drop CSV file"}
                                    </span>
                                    <span className="text-xs text-slate-400 mt-1">
                                        {file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV files only"}
                                    </span>
                                </div>
                            </div>
                        </label>

                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className={`
                                w-full py-2.5 px-4 rounded-md font-medium text-white shadow-sm flex items-center justify-center gap-2 transition-all
                                ${!file || uploading
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}
                            `}
                        >
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing Import...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Start Import
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md flex items-start gap-3 border border-red-200 dark:border-red-800">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold">Import Failed</h4>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {stats && (
                        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-3 text-green-800 dark:text-green-300">
                                <CheckCircle className="w-5 h-5" />
                                <h4 className="font-semibold">Import Complete</h4>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-white dark:bg-slate-900 p-3 rounded border border-green-100 dark:border-slate-700 text-center">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Rows</div>
                                    <div className="text-xl font-bold text-slate-800 dark:text-white">{stats.total_rows}</div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded border border-green-100 dark:border-slate-700 text-center">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Added</div>
                                    <div className="text-xl font-bold text-green-600">{stats.added}</div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded border border-green-100 dark:border-slate-700 text-center">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Updated</div>
                                    <div className="text-xl font-bold text-blue-600">{stats.updated}</div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded border border-green-100 dark:border-slate-700 text-center">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Errors</div>
                                    <div className={`text-xl font-bold ${stats.errors > 0 ? 'text-red-600' : 'text-slate-400'}`}>{stats.errors}</div>
                                </div>
                            </div>

                            {stats.error_messages && stats.error_messages.length > 0 && (
                                <div className="mt-4 text-xs text-red-600 font-mono bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
                                    {stats.error_messages.map((msg: string, i: number) => (
                                        <div key={i}>{msg}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};
