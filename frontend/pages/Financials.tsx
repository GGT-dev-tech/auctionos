import React, { useState, useEffect } from 'react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    DollarSign,
    History,
    Plus,
    ArrowRight,
    Filter,
    Download
} from 'lucide-react';
import { FinanceService, CompanyService, Transaction, FinanceStats, Company } from '../services/api';

const Financials: React.FC = () => {
    const [stats, setStats] = useState<FinanceStats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const comps = await CompanyService.list();
                setCompanies(comps);
                if (comps.length > 0) {
                    setSelectedCompanyId(comps[0].id);
                }
            } catch (err) {
                console.error('Failed to load companies:', err);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedCompanyId) {
            loadFinanceData(selectedCompanyId);
        }
    }, [selectedCompanyId]);

    const loadFinanceData = async (companyId: number) => {
        setLoading(true);
        try {
            const [s, t] = await Promise.all([
                FinanceService.getStats(companyId),
                FinanceService.getTransactions(companyId)
            ]);
            setStats(s);
            setTransactions(t);
        } catch (err) {
            console.error('Failed to load finance data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (!selectedCompanyId || !depositAmount) return;
        try {
            await FinanceService.deposit({
                company_id: selectedCompanyId,
                amount: parseFloat(depositAmount),
                description: 'Manual wallet deposit'
            });
            setDepositAmount('');
            setShowDepositModal(false);
            loadFinanceData(selectedCompanyId);
        } catch (err) {
            console.error('Deposit failed:', err);
            alert('Deposit failed. Are you a superuser?');
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Financials</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track company balance, investments, and transaction history.</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedCompanyId || ''}
                        onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        <Plus size={20} />
                        Add Funds
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label="Current Balance"
                    value={`$${stats?.total_balance.toLocaleString()}`}
                    icon={<Wallet className="text-blue-500" />}
                    color="blue"
                />
                <MetricCard
                    label="Invested Capital"
                    value={`$${stats?.total_invested.toLocaleString()}`}
                    icon={<ArrowUpRight className="text-orange-500" />}
                    color="orange"
                />
                <MetricCard
                    label="Total Expenses"
                    value={`$${stats?.total_expenses.toLocaleString()}`}
                    icon={<ArrowDownLeft className="text-red-500" />}
                    color="red"
                />
                <MetricCard
                    label="Max Bid (%)"
                    value={`${((stats?.default_bid_percentage || 0.70) * 100).toFixed(0)}%`}
                    icon={<TrendingUp className="text-purple-500" />}
                    color="purple"
                />
            </div>

            {/* Transactions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <History size={20} className="text-slate-600 dark:text-slate-300" />
                                </div>
                                <h2 className="font-bold text-lg dark:text-white">Recent Transactions</h2>
                            </div>
                            <button className="text-sm text-primary font-semibold hover:underline">View All</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900 dark:text-white">{tx.description || 'No description'}</span>
                                                    {tx.category && <span className="text-xs text-slate-500 uppercase">{tx.category}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${tx.type === 'deposit' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                                    tx.type === 'withdrawal' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                                                    }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                                                {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No transactions found for this company.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Performance / Summary Side Panel */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                        <h3 className="text-lg font-bold opacity-80 mb-1">Estimated ROI</h3>
                        <div className="text-4xl font-bold flex items-baseline gap-2 mb-6">
                            12.4% <span className="text-sm font-normal opacity-70">average</span>
                        </div>
                        <p className="text-sm opacity-90 mb-6 leading-relaxed">
                            Based on your recent property acquisitions and market valuations.
                        </p>
                        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-3 rounded-xl font-bold transition-all border border-white/30 flex items-center justify-center gap-2">
                            Download Report
                            <Download size={18} />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Investment Allocation</h3>
                        <div className="space-y-4">
                            <AllocationRow label="Residential" percentage={75} color="bg-primary" />
                            <AllocationRow label="Commercial" percentage={15} color="bg-orange-500" />
                            <AllocationRow label="Land" percentage={10} color="bg-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white">Deposit Funds</h2>
                            <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Amount ($)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</div>
                                    <input
                                        type="number"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-10 pr-4 text-2xl font-bold focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleDeposit}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                Confirm Deposit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <div className={`p-2 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 transition-colors group-hover:scale-110 duration-300`}>
                {icon}
            </div>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
);

const AllocationRow: React.FC<{ label: string, percentage: number, color: string }> = ({ label, percentage, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
            <span className="font-bold dark:text-white">{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} rounded-full`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    </div>
);

export { Financials };
