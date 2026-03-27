import React, { useState } from 'react';
import { Property } from '../../types';
import { API_BASE_URL } from '../../services/httpClient';

interface Props {
    property: Property;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    onAddToList?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onUpdateNotes?: (notes: string) => void;
    onUploadAttachment?: (file: File) => void;
}

export const PropertyUserActions: React.FC<Props> = ({ 
    property,
    isFavorite,
    onToggleFavorite,
    onAddToList,
    onUpdateNotes,
    onUploadAttachment
}) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white p-6 pb-4">My Dashboard</h3>
            
            <div className="grid grid-cols-2 gap-3 px-6 mb-6">
                <button 
                    onClick={onToggleFavorite}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-1 transition-colors group ${isFavorite ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                    <span className={`material-symbols-outlined text-[24px] ${isFavorite ? 'text-red-500' : 'text-slate-400 group-hover:text-red-500'}`}>
                        {isFavorite ? 'favorite' : 'favorite_border'}
                    </span>
                    <span className={`text-sm font-semibold ${isFavorite ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {isFavorite ? 'Favorited' : 'Favorite'}
                    </span>
                </button>
                <button 
                    onClick={onAddToList}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col items-center justify-center gap-1 transition-colors group"
                >
                    <span className="material-symbols-outlined text-[24px] text-slate-400 group-hover:text-purple-500">playlist_add</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add to List</span>
                </button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-6 space-y-6">
                {/* Notes */}
                <div className="flex flex-col gap-2 relative">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">edit_note</span> My Notes
                    </span>
                    <textarea
                        className="w-full p-3 text-sm border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow min-h-[100px]"
                        placeholder="Add private Markdown notes..."
                        defaultValue={property.notes || ""}
                        onBlur={(e) => {
                            if (onUpdateNotes && e.target.value !== property.notes) {
                                onUpdateNotes(e.target.value);
                            }
                        }}
                    />
                    <p className="text-[10px] text-slate-400 italic absolute bottom-[-18px] right-1">Auto-saves on blur</p>
                </div>

                {/* Attachments */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">attach_file</span> Attachments
                        </span>
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0] && onUploadAttachment) {
                                        onUploadAttachment(e.target.files[0]);
                                    }
                                }}
                            />
                            <span className="text-xs font-semibold px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-300">
                                Upload File
                            </span>
                        </label>
                    </div>
                    
                    {property.attachments && property.attachments.length > 0 ? (
                        <div className="text-sm space-y-2 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 limit-h-40 overflow-y-auto">
                            {property.attachments.map((att: any, idx: number) => (
                                <a
                                    key={idx}
                                    href={att.file_path.startsWith('http') ? att.file_path : `${API_BASE_URL}${att.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded transition-colors group"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-blue-500">description</span>
                                    <span className="truncate flex-1">{att.filename}</span>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-4 text-sm text-slate-500 italic bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 border-dashed">
                            No files attached yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
