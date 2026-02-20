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
