import React, { useState, useEffect } from 'react';
import { CompanyService, Company } from '../../services/api';

export const CompanyManagement: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [name, setName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await CompanyService.list();
            setCompanies(data);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch companies');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await CompanyService.create({ name });
            alert('Company created successfully');
            setShowModal(false);
            setName('');
            fetchData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (loading) return <div>Loading companies...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Company Management</h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Create Company
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="p-4 font-medium">Company Name</th>
                            <th className="p-4 font-medium">Created At</th>
                            <th className="p-4 font-medium">Owner ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {companies.map(company => (
                            <tr key={company.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-4 text-slate-900 dark:text-white font-medium">{company.name}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                    {company.created_at ? new Date(company.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">{company.owner_id || '-'}</td>
                            </tr>
                        ))}
                        {companies.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-slate-500">
                                    No companies found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Company Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create New Company</h3>
                        <form onSubmit={handleCreateCompany} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Acme Real Estate LLC"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    Create Company
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
