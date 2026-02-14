import React, { useState, useEffect } from 'react';
import { CompanyService, Company, UserService, User } from '../../services/api';

export const CompanyManagement: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [ownerId, setOwnerId] = useState<number | undefined>();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [companiesData, usersData] = await Promise.all([
                CompanyService.list(),
                UserService.list()
            ]);
            setCompanies(companiesData);
            setUsers(usersData);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCompany) {
                await CompanyService.update(editingCompany.id, {
                    name,
                    owner_id: ownerId
                });
                alert('Company updated successfully');
            } else {
                await CompanyService.create({ name, owner_id: ownerId });
                alert('Company created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleEditCompany = (company: Company) => {
        setEditingCompany(company);
        setName(company.name);
        setOwnerId(company.owner_id);
        setShowModal(true);
    };

    const handleDeleteCompany = async (id: number) => {
        if (!confirm('Are you sure you want to delete this company? All associated data will be affected.')) return;
        try {
            await CompanyService.delete(id);
            alert('Company deleted');
            fetchData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const resetForm = () => {
        setEditingCompany(null);
        setName('');
        setOwnerId(undefined);
    };

    if (loading) return <div>Loading companies...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Company (LLC) Management</h3>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
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
                            <th className="p-4 font-medium">Owner ID</th>
                            <th className="p-4 font-medium">Created At</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {companies.map(company => (
                            <tr key={company.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="p-4 text-slate-900 dark:text-white font-medium">{company.name}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                    {users.find(u => u.id === company.owner_id)?.email || company.owner_id || '-'}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                                    {company.created_at ? new Date(company.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEditCompany(company)}
                                        className="p-1 px-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors text-xs inline-flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCompany(company.id)}
                                        className="p-1 px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-xs inline-flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {companies.length === 0 && (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        No companies found. Create one to get started.
                    </div>
                )}
            </div>

            {/* Create/Edit Company Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingCompany ? 'Edit Company' : 'Create New Company'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateCompany} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Blue Rock Capital LLC"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner (User)</label>
                                <select
                                    value={ownerId || ''}
                                    onChange={e => setOwnerId(e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">Select Owner</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.email}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all"
                                >
                                    {editingCompany ? 'Save Changes' : 'Create Company'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
