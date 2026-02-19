
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../components/admin/PropertyForm';
import { ChevronLeft } from 'lucide-react';

const PropertyManualEntry: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-slate-700 mb-6 transition-colors"
            >
                <ChevronLeft size={20} />
                <span>Back</span>
            </button>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Property</h1>
                <p className="text-slate-500 dark:text-slate-400">Manually enter property details or use the value analysis tools.</p>
            </div>

            <PropertyForm onSuccess={() => navigate('/inventory')} />
        </div>
    );
};

export default PropertyManualEntry;
