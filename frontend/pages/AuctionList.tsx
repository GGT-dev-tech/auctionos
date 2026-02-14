import React, { useEffect, useState } from 'react';
import { AuctionService } from '../services/api';
import { Property } from '../types';
import { Layout } from '../components/Layout';

export const AuctionList: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await AuctionService.getProperties();
            setProperties(data);
        } catch (err) {
            setError('Failed to load auction data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleScrape = async () => {
        try {
            await AuctionService.scrape();
            alert('Scraping started in background!');
        } catch (e) {
            alert('Failed to start scraping');
        }
    };

    const handleImport = async () => {
        try {
            await AuctionService.import();
            alert('Import started in background! Refresh list later.');
        } catch (e) {
            alert('Failed to start import');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Auction Properties</h1>
                <div className="space-x-4">
                    <button
                        onClick={handleScrape}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Trigger Scraper
                    </button>
                    <button
                        onClick={handleImport}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Trigger Import
                    </button>
                    <button
                        onClick={fetchProperties}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Bid</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {properties.map((prop) => (
                            <tr key={prop.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {prop.auction_details?.auction_date || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {prop.auction_details?.case_number || prop.parcel_id || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="font-medium text-gray-900">{prop.title}</div>
                                    <div className="text-xs">{prop.auction_details?.auction_type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {prop.auction_details?.opening_bid ? `$${prop.auction_details.opening_bid.toLocaleString()}` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${prop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {prop.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {prop.address}, {prop.city} {prop.state}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {properties.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500">No properties found. Try triggering scraper/import.</div>
                )}
            </div>
        </div>
    );
};
