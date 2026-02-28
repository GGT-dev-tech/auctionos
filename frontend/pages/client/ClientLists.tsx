import React, { useState } from 'react';
import { Typography, Paper, Box, Button, List, ListItem, ListItemText } from '@mui/material';
import { FolderPlusIcon, SearchIcon, DownloadCloudIcon } from 'lucide-react';

interface ClientList {
    id: string;
    name: string;
    propertyCount: number;
}

const ClientLists: React.FC = () => {
    const [lists, setLists] = useState<ClientList[]>([]);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);

    const handleImportBroadcast = () => {
        const dummyBroadcastId = Math.random().toString(36).substring(7);
        setLists([...lists, { id: dummyBroadcastId, name: 'Imported: High ROI Florida Liens', propertyCount: 12 }]);
        alert("Successfully imported Admin broadcasted list as a personal, isolated copy.");
    };

    const selectedList = lists.find(l => l.id === selectedListId);

    return (
        <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
            {/* Left Pane: Folders/Lists */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-800/50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <Typography variant="h6" className="font-bold text-slate-800 dark:text-white">My Lists</Typography>
                        <Button size="small" startIcon={<FolderPlusIcon size={16} />}>New List</Button>
                    </div>
                    <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        startIcon={<DownloadCloudIcon size={16} />}
                        fullWidth
                        onClick={handleImportBroadcast}
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
                                        primary={<span className="font-semibold text-slate-700 dark:text-slate-300">{list.name}</span>}
                                        secondary={`${list.propertyCount} properties`}
                                    />
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
                                <p className="text-2xl text-slate-900 dark:text-white font-light">{selectedList.propertyCount} Properties</p>
                            </div>
                            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center border-dashed">
                                <p className="text-slate-400 italic">Pre-filtered Property View Component (Mock)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientLists;
