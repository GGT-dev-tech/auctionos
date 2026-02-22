import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { AdminService } from '../../services/admin.service';
import { Box, Typography, Button } from '@mui/material';

interface PropertyListProps {
    filters?: any;
}

const PropertyList: React.FC<PropertyListProps> = ({ filters }) => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = { ...filters, limit: 100, skip: 0 };
            const data = await AdminService.listProperties(params);

            // Map the data to have an `id` field required by DataGrid
            const mappedData = data.map((item: any) => ({
                ...item,
                id: item.parcel_id
            }));

            setRows(mappedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [filters]);

    const handleEditClick = (row: any) => {
        alert("Edit Property functionality coming soon!");
    };

    const columns: GridColDef[] = [
        { field: 'parcel_id', headerName: 'Parcel ID', width: 140 },
        { field: 'county', headerName: 'County', width: 130 },
        { field: 'state_code', headerName: 'State', width: 70 },
        {
            field: 'status', headerName: 'Status', width: 100,
            renderCell: (params) => {
                const status = params.value || 'active';
                const colors: any = {
                    'active': 'bg-green-100 text-green-700',
                    'sold': 'bg-red-100 text-red-700',
                    'pending': 'bg-yellow-100 text-yellow-700'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
                        {status.toUpperCase()}
                    </span>
                );
            }
        },
        { field: 'auction_name', headerName: 'Linked Auction', width: 220 },
        {
            field: 'auction_date', headerName: 'Auction Date', width: 120,
            valueFormatter: (params: any) => {
                const val = (params && typeof params === 'object' && 'value' in params) ? params.value : params;
                if (!val) return '';
                const date = new Date(val);
                return date.toLocaleDateString();
            }
        },
        {
            field: 'amount_due', headerName: 'Taxes', width: 100,
            valueFormatter: (params: any) => {
                const val = (params && typeof params === 'object' && 'value' in params) ? params.value : params;
                if (val !== undefined && val !== null) return `$${val.toLocaleString()}`;
                return '-';
            }
        },
        {
            field: 'assessed_value', headerName: 'Value', width: 100,
            valueFormatter: (params: any) => {
                const val = (params && typeof params === 'object' && 'value' in params) ? params.value : params;
                if (val !== undefined && val !== null) return `$${val.toLocaleString()}`;
                return '-';
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 80,
            getActions: ({ id, row }) => [
                <GridActionsCellItem
                    key={`edit-${id}`}
                    icon={<span className="material-symbols-outlined text-blue-600">edit</span>}
                    label="Edit"
                    onClick={() => handleEditClick(row)}
                />,
            ],
        },
    ];

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #e2e8f0">
                <Typography variant="h6" className="text-slate-800 dark:text-white font-semibold flex-1">
                    Properties Database
                </Typography>
                <Button
                    onClick={fetchProperties}
                    startIcon={<span className="material-symbols-outlined">refresh</span>}
                    sx={{ textTransform: 'none' }}
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    initialState={{
                        sorting: { sortModel: [{ field: 'auction_date', sort: 'asc' }] }
                    }}
                    pageSizeOptions={[20, 50, 100]}
                    disableRowSelectionOnClick
                    density="compact"
                />
            </Box>
        </Box>
    );
};

export default PropertyList;
