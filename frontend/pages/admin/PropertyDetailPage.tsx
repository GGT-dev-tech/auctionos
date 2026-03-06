import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyService, ClientDataService } from '../../services/property.service';
import { API_BASE_URL } from '../../services/httpClient';
import { countyService, CountyContact } from '../../services/county.service';
import { PropertyDetails } from '../../types';
import { Button, CircularProgress, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Menu, MenuItem, Tooltip } from '@mui/material';
import { FolderPlusIcon, PlusIcon } from 'lucide-react';

interface PropertyDetailPageProps {
    readOnly?: boolean;
}

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ readOnly = false }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<any>(null);
    const [countyContacts, setCountyContacts] = useState<CountyContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [lists, setLists] = useState<any[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        if (!id) return;
        loadProperty(id);
        loadLists();
    }, [id]);

    const loadLists = async () => {
        try {
            const data = await ClientDataService.getLists();
            setLists(data);
        } catch (err) {
            console.error("Error loading lists", err);
        }
    };

    const loadProperty = async (propertyId: string) => {
        try {
            setLoading(true);
            const data = await PropertyService.getProperty(propertyId);
            setProperty(data);
            setLoading(false); // Render the main UI as soon as we have data

            // Secondary background loads - non-blocking
            fetchSecondaryData(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error loading property details');
            setLoading(false);
        }
    };

    const fetchSecondaryData = async (data: any) => {
        // Check if favorited (Gracefully handle failures silently)
        if (localStorage.getItem('token')) {
            try {
                const favorites = await PropertyService.getFavorites();
                if (data.id && favorites.includes(data.id)) {
                    setIsFavorite(true);
                }
            } catch (favErr) {
                // Silently ignore favorites load failure to keep page functional
            }
        }

        // Dynamically load county contacts based on property state and county
        if (data.state && data.county) {
            try {
                const contacts = await countyService.getContacts(data.state, data.county);
                setCountyContacts(contacts);
            } catch (contactErr) {
                // Silently ignore contacts failure
            }
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

    const handlePurchaseOnline = async () => {
        // Redirection logic first
        try {
            const { url } = await PropertyService.getAuctionRedirect(property.parcel_id);
            if (url && window.confirm(`Redirecting to official auction site: ${url}\n\nDo you want to proceed?`)) {
                await PropertyService.logAction(property.parcel_id, 'purchase_redirect');
                window.open(url, '_blank');
                return;
            }
        } catch (e) {
            console.log("No dynamic link found, falling back to simulation.");
        }

        if (!window.confirm(`Are you sure you want to purchase the lien for ${property.parcel_id}? This is a simulated transaction.`)) {
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/api/v1/properties/${property.parcel_id}/purchase`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Purchase failed');
            }
            alert("Property successfully purchased!");
            loadProperty(property.parcel_id); // Reload to mirror new state
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };


    const handleToggleFavorite = async () => {
        try {
            const res = await PropertyService.toggleFavorite(property.id);
            setIsFavorite(res.is_favorite);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleAddressVerification = () => {
        alert("Address validation matrix initiated. Fetching latest postal data for " + property.address);
    };

    const handleOpenListMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseListMenu = () => {
        setAnchorEl(null);
    };

    const handleAddToList = async (listId: number) => {
        if (!property?.id) {
            alert("Error: Property ID missing. Try refreshing the page.");
            return;
        }
        try {
            setActionLoading(true);
            await ClientDataService.addPropertyToList(listId, property.id);
            alert(`Property added to list successfully!`);
            handleCloseListMenu();
        } catch (err: any) {
            console.error("Failed to add property to list:", err);
            alert(`Error: ${err.message || 'Failed to add property to list'}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddToStandardList = async () => {
        if (!property?.id) {
            alert("Error: Property ID missing. Try refreshing the page.");
            return;
        }
        try {
            setActionLoading(true);
            await ClientDataService.addPropertyToStandardList(property.id);
            alert(`Property added to Standard List (${property.state} - ${property.county}) successfully!`);
            handleCloseListMenu();
        } catch (err: any) {
            console.error("Failed to add property to standard list:", err);
            alert(`Error: ${err.message || 'Failed to add property to standard list'}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateAndAdd = async () => {
        const name = window.prompt("Enter name for new list:");
        if (!name) return;

        if (!property?.id) {
            alert("Error: Property ID missing. Try refreshing the page.");
            return;
        }

        try {
            setActionLoading(true);
            console.log("Creating list:", name);
            const newList = await ClientDataService.createList(name);
            console.log("Adding property to new list:", newList.id, property.id);
            await ClientDataService.addPropertyToList(newList.id, property.id);
            alert(`List "${name}" created and property added!`);
            loadLists();
            handleCloseListMenu();
        } catch (err: any) {
            console.error("Failed to create list and add property:", err);
            alert(`Error: ${err.message || 'Failed to create list'}`);
        } finally {
            setActionLoading(false);
        }
    };

    // Attempt to extract owner name from address block (rudimentary approach)
    const ownerNameFallback = property.owner_address ? property.owner_address.split('\n')[0] : 'UNKNOWN OWNER';

    const groupedShapeData: Record<string, any[]> = {};
    if (property?.shape_data && Array.isArray(property.shape_data)) {
        property.shape_data.forEach((item: any) => {
            if (!groupedShapeData[item.category]) {
                groupedShapeData[item.category] = [];
            }
            groupedShapeData[item.category].push(item);
        });
    }

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
                        <div className="bg-primary-600 text-white p-3 text-center font-bold text-lg">
                            {property.county}, {property.state}: {property.parcel_id}
                        </div>
                        <div className="p-6">
                            <div className="mb-6 space-y-1">
                                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                    {ownerNameFallback}
                                </h1>
                                <h2 className="text-lg font-bold text-slate-600 dark:text-slate-400">
                                    • {property.property_type || 'parcel type'}
                                </h2>
                                <h3 className="text-md text-slate-500 font-semibold">{property.lot_acres || 'N/A'} acres</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mt-4">
                                <div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                        <span className="font-semibold">Tax Sale Year:</span>
                                        <span>{property.tax_year || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                                        <span className="font-semibold text-red-600 dark:text-red-400">Tax Delinquent:</span>
                                        <span>{property.availability_status === 'available' ? 'Yes' : 'No'}</span>
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
                                    <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Land Only</div>
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

                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 border border-orange-100 dark:border-orange-800 rounded-lg text-center">
                        <span className="text-orange-800 dark:text-orange-300 font-bold">Tax history: </span>
                        <span>{property.availability_status === 'available' ? 'Tax Lien Available' : 'Tax Lien Unavailable'} ({property.tax_year || new Date().getFullYear()}) </span>
                        <a href={`https://www.google.com/search?q=${property.county}+County+Tax+Collector`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-2 text-sm italic">
                            click for tax lien details
                        </a>
                    </div>

                    <div className="bg-sky-50 dark:bg-sky-900/20 p-4 border border-sky-100 dark:border-sky-800 rounded-lg text-center">
                        <span className="text-sky-800 dark:text-sky-300 font-bold">Occupant Status: </span>
                        {property.occupancy || 'Unknown'}
                        <span className="text-xs italic ml-2">
                            {property.occupancy_checked_date ? `(last checked on ${new Date(property.occupancy_checked_date).toLocaleDateString()})` : '(date unknown)'}
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                        <p className="mb-2"><span className="font-bold">Description: </span>{property.legal_description || property.description || 'No legal description available.'}</p>
                        {property.is_qoz && (
                            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                                <span className="font-bold text-slate-900 dark:text-white">Opportunity Zone: </span>
                                {property.qoz_description || 'Low-Income Community & Opportunity Zone Information'}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button variant="contained" color="success" startIcon={<MapIcon />}>View on Map</Button>
                        <Button
                            variant={isFavorite ? "contained" : "outlined"}
                            color={isFavorite ? "error" : "inherit"}
                            startIcon={<FavoriteBorderIcon />}
                            onClick={handleToggleFavorite}
                        >
                            {isFavorite ? 'Favorited' : 'Add Favorite'}
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<FolderPlusIcon size={18} />}
                            onClick={handleOpenListMenu}
                        >
                            Add to List
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleCloseListMenu}
                            PaperProps={{ className: "mt-1 shadow-lg rounded-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900" }}
                        >
                            <MenuItem
                                onClick={handleAddToStandardList}
                                className="text-sm py-2 px-4 text-emerald-600 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                                <span className="material-symbols-outlined text-[18px] mr-3">auto_awesome</span> Standard List
                            </MenuItem>
                            <Divider className="my-1" />
                            <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Folders</div>
                            {lists.filter(l => l.tags !== 'STANDARD').map(list => (
                                <MenuItem
                                    key={list.id}
                                    onClick={() => handleAddToList(list.id)}
                                    className="text-sm py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <span className="material-symbols-outlined text-[18px] mr-3 text-blue-500">folder</span>
                                    {list.name}
                                </MenuItem>
                            ))}
                            <Divider className="my-1" />
                            <MenuItem
                                onClick={handleCreateAndAdd}
                                className="text-sm py-2 px-4 text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                <PlusIcon size={16} className="mr-3" /> New List...
                            </MenuItem>
                        </Menu>
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

                    {/* Source: Parcel Shape Data */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 font-bold text-slate-700 dark:text-slate-200">
                            Source: Parcel Shape Data
                        </div>
                        <div className="p-4">
                            {Object.keys(groupedShapeData).length > 0 ? (
                                <div className="space-y-6">
                                    {Object.entries(groupedShapeData).map(([category, items]) => (
                                        <div key={category}>
                                            <h5 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">
                                                {category}
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                                {items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 px-1 rounded transition-colors">
                                                        <span className="font-medium text-slate-600 dark:text-slate-400">{item.subcategory}:</span>
                                                        <span className="text-slate-800 dark:text-slate-300 text-right ms-2">{item.value || '-'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-900/50 text-xs font-mono text-slate-600 dark:text-slate-400 p-3 rounded">
                                    {property.parcel_shape_data ? (
                                        <div className="whitespace-pre-wrap">{property.parcel_shape_data}</div>
                                    ) : (
                                        <span className="italic text-slate-400">No dynamic shape data available.</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Parcel Numbers */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 font-bold text-slate-700 dark:text-slate-200">
                            Parcel Numbers
                        </div>
                        <div className="p-4 text-sm space-y-2">
                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
                                <span className="font-semibold text-slate-600 dark:text-slate-400">Formatted Number:</span>
                                <span>{property.parcel_id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
                                <span className="font-semibold text-slate-600 dark:text-slate-400">PIN/PPIN:</span>
                                <span>{property.pin_ppin || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
                                <span className="font-semibold text-slate-600 dark:text-slate-400">Raw Number:</span>
                                <span>{property.raw_parcel_number || property.parcel_id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-1">
                                <span className="font-semibold text-slate-600 dark:text-slate-400">County FIPS:</span>
                                <span>{property.county_fips || 'N/A'}</span>
                            </div>

                            {property.additional_parcel_numbers && (
                                <div className="mt-4 pt-2">
                                    <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Additional Parcel Number Formats</h5>
                                    <div className="text-xs font-mono text-slate-500 whitespace-pre-line bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                                        {property.additional_parcel_numbers}
                                    </div>
                                </div>
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

                    {/* Purchase Online Actions Box (Hidden for Clients) */}
                    {!readOnly && property.availability_status === 'available' && (
                        <div
                            className={`bg-green-600 text-white rounded-lg p-6 text-center shadow-lg transition ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700 cursor-pointer'}`}
                            onClick={actionLoading ? undefined : handlePurchaseOnline}
                        >
                            <h3 className="font-bold text-xl mb-1">{actionLoading ? 'Processing...' : 'Purchase Online'}</h3>
                            <p className="text-sm opacity-90">{property.county} County-Held Certificates</p>
                            <p className="text-xs font-semibold mt-2 underline">Click to simulate OTC purchase transaction</p>
                        </div>
                    )}

                    {!readOnly && property.availability_status === 'purchased' && (
                        <div className="bg-slate-200 text-slate-500 rounded-lg p-6 text-center shadow-inner cursor-not-allowed">
                            <h3 className="font-bold text-xl mb-1">Already Purchased</h3>
                            <p className="text-sm">This property is no longer available.</p>
                        </div>
                    )}

                    {/* Recommended Next Steps (Hidden for Clients) */}
                    {!readOnly && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="bg-slate-100 dark:bg-slate-700 p-3 font-bold text-slate-700 dark:text-slate-200">
                                • Recommended Next Steps
                            </div>
                            <div className="p-4 space-y-4">
                                {property.recommended_next_steps && property.recommended_next_steps.length > 0 ? (
                                    property.recommended_next_steps.map((step: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100">{step.action}</h4>
                                                <span className={`text-xs px-2 py-0.5 rounded ${step.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {step.priority} Priority
                                                </span>
                                            </div>
                                            <Button size="small" variant="text" onClick={() => PropertyService.logAction(property.parcel_id, `step_${idx}`)}>Clear</Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 italic text-center">No recommendations at this time.</p>
                                )}

                                <Divider />
                                <div className="text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded transition">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300">Investment Property Funding: Free Consultation</h4>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 hover:underline">click for more info</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 font-bold text-slate-700 dark:text-slate-200">
                            * Contact Information & Location
                        </div>
                        <div className="p-4 text-sm space-y-4">
                            <div>
                                <strong className="block text-slate-500 uppercase text-xs mb-1">Owner Address</strong>
                                <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{property.owner_address || 'Unavailable'}</p>
                                <button className="mt-2 text-blue-600 hover:underline text-xs" onClick={handleAddressVerification}>
                                    Address Verification <br /> click for history
                                </button>
                            </div>
                            {property.alternate_owner_address && (
                                <>
                                    <Divider />
                                    <div>
                                        <strong className="block text-slate-500 uppercase text-xs mb-1">Alternate Owner Address</strong>
                                        <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{property.alternate_owner_address}</p>
                                    </div>
                                </>
                            )}
                            <Divider />
                            <div>
                                <strong className="block text-slate-500 uppercase text-xs mb-1">Parcel Address</strong>
                                <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{property.address || 'Unavailable'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 font-bold text-slate-700 dark:text-slate-200">
                            Research Links
                        </div>
                        <div className="p-4 text-sm space-y-4">
                            {countyContacts.length > 0 && (
                                <div>
                                    <strong className="block text-slate-700 dark:text-slate-300 mb-1">{property.county} County Links:</strong>
                                    <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                                        {countyContacts.map((contact, idx) => (
                                            <li key={idx}>
                                                <a href={contact.url} target="_blank" rel="noreferrer" className="hover:underline">
                                                    {contact.name} {contact.phone ? `(${contact.phone})` : ''}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {/* Standard Static Links Fallback or Additions */}
                            <div>
                                <strong className="block text-slate-700 dark:text-slate-300 mb-1">Owner Research:</strong>
                                <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                                    <li><a href={`https://www.google.com/search?q=${encodeURIComponent(ownerNameFallback)}`} target="_blank" rel="noreferrer" className="hover:underline">Google Search</a></li>
                                    <li><a href={`https://news.google.com/search?q=${encodeURIComponent(ownerNameFallback)}`} target="_blank" rel="noreferrer" className="hover:underline">Google News</a></li>
                                    <li><a href={`https://www.google.com/search?q=${encodeURIComponent(ownerNameFallback + ' obituary')}`} target="_blank" rel="noreferrer" className="hover:underline">Obituary Search</a></li>
                                </ul>
                            </div>
                            <div>
                                <strong className="block text-slate-700 dark:text-slate-300 mb-1">Owner Skip Trace:</strong>
                                <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                                    <li><a href={`https://www.fastpeoplesearch.com/name/${encodeURIComponent(ownerNameFallback)}`} target="_blank" rel="noreferrer" className="hover:underline">Fast People Search</a></li>
                                    <li><a href={`https://www.truepeoplesearch.com/results?name=${encodeURIComponent(ownerNameFallback)}`} target="_blank" rel="noreferrer" className="hover:underline">True People Search</a></li>
                                    <li><a href={`https://www.cyberbackgroundchecks.com/people/${encodeURIComponent(ownerNameFallback.replace(/ /g, '-'))}`} target="_blank" rel="noreferrer" className="hover:underline">Cyber Background Checks</a></li>
                                </ul>
                            </div>
                            <div>
                                <strong className="block text-slate-700 dark:text-slate-300 mb-1">Property Research:</strong>
                                <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                                    <li><a href={`https://www.zillow.com/homes/${encodeURIComponent(property.address || '')}_rb`} target="_blank" rel="noreferrer" className="hover:underline">Zillow Property Report</a></li>
                                    <li><a href={`https://www.epa.gov/enviro/myenvironment`} target="_blank" rel="noreferrer" className="hover:underline">EPA Report</a></li>
                                    <li><a href={`https://news.google.com/search?q=${encodeURIComponent(property.address || property.parcel_id)}`} target="_blank" rel="noreferrer" className="hover:underline">Google News</a></li>
                                    <li><a href={`https://msc.fema.gov/portal/search?AddressQuery=${encodeURIComponent(property.address || '')}`} target="_blank" rel="noreferrer" className="hover:underline">FEMA Flood Map Details</a></li>
                                </ul>
                            </div>
                            <div>
                                <strong className="block text-slate-700 dark:text-slate-300 mb-1">Research Comparables:</strong>
                                <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                                    <li><a href={`https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(property.zip_code || property.city || '')}`} target="_blank" rel="noreferrer" className="hover:underline">Realtor.com Comps</a></li>
                                    <li><a href={`https://www.redfin.com/city/${encodeURIComponent(property.city || '')}/${property.state}`} target="_blank" rel="noreferrer" className="hover:underline">Redfin Comps</a></li>
                                    <li><a href={`https://www.trulia.com/${property.state}/${encodeURIComponent(property.city || '')}/`} target="_blank" rel="noreferrer" className="hover:underline">Trulia Comps</a></li>
                                    <li><a href={`https://www.zillow.com/homes/${encodeURIComponent(property.zip_code || property.city || '')}_rb/`} target="_blank" rel="noreferrer" className="hover:underline">Zillow Comps</a></li>
                                </ul>
                            </div>
                            <div>
                                <strong className="block text-slate-700 dark:text-slate-300 mb-1">Research Local Housing Market:</strong>
                                <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                                    <li><a href={`https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(property.zip_code || property.city || '')}/overview`} target="_blank" rel="noreferrer" className="hover:underline">Realtor.com Market Report</a></li>
                                    <li><a href={`https://www.redfin.com/city/${encodeURIComponent(property.city || '')}/${property.state}/housing-market`} target="_blank" rel="noreferrer" className="hover:underline">Redfin Market Report</a></li>
                                    <li><a href={`https://www.zillow.com/home-values/`} target="_blank" rel="noreferrer" className="hover:underline">Zillow Property Value Report</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* State Inventory History */}
                    {property.state_inventory_entered_date && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="bg-sky-100 dark:bg-sky-900/30 font-bold p-3 text-sky-800 dark:text-sky-300">State Inventory History</div>
                            <div className="p-4 text-sm">
                                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Timeline:</h4>
                                <div className="pl-4 border-l-2 border-blue-400 relative">
                                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {new Date(property.state_inventory_entered_date).toLocaleDateString()} to Present
                                    </p>
                                    <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                                        &nbsp;&nbsp;In State Inventory
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 space-y-4">
                            <div className="flex flex-col gap-2 border-b pb-2">
                                <span className="font-bold text-slate-700 dark:text-slate-300">My Notes:</span>
                                <textarea
                                    className="w-full p-2 text-sm border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    placeholder="Add private Markdown notes..."
                                    defaultValue={property.notes || ""}
                                    onBlur={async (e) => {
                                        const noteText = e.target.value;
                                        if (noteText !== property.notes) {
                                            try {
                                                await ClientDataService.createNote(property.id, noteText);
                                                // Optional: update local state if needed, but the current value is already in the textarea
                                            } catch (err) {
                                                console.error("Failed to save note", err);
                                            }
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-slate-400 italic">Auto-saves on blur. Supports Markdown formatting.</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="font-bold text-slate-700 dark:text-slate-300">My Attachments:</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        className="text-xs"
                                        onChange={async (e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                try {
                                                    await ClientDataService.uploadAttachment(property.id, e.target.files[0]);
                                                    alert("Attachment uploaded successfully");
                                                    loadProperty(property.parcel_id); // Refresh to show new attachment
                                                } catch (err: any) {
                                                    alert(err.message);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="text-xs space-y-1">
                                    {property.attachments?.map((att: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-blue-600 hover:underline cursor-pointer py-1 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                            <a
                                                href={att.file_path.startsWith('http') ? att.file_path : `${API_BASE_URL}${att.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">description</span>
                                                {att.filename}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailPage;
