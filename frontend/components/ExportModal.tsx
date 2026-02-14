import React, { useState, useEffect } from 'react';
import { Company, AuctionService, InventoryService } from '../services/api';

interface ExportModalProps {
    propertyId: string;
    propertyName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ propertyId, propertyName, isOpen, onClose }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
    const [selectedFolderId, setSelectedFolderId] = useState<string>('');
    const [status, setStatus] = useState('interested');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCompanies();
            // Reset state
            setSelectedCompanyId('');
            setSelectedFolderId('');
            setStatus('interested');
            setNotes('');
        }
    }, [isOpen]);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const user = AuctionService.getCurrentUser();
            if (user && user.companies) {
                setCompanies(user.companies);
                if (user.companies.length > 0) {
                    setSelectedCompanyId(user.companies[0].id);
                }
            }
        } catch (e) {
            console.error('Failed to fetch companies', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCompanyId) {
            fetchFolders(selectedCompanyId as number);
        } else {
            setFolders([]);
        }
    }, [selectedCompanyId]);

    const fetchFolders = async (cid: number) => {
        try {
            const data = await InventoryService.getFolders(cid);
            setFolders(data);
        } catch (e) {
            console.error('Failed to fetch folders', e);
        }
    };

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId) return;

        setExporting(true);
        try {
            await AuctionService.exportToInventory(propertyId, {
                company_id: selectedCompanyId as number,
                folder_id: selectedFolderId || undefined,
                status,
                user_notes: notes
            });
            alert('Property exported to inventory!');
            onClose();
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Export failed');
        } finally {
            setExporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export to Inventory</h3>
                        <p className="text-sm text-slate-500 mt-1 truncate max-w-[300px]">{propertyName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleExport} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company (LLC)</label>
                        <select
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                            required
                        >
                            <option value="">Select Company</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Folder</label>
                        <select
                            value={selectedFolderId}
                            onChange={(e) => setSelectedFolderId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        >
                            <option value="">Inbox / Unsorted</option>
                            {folders.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Initial Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        >
                            <option value="interested">Interested</option>
                            <option value="due_diligence">Due Diligence</option>
                            <option value="bid_ready">Bid Ready</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px] dark:text-white"
                            placeholder="Add your research notes here..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={exporting || !selectedCompanyId}
                            className="flex-1 px-4 py-2.5 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {exporting ? (
                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">ios_share</span>
                            )}
                            <span>{exporting ? 'Exporting...' : 'Export Now'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
