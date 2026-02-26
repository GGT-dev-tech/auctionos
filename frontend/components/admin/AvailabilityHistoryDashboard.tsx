import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { PropertyService } from '../../services/property.service';
import { PropertyAvailabilityHistory } from '../../types';

const AvailabilityHistoryDashboard: React.FC = () => {
    const [history, setHistory] = useState<PropertyAvailabilityHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await PropertyService.getAvailabilityHistory(500);
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const columns: GridColDef[] = [
        {
            field: 'changed_at',
            headerName: 'Date',
            width: 160,
            valueFormatter: (params: any) => {
                const val = typeof params === 'object' ? params?.value : params;
                return val ? new Date(val).toLocaleString() : '-';
            }
        },
        { field: 'parcel_id', headerName: 'Parcel ID', width: 140 },
        { field: 'address', headerName: 'Address', width: 220 },
        {
            field: 'previous_status',
            headerName: 'Previous',
            width: 130,
            renderCell: (params) => {
                const isAvail = params.value === 'available';
                return (
                    <Chip
                        label={params.value ? params.value.toUpperCase() : 'NONE'}
                        size="small"
                        color={isAvail ? 'success' : 'default'}
                    />
                );
            }
        },
        {
            field: 'new_status',
            headerName: 'New Status',
            width: 130,
            renderCell: (params) => {
                const isAvail = params.value === 'available';
                return (
                    <Chip
                        label={params.value ? params.value.toUpperCase() : 'NONE'}
                        size="small"
                        color={isAvail ? 'success' : 'error'}
                    />
                );
            }
        },
        { field: 'change_source', headerName: 'Source', width: 150 }
    ];

    return (
        <Box sx={{ p: 3, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" className="mb-4 text-slate-800 dark:text-white font-bold">
                Availability Status History
            </Typography>
            <Typography variant="body2" className="mb-4 text-slate-600 dark:text-slate-400">
                Tracking history of properties transitioning between available and not available statuses.
            </Typography>

            <Paper sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <DataGrid
                    rows={history}
                    columns={columns}
                    loading={loading}
                    density="compact"
                    disableRowSelectionOnClick
                    initialState={{
                        pagination: { paginationModel: { pageSize: 20 } },
                    }}
                    pageSizeOptions={[20, 50, 100]}
                />
            </Paper>
        </Box>
    );
};

export default AvailabilityHistoryDashboard;
