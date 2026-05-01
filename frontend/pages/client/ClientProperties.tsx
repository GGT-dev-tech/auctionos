import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyList from '../../components/admin/PropertyList';
import PropertyFilters, { PropertyFilterParams } from '../../components/admin/PropertyFilters';
import { Typography, Button, Dialog, TextField } from '@mui/material';
import { ClientDataService } from '../../services/property.service';

const ClientProperties: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState<PropertyFilterParams>(() => {
        try {
            const saved = sessionStorage.getItem('property_search_filters');
            if (saved) {
                const parsed = JSON.parse(saved);
                return Object.keys(parsed).length > 0 ? parsed : { availability: 'available' };
            }
        } catch {}
        return { availability: 'available' };
    });

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        address: '',
        city: '',
        state: '',
        county: '',
        property_type: 'Residential',
        visibility: 'private',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Save to sessionStorage whenever filters change
    useEffect(() => {
        sessionStorage.setItem('property_search_filters', JSON.stringify(filters));
    }, [filters]);

    // Sync URL params to filter state on mount
    useEffect(() => {
        const stateParam = searchParams.get('state');
        const topParam = searchParams.get('top');
        const initialFilters: PropertyFilterParams = { availability: 'available' };
        
        if (stateParam) initialFilters.state = stateParam;
        if (topParam === 'true') {
            initialFilters.min_score = 70;
        }
        
        const hasSavedSession = sessionStorage.getItem('property_search_filters');
        
        // Apply defaults/URL params only if there's an explicit URL override OR no saved session
        if (stateParam || topParam || !hasSavedSession) {
            if (Object.keys(initialFilters).length > 0) {
                setFilters(prev => {
                    const isDifferent = JSON.stringify(prev) !== JSON.stringify({ ...prev, ...initialFilters });
                    return isDifferent ? { ...prev, ...initialFilters } : prev;
                });
            }
        }
    }, [searchParams]);

    // availability='available' is the default — always show results when it's set
    const hasActiveFilters = filters.availability !== undefined || 
        Object.entries(filters).some(([k, v]) => k !== 'availability' && v !== undefined && v !== '');

    return (
        <div className="p-6 w-full space-y-6 px-4 sm:px-8 lg:px-12">
            <div className="flex justify-between items-center">
                <Typography variant="h4" className="font-bold text-slate-800 dark:text-white">
                    Property Search
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    className="bg-blue-600 rounded-lg shadow-none"
                    onClick={() => setCreateModalOpen(true)}
                    startIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
                >
                    Create Custom Property
                </Button>
            </div>
            <div className="sticky top-0 z-40 pt-2 pb-1 bg-[#F8FAFC] dark:bg-slate-950/80 backdrop-blur-md -mx-4 px-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
                <PropertyFilters 
                    onFilterChange={setFilters} 
                    readOnly={true} 
                    initialFilters={filters}
                />
            </div>
            
            {hasActiveFilters ? (
                <div className="w-full bg-white dark:bg-slate-800 shadow-sm rounded-xl h-[calc(100vh-250px)] flex flex-col">
                    <PropertyList filters={filters} readOnly={true} />
                </div>
            ) : (
                <div className="w-full h-[400px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-6xl mb-4 text-slate-300 dark:text-slate-700">search</span>
                    <Typography variant="h6" className="font-semibold text-slate-600 dark:text-slate-400">Search Properties</Typography>
                    <Typography variant="body2" className="mt-1">Use the filters above to find what you are looking for.</Typography>
                </div>
            )}

            {/* Create Custom Property Modal */}
            <Dialog open={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
                <Typography variant="h6" className="font-bold mb-4 text-slate-800 dark:text-white">Create Custom Property</Typography>
                <div className="space-y-4">
                    <TextField 
                        label="Address" 
                        fullWidth size="small" 
                        value={createForm.address} 
                        onChange={e => setCreateForm(p => ({...p, address: e.target.value}))} 
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <TextField 
                            label="City" 
                            fullWidth size="small" 
                            value={createForm.city} 
                            onChange={e => setCreateForm(p => ({...p, city: e.target.value}))} 
                        />
                        <TextField 
                            label="State" 
                            fullWidth size="small" 
                            value={createForm.state} 
                            onChange={e => setCreateForm(p => ({...p, state: e.target.value}))} 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <TextField 
                            label="County" 
                            fullWidth size="small" 
                            value={createForm.county} 
                            onChange={e => setCreateForm(p => ({...p, county: e.target.value}))} 
                        />
                        <TextField 
                            label="Property Type" 
                            fullWidth size="small" 
                            value={createForm.property_type} 
                            onChange={e => setCreateForm(p => ({...p, property_type: e.target.value}))} 
                        />
                    </div>
                    <div>
                        <Typography variant="caption" className="font-bold text-slate-500 mb-1 block">Visibility</Typography>
                        <select
                            value={createForm.visibility}
                            onChange={e => setCreateForm(p => ({...p, visibility: e.target.value}))}
                            className="w-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 text-sm"
                        >
                            <option value="private">Private (Only my team)</option>
                            <option value="public">Public (Share with all users)</option>
                        </select>
                        {createForm.visibility === 'public' && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                                ⚠️ Public properties will be available in the global search for all platform users.
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={() => setCreateModalOpen(false)} color="inherit">Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        disabled={isSubmitting || !createForm.address}
                        className="bg-blue-600 rounded-lg shadow-none"
                        onClick={async () => {
                            setIsSubmitting(true);
                            try {
                                await ClientDataService.createCustomProperty(createForm);
                                setCreateModalOpen(false);
                                setCreateForm({ address: '', city: '', state: '', county: '', property_type: 'Residential', visibility: 'private' });
                                alert(`✅ Custom property created and saved as ${createForm.visibility}.`);
                            } catch (e: any) {
                                alert(e.message);
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Property'}
                    </Button>
                </div>
            </Dialog>
        </div>
    );
};

export default ClientProperties;
