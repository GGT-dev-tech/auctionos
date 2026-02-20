import React, { useState, useRef } from 'react';
import { AdminService } from '../../services/admin.service';

interface CsvUploadProps {
    type: 'properties' | 'auctions';
    onSuccess: () => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ type, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const result = type === 'properties'
                ? await AdminService.importProperties(file)
                : await AdminService.importAuctions(file);

            alert(`Import started! Job ID: ${result.job_id}`);
            onSuccess();
        } catch (e: any) {
            console.error(e);
            alert(`Import failed: ${e.message}`);
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset
            }
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">
                Upload {type === 'properties' ? 'Properties' : 'Auctions'} CSV
            </h3>

            <div className="flex flex-col gap-4">
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500 dark:text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200"
                />

                {loading && (
                    <div className="text-sm text-blue-600 animate-pulse">
                        Uploading and processing...
                    </div>
                )}
            </div>
        </div>
    );
};

export default CsvUpload;
