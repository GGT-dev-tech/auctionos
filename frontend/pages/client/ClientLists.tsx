import React, { useState, useEffect } from 'react';
import { Typography, IconButton, TextField, Dialog, Button, CircularProgress, Chip } from '@mui/material';
import { FolderPlusIcon, Trash2Icon, Edit2Icon, ExternalLinkIcon } from 'lucide-react';
import { ClientDataService } from '../../services/property.service';
import { countyService, CountyContact } from '../../services/county.service';
import { useNavigate } from 'react-router-dom';

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
    const [dragOverListId, setDragOverListId] = useState<number | null>(null);
    const [broadcastedLists, setBroadcastedLists] = useState<CustomList[]>([]);
    const [importing, setImporting] = useState<number | null>(null);
    const [countyContacts, setCountyContacts] = useState<CountyContact[]>([]);

    useEffect(() => {
        loadLists();
    }, []);

    useEffect(() => {
        if (selectedListId) {
            loadListProperties(selectedListId);
            const selList = lists.find(l => l.id === selectedListId) || broadcastedLists.find(l => l.id === selectedListId);
            if (selList?.tags === 'STANDARD') {
                const parts = selList.name.split(' - ');
                if (parts.length === 2) {
                    countyService.getContacts(parts[0], parts[1]).then(setCountyContacts).catch(() => setCountyContacts([]));
                }
            } else {
                setCountyContacts([]);
            }
        } else {
            setSelectedListProperties([]);
            setCountyContacts([]);
        }
    }, [selectedListId, lists, broadcastedLists]);

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

    const handleCreateList = async () => {
        if (!newListName) return;
        try {
            await ClientDataService.createList(newListName);
            setNewListName('');
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
                                            onClick={() => setSelectedListId(list.id)}
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
                        {lists.some(l => l.tags === 'STANDARD') && (
                            <div>
                                <Typography variant="overline" className="px-3 text-slate-400 font-bold text-[10px]">Standard Folders</Typography>
                                <div className="mt-1 space-y-0.5">
                                    {lists.filter(l => l.tags === 'STANDARD').map(list => (
                                        <div
                                            key={list.id}
                                            onClick={() => setSelectedListId(list.id)}
                                            onDragOver={(e) => { e.preventDefault(); setDragOverListId(list.id); }}
                                            onDragLeave={() => setDragOverListId(null)}
                                            onDrop={(e) => handleDrop(e, list.id)}
                                            className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 
                                                ${selectedListId === list.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}
                                                ${dragOverListId === list.id ? 'ring-2 ring-emerald-400 ring-inset scale-[1.02]' : ''}`}
                                        >
                                            <span className={`material-symbols-outlined text-[18px] ${selectedListId === list.id ? 'text-white' : 'text-emerald-500'}`}>auto_awesome</span>
                                            <span className="flex-1 text-sm font-medium truncate">{list.name}</span>
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
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* custom folders */}
                        <div>
                            <Typography variant="overline" className="px-3 text-slate-400 font-bold text-[10px]">Custom Folders</Typography>
                            <div className="mt-1 space-y-0.5">
                                {lists.filter(l => !l.is_favorite_list && l.tags !== 'STANDARD').map(list => (
                                    <div
                                        key={list.id}
                                        onClick={() => setSelectedListId(list.id)}
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
                                            onClick={() => setSelectedListId(list.id)}
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
                                {selectedList?.name || 'Select a Folder'}
                            </Typography>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedListProperties.length} Properties</span>
                                <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                                <span className="text-xs text-slate-400">Synced to iCloud</span>
                            </div>
                        </div>
                    </div>

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
                                <div
                                    key={prop.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, prop.id)}
                                    onClick={() => navigate(`/client/properties/${prop.parcel_id || prop.id}`)}
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
                                        <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <ExternalLinkIcon size={16} />
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-40 transition-opacity">
                                            <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Folder Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} PaperProps={{ className: "rounded-2xl dark:bg-slate-900" }}>
                <div className="p-6 min-w-[320px]">
                    <Typography variant="h6" className="font-bold mb-4 dark:text-white">New Folder</Typography>
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
                    <div className="flex justify-end gap-3 mt-4">
                        <Button color="inherit" onClick={() => setOpenModal(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleCreateList} disabled={!newListName} className="bg-blue-600 rounded-lg">Create</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ClientLists;
