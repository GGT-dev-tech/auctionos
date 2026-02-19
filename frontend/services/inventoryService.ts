import { getHeaders, API_URL } from './api';

export interface InventoryFolder {
    id: string;
    name: string;
    parent_id?: string;
    is_system: boolean;
    company_id: number;
    children?: InventoryFolder[];
}

export interface InventoryItem {
    id: string;
    folder_id?: string;
    property_id: string;
    status: 'interested' | 'due_diligence' | 'bid_ready' | 'won' | 'lost' | 'archived';
    user_notes?: string;
    tags?: string;
    property: any; // Full Property object
}

export const InventoryService = {
    getFolders: async (): Promise<InventoryFolder[]> => {
        const res = await fetch(`${API_URL}/inventory/folders`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch folders');
        return res.json();
    },

    createFolder: async (name: string, parentId?: string): Promise<InventoryFolder> => {
        const res = await fetch(`${API_URL}/inventory/folders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, parent_id: parentId }),
        });
        if (!res.ok) throw new Error('Failed to create folder');
        return res.json();
    },

    getItems: async (folderId?: string, status?: string): Promise<InventoryItem[]> => {
        const params = new URLSearchParams();
        if (folderId) params.append('folder_id', folderId);
        if (status) params.append('status', status);

        const res = await fetch(`${API_URL}/inventory/items?${params.toString()}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
    },

    addItem: async (propertyId: string, folderId?: string): Promise<InventoryItem> => {
        const res = await fetch(`${API_URL}/inventory/items`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ property_id: propertyId, folder_id: folderId }),
        });
        if (!res.ok) throw new Error('Failed to add item');
        return res.json();
    },

    updateItem: async (itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> => {
        const res = await fetch(`${API_URL}/inventory/items/${itemId}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update item');
        return res.json();
    },

    deleteItem: async (itemId: string): Promise<void> => {
        const res = await fetch(`${API_URL}/inventory/items/${itemId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to delete item');
    },

    importParcelFairCsv: async (file: File, type: 'properties' | 'calendar'): Promise<{ stats: any }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        // Remove Content-Type so browser sets boundary
        const headers = getHeaders();
        delete (headers as any)['Content-Type'];

        const res = await fetch(`${API_URL}/properties/upload-csv`, {
            method: 'POST',
            body: formData,
            headers: headers
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to import CSV');
        }
        return res.json();
    },
};
