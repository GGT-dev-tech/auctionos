import { API_URL, getHeaders, getMultiPartHeaders } from './httpClient';
import { PropertyDetails as Property } from '../types';

export const PropertyService = {
    getProperties: async (filters: any = {}): Promise<Property[]> => {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v));
                    } else {
                        queryParams.append(key, String(value));
                    }
                }
            });

            const response = await fetch(`${API_URL}/properties/?${queryParams.toString()}`, {
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

    getAvailabilityHistory: async (limit: number = 100): Promise<any[]> => {
        const response = await fetch(`${API_URL}/properties/availability-history?limit=${limit}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch availability history');
        return await response.json();
    },

    bulkUpdate: async (ids: string[], action: 'update_status' | 'delete', status?: string): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/bulk-update`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ids, action, status })
        });
        if (!response.ok) throw new Error('Failed to perform bulk update');
        return response.json();
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

    enrichProperty: async (id: string): Promise<Property> => {
        const response = await fetch(`${API_URL}/properties/${id}/enrich`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Enrichment failed');
        return response.json();
    },

    geocodeAddress: async (address: string, autocomplete: boolean = false): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/geocode?address=${encodeURIComponent(address)}&autocomplete=${autocomplete}`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
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

    getPropertyReport: async (propertyId: string): Promise<{ report_url: string }> => {
        const response = await fetch(`${API_URL}/properties/${propertyId}/report`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to generate report');
        return response.json();
    },

    validateGSI: async (propertyId: string): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/${propertyId}/validate-gsi`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('GSI Validation failed');
        return response.json();
    },

    toggleFavorite: async (propertyId: number): Promise<{ is_favorite: boolean }> => {
        const response = await fetch(`${API_URL}/client-data/favorites/toggle/${propertyId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to toggle favorite');
        return response.json();
    },

    getFavorites: async (): Promise<number[]> => {
        const response = await fetch(`${API_URL}/client-data/favorites`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch favorites');
        return response.json();
    },

    getAuctionRedirect: async (parcelId: string): Promise<{ url: string }> => {
        const response = await fetch(`${API_URL}/properties/${parcelId}/redirect/auction`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to get auction link');
        return response.json();
    },

    logAction: async (parcelId: string, action: string): Promise<void> => {
        const formData = new FormData();
        formData.append('action', action);
        await fetch(`${API_URL}/properties/${parcelId}/log-action`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
    }
};

export const ClientDataService = {
    getLists: async (): Promise<any[]> => {
        const response = await fetch(`${API_URL}/client-data/lists`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch lists');
        return response.json();
    },

    createList: async (name: string, tags?: string): Promise<any> => {
        const response = await fetch(`${API_URL}/client-data/lists`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, tags })
        });
        if (!response.ok) throw new Error('Failed to create list');
        return response.json();
    },

    updateList: async (id: number, data: { name?: string; tags?: string }): Promise<any> => {
        const response = await fetch(`${API_URL}/client-data/lists/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update list');
        return response.json();
    },

    deleteList: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/client-data/lists/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete list');
    },

    addPropertyToList: async (listId: number, propertyId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/client-data/lists/${listId}/properties/${propertyId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to add property to list');
    },

    addPropertyToStandardList: async (propertyId: number): Promise<any> => {
        const response = await fetch(`${API_URL}/client-data/lists/standard/add/${propertyId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to add property to standard list');
        return response.json();
    },

    removePropertyFromList: async (listId: number, propertyId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/client-data/lists/${listId}/properties/${propertyId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to remove property from list');
    },

    getBroadcastedLists: async (): Promise<any[]> => {
        const response = await fetch(`${API_URL}/client-data/broadcasted`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch broadcasted lists');
        return response.json();
    },

    importBroadcastedList: async (listId: number): Promise<any> => {
        const response = await fetch(`${API_URL}/client-data/broadcasted/${listId}/import`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to import broadcasted list');
        return response.json();
    },

    createNote: async (propertyId: number, noteText: string): Promise<any> => {
        const response = await fetch(`${API_URL}/client-data/notes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ property_id: propertyId, note_text: noteText })
        });
        if (!response.ok) throw new Error('Failed to create note');
        return response.json();
    },

    uploadAttachment: async (propertyId: number, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('property_id', propertyId.toString());
        formData.append('file', file);

        const response = await fetch(`${API_URL}/client-data/attachments`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Upload failed');
        }
        return response.json();
    },

    getListProperties: async (listId: number): Promise<any[]> => {
        const response = await fetch(`${API_URL}/client-data/lists/${listId}/properties`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch list properties');
        return response.json();
    },

    moveProperty: async (sourceListId: number, propertyId: number, targetListId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/client-data/lists/${sourceListId}/move/${propertyId}?target_list_id=${targetListId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to move property');
    }
};

export const GISService = {
    async getGeoJSON(parcelId: string): Promise<any> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/gis/${parcelId}/geojson`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch GIS data');
        }
        return response.json();
    },
    async triggerSnapshot(parcelId: string): Promise<any> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/gis/${parcelId}/snapshot`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to trigger snapshot');
        return response.json();
    }
};
