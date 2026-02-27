import React from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import { FolderPlusIcon, SearchIcon } from 'lucide-react';

const ClientLists: React.FC = () => {
    return (
        <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
            {/* Left Pane: Folders/Lists */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-800/50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <Typography variant="h6" className="font-bold text-slate-800 dark:text-white">My Lists</Typography>
                    <Button size="small" startIcon={<FolderPlusIcon size={16} />}>New List</Button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <Typography variant="body2" className="text-slate-500 italic text-center mt-10">
                        No lists created yet. Click 'New List' to start organizing properties.
                    </Typography>
                </div>
            </div>

            {/* Right Pane: Property Contents */}
            <div className="w-2/3 flex flex-col bg-white dark:bg-slate-900">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
                    <Typography variant="h6" className="font-bold text-slate-800 dark:text-white">List Contents</Typography>
                    <Button disabled startIcon={<SearchIcon size={16} />}>Search in List</Button>
                </div>
                <div className="flex-1 p-6 flex items-center justify-center">
                    <Box className="text-center text-slate-400">
                        <FolderPlusIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <Typography variant="h6">Select a list</Typography>
                        <Typography variant="body2">Choose a list from the sidebar to view saved properties.</Typography>
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default ClientLists;
