import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { FolderPlusIcon, SearchIcon, DownloadCloudIcon, Trash2Icon, Edit2Icon } from 'lucide-react';
import { ClientDataService } from '../../services/property.service';

interface ClientList {
    id: number;
    name: string;
    property_count: number;
    is_favorite_list: boolean;
}

const ClientLists: React.FC = () => {
    const [lists, setLists] = useState<ClientList[]>([]);
    const [broadcastedLists, setBroadcastedLists] = useState<any[]>([]);
    const [selectedListId, setSelectedListId] = useState<number | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [openImportModal, setOpenImportModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [loading, setLoading] = useState(true);

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
        if (!window.confirm("Are you sure?")) return;
        try {
            await ClientDataService.deleteList(id);
            loadLists();
            if (selectedListId === id) setSelectedListId(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleOpenImport = async () => {
        try {
            const data = await ClientDataService.getBroadcastedLists();
            setBroadcastedLists(data);
            setOpenImportModal(true);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleImportBroadcast = async (listId: number) => {
        try {
            await ClientDataService.importBroadcastedList(listId);
            alert("Successfully imported Admin broadcasted list as a personal, isolated copy.");
            setOpenImportModal(false);
            loadLists();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const selectedList = lists.find(l => l.id === selectedListId);

    return (
        <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
            {/* Left Pane: Folders/Lists */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-800/50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <Typography variant="h6" className="font-bold text-slate-800 dark:text-white">My Lists</Typography>
                        <Button size="small" startIcon={<FolderPlusIcon size={16} />} onClick={() => setOpenModal(true)}>New List</Button>
                    </div>
                    <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        startIcon={<DownloadCloudIcon size={16} />}
                        fullWidth
                        onClick={handleOpenImport}
                    >
                        Import Broadcasted List
                    </Button>
                </div>
                <div className="p-0 flex-1 overflow-y-auto">
                    {lists.length === 0 ? (
                        <Typography variant="body2" className="text-slate-500 italic text-center mt-10 p-4">
                            No personal lists yet. Create a new one or import an Admin Broadcast.
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
                                                {list.is_favorite_list && <Chip label="Favorites" size="small" color="error" variant="outlined" className="h-5 text-[10px]" />}
                                            </div>
                                        }
                                        secondary={`${list.property_count} properties`}
                                    />
                                    {!list.is_favorite_list && (
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" size="small" onClick={() => handleDeleteList(list.id)}>
                                                <Trash2Icon size={14} className="text-slate-400 hover:text-red-600" />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    )}
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
                    <Button disabled={!selectedList} startIcon={<SearchIcon size={16} />}>Search in List</Button>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/10">
                    {!selectedList ? (
                        <Box className="text-center text-slate-400">
                            <FolderPlusIcon size={48} className="mx-auto mb-4 opacity-50 text-slate-300" />
                            <Typography variant="h6" className="font-semibold text-slate-500">Select a list</Typography>
                            <Typography variant="body2" className="mt-2 text-slate-400">Choose a list from the sidebar to view saved properties.</Typography>
                        </Box>
                    ) : (
                        <div className="w-full h-full flex flex-col">
                            <div className="mb-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-fit">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider mb-1">List Size</h3>
                                <p className="text-2xl text-slate-900 dark:text-white font-light">{selectedList.property_count} Properties</p>
                            </div>
                            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center border-dashed">
                                <p className="text-slate-400 italic">Pre-filtered Property View Component (Mock)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>New List</DialogTitle>
                <DialogContent><TextField label="Name" fullWidth value={newListName} onChange={e => setNewListName(e.target.value)} /></DialogContent>
                <DialogActions><Button onClick={() => setOpenModal(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateList}>Create</Button></DialogActions>
            </Dialog>

            {/* Import Modal */}
            <Dialog open={openImportModal} onClose={() => setOpenImportModal(false)}>
                <DialogTitle>Import Broadcasted Lists</DialogTitle>
                <DialogContent>
                    <List>
                        {broadcastedLists.length === 0 && <Typography>No broadcasted lists available.</Typography>}
                        {broadcastedLists.map(bl => (
                            <ListItem key={bl.id}>
                                <ListItemText primary={bl.name} secondary={`${bl.property_count} properties`} />
                                <Button size="small" variant="contained" onClick={() => handleImportBroadcast(bl.id)}>Import</Button>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClientLists;
