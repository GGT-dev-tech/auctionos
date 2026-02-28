import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FolderPlusIcon, SearchIcon, ShareIcon, CopyIcon, Trash2Icon, Edit2Icon, TagIcon } from 'lucide-react';
import { ClientDataService } from '../../services/property.service';

interface CustomList {
    id: number;
    name: string;
    property_count: number;
    is_broadcasted: boolean;
    is_favorite_list: boolean;
    tags?: string | null;
}

const AdminLists: React.FC = () => {
    const [lists, setLists] = useState<CustomList[]>([]);
    const [selectedListId, setSelectedListId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        loadLists();
    }, []);

    const loadLists = async () => {
        try {
            setLoading(true);
            const data = await ClientDataService.getLists();
            setLists(data);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
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
        if (!window.confirm("Are you sure you want to delete this list?")) return;
        try {
            await ClientDataService.deleteList(id);
            loadLists();
            if (selectedListId === id) setSelectedListId(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleBroadcastToggle = async (listId: number) => {
        const list = lists.find(l => l.id === listId);
        if (!list) return;
        try {
            await ClientDataService.updateList(listId, { is_broadcasted: !list.is_broadcasted } as any);
            loadLists();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleRenameList = async (id: number) => {
        const list = lists.find(l => l.id === id);
        if (!list) return;
        const newName = window.prompt("Enter new name:", list.name);
        if (newName && newName !== list.name) {
            try {
                await ClientDataService.updateList(id, { name: newName });
                loadLists();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const selectedList = lists.find(l => l.id === selectedListId);

    return (
        <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
            {/* Left Pane: Folders/Lists */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-800/50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <Typography variant="h6" className="font-bold text-slate-800 dark:text-white">Admin Lists</Typography>
                    <Button size="small" startIcon={<FolderPlusIcon size={16} />} onClick={() => setOpenModal(true)}>New List</Button>
                </div>
                <div className="p-0 flex-1 overflow-y-auto">
                    {lists.length === 0 ? (
                        <Typography variant="body2" className="text-slate-500 italic text-center mt-10">
                            No lists created yet. Click 'New List' to start organizing properties.
                        </Typography>
                    ) : (
                        <List component="nav" className="p-0">
                            {lists.map(list => (
                                <ListItem
                                    button
                                    key={list.id}
                                    selected={selectedListId === list.id}
                                    onClick={() => setSelectedListId(list.id)}
                                    className={`border-b border-slate-100 dark:border-slate-800 ${selectedListId === list.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <ListItemText
                                        primary={
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{list.name}</span>
                                                {list.is_broadcasted && <Chip label="Broadcasted" size="small" color="primary" className="h-5 text-[10px]" />}
                                                {list.is_favorite_list && <Chip label="Auto-Favorites" size="small" color="error" variant="outlined" className="h-5 text-[10px]" />}
                                            </div>
                                        }
                                        secondary={
                                            <div className="flex items-center gap-4 mt-1">
                                                <span>{list.property_count} properties</span>
                                                {list.tags && <span className="text-xs text-slate-400 flex items-center gap-1"><TagIcon size={10} /> {list.tags}</span>}
                                            </div>
                                        }
                                    />
                                    <ListItemSecondaryAction className="flex gap-1">
                                        {!list.is_favorite_list && (
                                            <>
                                                <IconButton size="small" onClick={() => handleRenameList(list.id)} title="Rename">
                                                    <Edit2Icon size={14} />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteList(list.id)} title="Delete">
                                                    <Trash2Icon size={14} />
                                                </IconButton>
                                            </>
                                        )}
                                        <IconButton size="small" onClick={() => handleBroadcastToggle(list.id)} title={list.is_broadcasted ? "Revoke Broadcast" : "Broadcast to Clients"}>
                                            <ShareIcon size={16} className={list.is_broadcasted ? "text-primary-600" : "text-slate-400"} />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </div>
            </div>

            {/* Right Pane: Property Contents */}
            <div className="w-2/3 flex flex-col bg-white dark:bg-slate-900">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
                    <Typography variant="h6" className="font-bold text-slate-800 dark:text-white">
                        {selectedList ? selectedList.name : 'List Contents'}
                    </Typography>
                    <div className="flex gap-2">
                        {selectedList && (
                            <Button
                                variant={selectedList.isBroadcasted ? "contained" : "outlined"}
                                size="small"
                                startIcon={<ShareIcon size={16} />}
                                onClick={() => handleBroadcastToggle(selectedList.id)}
                            >
                                {selectedList.isBroadcasted ? 'Revoke Broadcast' : 'Broadcast to Clients'}
                            </Button>
                        )}
                        <Button disabled={!selectedList} startIcon={<SearchIcon size={16} />}>Search in List</Button>
                    </div>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/10">
                    {!selectedList ? (
                        <Box className="text-center text-slate-400">
                            <FolderPlusIcon size={48} className="mx-auto mb-4 opacity-50 text-slate-300" />
                            <Typography variant="h6" className="font-semibold text-slate-500">Select an Admin List</Typography>
                            <Typography variant="body2" className="mt-2 text-slate-400 max-w-sm">Choose a list from the sidebar to view saved properties or broadcast the collection to all client dashboards.</Typography>
                        </Box>
                    ) : (
                        <div className="w-full h-full flex flex-col">
                            {/* Render property list table/cards here in the future */}
                            <div className="mb-4 flex gap-4">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex-1">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider mb-1">List Size</h3>
                                    <p className="text-2xl text-slate-900 dark:text-white font-light">{selectedList.property_count} Properties</p>
                                </div>
                                <div className={`p-4 rounded-lg shadow-sm border flex-1 ${selectedList.is_broadcasted ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Broadcast Status</h3>
                                    <p className="text-2xl font-light">{selectedList.is_broadcasted ? 'Active on Client Dashboards' : 'Private to Admins'}</p>
                                </div>
                            </div>
                            {selectedList.tags && (
                                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Tags:</span>
                                    <div className="mt-1 flex gap-2">
                                        {selectedList.tags.split(',').map(tag => (
                                            <Chip key={tag} label={tag.trim()} size="small" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center border-dashed">
                                <p className="text-slate-400 italic">Property datagrid rendering engine (Mock)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLists;
