import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';

export interface AnnouncementFormData {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

const SystemAnnouncementForm: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [formData, setFormData] = useState<AnnouncementFormData>({
        title: '',
        message: '',
        type: 'info'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // TODO: Wire up to HTTP Client service
            const response = await fetch('/api/v1/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to create announcement');

            enqueueSnackbar('Announcement broadcasted successfully!', { variant: 'success' });
            setFormData({ title: '', message: '', type: 'info' });
        } catch (error) {
            enqueueSnackbar('Error broadcasting announcement.', { variant: 'error' });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper elevation={2} className="p-6">
            <Typography variant="h6" className="mb-4">Create System Announcement</Typography>
            <Typography variant="body2" className="text-slate-500 mb-6">
                This message will be broadcast directly to the Client Portal dashboard.
            </Typography>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <TextField
                    label="Announcement Title"
                    required
                    fullWidth
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />

                <FormControl fullWidth required>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={formData.type}
                        label="Type"
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                        <MenuItem value="info">Info (Blue)</MenuItem>
                        <MenuItem value="success">Success (Green)</MenuItem>
                        <MenuItem value="warning">Warning (Yellow)</MenuItem>
                        <MenuItem value="error">Error/Urgent (Red)</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Detailed Message or HTTP Links"
                    required
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />

                <Box className="flex justify-end mt-2">
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Broadcasting...' : 'Broadcast Announcement'}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default SystemAnnouncementForm;
