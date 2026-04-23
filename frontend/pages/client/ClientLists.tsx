import React, { useState, useEffect } from 'react';
import { Typography, IconButton, TextField, Dialog, Button, CircularProgress, Chip, Tabs, Tab, Autocomplete } from '@mui/material';
import { FolderPlusIcon, Trash2Icon, Edit2Icon, ExternalLinkIcon } from 'lucide-react';
import { ClientDataService } from '../../services/property.service';
import { countyService, CountyContact } from '../../services/county.service';
import { StatesService, StateContact } from '../../services/states.service';
import { geocodeAddress } from '../../services/geocoding.service';
import { useNavigate } from 'react-router-dom';
import { SwipeToDeleteItem } from '../../components/SwipeToDeleteItem';
import { PropertyPreviewDrawer } from '../../components/PropertyPreviewDrawer';
import { useCompany } from '../../context/CompanyContext';
import { ClientUserProperties } from './ClientUserProperties';

// Helper to map state names to codes for the SVG silhouette
const STATE_CODE_MAP: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

interface CustomList {
    id: number;
    name: string;
    property_count: number;
    is_favorite_list: boolean;
    is_broadcasted: boolean;
    tags?: string;
    has_upcoming_auction?: boolean;
    upcoming_auctions_count?: number;
    notes?: string;
}



const ClientLists: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompany } = useCompany();
    const [lists, setLists] = useState<CustomList[]>([]);
    const [selectedListId, setSelectedListId] = useState<number | null>(null);
    const [selectedListProperties, setSelectedListProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [propsLoading, setPropsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [editingListId, setEditingListId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [newCountyName, setNewCountyName] = useState('');
    const [dragOverListId, setDragOverListId] = useState<number | null>(null);
    const [broadcastedLists, setBroadcastedLists] = useState<CustomList[]>([]);
    const [importing, setImporting] = useState<number | null>(null);
    const [countyContacts, setCountyContacts] = useState<CountyContact[]>([]);
    const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        smart: false,
        standard: false,
        custom: false,
        broadcasted: false
    });

    const [creationMode, setCreationMode] = useState<'custom' | 'standard'>('custom');
    const [stateContacts, setStateContacts] = useState<StateContact[]>([]);
    const [selectedState, setSelectedState] = useState<StateContact | null>(null);
    const [selectedStateName, setSelectedStateName] = useState<string | null>(null);
    const [selectedCountyName, setSelectedCountyName] = useState<string | null>(null);
    const [previewPropertyId, setPreviewPropertyId] = useState<number | string | null>(null);
    const [geocodedProperties, setGeocodedProperties] = useState<Record<number, { lat: number, lng: number }>>({});
    const [folderNotes, setFolderNotes] = useState<string>('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [viewMode, setViewMode] = useState<'folders' | 'custom_properties'>('folders');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Global listener for dynamic property additions
    useEffect(() => {
        const handlePropertyAdded = async (event: any) => {
            const newProperty = event.detail;
            if (!newProperty) return;

            // 1. Refresh list data implicitly to update counts
            loadLists();

            // 2. If we are currently viewing the folder this property belongs to, inject it into the UI
            if (
                (selectedListId && newProperty.list_id === selectedListId) ||
                (selectedStateName && newProperty.state && newProperty.state.toLowerCase() === selectedStateName.toLowerCase())
            ) {
                setSelectedListProperties(prev => {
                    if (prev.find(p => p.id === newProperty.id)) return prev;
                    return [newProperty, ...prev];
                });

                // 3. Geocode on-the-fly and update map instantly
                if ((!newProperty.latitude || !newProperty.longitude) && newProperty.address) {
                    try {
                        let coords = await geocodeAddress(newProperty.address);
                        if (!coords && (newProperty.county || newProperty.state)) {
                            const fallback = `${newProperty.county || ''} County, ${newProperty.state || ''}`;
                            coords = await geocodeAddress(fallback);
                        }
                        if (!coords && newProperty.state) {
                            coords = await geocodeAddress(newProperty.state);
                        }

                        if (coords) {
                            setGeocodedProperties(prev => ({ ...prev, [newProperty.id]: coords }));
                        }
                    } catch (err) {
                        console.error('Dynamic geocoding error', err);
                    }
                }
            }
        };

        window.addEventListener('propertyAdded', handlePropertyAdded);
        return () => window.removeEventListener('propertyAdded', handlePropertyAdded);
    }, [selectedListId, selectedStateName]);

    const toggleState = (stateName: string) => {
        setExpandedStates(prev => ({ ...prev, [stateName]: !prev[stateName] }));
    };

    useEffect(() => {
        loadLists();
        StatesService.getContacts().then(setStateContacts).catch(() => { });
    }, [activeCompany?.id]);

    useEffect(() => {
        if (selectedListId) {
            loadListProperties(selectedListId);
            const selList = lists.find(l => l.id === selectedListId) || broadcastedLists.find(l => l.id === selectedListId);
            if (selList?.tags === 'STANDARD') { // Now these are just states. We clear county contacts until they pick a county subfolder, but we can load state contacts if needed.
                setCountyContacts([]);
            } else {
                setCountyContacts([]);
            }
        } else if (selectedStateName) {
            loadStateProperties(selectedStateName);
            // If they clicked a specific county subfolder, load those county contacts
            if (selectedCountyName) {
                countyService.getContacts(selectedStateName, selectedCountyName).then(setCountyContacts).catch(() => setCountyContacts([]));
            } else {
                setCountyContacts([]);
            }
        } else {
            setSelectedListProperties([]);
            setCountyContacts([]);
        }
    }, [selectedListId, selectedStateName, selectedCountyName, lists, broadcastedLists]);

    const parseNotes = (rawNotes: string) => {
        try {
            const parsed = JSON.parse(rawNotes);
            if (typeof parsed === 'object' && parsed !== null) return parsed;
        } catch (e) { }
        return { __root__: rawNotes || '' };
    };

    // Update folderNotes state when list changes
    useEffect(() => {
        const selList = lists.find(l => l.id === selectedListId) || broadcastedLists.find(l => l.id === selectedListId);
        if (selList) {
            const notesObj = parseNotes(selList.notes || '');
            const activeKey = selectedCountyName || '__root__';
            setFolderNotes(notesObj[activeKey] || '');
        } else {
            setFolderNotes('');
        }
    }, [selectedListId, selectedCountyName, lists, broadcastedLists]);

    const handleSaveNotes = async (newText: string) => {
        if (!selectedListId) return;
        setSavingNotes(true);
        try {
            const selList = lists.find(l => l.id === selectedListId) || broadcastedLists.find(l => l.id === selectedListId);
            const notesObj = parseNotes(selList?.notes || '');
            const activeKey = selectedCountyName || '__root__';
            
            // Check if there is actually a change to avoid unnecessary writes
            if (notesObj[activeKey] === newText) {
                setSavingNotes(false);
                return;
            }

            const updatedNotesObj = { ...notesObj, [activeKey]: newText };
            const jsonString = JSON.stringify(updatedNotesObj);

            await ClientDataService.updateList(selectedListId, { notes: jsonString });
            
            // Reflect in local state
            setLists(prev => prev.map(l => l.id === selectedListId ? { ...l, notes: jsonString } : l));
        } catch (err) {
            console.error('Error saving notes:', err);
        } finally {
            setSavingNotes(false);
        }
    };

    const loadLists = async () => {
        try {
            setLoading(true);
            const data = await ClientDataService.getLists(activeCompany?.id);
            setLists(data);
            if (data.length > 0 && !selectedListId && !selectedStateName) {
                // Select favorites by default if available, otherwise stay at 'Select a Folder'
                const fav = data.find(l => l.is_favorite_list);
                if (fav) setSelectedListId(fav.id);
            }
        } catch (err: any) {
            console.error('Error loading lists:', err);
        } finally {
            setLoading(false);
        }

        try {
            const bData = await ClientDataService.getBroadcastedLists();
            setBroadcastedLists(bData);
        } catch (err: any) {
            console.error('Error loading broadcasted lists:', err);
        }
    };

    const handleExpandStateList = async (listId: number, stateName: string) => {
        toggleState(stateName);
        if (!expandedStates[stateName]) {
            // About to expand, fetch properties to group by county in the sidebar
            try {
                const data = await ClientDataService.getListProperties(listId);
                // Keep it in some state Map if needed, but easier: simply group selectedListProperties if selected
            } catch (err) { }
        }
    };

    const loadListProperties = async (listId: number) => {
        try {
            setPropsLoading(true);
            const data = await ClientDataService.getListProperties(listId);
            setSelectedListProperties(data);
        } catch (err) {
            console.error('Error loading properties:', err);
        } finally {
            setPropsLoading(false);
        }
    };

    const loadStateProperties = async (stateName: string) => {
        try {
            setPropsLoading(true);
            const stateList = lists.find(l => l.tags === 'STANDARD' && l.name === stateName);
            if (!stateList) {
                setSelectedListProperties([]);
                return;
            }
            const data = await ClientDataService.getListProperties(stateList.id);
            setSelectedListProperties(data);

            // Geocode properties missing coordinates without blocking the UI
            const missingCoords = data.filter((p: any) => (!p.latitude || !p.longitude) && p.address);
            if (missingCoords.length > 0) {
                (async () => {
                    for (const prop of missingCoords) {
                        try {
                            if (geocodedProperties[prop.id]) continue;

                            let coords = await geocodeAddress(prop.address);
                            if (!coords && (prop.county || prop.state)) {
                                const fallback = `${prop.county || ''} County, ${prop.state || ''}`;
                                console.log(`Fallback geocoding for property ${prop.id}: ${fallback}`);
                                coords = await geocodeAddress(fallback);
                            }
                            if (!coords && prop.state) {
                                coords = await geocodeAddress(prop.state);
                            }

                            if (coords) {
                                console.log(`Map debug: Setting geocoded coords for property ${prop.id}`, coords);
                                setGeocodedProperties(prev => ({ ...prev, [prop.id]: coords }));
                            }
                        } catch (e) {
                            console.error('Geocoding error for', prop.id, e);
                        }
                        // Small delay to prevent API rate limiting
                        await new Promise(r => setTimeout(r, 1000));
                    }
                })();
            }
        } catch (err) {
            console.error('Error loading state properties:', err);
        } finally {
            setPropsLoading(false);
        }
    };

    const handleRemoveProperty = async (propertyId: number) => {
        try {
            if (selectedListId) {
                await ClientDataService.removePropertyFromList(selectedListId, propertyId);
                loadListProperties(selectedListId);
            } else if (selectedStateName) {
                const stateList = lists.find(l => l.tags === 'STANDARD' && l.name === selectedStateName);
                if (stateList) {
                    await ClientDataService.removePropertyFromList(stateList.id, propertyId);
                    loadStateProperties(selectedStateName);
                }
            }
            loadLists();
        } catch (err: any) {
            alert(err.message || 'Failed to remove property');
        }
    };

    const handleCreateList = async () => {
        try {
            if (creationMode === 'custom') {
                if (!newListName) return;
                await ClientDataService.createList(newListName, undefined, activeCompany?.id);
            } else {
                if (!selectedState) return;
                await ClientDataService.createList(selectedState.state, 'STANDARD', activeCompany?.id);
            }
            setNewListName('');
            setNewCountyName('');
            setSelectedState(null);
            setOpenModal(false);
            loadLists();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteList = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this folder?")) return;
        try {
            await ClientDataService.deleteList(id);
            loadLists();
            if (selectedListId === id) setSelectedListId(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleStartRename = (list: CustomList) => {
        setEditingListId(list.id);
        setEditName(list.name);
    };

    const handleRename = async () => {
        if (!editingListId || !editName) return;
        try {
            await ClientDataService.updateList(editingListId, { name: editName });
            setEditingListId(null);
            loadLists();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDragStart = (e: React.DragEvent, propertyId: number) => {
        e.dataTransfer.setData("propertyId", propertyId.toString());
        e.dataTransfer.setData("sourceListId", selectedListId?.toString() || "");
    };

    const handleDrop = async (e: React.DragEvent, targetListId: number) => {
        e.preventDefault();
        setDragOverListId(null);
        const propertyId = parseInt(e.dataTransfer.getData("propertyId"));
        const sourceListId = parseInt(e.dataTransfer.getData("sourceListId"));

        if (sourceListId === targetListId) return;

        try {
            await ClientDataService.moveProperty(sourceListId, propertyId, targetListId);
            loadLists();
            if (selectedListId === sourceListId) {
                loadListProperties(sourceListId);
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleImportBroadcasted = async (listId: number) => {
        setImporting(listId);
        try {
            const newList = await ClientDataService.importBroadcastedList(listId);
            await loadLists();
            setSelectedListId(newList.id);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setImporting(null);
        }
    };

    const selectedList = lists.find(l => l.id === selectedListId) || broadcastedLists.find(l => l.id === selectedListId);

    if (loading && !lists.length && !broadcastedLists.length) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <CircularProgress size={24} />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 border-x border-slate-200 dark:border-slate-800">
            {/* Left Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl overflow-hidden shrink-0`}>
                <div className="p-4 flex justify-between items-center w-64">
                    <Typography variant="h6" className="font-bold text-slate-800 dark:text-white tracking-tight">Folders</Typography>
                    <IconButton size="small" onClick={() => setOpenModal(true)} className="hover:bg-slate-200 dark:hover:bg-slate-800">
                        <FolderPlusIcon size={18} className="text-blue-600" />
                    </IconButton>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    <div className="space-y-6">
                        {/* smart lists / favorites */}
                        {lists.some(l => l.is_favorite_list) && (
                            <div>
                                <div
                                    className="flex items-center justify-between px-3 cursor-pointer group"
                                    onClick={() => setCollapsedSections(prev => ({ ...prev, smart: !prev.smart }))}
                                >
                                    <Typography variant="overline" className="text-slate-400 font-bold text-[10px]">Smart Lists</Typography>
                                    <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform ${collapsedSections.smart ? '-rotate-90' : ''}`}>expand_more</span>
                                </div>
                                {!collapsedSections.smart && (
                                    <div className="mt-1 space-y-0.5">
                                        {lists.filter(l => l.is_favorite_list).map(list => (
                                            <div
                                                key={list.id}
                                                onClick={() => { setSelectedListId(list.id); setSelectedStateName(null); setSelectedCountyName(null); }}
                                                onDragOver={(e) => { e.preventDefault(); setDragOverListId(list.id); }}
                                                onDragLeave={() => setDragOverListId(null)}
                                                onDrop={(e) => handleDrop(e, list.id)}
                                                className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 
                                                    ${selectedListId === list.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}
                                                    ${dragOverListId === list.id ? 'ring-2 ring-blue-400 ring-inset scale-[1.02]' : ''}`}
                                            >
                                                <span className={`material-symbols-outlined text-[18px] ${selectedListId === list.id ? 'text-white' : 'text-red-500'}`}>favorite</span>
                                                <span className="flex-1 text-sm font-medium truncate">{list.name}</span>
                                                {list.has_upcoming_auction && (
                                                    <div className="flex items-center gap-0.5 bg-orange-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                                                        <span className="material-symbols-outlined text-[10px]">gavel</span>
                                                        <span className="text-[9px] font-black">{list.upcoming_auctions_count}</span>
                                                    </div>
                                                )}
                                                <span className={`text-xs ${selectedListId === list.id ? 'text-blue-100' : 'text-slate-400'}`}>{list.property_count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {lists.some(l => l.tags === 'STANDARD') && (
                            <div>
                                <div
                                    className="flex items-center justify-between px-3 cursor-pointer group"
                                    onClick={() => setCollapsedSections(prev => ({ ...prev, standard: !prev.standard }))}
                                >
                                    <Typography variant="overline" className="text-slate-400 font-bold text-[10px]">Standard Folders</Typography>
                                    <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform ${collapsedSections.standard ? '-rotate-90' : ''}`}>expand_more</span>
                                </div>
                                {!collapsedSections.standard && (
                                    <div className="mt-1 space-y-1">
                                        {lists.filter(l => l.tags === 'STANDARD').sort((a, b) => a.name.localeCompare(b.name)).map(list => {
                                            // Compute dynamic county groupings if this state is selected
                                            const isSelectedState = selectedStateName === list.name;
                                            const stateProperties = isSelectedState ? selectedListProperties : [];
                                            const countyMap = new Map<string, number>();
                                            stateProperties.forEach(p => {
                                                const c = p.county || 'Unknown County';
                                                countyMap.set(c, (countyMap.get(c) || 0) + 1);
                                            });
                                            const sortedCounties = Array.from(countyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

                                            return (
                                                <div key={list.id} className="flex flex-col">
                                                    {/* State Header (Click to select) */}
                                                    <div
                                                        onClick={() => {
                                                            setSelectedListId(list.id);
                                                            setSelectedStateName(list.name);
                                                            setSelectedCountyName(null);
                                                            setCountyContacts([]);
                                                            handleExpandStateList(list.id, list.name);
                                                        }}
                                                        onDragOver={(e) => { e.preventDefault(); setDragOverListId(list.id); }}
                                                        onDragLeave={() => setDragOverListId(null)}
                                                        onDrop={(e) => handleDrop(e, list.id)}
                                                        className={`group flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer text-slate-700 dark:text-slate-300 transition-colors 
                                                            ${selectedStateName === list.name && !selectedCountyName ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}
                                                            ${dragOverListId === list.id ? 'ring-2 ring-blue-400 ring-inset scale-[1.02]' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${expandedStates[list.name] ? 'rotate-90 text-blue-500' : 'text-slate-400'}`}>
                                                                chevron_right
                                                            </span>
                                                            <span className="text-sm font-bold truncate tracking-tight">{list.name}</span>
                                                            {list.has_upcoming_auction && (
                                                                <div className="flex items-center gap-0.5 bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                                                                    <span className="material-symbols-outlined text-[10px]">gavel</span>
                                                                    <span className="text-[9px] font-black">{list.upcoming_auctions_count}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <IconButton
                                                                    size="small"
                                                                    className="p-0.5"
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                                                                >
                                                                    <Trash2Icon size={12} className={selectedStateName === list.name && !selectedCountyName ? 'text-blue-600' : 'text-slate-400'} />
                                                                </IconButton>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${selectedStateName === list.name && !selectedCountyName ? 'text-blue-600 bg-blue-200/50 dark:bg-blue-800/50 dark:text-blue-300' : 'text-slate-400 bg-slate-200 dark:bg-slate-800'}`}>
                                                                {list.property_count} Props
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Dynamic County Lists */}
                                                    {expandedStates[list.name] && isSelectedState && sortedCounties.length > 0 && (
                                                        <div className="mt-1 ml-4 border-l-2 border-slate-200 dark:border-slate-800 pl-2 space-y-0.5">
                                                            {sortedCounties.map(([county, count]) => {
                                                                // Check if any property in this county has an upcoming auction
                                                                const hasAuction = stateProperties.some(p =>
                                                                    p.county === county &&
                                                                    (p.auction_status === "started" || (p.auction_date && new Date(p.auction_date).getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000))
                                                                );

                                                                return (
                                                                    <div
                                                                        key={`${list.id}-${county}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedListId(list.id);
                                                                            setSelectedStateName(list.name);
                                                                            setSelectedCountyName(county);
                                                                            // Fetch county contacts using the existing service logic
                                                                            countyService.getContacts(list.name, county)
                                                                                .then(setCountyContacts)
                                                                                .catch(() => setCountyContacts([]));
                                                                        }}
                                                                        className={`group flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 
                                                                        ${selectedCountyName === county ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
                                                                    >
                                                                        <span className={`material-symbols-outlined text-[16px] ${selectedCountyName === county ? 'text-white' : 'text-emerald-500'}`}>map</span>
                                                                        <span className="flex-1 text-sm font-medium truncate">{county}</span>
                                                                        {hasAuction && (
                                                                            <div className="flex items-center gap-0.5 bg-orange-500 text-white px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                                                                                <span className="material-symbols-outlined text-[10px]">gavel</span>
                                                                            </div>
                                                                        )}
                                                                        <span className={`text-xs ${selectedCountyName === county ? 'text-emerald-100' : 'text-slate-400'}`}>{count}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <div
                                className="flex items-center justify-between px-3 cursor-pointer group"
                                onClick={() => setCollapsedSections(prev => ({ ...prev, custom: !prev.custom }))}
                            >
                                <Typography variant="overline" className="text-slate-400 font-bold text-[10px]">Custom Folders</Typography>
                                <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform ${collapsedSections.custom ? '-rotate-90' : ''}`}>expand_more</span>
                            </div>
                            {!collapsedSections.custom && (
                                <div className="mt-1 space-y-0.5">
                                    {lists.filter(l => !l.is_favorite_list && l.tags !== 'STANDARD').sort((a, b) => a.name.localeCompare(b.name)).map(list => (
                                        <div
                                            key={list.id}
                                            onClick={() => { setSelectedListId(list.id); setSelectedStateName(null); setSelectedCountyName(null); }}
                                            onDragOver={(e) => { e.preventDefault(); setDragOverListId(list.id); }}
                                            onDragLeave={() => setDragOverListId(null)}
                                            onDrop={(e) => handleDrop(e, list.id)}
                                            className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 
                                                ${selectedListId === list.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}
                                                ${dragOverListId === list.id ? 'ring-2 ring-blue-400 ring-inset scale-[1.02]' : ''}`}
                                        >
                                            <span className={`material-symbols-outlined text-[18px] ${selectedListId === list.id ? 'text-white' : 'text-blue-500'}`}>folder</span>
                                            {list.has_upcoming_auction && !editingListId && (
                                                <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full p-0.5 shadow-sm z-10">
                                                    <span className="material-symbols-outlined text-[12px]">gavel</span>
                                                </div>
                                            )}
                                            {editingListId === list.id ? (
                                                <input
                                                    autoFocus
                                                    className="flex-1 bg-transparent border-none outline-none text-sm text-inherit p-0"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onBlur={handleRename}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <>
                                                    <span className="flex-1 text-sm font-medium truncate">{list.name}</span>
                                                    {list.has_upcoming_auction && (
                                                        <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-md font-black">
                                                            AUCTION
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <IconButton
                                                            size="small"
                                                            className="p-0.5"
                                                            onClick={(e) => { e.stopPropagation(); handleStartRename(list); }}
                                                        >
                                                            <Edit2Icon size={12} className={selectedListId === list.id ? 'text-white' : 'text-slate-400'} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            className="p-0.5"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                                                        >
                                                            <Trash2Icon size={12} className={selectedListId === list.id ? 'text-white' : 'text-slate-400'} />
                                                        </IconButton>
                                                    </div>
                                                    <span className={`text-xs ${selectedListId === list.id ? 'text-blue-100' : 'text-slate-400'}`}>{list.property_count}</span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* broadcasted folders */}
                        {broadcastedLists.length > 0 && (
                            <div>
                                <div
                                    className="flex items-center justify-between px-3 cursor-pointer group"
                                    onClick={() => setCollapsedSections(prev => ({ ...prev, broadcasted: !prev.broadcasted }))}
                                >
                                    <Typography variant="overline" className="text-slate-400 font-bold text-[10px]">From Admin</Typography>
                                    <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform ${collapsedSections.broadcasted ? '-rotate-90' : ''}`}>expand_more</span>
                                </div>
                                {!collapsedSections.broadcasted && (
                                    <div className="mt-1 space-y-0.5">
                                        {[...broadcastedLists].sort((a, b) => a.name.localeCompare(b.name)).map(list => (
                                            <div
                                                key={list.id}
                                                onClick={() => { setSelectedListId(list.id); setSelectedStateName(null); setSelectedCountyName(null); }}
                                                className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 
                                                    ${selectedListId === list.id ? 'bg-green-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
                                            >
                                                <span className={`material-symbols-outlined text-[18px] ${selectedListId === list.id ? 'text-white' : 'text-green-500'}`}>campaign</span>
                                                <span className="flex-1 text-sm font-medium truncate">{list.name}</span>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="small" variant="contained" color="success" className="text-[10px] py-0 min-w-0 px-2" onClick={(e) => { e.stopPropagation(); handleImportBroadcasted(list.id); }} disabled={importing === list.id}>
                                                        {importing === list.id ? '...' : 'Save'}
                                                    </Button>
                                                </div>
                                                {importing !== list.id && (
                                                    <span className={`text-xs ${selectedListId === list.id ? 'text-green-100' : 'text-slate-400'}`}>{list.property_count}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Content / Custom Properties */}
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <Typography variant="overline" className="px-3 text-slate-400 font-bold text-[10px] tracking-widest uppercase">User Content</Typography>
                            <div className="mt-2 space-y-0.5">
                                <div
                                    onClick={() => { setViewMode('custom_properties'); setSelectedListId(null); setSelectedStateName(null); setSelectedCountyName(null); }}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 
                                        ${viewMode === 'custom_properties' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${viewMode === 'custom_properties' ? 'text-white' : 'text-blue-500'}`}>real_estate_agent</span>
                                    <span className="flex-1 text-sm font-medium truncate">Custom Properties</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <IconButton size="small" onClick={() => setOpenModal(true)} className="text-blue-600">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    </IconButton>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">New Folder</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
                {viewMode === 'custom_properties' ? (
                    <ClientUserProperties onBack={() => setViewMode('folders')} />
                ) : (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} size="small" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-[20px]">{sidebarOpen ? 'left_panel_close' : 'left_panel_open'}</span>
                            </IconButton>
                            <div>
                                <Typography variant="h5" className="font-bold text-slate-900 dark:text-white capitalize leading-tight">
                                {selectedStateName
                                    ? (selectedCountyName ? `${selectedStateName} - ${selectedCountyName}` : selectedStateName)
                                    : (selectedList?.name || 'Select a Folder')}
                            </Typography>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {selectedStateName && selectedCountyName
                                        ? selectedListProperties.filter(p => p.county === selectedCountyName).length
                                        : selectedListProperties.length} Properties
                                </span>

                            </div>
                        </div>
                    </div>
                    </div>

                    {/* Upcoming Auction Alert Banner */}
                    {(selectedList?.has_upcoming_auction || selectedListProperties.some(p => p.auction_status === "started" || (p.auction_date && new Date(p.auction_date).getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000))) && (
                        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 flex gap-4 items-start">
                            <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl">warning</span>
                            </div>
                            <div>
                                <h4 className="text-orange-800 dark:text-orange-400 font-bold text-sm">Action Required: Approaching Auctions</h4>
                                <p className="text-orange-700 dark:text-orange-500 text-xs mt-1">
                                    One or more properties in this watchlist have an upcoming auction date within the next 7 days or have already started. Please verify funds and register to bid on the respective county portal.
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedStateName && (() => {
                        const contactInfo = stateContacts.find(c => c.state === selectedStateName);
                        const stateCode = STATE_CODE_MAP[selectedStateName] || 'FL'; // Default to FL fallback if missing
                        const silhouetteUrl = `https://static.simplemaps.com/resources/svg-library/us/${stateCode.toLowerCase()}.svg`;

                        // Aggregate auction links from all properties in the selected folder
                        const auctionLinks = selectedListProperties.reduce((acc: any[], p: any) => {
                            if (p.auction_info_link || p.auction_list_link) {
                                // Unique key by links
                                const key = `${p.auction_info_link}-${p.auction_list_link}`;
                                if (!acc.find(item => item.key === key)) {
                                    acc.push({
                                        key,
                                        name: p.auction_name || 'Auction Portal',
                                        register: p.auction_info_link,
                                        list: p.auction_list_link
                                    });
                                }
                            }
                            return acc;
                        }, []);

                        return (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-2">
                                {/* Header and Silhouette Wrapper */}
                                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-slate-200 dark:border-slate-800">
                                    {/* Left Side: Contact and Links */}
                                    <div className="flex-1 p-4 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">public</span>
                                                <Typography className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                    {selectedStateName} Official Info
                                                </Typography>
                                            </div>
                                            {contactInfo?.url && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    href={contactInfo.url}
                                                    target="_blank"
                                                    className="text-[10px] h-6 px-2 rounded-sm border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 normal-case"
                                                    startIcon={<ExternalLinkIcon size={10} />}
                                                >
                                                    State Portal
                                                </Button>
                                            )}
                                        </div>

                                        {/* Dynamic Auction Links Section */}
                                        <div className="space-y-2">
                                            <Typography variant="overline" className="text-[10px] font-bold text-slate-400">Active Auction Portals</Typography>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {auctionLinks.length > 0 ? (
                                                    auctionLinks.map((link, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col gap-1 shadow-xs">
                                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate">{link.name}</span>
                                                            <div className="flex gap-2">
                                                                {link.register && (
                                                                    <a href={link.register} target="_blank" rel="noreferrer" className="text-[9px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold">
                                                                        <span className="material-symbols-outlined text-[10px]">app_registration</span> Registration / Instructions
                                                                    </a>
                                                                )}
                                                                {link.list && (
                                                                    <a href={link.list} target="_blank" rel="noreferrer" className="text-[9px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-bold">
                                                                        <span className="material-symbols-outlined text-[10px]">list_alt</span> Auction List
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full py-3 bg-slate-100/50 dark:bg-slate-800/40 rounded-lg text-center">
                                                        <span className="text-[10px] text-slate-400 italic">No auction links found for properties in this list.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Folder Notes Section */}
                                        <div className="mt-2 text-left">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Typography variant="overline" className="text-[10px] font-bold text-slate-400">
                                                    {selectedCountyName ? `${selectedCountyName} Specific Notes` : 'General Folder Notes'}
                                                </Typography>
                                                {selectedCountyName && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-1.5 py-0.5 rounded uppercase font-bold">Subfolder</span>}
                                            </div>
                                            <TextField
                                                multiline
                                                fullWidth
                                                rows={3}
                                                placeholder={selectedCountyName ? `Specific annotations for properties in ${selectedCountyName}...` : "Add private notes about this state search, strategy or contacts..."}
                                                variant="outlined"
                                                value={folderNotes}
                                                onChange={(e) => setFolderNotes(e.target.value)}
                                                onBlur={(e) => handleSaveNotes(e.target.value)}
                                                className="bg-white dark:bg-slate-900/80 rounded-xl"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        fontSize: '13px',
                                                        borderRadius: '12px',
                                                        '& fieldset': { borderColor: 'rgba(226, 232, 240, 0.5)' },
                                                        '&:hover fieldset': { borderColor: '#3b82f6' },
                                                        className: 'dark:border-slate-700'
                                                    }
                                                }}
                                            />
                                            {savingNotes && <span className="text-[9px] text-blue-500 animate-pulse ml-1">Saving changes...</span>}
                                        </div>
                                    </div>

                                    {/* Right Side: State Silhouette */}
                                    {!selectedCountyName && (
                                        <div className="w-full md:w-48 h-full bg-white dark:bg-slate-900 flex items-center justify-center p-6 shrink-0 group/silhouette overflow-hidden relative">
                                            <img
                                                src={silhouetteUrl}
                                                alt={`${selectedStateName} silhouette`}
                                                className="w-full h-full object-contain opacity-50 dark:opacity-60 group-hover/silhouette:opacity-80 dark:group-hover/silhouette:opacity-90 transition-all duration-700 pointer-events-none drop-shadow-sm"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="text-4xl font-black text-slate-200 dark:text-slate-800 tracking-tighter opacity-50">{stateCode}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* County Contacts (Overlay/Replacement) */}
                                    {selectedCountyName && (
                                        <div className="w-full md:w-64 p-4 bg-white dark:bg-slate-800 overflow-y-auto max-h-[300px]">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{selectedCountyName} Sub-Links</h3>
                                            <div className="space-y-2">
                                                {countyContacts.length > 0 ? (
                                                    countyContacts.map((contact, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={contact.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                                                        >
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="font-bold text-[10px] truncate">{contact.name}</span>
                                                                {contact.phone && <span className="text-[9px] text-slate-500 opacity-70 italic">{contact.phone}</span>}
                                                            </div>
                                                            <span className="material-symbols-outlined text-[14px] text-blue-500">open_in_new</span>
                                                        </a>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">No specific county links.</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {propsLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <CircularProgress size={24} />
                        </div>
                    ) : selectedListProperties.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">folder_open</span>
                            <Typography className="text-slate-500 text-sm font-medium">No Properties in this folder</Typography>
                            <Typography className="text-slate-400 text-xs mt-1">Drag and drop properties here from search or other lists.</Typography>
                        </div>
                    ) : (() => {
                        // Filter by county if a subfolder is selected
                        const displayProperties = selectedStateName && selectedCountyName
                            ? selectedListProperties.filter(p => p.county === selectedCountyName)
                            : selectedListProperties;

                        if (displayProperties.length === 0) {
                            return (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">folder_open</span>
                                    <Typography className="text-slate-500 text-sm font-medium">No properties found in this specific county.</Typography>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-3">
                                {selectedList?.has_upcoming_auction && (
                                    <div className="mb-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-orange-100 dark:bg-orange-800/40 rounded-lg text-orange-600 dark:text-orange-400 shadow-inner">
                                                <span className="material-symbols-outlined pt-0.5">notification_important</span>
                                            </div>
                                            <div>
                                                <h5 className="font-extrabold text-orange-800 dark:text-orange-300 text-sm tracking-tight">Upcoming Auctions Detected!</h5>
                                                <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5 font-medium">There are {selectedList.upcoming_auctions_count} properties in this folder scheduled for auction soon. Review them immediately.</p>
                                            </div>
                                        </div>
                                        <Button variant="contained" color="warning" size="small" className="whitespace-nowrap shadow-none font-bold text-xs" onClick={() => { }}>
                                            Review Agenda
                                        </Button>
                                    </div>
                                )}
                                {displayProperties.map((prop: any) => (
                                    <SwipeToDeleteItem key={prop.id} onDelete={() => handleRemoveProperty(prop.id)}>
                                        <div
                                            onClick={() => setPreviewPropertyId(prop.parcel_id || prop.id)}
                                            className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200 cursor-pointer flex items-center gap-4"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">
                                                        {prop.owner_address ? prop.owner_address.split('\n')[0] : (prop.title || 'Untitled Property')}
                                                    </h4>
                                                    <Chip
                                                        label={prop.availability_status || 'Unknown'}
                                                        size="small"
                                                        className={`h-4 text-[8px] font-bold uppercase transition-colors px-0
                                                        ${prop.availability_status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{prop.parcel_id}</span>
                                                    <span className="opacity-30">|</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px] text-red-500">location_on</span>
                                                        <span className="truncate">{prop.address || 'No Address Listed'}</span>
                                                    </div>
                                                </div>

                                                {/* Description Field Requested by User */}
                                                {prop.description && (
                                                    <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic leading-relaxed">
                                                        {prop.description}
                                                    </p>
                                                )}

                                                <div className="mt-3 flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Amount Due</span>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-white">${prop.amount_due?.toLocaleString() || '0'}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Acres</span>
                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{prop.lot_acres || 'N/A'}</span>
                                                    </div>
                                                    {prop.is_auction_upcoming && (
                                                        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 px-2 py-1 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                                            <span className="material-symbols-outlined text-[16px] text-orange-600 animate-bounce">gavel</span>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-orange-600 font-black uppercase tracking-tighter">Auction Soon</span>
                                                                <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                                                                    {prop.days_until_auction === 0 ? 'TODAY' : `${prop.days_until_auction} days left`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(prop.auction_info_link || prop.auction_list_link) && (
                                                        <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                                                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Portals:</span>
                                                            <div className="flex gap-2">
                                                                {prop.auction_info_link && (
                                                                    <a href={prop.auction_info_link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold">
                                                                        Registration / Instructions
                                                                    </a>
                                                                )}
                                                                {prop.auction_list_link && (
                                                                    <a href={prop.auction_list_link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-bold">
                                                                        Auction List
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/client/properties/${prop.parcel_id || prop.id}`); }}
                                                >
                                                    <ExternalLinkIcon size={16} />
                                                </div>
                                                <div className="opacity-40 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, prop.id)}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwipeToDeleteItem>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>
            )}
            </div>

            {/* Create Folder Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} PaperProps={{ className: "rounded-2xl dark:bg-slate-900", sx: { overflow: 'visible' } }}>
                <div className="p-6 min-w-[320px] max-w-[400px]">
                    <Typography variant="h6" className="font-bold mb-4 dark:text-white">New Folder</Typography>

                    <Tabs
                        value={creationMode}
                        onChange={(_, val) => setCreationMode(val)}
                        textColor="primary"
                        indicatorColor="primary"
                        className="mb-6 flex space-x-2"
                        variant="fullWidth"
                    >
                        <Tab value="custom" label="Custom" className="font-bold capitalize rounded-t-lg" />
                        <Tab value="standard" label="Standard (State)" className="font-bold capitalize rounded-t-lg" />
                    </Tabs>

                    {creationMode === 'custom' ? (
                        <TextField
                            autoFocus
                            fullWidth
                            placeholder="Name of your new folder..."
                            variant="outlined"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            className="mb-4"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                        />
                    ) : (
                        <div className="flex flex-col gap-3 mb-4">
                            <Autocomplete
                                options={stateContacts}
                                getOptionLabel={(option) => option.state}
                                value={selectedState}
                                onChange={(_, newValue) => setSelectedState(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" placeholder="Select a US State..." autoFocus className="bg-white dark:bg-slate-800 rounded-lg" />
                                )}
                                fullWidth
                                disablePortal
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button color="inherit" onClick={() => setOpenModal(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateList}
                            disabled={creationMode === 'custom' ? !newListName : !selectedState}
                            className="bg-blue-600 rounded-lg shadow-none"
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </Dialog>

            <PropertyPreviewDrawer
                open={!!previewPropertyId}
                propertyId={previewPropertyId}
                onClose={() => setPreviewPropertyId(null)}
            />
        </div>
    );
};

export default ClientLists;
