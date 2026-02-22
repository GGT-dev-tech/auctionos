
import React, { useState } from 'react';
import { AdminService } from '../../services/admin.service';

const PropertyForm: React.FC<{ onSuccess?: () => void, initialData?: any }> = ({ onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        parcel_id: initialData?.parcel_id || '',
        account: initialData?.account_number || '', // Mapping from DB account_number
        acres: initialData?.lot_acres || '',        // Mapping from DB lot_acres
        amount_due: initialData?.amount_due || '',
        auction_date: initialData?.auction_date || '',
        auction_name: initialData?.auction_name || '',
        county: initialData?.county || '',
        description: initialData?.description || '',
        owner_name: initialData?.owner_name || '',
        owner_address: initialData?.owner_address || '',
        parcel_address: initialData?.address || '', // Mapping from DB address
        state_code: initialData?.state_code || '',
        tax_sale_year: initialData?.tax_year || '', // Mapping from DB tax_year
        taxes_due_auction: initialData?.taxes_due || '',
        total_value: initialData?.assessed_value || '', // Mapping from DB assessed_value
        property_category: initialData?.property_category || '',
        purchase_option_type: initialData?.purchase_option_type || '',
        map_link: initialData?.map_link || '',
        cs_number: initialData?.cs_number || '',
        parcel_code: initialData?.parcel_code || '',
        occupancy: initialData?.occupancy || '',
        land_value: initialData?.land_value || '',
        improvement_value: initialData?.improvement_value || '',
        estimated_arv: initialData?.estimated_value || '', // Mapping from DB estimated_value
        estimated_rent: initialData?.rental_value || ''    // Mapping from DB rental_value
    });
    const [status, setStatus] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Saving...');
        try {
            // Remap frontend names to backend expected keys for Update
            const payload = {
                ...formData,
                account_number: formData.account,
                lot_acres: formData.acres ? parseFloat(formData.acres) : null,
                address: formData.parcel_address,
                tax_year: formData.tax_sale_year ? parseInt(formData.tax_sale_year) : null,
                assessed_value: formData.total_value ? parseFloat(formData.total_value) : null,
                estimated_value: formData.estimated_arv ? parseFloat(formData.estimated_arv) : null,
                rental_value: formData.estimated_rent ? parseFloat(formData.estimated_rent) : null,
                land_value: formData.land_value ? parseFloat(formData.land_value) : null,
                improvement_value: formData.improvement_value ? parseFloat(formData.improvement_value) : null,
                amount_due: formData.amount_due ? parseFloat(formData.amount_due) : null,
            };

            if (initialData?.parcel_id) {
                await AdminService.updateProperty(initialData.parcel_id, payload);
                setStatus('Property updated successfully!');
            } else {
                await AdminService.createProperty(payload);
                setStatus('Property created successfully!');
                setFormData({
                    parcel_id: '', account: '', acres: '', amount_due: '', auction_date: '', auction_name: '',
                    county: '', description: '', owner_name: '', owner_address: '', parcel_address: '', state_code: '',
                    tax_sale_year: '', taxes_due_auction: '', total_value: '', property_category: '', purchase_option_type: '',
                    map_link: '', cs_number: '', parcel_code: '', occupancy: '', land_value: '', improvement_value: '',
                    estimated_arv: '', estimated_rent: ''
                });
            }
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setStatus('Error: ' + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">New Property Entry</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                    <label className="label">Parcel Number (ID) *</label>
                    <input name="parcel_id" required className="input" value={formData.parcel_id} onChange={handleChange} placeholder="e.g. 12-34-567" />
                </div>
                <div>
                    <label className="label">C/S #</label>
                    <input name="cs_number" className="input" value={formData.cs_number} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">PIN (Parcel Code)</label>
                    <input name="parcel_code" className="input" value={formData.parcel_code} onChange={handleChange} />
                </div>

                <div>
                    <label className="label">Owner Name</label>
                    <input name="owner_name" className="input" value={formData.owner_name} onChange={handleChange} />
                </div>
                <div className="md:col-span-2">
                    <label className="label">Owner Address</label>
                    <input name="owner_address" className="input" value={formData.owner_address} onChange={handleChange} />
                </div>

                <div className="md:col-span-2">
                    <label className="label">Property Address</label>
                    <input name="parcel_address" className="input" value={formData.parcel_address} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">City/County</label>
                    <input name="county" className="input" value={formData.county} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">State</label>
                    <input name="state_code" maxLength={2} className="input" value={formData.state_code} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Map Link</label>
                    <input name="map_link" className="input" value={formData.map_link} onChange={handleChange} placeholder="https://maps.google.com..." />
                </div>

                <div>
                    <label className="label">Occupancy</label>
                    <select name="occupancy" className="input" value={formData.occupancy} onChange={handleChange as any}>
                        <option value="">Select...</option>
                        <option value="occupied">Occupied</option>
                        <option value="vacant">Vacant</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </div>
                <div>
                    <label className="label">Acres</label>
                    <input name="acres" type="number" step="0.01" className="input" value={formData.acres} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Category</label>
                    <input name="property_category" className="input" value={formData.property_category} onChange={handleChange} />
                </div>

                <div className="col-span-1 md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Financials & Valuation</h4>
                </div>

                <div>
                    <label className="label">Amount Due (Opening Bid)</label>
                    <input name="amount_due" type="number" step="0.01" className="input" value={formData.amount_due} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Total Assessed Value</label>
                    <input name="total_value" type="number" step="0.01" className="input" value={formData.total_value} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Land Value</label>
                    <input name="land_value" type="number" step="0.01" className="input" value={formData.land_value} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Improvement Value</label>
                    <input name="improvement_value" type="number" step="0.01" className="input" value={formData.improvement_value} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Est. ARV</label>
                    <input name="estimated_arv" type="number" step="0.01" className="input" value={formData.estimated_arv} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Est. Rent</label>
                    <input name="estimated_rent" type="number" step="0.01" className="input" value={formData.estimated_rent} onChange={handleChange} />
                </div>

                <div className="col-span-1 md:col-span-3 border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Auction Info</h4>
                </div>

                <div>
                    <label className="label">Auction Name</label>
                    <input name="auction_name" className="input" value={formData.auction_name} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Auction Date</label>
                    <input name="auction_date" type="date" className="input" value={formData.auction_date} onChange={handleChange} />
                </div>
                <div>
                    <label className="label">Tax Sale Year</label>
                    <input name="tax_sale_year" type="number" className="input" value={formData.tax_sale_year} onChange={handleChange} />
                </div>

                <div className="md:col-span-3">
                    <label className="label">Description / Notes</label>
                    <textarea name="description" className="input h-24" value={formData.description} onChange={handleChange} />
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className={`text-sm font-medium ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{status}</div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Save Property
                </button>
            </div>

            <style>{`
                .label { display: block; font-size: 0.875rem; font-weight: 500; color: #64748b; margin-bottom: 0.25rem; }
                .input { width: 100%; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #cbd5e1; background: #f8fafc; }
                .input:focus { outline: none; border-color: #2563eb; ring: 2px solid #93c5fd; }
                @media (prefers-color-scheme: dark) {
                    .label { color: #94a3b8; }
                    .input { background: #1e293b; border-color: #334155; color: white; }
                }
            `}</style>
        </form>
    );
};

export default PropertyForm;
