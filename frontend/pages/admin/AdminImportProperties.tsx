import React from 'react';
import CsvUpload from '../../components/admin/CsvUpload';

const AdminImportProperties: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Import Properties (CSV)</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Upload a CSV file to bulk-import property records into the system.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <CsvUpload type="properties" onSuccess={() => {}} />
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
          <div>
            <p className="font-semibold mb-1">CSV Format Requirements</p>
            <ul className="list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-300">
              <li>Required columns: <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">parcel_id, county, state</code></li>
              <li>Dates must be in YYYY-MM-DD format</li>
              <li>Numeric fields (values, amounts) must not include currency symbols</li>
              <li>Maximum file size: 50MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImportProperties;
