import React, { useState, useEffect } from 'react';
import { AuctionService } from '../services/api';

interface Expense {
    id: string;
    category: string;
    amount: number;
    date: string;
    description: string;
}

interface ExpenseManagerProps {
    propertyId: string;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ propertyId }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: 'Projects / Construction',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const categories = [
        "Projects / Construction",
        "HOA / Tax",
        "Utilities (Water/Electric/Gas)",
        "Insurance / Alarm",
        "Internet",
        "Cleaning / Gardening",
        "Other"
    ];

    useEffect(() => {
        loadExpenses();
    }, [propertyId]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await AuctionService.getExpenses(propertyId);
            setExpenses(data);
        } catch (error) {
            console.error("Failed to load expenses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await AuctionService.createExpense({
                ...newExpense,
                amount: parseFloat(newExpense.amount),
                property_id: propertyId
            });
            setNewExpense({ ...newExpense, amount: '', description: '' });
            loadExpenses();
        } catch (error) {
            alert("Failed to add expense");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this expense?")) return;
        try {
            await AuctionService.deleteExpense(id);
            loadExpenses();
        } catch (error) {
            alert("Failed to delete expense");
        }
    };

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Add New Expense</h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                        <select
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 text-sm"
                            value={newExpense.category}
                            onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 text-sm"
                            value={newExpense.date}
                            onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 text-sm"
                            value={newExpense.amount}
                            onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                        <input
                            type="text"
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 text-sm"
                            value={newExpense.description}
                            onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                            placeholder="Optional"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <button
                            type="submit"
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Add Expense
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Expense History</h3>
                    <span className="text-sm font-medium text-slate-500">Total: <span className="text-slate-900 dark:text-white font-bold">${total.toLocaleString()}</span></span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-medium">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Description</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">No expenses recorded yet.</td>
                                </tr>
                            ) : (
                                expenses.map(expense => (
                                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-4 text-slate-600 dark:text-slate-300">{expense.date}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">{expense.description || '-'}</td>
                                        <td className="p-4 text-right font-medium text-slate-900 dark:text-white">${expense.amount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
