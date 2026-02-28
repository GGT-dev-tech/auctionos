import React, { useState } from 'react';
import { Typography, Paper, Box, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip } from '@mui/material';
import { FolderPlusIcon, SearchIcon, ShareIcon, CopyIcon } from 'lucide-react';

interface CustomList {
    id: string;
    name: string;
    propertyCount: number;
    isBroadcasted: boolean;
}

const AdminLists: React.FC = () => {
    const [lists, setLists] = useState<CustomList[]>([
        { id: '1', name: 'High ROI Florida Liens', propertyCount: 12, isBroadcasted: false },
        { id: '2', name: 'Premium Arkansas Selection', propertyCount: 5, isBroadcasted: true }
    ]);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);

    const handleBroadcastToggle = (listId: string) => {
        setLists(lists.map(list => {
            if (list.id === listId) {
                const newStatus = !list.isBroadcasted;
                alert(newStatus ? `List '${list.name}' is now broadcasted to all Clients.` : `List '${list.name}' broadcast revoked.`);
                return { ...list, isBroadcasted: newStatus };
            }
            return list;
        }));
    };

    const selectedList = lists.find(l => l.id === selectedListId);

    return (
        <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
            {/* Left Pane: Folders/Lists */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-800/50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <Typography variant="h6" className="font-bold text-slate-800 dark:text-white">Admin Lists</Typography>
                    <Button size="small" startIcon={<FolderPlusIcon size={16} />} onClick={() => alert("List creation modal triggered")}>New List</Button>
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
                                                {list.isBroadcasted && <Chip label="Broadcasted" size="small" color="primary" className="h-5 text-[10px]" />}
                                            </div>
                                        }
                                        secondary={`${list.propertyCount} properties`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="broadcast" onClick={() => handleBroadcastToggle(list.id)} title={list.isBroadcasted ? "Revoke Broadcast" : "Broadcast to Clients"}>
                                            <ShareIcon size={18} className={list.isBroadcasted ? "text-primary-600" : "text-slate-400"} />
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
                                    <p className="text-2xl text-slate-900 dark:text-white font-light">{selectedList.propertyCount} Properties</p>
                                </div>
                                <div className={`p-4 rounded-lg shadow-sm border flex-1 ${selectedList.isBroadcasted ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Broadcast Status</h3>
                                    <p className="text-2xl font-light">{selectedList.isBroadcasted ? 'Active on Client Dashboards' : 'Private to Admins'}</p>
                                </div>
                            </div>
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
