
import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/api';

const PropertyList: React.FC = () => {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProperties = async () => {
        try {
            const data = await AdminService.listProperties();
            setProperties(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">All Properties</h3>
                <button onClick={fetchProperties} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-4 py-3">Parcel ID</th>
                            <th className="px-4 py-3">County</th>
                            <th className="px-4 py-3">State</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Auction Date</th>
                            <th className="px-4 py-3">Amount Due</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={7} className="px-4 py-8 text-center">Loading...</td></tr>
                        ) : properties.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-8 text-center">No properties found.</td></tr>
                        ) : (
                            properties.map((prop) => (
                                <tr key={prop.parcel_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{prop.parcel_id}</td>
                                    <td className="px-4 py-3">{prop.county}</td>
                                    <td className="px-4 py-3">{prop.state_code}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${prop.status === 'sold' ? 'bg-red-100 text-red-700' :
                                                prop.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {prop.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{prop.auction_date || '-'}</td>
                                    <td className="px-4 py-3">${prop.amount_due}</td>
                                    <td className="px-4 py-3">
                                        <button className="text-blue-600 hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PropertyList;
