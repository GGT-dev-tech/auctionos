import React, { useState, useEffect } from 'react';
import { AuctionService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Note {
    id: number;
    property_id: string;
    user_id: number;
    content: string;
    created_at: string;
}

interface Props {
    propertyId: string;
}

export const NotesManager: React.FC<Props> = ({ propertyId }) => {
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotes();
    }, [propertyId]);

    const loadNotes = async () => {
        try {
            const data = await AuctionService.getNotes(propertyId);
            setNotes(data);
        } catch (error) {
            console.error("Failed to load notes", error);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            setLoading(true);
            await AuctionService.createNote({ property_id: propertyId, content: newNote });
            setNewNote('');
            loadNotes();
        } catch (error) {
            console.error("Failed to add note", error);
            alert("Failed to add note");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this note?")) return;
        try {
            await AuctionService.deleteNote(id);
            loadNotes();
        } catch (error) {
            console.error("Failed to delete note", error);
            alert("Failed to delete note");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">edit_note</span>
                    Add Note
                </h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <textarea
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white p-3 focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={3}
                        placeholder="Type your note here..."
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !newNote.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                            {loading ? 'Saving...' : 'Save Note'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                {notes.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">note_stack</span>
                        <p className="text-slate-500 dark:text-slate-400">No notes yet. Be the first to add one!</p>
                    </div>
                ) : (
                    notes.map(note => {
                        const isOwner = user?.id === note.user_id; // Check ID match
                        return (
                            <div key={note.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative group hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${isOwner ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {isOwner ? 'ME' : 'U'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                                {isOwner ? 'You' : `User #${note.user_id}`}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                            title="Delete Note"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm ml-10">{note.content}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
