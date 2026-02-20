import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridSortModel, GridActionsCellItem } from '@mui/x-data-grid';
import { AuctionService } from '../../services/auction.service';
import { AuctionEvent } from '../../types';
import { Box, Typography, Button } from '@mui/material';
import { AuctionForm } from './AuctionForm';



interface AuctionListProps {
    filters: any;
}

const AuctionList: React.FC<AuctionListProps> = ({ filters }) => {
    const [rows, setRows] = useState<AuctionEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Modal State
    const [formOpen, setFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AuctionEvent | null>(null);

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            const params = { ...filters, sort_by_date: true, limit: 100, skip: 0 };
            const data = await AuctionService.getAuctionEvents(params);
            setRows(data);
        } catch (error) {
            console.error('Failed to fetch auctions for list', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, [filters]);

    const handleEditClick = (event: AuctionEvent) => {
        setEditingEvent(event);
        setFormOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (!window.confirm("Are you sure you want to permanently delete this auction?")) return;
        setLoading(true);
        try {
            await AuctionService.deleteAuctionEvent(id);
            alert("Auction deleted successfully!");
            fetchAuctions();
        } catch (error: any) {
            alert(`Delete failed: ${error.message}`);
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setEditingEvent(null);
        setFormOpen(true);
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 250, flex: 1 },
        {
            field: 'auction_date', headerName: 'Date', width: 120,
            valueFormatter: (params: any) => {
                const val = (params && typeof params === 'object' && 'value' in params) ? params.value : params;
                if (!val) return '';
                const date = new Date(val);
                return date.toLocaleDateString();
            }
        },
        { field: 'time', headerName: 'Time', width: 100 },
        { field: 'state', headerName: 'State', width: 80 },
        { field: 'county', headerName: 'County', width: 150 },
        { field: 'location', headerName: 'Location', width: 150 },
        { field: 'tax_status', headerName: 'Tax Status', width: 150 },
        { field: 'parcels_count', headerName: 'Parcels', type: 'number', width: 100 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id, row }) => {
                return [
                    <GridActionsCellItem
                        key={`edit-${id}`}
                        icon={<span className="material-symbols-outlined text-blue-600">edit</span>}
                        label="Edit"
                        className="textPrimary"
                        onClick={() => handleEditClick(row as AuctionEvent)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key={`delete-${id}`}
                        icon={<span className="material-symbols-outlined text-red-600">delete</span>}
                        label="Delete"
                        onClick={() => handleDeleteClick(id as number)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #e2e8f0">
                <Typography variant="h6" className="text-slate-800 dark:text-white font-semibold flex-1">
                    Auction Events
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<span className="material-symbols-outlined">add</span>}
                    onClick={handleCreateClick}
                    sx={{ textTransform: 'none', borderRadius: 2, px: 3, fontWeight: 'bold' }}
                >
                    Add Auction
                </Button>
            </Box>

            <Box sx={{ height: 600, width: '100%' }}>
                {rows.length === 0 && !loading ? (
                    <Box p={3} textAlign="center">
                        <Typography color="textSecondary">No auctions found matching the filters.</Typography>
                    </Box>
                ) : (
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
                )}
            </Box>

            <AuctionForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSuccess={fetchAuctions}
                editingEvent={editingEvent}
            />
        </Box>
    );
};

export default AuctionList;
