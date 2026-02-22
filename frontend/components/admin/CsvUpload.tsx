import React, { useState, useRef } from 'react';
import { AdminService } from '../../services/admin.service';

interface CsvUploadProps {
    type: 'properties' | 'auctions';
    onSuccess: () => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ type, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            setStatusMsg('Uploading file to server...');
            const result = type === 'properties'
                ? await AdminService.importProperties(file)
                : await AdminService.importAuctions(file);

            const jobId = result.job_id;
            setStatusMsg('File received. Worker assigned. Processing 100k+ rows may take 2-5 minutes...');

            // Poll status
            const interval = setInterval(async () => {
                try {
                    const statusRes = await AdminService.getImportStatus(jobId);

                    // If status is still 'pending' after upload, it might be waiting for worker
                    if (statusRes.status === 'pending') {
                        setStatusMsg('Worker in progress... please wait.');
                    } else {
                        setStatusMsg(statusRes.status);
                    }

                    const lowerStatus = statusRes.status.toLowerCase();
                    if (lowerStatus.includes('success') || lowerStatus.includes('error') || lowerStatus.includes('failed') || lowerStatus.includes('critical')) {
                        clearInterval(interval);
                        setLoading(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        if (lowerStatus.includes('success')) {
                            onSuccess();
                        }
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 3000); // Slightly slower polling for long jobs

        } catch (e: any) {
            console.error(e);
            setStatusMsg(`Upload failed: ${e.message}`);
            setLoading(false);
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
                    disabled={loading}
                    className="block w-full text-sm text-slate-500 dark:text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200
                        disabled:opacity-50"
                />

                {statusMsg && (
                    <div className={`text-sm ${statusMsg.toLowerCase().includes('error') || statusMsg.toLowerCase().includes('failed') ? 'text-red-600' : 'text-blue-600'} ${loading ? 'animate-pulse' : 'font-semibold'}`}>
                        {statusMsg}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CsvUpload;
