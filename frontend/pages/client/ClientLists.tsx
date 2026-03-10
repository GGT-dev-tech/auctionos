import React, { useState, useEffect } from 'react';
import { Typography, IconButton, TextField, Dialog, Button, CircularProgress, Chip, Tabs, Tab, Autocomplete } from '@mui/material';
import { FolderPlusIcon, Trash2Icon, Edit2Icon, ExternalLinkIcon } from 'lucide-react';
import { ClientDataService } from '../../services/property.service';
import { countyService, CountyContact } from '../../services/county.service';
import { StatesService, StateContact } from '../../services/states.service';
import { useNavigate } from 'react-router-dom';
import { SwipeToDeleteItem } from '../../components/SwipeToDeleteItem';
import { PropertyPreviewDrawer } from '../../components/PropertyPreviewDrawer';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CustomList {
    id: number;
    name: string;
    property_count: number;
    is_favorite_list: boolean;
    is_broadcasted: boolean;
    tags?: string;
}

const ClientLists: React.FC = () => {
    const navigate = useNavigate();
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

    const [creationMode, setCreationMode] = useState<'custom' | 'standard'>('custom');
    const [stateContacts, setStateContacts] = useState<StateContact[]>([]);
    const [selectedState, setSelectedState] = useState<StateContact | null>(null);
    const [selectedStateName, setSelectedStateName] = useState<string | null>(null);
    const [previewPropertyId, setPreviewPropertyId] = useState<number | string | null>(null);

    const toggleState = (stateName: string) => {
        setExpandedStates(prev => ({ ...prev, [stateName]: !prev[stateName] }));
    };

    useEffect(() => {
        loadLists();
        StatesService.getContacts().then(setStateContacts).catch(() => { });
    }, []);

    useEffect(() => {
        if (selectedListId) {
            loadListProperties(selectedListId);
            const selList = lists.find(l => l.id === selectedListId) || broadcastedLists.find(l => l.id === selectedListId);
            if (selList?.tags === 'STANDARD') {
                const parts = selList.name.split(' - ');
                if (parts.length === 2 && parts[1] !== 'All') {
                    countyService.getContacts(parts[0], parts[1]).then(setCountyContacts).catch(() => setCountyContacts([]));
                }
            } else {
                setCountyContacts([]);
            }
        } else if (selectedStateName) {
            loadStateProperties(selectedStateName);
            setCountyContacts([]);
        } else {
            setSelectedListProperties([]);
            setCountyContacts([]);
        }
    }, [selectedListId, selectedStateName, lists, broadcastedLists]);

    const loadLists = async () => {
        try {
            setLoading(true);
            const data = await ClientDataService.getLists();
            setLists(data);
            if (data.length > 0 && !selectedListId) {
                // Select favorites by default if available
                const fav = data.find(l => l.is_favorite_list);
                setSelectedListId(fav ? fav.id : data[0].id);
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
            const stateLists = lists.filter(l => l.tags === 'STANDARD' && (l.name.split(' - ')[0] === stateName));
            if (stateLists.length === 0) {
                setSelectedListProperties([]);
                return;
            }
            const allPropsPromises = stateLists.map(l => ClientDataService.getListProperties(l.id));
            const results = await Promise.all(allPropsPromises);

            const uniquePropsMap = new Map();
            results.flat().forEach(p => uniquePropsMap.set(p.id, p));
            setSelectedListProperties(Array.from(uniquePropsMap.values()));
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
                const stateLists = lists.filter(l => l.tags === 'STANDARD' && (l.name.split(' - ')[0] === selectedStateName));
                for (const sl of stateLists) {
                    try { await ClientDataService.removePropertyFromList(sl.id, propertyId); } catch (e) { }
                }
                loadStateProperties(selectedStateName);
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
                await ClientDataService.createList(newListName);
            } else {
                if (!selectedState || !newCountyName) return;
                await ClientDataService.createList(`${selectedState.state} - ${newCountyName.trim()}`, 'STANDARD');
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
        <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden bg-slate-50 dark:bg-slate-950 border-x border-slate-200 dark:border-slate-800">
            {/* Left Sidebar */}
            <div className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl">
                <div className="p-4 flex justify-between items-center">
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
                                <Typography variant="overline" className="px-3 text-slate-400 font-bold text-[10px]">Smart Lists</Typography>
                                <div className="mt-1 space-y-0.5">
                                    {lists.filter(l => l.is_favorite_list).map(list => (
                                        <div
                                            key={list.id}
                                            onClick={() => { setSelectedListId(list.id); setSelectedStateName(null); }}
                                            onDragOver={(e) => { e.preventDefault(); setDragOverListId(list.id); }}
                                            onDragLeave={() => setDragOverListId(null)}
                                            onDrop={(e) => handleDrop(e, list.id)}
                                            className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 
                                                ${selectedListId === list.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}
                                                ${dragOverListId === list.id ? 'ring-2 ring-blue-400 ring-inset scale-[1.02]' : ''}`}
                                        >
                                            <span className={`material-symbols-outlined text-[18px] ${selectedListId === list.id ? 'text-white' : 'text-red-500'}`}>favorite</span>
                                            <span className="flex-1 text-sm font-medium truncate">{list.name}</span>
                                            <span className={`text-xs ${selectedListId === list.id ? 'text-blue-100' : 'text-slate-400'}`}>{list.property_count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* standard folders */}
                        {lists.some(l => l.tags === 'STANDARD') && (() => {
                            const standardLists = lists.filter(l => l.tags === 'STANDARD');
                            const statesMap: Record<string, typeof standardLists> = {};
                            standardLists.forEach(list => {
                                const parts = list.name.split(' - ');
                                const state = parts.length === 2 ? parts[0] : 'Other';
                                if (!statesMap[state]) statesMap[state] = [];
                                statesMap[state].push(list);
                            });

                            return (
                                <div>
                                    <Typography variant="overline" className="px-3 text-slate-400 font-bold text-[10px]">Standard Folders</Typography>
                                    <div className="mt-1 space-y-1">
                                        {Object.entries(statesMap).map(([state, stateLists]) => (
                                            <div key={state} className="flex flex-col">
                                                {/* State Header (Click to select & expand) */}
                                                <div
                                                    onClick={() => {
                                                        toggleState(state);
                                                        setSelectedListId(null);
                                                        setSelectedStateName(state);
                                                    }}
                                                    className={`group flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer text-slate-700 dark:text-slate-300 transition-colors ${selectedStateName === state && !selectedListId ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${expandedStates[state] ? 'rotate-90 text-blue-500' : 'text-slate-400'}`}>
                                                            chevron_right
                                                        </span>
                                                        <span className="text-sm font-bold truncate tracking-tight">{state}</span>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${selectedStateName === state && !selectedListId ? 'text-blue-600 bg-blue-200/50 dark:bg-blue-800/50 dark:text-blue-300' : 'text-slate-400 bg-slate-200 dark:bg-slate-800'}`}>
                                                        {stateLists.reduce((acc, curr) => acc + curr.property_count, 0)} Props
                                                    </span>
                                                </div>

                                                {/* Expanded County Lists */}
                                                {expandedStates[state] && (
                                                    <div className="mt-1 ml-4 border-l-2 border-slate-200 dark:border-slate-800 pl-2 space-y-0.5">
                                                        {stateLists.map(list => {
                                                            const countyName = list.name.split(' - ')[1] || list.name;
                                                            return (
                                                                <div
                                                                    key={list.id}
                                                                    onClick={() => { setSelectedListId(list.id); setSelectedStateName(null); }}
                                                                    onDragOver={(e) => { e.preventDefault(); setDragOverListId(list.id); }}
                                                                    onDragLeave={() => setDragOverListId(null)}
                                                                    onDrop={(e) => handleDrop(e, list.id)}
                                                                    className={`group flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 
                                                                        ${selectedListId === list.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}
                                                                        ${dragOverListId === list.id ? 'ring-2 ring-emerald-400 ring-inset scale-[1.02]' : ''}`}
                                                                >
                                                                    <span className={`material-symbols-outlined text-[16px] ${selectedListId === list.id ? 'text-white' : 'text-emerald-500'}`}>map</span>
                                                                    <span className="flex-1 text-sm font-medium truncate">{countyName}</span>
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <IconButton
                                                                            size="small"
                                                                            className="p-0.5"
                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                                                                        >
                                                                            <Trash2Icon size={12} className={selectedListId === list.id ? 'text-white' : 'text-slate-400'} />
                                                                        </IconButton>
                                                                    </div>
                                                                    <span className={`text-xs ${selectedListId === list.id ? 'text-emerald-100' : 'text-slate-400'}`}>{list.property_count}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* custom folders */}
                        <div>
                            <Typography variant="overline" className="px-3 text-slate-400 font-bold text-[10px]">Custom Folders</Typography>
                            <div className="mt-1 space-y-0.5">
                                {lists.filter(l => !l.is_favorite_list && l.tags !== 'STANDARD').map(list => (
                                    <div
                                        key={list.id}
                                        onClick={() => { setSelectedListId(list.id); setSelectedStateName(null); }}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverListId(list.id); }}
                                        onDragLeave={() => setDragOverListId(null)}
                                        onDrop={(e) => handleDrop(e, list.id)}
                                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 
                                            ${selectedListId === list.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}
                                            ${dragOverListId === list.id ? 'ring-2 ring-blue-400 ring-inset scale-[1.02]' : ''}`}
                                    >
                                        <span className={`material-symbols-outlined text-[18px] ${selectedListId === list.id ? 'text-white' : 'text-blue-500'}`}>folder</span>
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
                        </div>

                        {/* broadcasted folders */}
                        {broadcastedLists.length > 0 && (
                            <div>
                                <Typography variant="overline" className="px-3 text-slate-400 font-bold text-[10px]">From Admin</Typography>
                                <div className="mt-1 space-y-0.5">
                                    {broadcastedLists.map(list => (
                                        <div
                                            key={list.id}
                                            onClick={() => { setSelectedListId(list.id); setSelectedStateName(null); }}
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
                            </div>
                        )}
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
                <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <Typography variant="h5" className="font-bold text-slate-900 dark:text-white capitalize leading-tight">
                                {selectedStateName
                                    ? selectedStateName
                                    : (selectedList?.name || 'Select a Folder')}
                            </Typography>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedListProperties.length} Properties</span>
                                <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                                <span className="text-xs text-slate-400">Synced to iCloud</span>
                            </div>
                        </div>
                    </div>

                    {/* State Folder Header */}
                    {selectedStateName && (() => {
                        const contactInfo = stateContacts.find(c => c.state === selectedStateName);
                        // Center map logic: try to find first property with coords, or default to US center
                        const propWithCoords = selectedListProperties.find(p => p.latitude && p.longitude);
                        const center: [number, number] = propWithCoords
                            ? [parseFloat(propWithCoords.latitude), parseFloat(propWithCoords.longitude)]
                            : [39.8283, -98.5795]; // Center of US

                        return (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-2">
                                {/* State Government Link Header */}
                                <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 mt-0 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">public</span>
                                        <Typography className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {selectedStateName} State Government
                                        </Typography>
                                    </div>
                                    {contactInfo?.url && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            href={contactInfo.url}
                                            target="_blank"
                                            className="text-[11px] h-7 rounded-sm border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 normal-case"
                                            startIcon={<ExternalLinkIcon size={12} />}
                                        >
                                            Official Portal
                                        </Button>
                                    )}
                                </div>

                                {/* Leaflet Map */}
                                <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 relative z-[1]">
                                    <MapContainer center={center} zoom={propWithCoords ? 10 : 4} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {selectedListProperties.filter(p => p.latitude && p.longitude).map((prop, idx) => (
                                            <Marker key={idx} position={[parseFloat(prop.latitude), parseFloat(prop.longitude)]}>
                                                <Popup>
                                                    <div className="text-xs">
                                                        <strong className="block mb-1">{prop.parcel_id}</strong>
                                                        {prop.address || 'Address Unavailable'}<br />
                                                        <strong>Due:</strong> ${prop.amount_due?.toLocaleString()}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Contact Links rendering for STANDARD lists */}
                    {selectedList?.tags === 'STANDARD' && countyContacts.length > 0 && (
                        <div className="bg-sky-50 dark:bg-sky-900/20 p-3 rounded-lg border border-sky-100 dark:border-sky-800/50">
                            <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider block mb-2">County Contacts</span>
                            <div className="flex flex-wrap gap-2">
                                {countyContacts.map((contact, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outlined"
                                        size="small"
                                        href={contact.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[11px] rounded-full border-sky-200 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-800 normal-case"
                                    >
                                        <span className="material-symbols-outlined text-[14px] mr-1">link</span>
                                        {contact.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
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
                    ) : (
                        <div className="space-y-3">
                            {selectedListProperties.map((prop: any) => (
                                <SwipeToDeleteItem key={prop.id} onDelete={() => handleRemoveProperty(prop.id)}>
                                    <div
                                        onClick={() => setPreviewPropertyId(prop.id)}
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
                                                <span className="truncate">{prop.address || 'No Address Listed'}</span>
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
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Improvements</span>
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">${prop.improvement_value?.toLocaleString() || '0'}</span>
                                                </div>
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
                    )}
                </div>
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
                            <TextField
                                fullWidth
                                placeholder="County Name (e.g., Harris)"
                                variant="outlined"
                                value={newCountyName}
                                onChange={(e) => setNewCountyName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && selectedState && newCountyName && handleCreateList()}
                                className="bg-white dark:bg-slate-800 rounded-lg"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button color="inherit" onClick={() => setOpenModal(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateList}
                            disabled={creationMode === 'custom' ? !newListName : (!selectedState || !newCountyName.trim())}
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
