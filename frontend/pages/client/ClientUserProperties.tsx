import React, { useState, useEffect } from 'react';
import { Typography, Button, IconButton, Dialog, TextField, CircularProgress } from '@mui/material';
import { UserPropertyService, CustomPropertyPayload } from '../../services/user_property.service';
import { PlusIcon, Edit2Icon, Trash2Icon, ArrowLeftIcon, FolderInputIcon } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ClientDataService } from '../../services/property.service';

interface Props {
    onBack?: () => void;
}

export const ClientUserProperties: React.FC<Props> = ({ onBack }) => {
    const { activeCompany } = useCompany();
    const [lists, setLists] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const [formData, setFormData] = useState<CustomPropertyPayload>({
        address: '', city: '', state: '', zip_code: '', property_type: '', assessed_value: 0
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

    const loadLists = async () => {
        if (!activeCompany?.id) return;
        try {
            const fetchedLists = await ClientDataService.getLists(activeCompany.id);
            setLists(fetchedLists);
        } catch (e) {
            console.error("Failed to load lists", e);
        }
    };

    useEffect(() => {
        loadProperties();
        loadLists();
    }, [activeCompany?.id]);

    const handleSave = async () => {
        try {
            await UserPropertyService.create(formData);
            setModalOpen(false);
            loadProperties();
            alert("Property Created Successfully! It is now available in your folders.");
        } catch (err) {
            alert("Error saving property");
        }
    };

    const handleDelete = async (id: string) => {
        // Disabled for now since they are part of unified properties
        alert("To delete unified properties, remove them from your lists or contact support.");
    };

    const openCreate = () => {
        setFormData({ 
            address: '', city: '', state: '', zip_code: '', 
            property_type: '', assessed_value: 0, parcel_id: '', county: '',
            bedrooms: 0, bathrooms: 0, sqft: 0, year_built: 0, amount_due: 0,
            owner_name: '', lot_size: 0, occupancy: '', description: ''
        });
        setModalOpen(true);
    };

    const openEdit = (p: any) => {
        alert("Editing unified properties directly from here is currently disabled. Use the details drawer.");
    };

    return (
        <div className="flex-1 flex flex-col p-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <IconButton onClick={onBack} size="small" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                            <ArrowLeftIcon size={18} className="text-slate-600 dark:text-slate-300" />
                        </IconButton>
                    )}
                    <Typography variant="h5" className="font-bold text-slate-800 dark:text-white">Custom Properties</Typography>
                </div>
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
                                <div className="flex flex-col">
                                    <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-white truncate">{p.address || 'Untitled Property'}</Typography>
                                    {p.parcel_id && <Typography variant="caption" className="text-blue-500 font-bold uppercase text-[10px]">PID: {p.parcel_id}</Typography>}
                                </div>
                                <div className="flex gap-1">
                                    <IconButton size="small" onClick={() => p.id && handleDelete(p.id)}><Trash2Icon size={14} className="text-red-500" /></IconButton>
                                </div>
                            </div>
                            <Typography variant="body2" className="text-slate-500 mb-1">
                                {p.city ? `${p.city}, ` : ''}{p.state}
                            </Typography>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Typography variant="caption" className="text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit">{p.property_type || 'Unknown Type'}</Typography>
                                {p.bedrooms > 0 && <Typography variant="caption" className="text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit">{p.bedrooms} Beds</Typography>}
                                {p.bathrooms > 0 && <Typography variant="caption" className="text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit">{p.bathrooms} Baths</Typography>}
                                {p.sqft > 0 && <Typography variant="caption" className="text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit">{p.sqft} sqft</Typography>}
                            </div>
                            
                            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-slate-400 font-bold">Assessed Value</span>
                                    <span className="text-sm font-bold text-emerald-600">${p.assessed_value?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase text-slate-400 font-bold">Amount Due</span>
                                    <span className="text-sm font-bold text-red-500">${p.amount_due?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
                <Typography variant="h6" className="font-bold mb-4">New Custom Property</Typography>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <TextField label="Parcel ID" size="small" value={formData.parcel_id || ''} onChange={e => setFormData({...formData, parcel_id: e.target.value})} fullWidth />
                        <TextField label="County" size="small" value={formData.county || ''} onChange={e => setFormData({...formData, county: e.target.value})} fullWidth />
                    </div>
                    <TextField label="Address" size="small" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} fullWidth />
                    <div className="flex gap-3">
                        <TextField label="City" size="small" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} fullWidth />
                        <TextField label="State" size="small" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} sx={{ width: 100 }} />
                        <TextField label="Zip" size="small" value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} sx={{ width: 120 }} />
                    </div>
                    <TextField label="Description" size="small" multiline rows={2} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} fullWidth />
                    
                    <div className="flex gap-3">
                        <TextField label="Property Type (e.g. Single Family)" size="small" value={formData.property_type || ''} onChange={e => setFormData({...formData, property_type: e.target.value})} fullWidth />
                        <TextField label="Occupancy" size="small" value={formData.occupancy || ''} onChange={e => setFormData({...formData, occupancy: e.target.value})} fullWidth />
                    </div>
                    
                    <div className="flex gap-3">
                        <TextField label="Beds" type="number" size="small" value={formData.bedrooms || ''} onChange={e => setFormData({...formData, bedrooms: parseInt(e.target.value) || 0})} fullWidth />
                        <TextField label="Baths" type="number" size="small" value={formData.bathrooms || ''} onChange={e => setFormData({...formData, bathrooms: parseFloat(e.target.value) || 0})} fullWidth />
                        <TextField label="Year Built" type="number" size="small" value={formData.year_built || ''} onChange={e => setFormData({...formData, year_built: parseInt(e.target.value) || 0})} fullWidth />
                    </div>
                    
                    <div className="flex gap-3">
                        <TextField label="SqFt" type="number" size="small" value={formData.sqft || ''} onChange={e => setFormData({...formData, sqft: parseInt(e.target.value) || 0})} fullWidth />
                        <TextField label="Lot Size (Acres/Sqft)" type="number" size="small" value={formData.lot_size || ''} onChange={e => setFormData({...formData, lot_size: parseFloat(e.target.value) || 0})} fullWidth />
                    </div>
                    
                    <div className="flex gap-3">
                        <TextField label="Assessed Value ($)" type="number" size="small" value={formData.assessed_value || ''} onChange={e => setFormData({...formData, assessed_value: parseFloat(e.target.value) || 0})} fullWidth />
                        <TextField label="Amount Due ($)" type="number" size="small" value={formData.amount_due || ''} onChange={e => setFormData({...formData, amount_due: parseFloat(e.target.value) || 0})} fullWidth />
                    </div>
                    
                    <div className="flex gap-3">
                        <TextField label="Owner Name" size="small" value={formData.owner_name || ''} onChange={e => setFormData({...formData, owner_name: e.target.value})} fullWidth />
                    </div>
                    
                    <div className="mt-2">
                        <TextField
                            select
                            SelectProps={{ native: true }}
                            label="Target Folder"
                            size="small"
                            fullWidth
                            value={formData.target_list_id || ''}
                            onChange={e => setFormData({...formData, target_list_id: e.target.value ? parseInt(e.target.value) : undefined})}
                        >
                            <option value="">-- Default (Custom Folder) --</option>
                            {lists.map(list => (
                                <option key={list.id} value={list.id}>{list.name}</option>
                            ))}
                        </TextField>
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
