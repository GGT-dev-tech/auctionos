import React from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import { SearchIcon, MapIcon, FilterIcon } from 'lucide-react';

const AdminResearch: React.FC = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Typography variant="h5" className="font-bold text-slate-800 dark:text-white">Research & Map</Typography>
                    <Typography variant="body2" className="text-slate-500">Explore properties spatially to visualize proximity and boundaries.</Typography>
                </div>
                <div className="flex gap-2">
                    <Button variant="outlined" startIcon={<FilterIcon size={16} />}>Advanced Filters</Button>
                    <Button variant="contained" startIcon={<SearchIcon size={16} />}>Search Area</Button>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-center relative">
                {/* Embedded GIS/Map Placeholder */}
                <Box className="text-center text-slate-400 z-10 bg-white/90 dark:bg-slate-800/90 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                    <MapIcon size={48} className="mx-auto mb-4 opacity-50 text-slate-400" />
                    <Typography variant="h6" className="font-semibold text-slate-800 dark:text-slate-200">Interactive Map Interface</Typography>
                    <Typography variant="body2" className="mt-2 text-slate-500 max-w-sm mx-auto">
                        In a production environment, this module integrates with Mapbox or Google Maps to display parcel boundaries, zoning clusters, and heatmaps.
                    </Typography>
                    <Button variant="outlined" size="small" className="mt-6" onClick={() => alert('GIS Engine Loading Sequence Initiated')}>Simulate Map Load</Button>
                </Box>

                {/* Decorative map background grid to simulate "map area" */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6">
                <Paper className="p-4 shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <Typography variant="subtitle2" className="font-bold text-slate-500 uppercase tracking-wider mb-2">Saved Bounds</Typography>
                    <Typography variant="body2" className="text-slate-600 dark:text-slate-300">0 polygons saved</Typography>
                </Paper>
                <Paper className="p-4 shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <Typography variant="subtitle2" className="font-bold text-slate-500 uppercase tracking-wider mb-2">Active Layers</Typography>
                    <Typography variant="body2" className="text-slate-600 dark:text-slate-300">Default County Parcels</Typography>
                </Paper>
                <Paper className="p-4 shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <Typography variant="subtitle2" className="font-bold text-slate-500 uppercase tracking-wider mb-2">Export Data</Typography>
                    <Button size="small" className="mt-1">Download GeoJSON</Button>
                </Paper>
            </div>
        </div>
    );
};

export default AdminResearch;
