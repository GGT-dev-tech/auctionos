import React from 'react';
import { NotesManager } from '../../components/NotesManager';

interface Props {
    data: any;
    update?: (data: any) => void;
}

export const Step5Notes: React.FC<Props> = ({ data }) => {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                    <span className="material-symbols-outlined">edit_note</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notes & Comments</h2>
                    <p className="text-sm text-slate-500">Internal notes for team collaboration.</p>
                </div>
            </div>

            {data.id ? (
                <NotesManager propertyId={data.id} />
            ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-800 dark:text-amber-300 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span>
                    Please save the property draft first to enable notes.
                </div>
            )}
        </div>
    );
};
