import { API_URL, getHeaders } from './httpClient';

export interface CountyContact {
    name: string;
    phone: string;
    url: string;
}

class CountyService {
    async getContacts(state: string, county: string): Promise<CountyContact[]> {
        if (!state || !county) return [];

        try {
            const formattedState = encodeURIComponent(state.toLowerCase().trim());
            const formattedCounty = encodeURIComponent(county.toLowerCase().trim());

            const response = await fetch(`${API_URL}/counties/${formattedState}/${formattedCounty}/contacts`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch county contacts');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch county contacts:', error);
            return [];
        }
    }
}

export const countyService = new CountyService();
