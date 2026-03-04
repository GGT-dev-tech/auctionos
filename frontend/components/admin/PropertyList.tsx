import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem, GridFilterModel } from '@mui/x-data-grid';
import { AdminService } from '../../services/admin.service';
import { Box, Typography, Button, Dialog, DialogContent, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropertyForm from './PropertyForm';
import AvailabilityHistoryDashboard from './AvailabilityHistoryDashboard';

interface PropertyListProps {
    filters?: any;
    readOnly?: boolean;
}

const PropertyList: React.FC<PropertyListProps> = ({ filters, readOnly = false }) => {
    const navigate = useNavigate();
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editRow, setEditRow] = useState<any | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 50,
    });
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const skip = paginationModel.page * paginationModel.pageSize;
            const limit = paginationModel.pageSize;

            const params: any = { ...filters, limit, skip };

            // Apply DataGrid server-side column filters
            filterModel.items.forEach(item => {
                if (item.value === undefined || item.value === null || item.value === '') return;

                const f = item.field;
                const v = item.value;
                const op = item.operator;

                if (f === 'availability_status') params.availability = v;
                else if (f === 'state_code') params.state = v;
                else if (f === 'owner_address') params.owner_location = v;
                else if (f === 'parcel_id' || f === 'address') params.keyword = params.keyword ? `${params.keyword} ${v}` : v;
                else if (['amount_due', 'assessed_value', 'improvement_value', 'lot_acres'].includes(f)) {
                    const prefixMap: Record<string, string> = {
                        'amount_due': 'amount_due',
                        'assessed_value': 'county_appraisal',
                        'improvement_value': 'improvements',
                        'lot_acres': 'acreage'
                    };
                    const p = prefixMap[f];
                    if (op === '>' || op === '>=' || op === '!=') params[`min_${p}`] = v;
                    else if (op === '<' || op === '<=') params[`max_${p}`] = v;
                    else {
                        params[`min_${p}`] = v;
                        params[`max_${p}`] = v; // Exact match
                    }
                } else if (f === 'tax_year' || f === 'county' || f === 'property_type' || f === 'auction_name' || f === 'occupancy') {
                    params[f] = v;
                }
            });

            const { items, total } = await AdminService.listProperties(params);

            // Map the data to have an `id` field required by DataGrid
            const mappedData = items.map((item: any) => ({
                ...item,
                id: item.parcel_id
            }));

            setRows(mappedData);
            setRowCount(total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [filters, paginationModel, filterModel]);

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
            field: 'availability_status', headerName: 'Status', width: 110,
            type: 'singleSelect',
            valueOptions: ['available', 'sold', 'pending', 'withdrawn'],
            renderCell: (params) => {
                const status = (params.value || 'unknown').toLowerCase();
                const isAvail = status === 'available';
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAvail ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {status.toUpperCase()}
                    </span>
                );
            }
        },
        { field: 'tax_year', headerName: 'Sale Year', width: 100, type: 'number', valueFormatter: (params: any) => params?.value ?? '-' },
        {
            field: 'amount_due', headerName: 'Amount Due', width: 110, type: 'number',
            valueFormatter: (params: any) => {
                const val = typeof params === 'object' ? params?.value : params;
                return (val !== null && val !== undefined) ? `$${Number(val).toLocaleString()}` : '-';
            }
        },
        { field: 'lot_acres', headerName: 'Acres', width: 80, type: 'number', valueFormatter: (params: any) => params?.value ?? '-' },
        {
            field: 'assessed_value', headerName: 'Total Value', width: 110, type: 'number',
            valueFormatter: (params: any) => {
                const val = typeof params === 'object' ? params?.value : params;
                return (val !== null && val !== undefined) ? `$${Number(val).toLocaleString()}` : '-';
            }
        },
        {
            field: 'land_value', headerName: 'Land', width: 100, type: 'number',
            valueFormatter: (params: any) => {
                const val = typeof params === 'object' ? params?.value : params;
                return (val !== null && val !== undefined) ? `$${Number(val).toLocaleString()}` : '-';
            }
        },
        {
            field: 'improvement_value', headerName: 'Building', width: 100, type: 'number',
            valueFormatter: (params: any) => {
                const val = typeof params === 'object' ? params?.value : params;
                return (val !== null && val !== undefined) ? `$${Number(val).toLocaleString()}` : '-';
            }
        },
        { field: 'property_type', headerName: 'Parcel Type', width: 140, type: 'singleSelect', valueOptions: ['Vacant Land', 'Single Family', 'Multi-Family', 'Commercial', 'Agricultural', 'Industrial', 'Tax Sale', 'Over the Counter', 'Sealed Bid', 'Public Outcry', 'Tax Deed', 'Tax Lien', 'Foreclosure', 'Other'] },
        { field: 'address', headerName: 'Address', width: 180 },
        { field: 'auction_name', headerName: 'Next Auction', width: 220 },
        { field: 'occupancy', headerName: 'Occupancy', width: 150, type: 'singleSelect', valueOptions: ['Occupied', 'Vacant', 'Unknown'] },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 80,
            getActions: ({ id, row }) => {
                const actions = [
                    <GridActionsCellItem
                        key={`view-${id}`}
                        icon={<span className="material-symbols-outlined text-green-600">visibility</span>}
                        label="View Details"
                        onClick={() => navigate(readOnly ? `/client/properties/${id}` : `/admin/properties/${id}`)}
                    />
                ];

                if (!readOnly) {
                    actions.push(
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
                        />
                    );
                }
                return actions;
            },
        },
    ];

    return (
        <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center" sx={{ borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                <Typography variant="h6" className="text-slate-800 dark:text-white font-semibold flex-1">
                    Properties Database
                </Typography>
                {!readOnly && (
                    <Button
                        onClick={() => setShowHistory(true)}
                        startIcon={<span className="material-symbols-outlined">history</span>}
                        sx={{ textTransform: 'none', mr: 2 }}
                        color="secondary"
                        variant="outlined"
                    >
                        View Flow History
                    </Button>
                )}
                <Button
                    onClick={fetchProperties}
                    startIcon={<span className="material-symbols-outlined">refresh</span>}
                    sx={{ textTransform: 'none' }}
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    rowCount={rowCount}
                    paginationMode="server"
                    filterMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    filterModel={filterModel}
                    onFilterModelChange={setFilterModel}
                    initialState={{
                        sorting: { sortModel: [{ field: 'auction_date', sort: 'asc' }] }
                    }}
                    pageSizeOptions={[20, 50, 100]}
                    disableRowSelectionOnClick
                    density="compact"
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'rgba(248, 250, 252, 0.5)',
                        },
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                    }}
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

            <Dialog
                open={showHistory}
                onClose={() => setShowHistory(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogContent className="bg-slate-50 dark:bg-slate-900 p-0">
                    <div className="relative">
                        <IconButton
                            onClick={() => setShowHistory(false)}
                            className="absolute right-4 top-4 z-10 bg-white shadow-sm hover:bg-slate-100"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </IconButton>
                        <AvailabilityHistoryDashboard />
                    </div>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default PropertyList;
