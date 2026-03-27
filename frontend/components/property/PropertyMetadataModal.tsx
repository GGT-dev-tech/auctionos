import React from 'react';
import { Modal } from '../Modal';
import { Property } from '../../types';

interface Props {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
}

export const PropertyMetadataModal: React.FC<Props> = ({ property, isOpen, onClose }) => {
    const d = property.details || {};

    const DataRow = ({ label, value }: { label: string, value: string | number | boolean | null | undefined }) => (
        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
            <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white text-right">
                {value === true ? 'Yes' : value === false ? 'No' : value || '-'}
            </span>
        </div>
    );

    const calcEquity = () => {
        if (d.estimated_value && property.price) {
            return d.estimated_value - property.price;
        }
        return null;
    };

    const eq = calcEquity();
    const eqPerc = eq && d.estimated_value ? ((eq / d.estimated_value) * 100).toFixed(1) + '%' : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Extended Decision Metadata" size="2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Financial & Value */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">account_balance</span>
                        Value & Equity
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                        <DataRow label="Estimated Value" value={d.estimated_value ? `$${d.estimated_value.toLocaleString()}` : null} />
                        <DataRow label="Assessed Value" value={d.assessed_value ? `$${d.assessed_value.toLocaleString()}` : null} />
                        <DataRow label="Equity" value={eq ? `$${eq.toLocaleString()}` : null} />
                        <DataRow label="Equity %" value={eqPerc} />
                        <DataRow label="Estimated Rent" value={d.rental_value ? `$${d.rental_value.toLocaleString()}/mo` : null} />
                    </div>
                </div>

                {/* Property Characteristics */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">architecture</span>
                        Characteristics
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                        <DataRow label="Property Type" value={property.property_type_detail || d.use_description} />
                        <DataRow label="Land Use" value={d.use_code} />
                        <DataRow label="Square Feet" value={d.sqft || d.building_area_sqft ? `${(d.sqft || d.building_area_sqft)?.toLocaleString()} sqft` : null} />
                        <DataRow label="Lot Size" value={d.lot_size || property.lot_sqft ? `${(d.lot_size || property.lot_sqft)?.toLocaleString()} sqft` : null} />
                        <DataRow label="Year Built" value={d.year_built} />
                        <DataRow label="Stories" value={d.num_stories} />
                        <DataRow label="Units" value={d.num_units} />
                    </div>
                </div>

                {/* Ownership & Status */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">real_estate_agent</span>
                        Ownership & Sales
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                        <DataRow label="Owner Occupied" value={property.occupancy === 'Occupied' ? true : property.occupancy === 'Vacant' ? false : null} />
                        <DataRow label="Out of State Owner" value={null /* Requires logic comparing prop state to owner state */} />
                        <DataRow label="Last Sale Amount" value={d.last_sale_price ? `$${d.last_sale_price.toLocaleString()}` : null} />
                        <DataRow label="Last Sale Date" value={d.last_sale_date ? new Date(d.last_sale_date).toLocaleDateString() : null} />
                    </div>
                </div>

                {/* Legal & Status */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">gavel</span>
                        Legal & Location
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                        <DataRow label="Tax Status" value={property.tax_sale_year ? `${property.tax_sale_year} Taxes Due` : null} />
                        <DataRow label="Foreclosure Status" value={null /* From external API if available */} />
                        <DataRow label="Latitude" value={property.latitude} />
                        <DataRow label="Longitude" value={property.longitude} />
                        <DataRow label="Flood Zone" value={d.flood_zone_code} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
