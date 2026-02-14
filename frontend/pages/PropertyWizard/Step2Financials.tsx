import React from 'react';
import { Property, FloodZone } from '../../types';
import { ExpenseManager } from '../../components/ExpenseManager';

interface Props {
  data: Partial<Property>;
  update: (data: Partial<Property>) => void;
}

export const Step2Financials: React.FC<Props> = ({ data, update }) => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-emerald-600">
          <span className="material-symbols-outlined">attach_money</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Valuation & Risk Assessment</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Legal & Zoning (Moved from Step 1) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">Legal & Zoning</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-slate-500">Legal Description</label>
              <textarea
                className="w-full rounded border-slate-300 text-sm p-2 h-20"
                value={data.details?.legal_description || ''}
                onChange={e => update({ details: { ...data.details, legal_description: e.target.value } })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Use Code</label>
              <input className="w-full rounded border-slate-300 text-sm"
                value={data.details?.use_code || ''}
                onChange={e => update({ details: { ...data.details, use_code: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Zoning</label>
              <input className="w-full rounded border-slate-300 text-sm"
                value={data.details?.zoning || ''}
                onChange={e => update({ details: { ...data.details, zoning: e.target.value } })} />
            </div>
          </div>
        </div>

        {/* Structure & Land */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">Structure & Land</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">Year Built</label>
              <input className="w-full rounded border-slate-300 text-sm" type="number"
                value={data.details?.year_built}
                onChange={e => update({ details: { ...data.details, year_built: parseInt(e.target.value) } })} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Stories</label>
              <input className="w-full rounded border-slate-300 text-sm" type="number"
                value={data.details?.num_stories}
                onChange={e => update({ details: { ...data.details, num_stories: parseInt(e.target.value) } })} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Units</label>
              <input className="w-full rounded border-slate-300 text-sm" type="number"
                value={data.details?.num_units}
                onChange={e => update({ details: { ...data.details, num_units: parseInt(e.target.value) } })} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Bldg SqFt</label>
              <input className="w-full rounded border-slate-300 text-sm" type="number"
                value={data.details?.building_area_sqft}
                onChange={e => update({ details: { ...data.details, building_area_sqft: parseInt(e.target.value) } })} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Lot Acres</label>
              <input className="w-full rounded border-slate-300 text-sm" type="number" step="0.01"
                value={data.details?.lot_acres}
                onChange={e => update({ details: { ...data.details, lot_acres: parseFloat(e.target.value) } })} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Style</label>
              <input className="w-full rounded border-slate-300 text-sm"
                value={data.details?.structure_style}
                onChange={e => update({ details: { ...data.details, structure_style: e.target.value } })} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Valuation & Tax */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">Valuation & Tax</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">Assessed Value</label>
              <input className="w-full rounded border-slate-300 text-sm" type="number"
                value={data.details?.assessed_value}
                onChange={e => update({ details: { ...data.details, assessed_value: parseFloat(e.target.value) } })} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Tax Amount</label>
              <input className="w-full rounded border-slate-300 text-sm" type="number"
                value={data.details?.tax_amount}
                onChange={e => update({ details: { ...data.details, tax_amount: parseFloat(e.target.value) } })} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Land Value</label>
              <input className="w-full rounded border-slate-300 text-sm" type="number"
                value={data.details?.land_value}
                onChange={e => update({ details: { ...data.details, land_value: parseFloat(e.target.value) } })} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Improv. Value</label>
              <input className="w-full rounded border-slate-300 text-sm" type="number"
                value={data.details?.improvement_value}
                onChange={e => update({ details: { ...data.details, improvement_value: parseFloat(e.target.value) } })} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox"
                checked={data.details?.homestead_exemption || false}
                onChange={e => update({ details: { ...data.details, homestead_exemption: e.target.checked } })}
              />
              <label className="text-sm text-slate-700">Homestead Exemption</label>
            </div>
          </div>
        </div>

        {/* Market Data */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">Market & Risk</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Estimated Market Value</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-500">$</span>
                <input
                  className="pl-6 w-full rounded border-slate-300 text-sm"
                  type="number"
                  value={data.details?.estimated_value || ''}
                  onChange={e => update({ details: { ...data.details, estimated_value: parseFloat(e.target.value) } })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Market Value URL</label>
              <input
                className="w-full rounded border-slate-300 text-sm"
                placeholder="https://zillow.com/..."
                value={data.details?.market_value_url || ''}
                onChange={e => update({ details: { ...data.details, market_value_url: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Starting Bid (Price)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-500">$</span>
                <input
                  className="pl-6 w-full rounded border-slate-300 text-sm"
                  type="number"
                  value={data.price || ''}
                  onChange={e => update({ price: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">FEMA Flood Zone</label>
              <input
                className="w-full rounded border-slate-300 text-sm"
                placeholder="Code (e.g. AE)"
                value={data.details?.flood_zone_code}
                onChange={e => update({ details: { ...data.details, flood_zone_code: e.target.value } })}
              />
            </div>
          </div>
        </div>

      </div>

      <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500 text-[20px]">warning</span>
          Legal Liens & Encumbrances
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Tax Lien', 'HOA Violation', 'Mortgage Arrears', "Mechanic's Lien"].map((lien) => {
            const currentTags = data.details?.legal_tags ? data.details.legal_tags.split(',') : [];
            const isChecked = currentTags.includes(lien);

            const handleToggle = () => {
              let newTags;
              if (isChecked) {
                newTags = currentTags.filter(t => t !== lien);
              } else {
                newTags = [...currentTags, lien];
              }
              update({
                details: {
                  ...data.details,
                  legal_tags: newTags.join(',')
                } as any
              });
            };

            return (
              <label key={lien} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${isChecked ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                <input
                  className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleToggle}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{lien}</p>
                  <p className="text-xs text-slate-500">Recorded on file.</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Expense Manager Section - Only visible if property ID exists */}
      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500">receipt_long</span>
          Expense Management
        </h2>

        {data.id ? (
          <ExpenseManager propertyId={data.id} />
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-800 dark:text-blue-300 text-sm">
            Please save the property draft first to start adding expenses.
          </div>
        )}
      </div>
    </div>
  );
};