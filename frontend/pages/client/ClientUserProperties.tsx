import React, { useState, useEffect } from 'react';
import { Typography, Button, IconButton, Dialog, TextField, CircularProgress } from '@mui/material';
import { UserPropertyService, UserProperty } from '../../services/user_property.service';
import { PlusIcon, Edit2Icon, Trash2Icon } from 'lucide-react';

export const ClientUserProperties: React.FC = () => {
    const [properties, setProperties] = useState<UserProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProp, setEditingProp] = useState<UserProperty | null>(null);

    const [formData, setFormData] = useState<UserProperty>({
        title: '', address: '', city: '', state: '', zip_code: '', property_type: '', estimated_value: 0
    });

    const loadProperties = async () => {
        setLoading(true);
        try {
            const data = await UserPropertyService.getAll();
            setProperties(data);
        } catch (err) {
            console.error("Failed to load user properties", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, []);

    const handleSave = async () => {
        try {
            if (editingProp && editingProp.id) {
                await UserPropertyService.update(editingProp.id, formData);
            } else {
                await UserPropertyService.create(formData);
            }
            setModalOpen(false);
            loadProperties();
        } catch (err) {
            alert("Error saving property");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await UserPropertyService.delete(id);
            loadProperties();
        } catch (err) {
            alert("Error deleting property");
        }
    };

    const openCreate = () => {
        setEditingProp(null);
        setFormData({ title: '', address: '', city: '', state: '', zip_code: '', property_type: '', estimated_value: 0 });
        setModalOpen(true);
    };

    const openEdit = (p: UserProperty) => {
        setEditingProp(p);
        setFormData(p);
        setModalOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col p-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <Typography variant="h5" className="font-bold text-slate-800 dark:text-white">Custom Properties</Typography>
                <Button variant="contained" color="primary" startIcon={<PlusIcon size={18} />} onClick={openCreate} sx={{ textTransform: 'none', borderRadius: 2 }}>
                    Add Property
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><CircularProgress /></div>
            ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                    <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">real_estate_agent</span>
                    <Typography>No custom properties yet.</Typography>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map(p => (
                        <div key={p.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-white truncate">{p.title || 'Untitled Property'}</Typography>
                                <div className="flex gap-1">
                                    <IconButton size="small" onClick={() => openEdit(p)}><Edit2Icon size={14} className="text-blue-500" /></IconButton>
                                    <IconButton size="small" onClick={() => p.id && handleDelete(p.id)}><Trash2Icon size={14} className="text-red-500" /></IconButton>
                                </div>
                            </div>
                            <Typography variant="body2" className="text-slate-500 mb-1">{p.address}, {p.city}, {p.state} {p.zip_code}</Typography>
                            <Typography variant="caption" className="text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit mb-3">{p.property_type || 'Unknown Type'}</Typography>
                            
                            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                                <span className="text-xs text-slate-400">Est. Value</span>
                                <span className="text-sm font-bold text-emerald-600">${p.estimated_value?.toLocaleString() || '0'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
                <Typography variant="h6" className="font-bold mb-4">{editingProp ? 'Edit Property' : 'New Custom Property'}</Typography>
                <div className="flex flex-col gap-3">
                    <TextField label="Title (e.g. My Next Flip)" size="small" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} fullWidth />
                    <TextField label="Address" size="small" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} fullWidth />
                    <div className="flex gap-3">
                        <TextField label="City" size="small" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} fullWidth />
                        <TextField label="State" size="small" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} sx={{ width: 100 }} />
                        <TextField label="Zip" size="small" value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} sx={{ width: 120 }} />
                    </div>
                    <div className="flex gap-3">
                        <TextField label="Property Type (e.g. Single Family)" size="small" value={formData.property_type} onChange={e => setFormData({...formData, property_type: e.target.value})} fullWidth />
                        <TextField label="Est. Value ($)" type="number" size="small" value={formData.estimated_value} onChange={e => setFormData({...formData, estimated_value: parseFloat(e.target.value)})} fullWidth />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setModalOpen(false)} color="inherit">Cancel</Button>
                        <Button onClick={handleSave} variant="contained" color="primary">Save Property</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
