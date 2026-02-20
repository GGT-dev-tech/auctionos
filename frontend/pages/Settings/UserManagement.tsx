import React, { useState, useEffect } from 'react';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../types';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.AGENT);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const usersData = await UserService.list();
            setUsers(usersData);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await UserService.update(editingUser.id, {
                    email,
                    role,
                    is_active: isActive,
                    ...(password ? { password } : {})
                });
                alert('User updated successfully');
            } else {
                await UserService.create({
                    email,
                    password,
                    role
                });
                alert('User created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEmail(user.email);
        setPassword('');
        setRole(user.role);
        setIsActive(user.is_active);
        setShowModal(true);
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await UserService.delete(id);
            alert('User deleted');
            fetchData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setEmail('');
        setPassword('');
        setRole(UserRole.AGENT);
        setIsActive(true);
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Management</h3>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Create User
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-4 text-slate-900 dark:text-white font-medium">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                            user.role === 'manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                        ${user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEditUser(user)}
                                        className="p-1 px-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors text-xs inline-flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
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
            </div>

            {/* Create/Edit User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value as UserRole)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                                >
                                    <option value={UserRole.AGENT}>Agent</option>
                                    <option value={UserRole.MANAGER}>Manager</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                </select>
                            </div>

                            {editingUser && (
                                <div className="flex items-center gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={isActive}
                                        onChange={e => setIsActive(e.target.checked)}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                        Account Active
                                    </label>
                                </div>
                            )}

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
                                    className="px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all"
                                >
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
