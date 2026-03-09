import { API_URL, getHeaders } from './httpClient';

export interface StateContact {
    state: string;
    url: string;
}

export const StatesService = {
    getContacts: async (): Promise<StateContact[]> => {
        try {
            const response = await fetch(`${API_URL}/states/contacts`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch state contacts');
            return response.json();
        } catch (error) {
            console.error('Error fetching state contacts:', error);
            throw error;
        }
    }
};
