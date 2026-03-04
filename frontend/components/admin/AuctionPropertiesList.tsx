import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridFilterModel } from '@mui/x-data-grid';
import { AdminService } from '../../services/admin.service';
import { Box, Typography, Button, IconButton } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface AuctionPropertiesListProps {
    auctionName: string;
    onClose?: () => void;
}

const AuctionPropertiesList: React.FC<AuctionPropertiesListProps> = ({ auctionName, onClose }) => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const skip = paginationModel.page * paginationModel.pageSize;
            const limit = paginationModel.pageSize;

            // Fetch properties specifically for this auction
            const params: any = { auction_name: auctionName, limit, skip };

            filterModel.items.forEach(item => {
                if (item.value === undefined || item.value === null || item.value === '') return;

                const f = item.field;
                const v = item.value;
                const op = item.operator;

                if (f === 'parcel_id' || f === 'address') params.keyword = params.keyword ? `${params.keyword} ${v}` : v;
                else if (f === 'amount_due') {
                    if (op === '>' || op === '>=' || op === '!=') params.min_amount_due = v;
                    else if (op === '<' || op === '<=') params.max_amount_due = v;
                    else {
                        params.min_amount_due = v;
                        params.max_amount_due = v;
                    }
                } else {
                    params[f] = v;
                }
            });

            const { items, total } = await AdminService.listProperties(params);

            const mappedData = items.map((item: any) => ({
                ...item,
                id: item.parcel_id
            }));

            setRows(mappedData);
            setRowCount(total);
        } catch (err) {
            console.error('Failed to fetch auction properties', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auctionName) {
            fetchProperties();
        }
    }, [auctionName, paginationModel, filterModel]);

    const columns: GridColDef[] = [
        { field: 'parcel_id', headerName: 'Parcel Number', width: 140 },
        { field: 'address', headerName: 'Address', width: 200 },
        { field: 'county', headerName: 'County', width: 120 },
        {
            field: 'amount_due', headerName: 'Amount Due', width: 110, type: 'number',
            valueFormatter: (params: any) => {
                const val = typeof params === 'object' ? params?.value : params;
                return (val !== null && val !== undefined) ? `$${Number(val).toLocaleString()}` : '-';
            }
        },
        { field: 'property_type', headerName: 'Type', width: 130, type: 'singleSelect', valueOptions: ['Vacant Land', 'Single Family', 'Multi-Family', 'Commercial', 'Agricultural', 'Industrial', 'Other'] },
        {
            field: 'actions',
            headerName: '',
            width: 60,
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    size="small"
                    component="a"
                    href={`#/admin/properties/${params.row.parcel_id}`}
                    target="_blank"
                    title="Open Details"
                >
                    <OpenInNewIcon fontSize="small" className="text-blue-500" />
                </IconButton>
            )
        }
    ];

    return (
        <Box sx={{ width: '100%', height: 400, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
            <Box p={1} display="flex" justifyContent="space-between" alignItems="center" sx={{ borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                <Typography variant="subtitle1" className="text-slate-800 dark:text-white font-semibold">
                    Properties for: {auctionName}
                </Typography>
                <div className="flex gap-2">
                    <Button
                        size="small"
                        onClick={fetchProperties}
                        startIcon={<span className="material-symbols-outlined text-sm">refresh</span>}
                    >
                        Refresh
                    </Button>
                    {onClose && (
                        <Button size="small" onClick={onClose} color="inherit">
                            Back
                        </Button>
                    )}
                </div>
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
                    pageSizeOptions={[10, 20]}
                    disableRowSelectionOnClick
                    density="compact"
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f8fafc',
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default AuctionPropertiesList;
