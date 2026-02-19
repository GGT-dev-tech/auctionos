
import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/api';

interface CsvUploadProps {
    type: 'properties' | 'auctions';
    onSuccess?: () => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ type, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus('Uploading...');
        try {
            let res;
            if (type === 'properties') {
                res = await AdminService.importProperties(file);
            } else {
                res = await AdminService.importAuctions(file);
            }
            setJobId(res.job_id);
            setStatus(`Processing (Job: ${res.job_id})...`);
        } catch (err: any) {
            setStatus('Error: ' + (err.message || 'Upload failed'));
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!jobId) return;

        const interval = setInterval(async () => {
            try {
                const res = await AdminService.getImportStatus(jobId);
                setStatus(`Status: ${res.status}`);

                if (res.status.startsWith('success') || res.status.startsWith('error')) {
                    clearInterval(interval);
                    setLoading(false);
                    if (res.status.startsWith('success') && onSuccess) {
                        onSuccess();
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [jobId, onSuccess]);

    return (
        <div className="p-4 border rounded-xl bg-white dark:bg-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Import {type === 'properties' ? 'Properties' : 'Auctions'} CSV</h3>
            <div className="flex flex-col gap-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Processing...' : 'Upload CSV'}
                </button>
                {status && (
                    <div className={`text-sm p-2 rounded ${status.startsWith('error') || status.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CsvUpload;
