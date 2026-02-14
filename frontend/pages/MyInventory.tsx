import React, { useState, useEffect } from 'react';
import { InventoryFolder, InventoryItem, InventoryService } from '../services/inventoryService';
import { Folder, FileText, ChevronRight, ChevronDown, Plus, Trash2, Tag, ExternalLink } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const MyInventory: React.FC = () => {
    const [folders, setFolders] = useState<InventoryFolder[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        fetchItems();
    }, [selectedFolderId]);

    const fetchFolders = async () => {
        try {
            const data = await InventoryService.getFolders();
            setFolders(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            // If no folder selected, maybe show 'Inbox' or all? 
            // For now, let's treat undefined as 'All' or 'Unsorted' depending on requirement.
            // Let's implement 'Inbox' behavior: items with null folder_id.
            // But for "All Items" view, we might need a specific flag.
            // Let's assume root view shows everything or just Inbox.
            // We will request items for the specific folder.
            const data = await InventoryService.getItems(selectedFolderId);
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        try {
            await InventoryService.createFolder(newFolderName);
            setNewFolderName('');
            setShowNewFolderInput(false);
            fetchFolders();
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (itemId: string, newStatus: string) => {
        try {
            const updated = await InventoryService.updateItem(itemId, { status: newStatus as any });
            setItems(items.map(i => i.id === itemId ? updated : i));
            if (selectedItem?.id === itemId) setSelectedItem(updated);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (source.droppableId === destination.droppableId) return;

        // Moving between folders (Sidebar drop) or reordering (not implemented yet)
        // Assuming destination.droppableId is the folder ID

        // NOTE: react-beautiful-dnd is tricky with nested lists. 
        // Implementing drag-to-folder in sidebar is complex.
        // For MVP phase 5, we might skip DND if it complicates the code too much without a library like dnd-kit or react-dnd.
        // However, I will implement a rudimentary drag-to-card status change if possible, or just standard list for now.

        console.log('Drag ended', result);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 border-t border-gray-200">
            {/* 1. Sidebar: Folders */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Folders</span>
                    <button onClick={() => setShowNewFolderInput(!showNewFolderInput)} className="p-1 hover:bg-gray-200 rounded">
                        <Plus size={16} />
                    </button>
                </div>

                {showNewFolderInput && (
                    <form onSubmit={handleCreateFolder} className="p-2">
                        <input
                            autoFocus
                            type="text"
                            className="w-full border rounded px-2 py-1 text-sm"
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onBlur={() => setShowNewFolderInput(false)}
                        />
                    </form>
                )}

                <div className="flex-1 overflow-y-auto py-2">
                    <div
                        className={`px-4 py-2 cursor-pointer flex items-center text-sm ${!selectedFolderId ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setSelectedFolderId(undefined)}
                    >
                        <Folder size={16} className="mr-2" />
                        <span>Inbox / Unsorted</span>
                    </div>
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            className={`px-4 py-2 cursor-pointer flex items-center text-sm ${selectedFolderId === folder.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setSelectedFolderId(folder.id)}
                        >
                            <Folder size={16} className="mr-2" />
                            <span>{folder.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Middle Pane: Item List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-800">
                        {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : "Inbox"}
                    </h2>
                    <p className="text-xs text-gray-500">{items.length} items</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-4 text-center text-gray-400">Loading...</div> : (
                        items.map(item => (
                            <div
                                key={item.id}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedItem?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                onClick={() => setSelectedItem(item)}
                            >
                                <h3 className="font-medium text-gray-800 text-sm truncate">{item.property.address}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                        {item.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.property.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    {items.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-400 text-sm">No items in this folder</div>
                    )}
                </div>
            </div>

            {/* 3. Right Pane: Detail View */}
            <div className="flex-1 bg-white flex flex-col overflow-y-auto">
                {selectedItem ? (
                    <div className="p-8 max-w-3xl mx-auto w-full">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedItem.property.address}</h1>
                                <p className="text-gray-500">{selectedItem.property.city}, {selectedItem.property.state} {selectedItem.property.zip_code}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${selectedItem.status === 'won' ? 'bg-green-100 text-green-800 border-green-200' :
                                selectedItem.status === 'lost' ? 'bg-red-100 text-red-800 border-red-200' :
                                    'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>
                                {selectedItem.status.toUpperCase().replace('_', ' ')}
                            </span>
                        </div>

                        {/* Quick Actions / Status Update */}
                        <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">My Status</label>
                            <div className="flex gap-2 flex-wrap">
                                {['interested', 'due_diligence', 'bid_ready', 'won', 'lost', 'archived'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(selectedItem.id, s)}
                                        className={`px-3 py-1 text-sm rounded border ${selectedItem.status === s
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                    <FileText size={16} className="mr-2" /> Notes
                                </h3>
                                <textarea
                                    className="w-full h-40 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add your personal notes here..."
                                    value={selectedItem.user_notes || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedItem({ ...selectedItem, user_notes: val });
                                    }}
                                    onBlur={(e) => {
                                        // Save on blur
                                        if (e.target.value !== selectedItem.property.user_notes) {
                                            handleStatusChange(selectedItem.id, selectedItem.status); // Hack to trigger save, should split update function
                                            InventoryService.updateItem(selectedItem.id, { user_notes: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Property Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">List Price</span>
                                        <span className="font-medium">${selectedItem.property.price?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Est. Value</span>
                                        <span className="font-medium">${selectedItem.property.details?.zillow_estimate?.toLocaleString() || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Beds / Baths</span>
                                        <span className="font-medium">{selectedItem.property.beds || '-'} / {selectedItem.property.baths || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">SqFt</span>
                                        <span className="font-medium">{selectedItem.property.sqft?.toLocaleString() || '-'}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <a
                                            href={`#/properties/${selectedItem.property_id}/edit`}
                                            className="text-blue-600 hover:underline flex items-center"
                                        >
                                            View Full Property <ExternalLink size={12} className="ml-1" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={48} className="mb-4 text-gray-200" />
                        <p>Select an item to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyInventory;
