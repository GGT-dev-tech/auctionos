import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { AuctionService } from '../../services/auction.service';
import { AuctionEvent } from '../../types';
import { Box, Typography } from '@mui/material';

const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 250, flex: 1 },
    {
        field: 'auction_date', headerName: 'Date', width: 120,
        valueFormatter: (params) => {
            if (!params.value) return '';
            const date = new Date(params.value);
            return date.toLocaleDateString();
        }
    },
    { field: 'time', headerName: 'Time', width: 100 },
    { field: 'state', headerName: 'State', width: 80 },
    { field: 'county', headerName: 'County', width: 150 },
    { field: 'location', headerName: 'Location', width: 150 },
    { field: 'tax_status', headerName: 'Tax Status', width: 150 },
    { field: 'parcels_count', headerName: 'Parcels', type: 'number', width: 100 }
];

interface AuctionListProps {
    filters: any;
}

const AuctionList: React.FC<AuctionListProps> = ({ filters }) => {
    const [rows, setRows] = useState<AuctionEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchAuctions = async () => {
            setLoading(true);
            try {
                // Ensure default sort behavior per requirements
                const params = { ...filters, sort_by_date: true, limit: 100, skip: 0 };
                const data = await AuctionService.getAuctionEvents(params);
                setRows(data);
            } catch (error) {
                console.error('Failed to fetch auctions for list', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuctions();
    }, [filters]);

    return (
        <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
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
    );
};

export default AuctionList;
