import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyService } from '../../services/property.service';
import { PropertyDetails } from '../../types';
import { Button, CircularProgress, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const PropertyDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        loadProperty(id);
    }, [id]);

    const loadProperty = async (propertyId: string) => {
        try {
            setLoading(true);
            const data = await PropertyService.getProperty(propertyId);
            setProperty(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error loading property details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><CircularProgress /></div>;
    }

    if (error || !property) {
        return (
            <div className="p-8 text-center text-red-500">
                <h2>{error || 'Property not found'}</h2>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go Back</Button>
            </div>
        );
    }

    // Attempt to extract owner name from address block (rudimentary approach)
    const ownerNameFallback = property.owner_address ? property.owner_address.split('\n')[0] : 'UNKNOWN OWNER';

    return (
        <div className="p-6 max-w-7xl mx-auto mb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    {ownerNameFallback}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Stats Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-primary-600 text-white p-3 text-center font-bold">
                            {property.county} County, {property.state} : {property.parcel_id}
                        </div>
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
                                    • {property.availability_status === 'available' ? 'Available' : 'Unavailable'}
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div>
                                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">{property.lot_acres || 'N/A'} acres</div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                        <span className="font-semibold">Tax Sale Year:</span>
                                        <span>{property.tax_year || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                        <span className="font-semibold">C/S Number:</span>
                                        <span>{property.cs_number || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                        <span className="font-semibold">Account #:</span>
                                        <span>{property.account_number || 'N/A'}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">{property.property_type || 'Land Only'}</div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                        <span className="font-semibold">Amount Due:</span>
                                        <span>${property.amount_due?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                        <span className="font-semibold">Assessed:</span>
                                        <span>${property.assessed_value?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                        <span className="font-semibold">Land Value:</span>
                                        <span>${property.land_value?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                        <span className="font-semibold">Improvements:</span>
                                        <span>{property.improvement_value ? `$${property.improvement_value.toLocaleString()}` : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 mt-2 bg-green-50 dark:bg-green-900/20 px-2 rounded font-bold">
                                        <span>Total Value:</span>
                                        <span className="text-green-700 dark:text-green-400">
                                            ${((property.land_value || 0) + (property.improvement_value || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-sky-50 dark:bg-sky-900/20 p-4 border border-sky-100 dark:border-sky-800 rounded-lg text-center">
                        <span className="text-sky-800 dark:text-sky-300 font-bold">Occupant Status: </span>
                        {property.occupancy || 'Unknown'} <span className="text-xs italic ml-2">(from county records)</span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                        <p className="mb-2"><span className="font-bold">Description: </span>{property.legal_description || property.description || 'No legal description available.'}</p>
                        {property.is_qoz && <p><span className="font-bold">Opportunity Zone: </span> Yes</p>}
                    </div>

                    <div className="flex gap-4">
                        <Button variant="contained" color="success" startIcon={<MapIcon />}>View on Map</Button>
                        <Button variant="outlined" startIcon={<FavoriteBorderIcon />}>Add Favorite</Button>
                    </div>

                    {/* Auction History */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 font-bold text-slate-700 dark:text-slate-200">
                            Auction History
                        </div>
                        <div className="p-4">
                            {property.auction_history && property.auction_history.length > 0 ? (
                                <div className="space-y-4">
                                    {property.auction_history.map((hist: any, i: number) => (
                                        <div key={i} className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-100 dark:border-slate-800">
                                            <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-2">{hist.auction_name} : {hist.auction_date ? new Date(hist.auction_date).toLocaleDateString() : 'Unknown Date'}</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                <div><strong>Where:</strong> {hist.location || 'Online'}</div>
                                                <div><strong>Listed As:</strong> {hist.listed_as || property.parcel_id}</div>
                                                <div><strong>Taxes Due:</strong> ${hist.taxes_due?.toFixed(2) || property.amount_due}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No previous auction history found.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Google Maps Embed */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-2">
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-center py-2 font-bold rounded mb-2">
                            Map View
                        </div>
                        {/* Example embedded map since we don't have true coordinates consistently available without GIS, using a placeholder logic. */}
                        <iframe
                            src={`https://www.google.com/maps?q=${property.address ? encodeURIComponent(property.address) : property.parcel_id}&output=embed`}
                            width="100%"
                            height="300"
                            style={{ border: 0, borderRadius: '4px' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Property Map"
                        ></iframe>
                    </div>

                    {/* Actions Box */}
                    <div className="bg-green-500 text-white rounded-lg p-4 text-center cursor-pointer hover:bg-green-600 transition shadow">
                        <h3 className="font-bold text-lg">Purchase Online</h3>
                        <p className="text-sm opacity-90">Click to purchase from {property.county} County OTC Liens</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-primary-600 text-white p-3 font-bold">Recommended Next Steps</div>
                        <div className="p-4 space-y-3">
                            <Button fullWidth variant="outlined" color="success">Investment Property Funding</Button>
                            <Button fullWidth variant="outlined" color="warning">Title Report: Nationwide Searches</Button>
                            <Button fullWidth variant="outlined" color="info">Clear Title: Free Consultation</Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-sky-100 dark:bg-sky-900/30 font-bold p-3 text-sky-800 dark:text-sky-300">Contact & Location</div>
                        <div className="p-4 text-sm space-y-4">
                            <div>
                                <strong className="block text-slate-500 uppercase text-xs">Owner Address</strong>
                                <p className="whitespace-pre-line">{property.owner_address || 'Unavailable'}</p>
                            </div>
                            <Divider />
                            <div>
                                <strong className="block text-slate-500 uppercase text-xs">Parcel Address</strong>
                                <p className="whitespace-pre-line">{property.address || 'Unavailable'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-sky-100 dark:bg-sky-900/30 font-bold p-3 text-sky-800 dark:text-sky-300">Research Links</div>
                        <div className="p-4 text-sm">
                            <ul className="space-y-2 text-primary-600 dark:text-primary-400">
                                <li><a href={`https://www.google.com/search?q=${property.county}+County+Property+Appraiser`} target="_blank" rel="noreferrer" className="hover:underline">Google: {property.county} Property Appraiser</a></li>
                                <li><a href={`https://www.zillow.com/homes/${encodeURIComponent(property.address || '')}_rb`} target="_blank" rel="noreferrer" className="hover:underline">Zillow Property Report</a></li>
                                <li><a href={`https://msc.fema.gov/portal/search?AddressQuery=${encodeURIComponent(property.address || '')}`} target="_blank" rel="noreferrer" className="hover:underline">FEMA Flood Map Details</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-sky-100 dark:bg-sky-900/30 font-bold p-3 text-sky-800 dark:text-sky-300">Personal Tools</div>
                        <div className="p-4 space-y-3">
                            <Button fullWidth variant="outlined" size="small">Create New List</Button>
                            <Button fullWidth variant="outlined" size="small">Edit Notes</Button>
                            <Button fullWidth variant="outlined" size="small">Add Attachments</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailPage;
