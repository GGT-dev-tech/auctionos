import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { InventoryService } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { ShoppingBag, Search, Filter } from 'lucide-react';

const OTCInventory: React.FC = () => {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 20;

    useEffect(() => {
        loadData();
    }, [page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await InventoryService.getOTC({
                skip: (page - 1) * limit,
                limit
            });
            // data matches standard list response or direct array?
            // Backend returns List[Property]
            setProperties(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShoppingBag className="text-green-500" /> OTC Inventory
                        </h1>
                        <p className="text-slate-500 mt-1">Properties available for immediate purchase (Over-The-Counter)</p>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50">
                            <Filter size={18} /> Filter
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {properties.map(p => (
                                <PropertyCard key={p.id} property={p} />
                            ))}
                        </div>

                        <div className="flex justify-center mt-10 gap-4">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-4 py-2 border rounded hover:bg-slate-100 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="py-2">Page {page}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 border rounded hover:bg-slate-100"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default OTCInventory;
