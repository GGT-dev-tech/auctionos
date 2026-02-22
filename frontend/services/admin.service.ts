import { API_URL, getHeaders } from './httpClient';

export const AdminService = {
    importProperties: async (file: File): Promise<{ job_id: string, status: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_URL}/admin/import/properties`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Import failed');
        return response.json();
    },

    importAuctions: async (file: File): Promise<{ job_id: string, status: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_URL}/admin/import/auctions`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Import failed');
        return response.json();
    },

    getImportStatus: async (jobId: string): Promise<{ status: string }> => {
        const response = await fetch(`${API_URL}/admin/import/status/${jobId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to get status');
        return response.json();
    },

    updatePropertyStatus: async (parcelId: string, status: string, auctionId?: number): Promise<any> => {
        const response = await fetch(`${API_URL}/admin/properties/${parcelId}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status, auction_id: auctionId })
        });
        if (!response.ok) throw new Error('Update failed');
        return response.json();
    },

    listProperties: async (filters: any = {}): Promise<{ items: any[], total: number }> => {
        const queryParams = new URLSearchParams();
        if (filters.skip !== undefined) queryParams.append('skip', String(filters.skip));
        if (filters.limit !== undefined) queryParams.append('limit', String(filters.limit));
        if (filters.county) queryParams.append('county', filters.county);
        if (filters.state) queryParams.append('state', filters.state);
        if (filters.auction_name) queryParams.append('auction_name', filters.auction_name);

        const response = await fetch(`${API_URL}/properties/?${queryParams.toString()}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch properties');
        return response.json();
    },

    createProperty: async (data: any): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Creation failed');
        }
        return response.json();
    },

    getProperty: async (parcelId: string): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/${parcelId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch property');
        return response.json();
    },

    updateProperty: async (parcelId: string, data: any): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/${parcelId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Update failed');
        return response.json();
    },

    deleteProperty: async (parcelId: string): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/${parcelId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Delete failed');
        return response.json();
    }
};
