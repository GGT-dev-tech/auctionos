import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    IconButton,
    Chip
} from '@mui/material';
import {
    Close as CloseIcon,
    Event as EventIcon,
    LocationOn as LocationIcon,
    Info as InfoIcon,
    OpenInNew as OpenInNewIcon,
    ListAlt as ListIcon
} from '@mui/icons-material';
import AuctionPropertiesList from './AuctionPropertiesList';

interface AuctionDetailsModalProps {
    open: boolean;
    onClose: () => void;
    eventData: any;
}

export const AuctionDetailsModal: React.FC<AuctionDetailsModalProps> = ({ open, onClose, eventData }) => {
    const [showProperties, setShowProperties] = useState(false);

    if (!eventData) return null;

    const props = eventData.extendedProps;
    const dateStr = eventData.start ? new Date(eventData.start).toLocaleDateString() : '';
    const timeStr = eventData.start ? new Date(eventData.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const cleanAuctionName = eventData.title.replace(/\(\d+\)$/, '').trim();

    const handleClose = () => {
        setShowProperties(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, minHeight: showProperties ? '600px' : 'auto' } }}>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                <Typography variant="h6" className="font-bold text-slate-800">
                    {cleanAuctionName}
                </Typography>
                <IconButton aria-label="close" onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers className="bg-white p-0">
                {showProperties ? (
                    <AuctionPropertiesList
                        auctionName={cleanAuctionName}
                        onClose={() => setShowProperties(false)}
                    />
                ) : (
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip icon={<EventIcon />} label={`${dateStr} at ${timeStr}`} color="primary" variant="outlined" />
                            {props.property_count > 0 && (
                                <Chip icon={<ListIcon />} label={`${props.property_count} Properties`} color="secondary" variant="outlined" />
                            )}
                            {props.tax_status && (
                                <Chip label={props.tax_status} color={props.tax_status.toLowerCase() === 'deed' ? 'success' : 'error'} variant="filled" sx={{ fontWeight: 'bold' }} />
                            )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary" className="flex items-center gap-1 mb-1">
                                <LocationIcon fontSize="small" /> Location / Type
                            </Typography>
                            <Typography variant="body1" className="pl-6 font-medium text-slate-700">
                                {props.location || 'Online / Specified upon registration'}
                            </Typography>
                        </Box>

                        {props.notes && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary" className="flex items-center gap-1 mb-1">
                                    <InfoIcon fontSize="small" /> Notes
                                </Typography>
                                <Typography variant="body2" className="pl-6 text-slate-600 bg-slate-50 p-2 rounded">
                                    {props.notes}
                                </Typography>
                            </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="textSecondary" className="mb-2">Official Links</Typography>
                        <Box className="flex flex-col gap-2">
                            {props.register_link && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    href={props.register_link}
                                    target="_blank"
                                    startIcon={<OpenInNewIcon />}
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Registration / Instructions
                                </Button>
                            )}
                            {props.list_link && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    href={props.list_link}
                                    target="_blank"
                                    startIcon={<OpenInNewIcon />}
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Official Property List
                                </Button>
                            )}
                            {!props.register_link && !props.list_link && (
                                <Typography variant="body2" color="textSecondary" className="italic">No external links provided.</Typography>
                            )}
                        </Box>
                    </Box>
                )}
            </DialogContent>

            {!showProperties && (
                <DialogActions sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                    <Button onClick={handleClose} color="inherit">Close</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowProperties(true)}
                    >
                        View Matched Properties
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};
