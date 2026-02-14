import { Property } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const API_BASE_URL = API_URL.replace('/api/v1', '');

// Basic auth header helper
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const getMultiPartHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const AuctionService = {
    getProperties: async (): Promise<Property[]> => {
        try {
            const response = await fetch(`${API_URL}/properties/`, {
                headers: getHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch properties');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching properties:', error);
            throw error;
        }
    },

    getProperty: async (id: string): Promise<Property> => {
        try {
            const response = await fetch(`${API_URL}/properties/${id}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch property');
            return await response.json();
        } catch (error) {
            console.error('Error fetching property:', error);
            throw error;
        }
    },

    createProperty: async (data: Partial<Property>): Promise<Property> => {
        try {
            const response = await fetch(`${API_URL}/properties/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create property');
            return await response.json();
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    },

    updateProperty: async (id: string, data: Partial<Property>): Promise<Property> => {
        try {
            const response = await fetch(`${API_URL}/properties/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update property');
            return await response.json();
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    },

    deleteProperty: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete property');
    },

    getStats: async (): Promise<any> => {
        const response = await fetch(`${API_URL}/reports/stats`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    generateReport: async (id: string): Promise<{ url: string }> => {
        const response = await fetch(`${API_URL}/reports/${id}/pdf`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to generate report');
        return response.json();
    },

    scrape: async () => {
        try {
            const response = await fetch(`${API_URL}/ingestion/scrape`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Scrape trigger failed');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    import: async () => {
        try {
            const response = await fetch(`${API_URL}/ingestion/import`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Import trigger failed');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    login: async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_URL}/auth/login/access-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    },

    getMe: async () => {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch user profile');
        return response.json();
    },

    getCurrentUser: () => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/#/login';
    },

    geocodeAddress: async (address: string, autocomplete: boolean = false): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/properties/geocode?address=${encodeURIComponent(address)}&autocomplete=${autocomplete}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            // if autocomplete is true, we might get 404 if no results, handled by empty list usually
            // but backend returns 404 if not found and not autocomplete
            if (autocomplete && response.status === 404) return [];
            throw new Error('Geocoding failed');
        }
        return response.json();
    },

    uploadMedia: async (propertyId: string, file: File) => {
        const formData = new FormData();
        formData.append('files', file);

        const response = await fetch(`${API_URL}/media/${propertyId}/upload`, {
            method: 'POST',
            headers: getMultiPartHeaders(),
            body: formData,
        });

        if (!response.ok) throw new Error('File upload failed');
        return response.json();
    },

    uploadCSV: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/ingestion/upload-csv`, {
            method: 'POST',
            headers: getMultiPartHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'CSV upload failed');
        }
        return response.json();
    },

    getLocations: async (query: string = '') => {
        try {
            const response = await fetch(`${API_URL}/locations/?q=${query}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch locations');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    getCounties: async (stateCode: string) => {
        try {
            const response = await fetch(`${API_URL}/counties/${stateCode}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch counties');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    generateAggregateReport: async (type: string): Promise<{ url: string }> => {
        const response = await fetch(`${API_URL}/reports/summary`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to generate report');
        return response.json();
    },

    // Expenses
    getExpenses: async (propertyId: string): Promise<any[]> => {
        const response = await fetch(`${API_URL}/expenses/property/${propertyId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch expenses');
        return response.json();
    },

    createExpense: async (data: any): Promise<any> => {
        const response = await fetch(`${API_URL}/expenses/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create expense');
        return response.json();
    },

    deleteExpense: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete expense');
    },

    // Notes
    getNotes: async (propertyId: string): Promise<any[]> => {
        const response = await fetch(`${API_URL}/notes/${propertyId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch notes');
        return response.json();
    },

    createNote: async (data: { property_id: string, content: string }): Promise<any> => {
        const response = await fetch(`${API_URL}/notes/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create note');
        return response.json();
    },

    deleteNote: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete note');
    }
};
