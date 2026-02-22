import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { AdminService } from '../../services/admin.service';
import { Box, Typography, Button, Dialog, DialogContent, IconButton } from '@mui/material';
import PropertyForm from './PropertyForm';

interface PropertyListProps {
    filters?: any;
}

const PropertyList: React.FC<PropertyListProps> = ({ filters }) => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editRow, setEditRow] = useState<any | null>(null);

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
        setEditRow(row);
    };

    const handleDeleteClick = async (parcelId: string) => {
        if (window.confirm('Are you sure you want to delete this property (Parcel ID: ' + parcelId + ')? This action cannot be undone.')) {
            try {
                await AdminService.deleteProperty(parcelId);
                fetchProperties();
            } catch (err: any) {
                alert('Failed to delete property: ' + err.message);
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'parcel_id', headerName: 'Parcel Number', width: 140 },
        { field: 'cs_number', headerName: 'C/S#', width: 90 },
        { field: 'account_number', headerName: 'PIN', width: 100 },
        { field: 'owner_address', headerName: 'Name', width: 160 },
        { field: 'county', headerName: 'County', width: 130 },
        { field: 'state_code', headerName: 'State', width: 70 },
        {
            field: 'status', headerName: 'Availability', width: 110,
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
        { field: 'tax_year', headerName: 'Sale Year', width: 100 },
        { field: 'amount_due', headerName: 'Amount Due', width: 110, valueFormatter: (params: any) => params.value ? `$${params.value.toLocaleString()}` : '-' },
        { field: 'lot_acres', headerName: 'Acres', width: 80 },
        { field: 'assessed_value', headerName: 'Total Value', width: 110, valueFormatter: (params: any) => params.value ? `$${params.value.toLocaleString()}` : '-' },
        { field: 'land_value', headerName: 'Land', width: 100, valueFormatter: (params: any) => params.value ? `$${params.value.toLocaleString()}` : '-' },
        { field: 'improvement_value', headerName: 'Building', width: 100, valueFormatter: (params: any) => params.value ? `$${params.value.toLocaleString()}` : '-' },
        { field: 'property_type', headerName: 'Parcel Type', width: 140 },
        { field: 'address', headerName: 'Address', width: 180 },
        { field: 'auction_name', headerName: 'Next Auction', width: 220 },
        { field: 'occupancy', headerName: 'Occupancy', width: 150 },
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
                <GridActionsCellItem
                    key={`delete-${id}`}
                    icon={<span className="material-symbols-outlined text-red-600">delete</span>}
                    label="Delete"
                    onClick={() => handleDeleteClick(id as string)}
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

            <Dialog
                open={!!editRow}
                onClose={() => setEditRow(null)}
                maxWidth="lg"
                fullWidth
            >
                <DialogContent className="bg-slate-50 dark:bg-slate-900 p-0">
                    {editRow && (
                        <div className="relative">
                            <IconButton
                                onClick={() => setEditRow(null)}
                                className="absolute right-4 top-4 z-10 bg-white shadow-sm hover:bg-slate-100"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </IconButton>
                            <PropertyForm
                                initialData={editRow}
                                onSuccess={() => {
                                    setEditRow(null);
                                    fetchProperties();
                                }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default PropertyList;
