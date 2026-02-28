
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../components/admin/PropertyForm';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
} from '@mui/material';
import { ChevronLeft } from 'lucide-react';

// Custom Hook for Dirty Form Detection
function useDirtyFormWarning(isDirty: boolean) {
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Standard way to enforce standard browser dialog
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);
}

const PropertyManualEntry: React.FC = () => {
    const navigate = useNavigate();
    // You would typically manage the 'isDirty' state within your form component
    // For this example, we'll assume a state variable `isFormDirty` exists and is updated by PropertyForm
    // For now, let's mock it or assume PropertyForm will pass a prop to update it.
    // For the purpose of this instruction, we're just adding the hook definition.
    // A real implementation would involve useState and passing a setter to PropertyForm.
    const [isFormDirty, setIsFormDirty] = React.useState(false);

    useDirtyFormWarning(isFormDirty);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <button
                onClick={() => {
                    if (isFormDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                        return;
                    }
                    navigate(-1);
                }}
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
