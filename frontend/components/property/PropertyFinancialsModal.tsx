import React from 'react';
import { Modal } from '../Modal';
import { Property } from '../../types';

interface Props {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
}

export const PropertyFinancialsModal: React.FC<Props> = ({ property, isOpen, onClose }) => {
    const details = property.details || {};

    const formatCurrency = (val?: number) => val ? `$${val.toLocaleString()}` : '-';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detailed Financials" size="lg">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Amount Due</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {formatCurrency(property.amount_due)}
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Estimated Value</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {formatCurrency(details.estimated_value)}
                        </p>
                    </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Financial Metric</th>
                                <th className="px-4 py-3 font-semibold text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            <tr>
                                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Assessed Value</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(details.assessed_value)}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Land Value</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(details.land_value)}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Improvement Value</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(details.improvement_value)}</td>
                            </tr>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Total Market Value</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                                    {formatCurrency((details.land_value || 0) + (details.improvement_value || 0))}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-500 dark:text-slate-400">
                    <p>Note: Values are estimated based on available tax records and third-party data sources. Always verify independently.</p>
                </div>
            </div>
        </Modal>
    );
};
