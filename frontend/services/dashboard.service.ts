import { API_URL, getHeaders } from './httpClient';

export const DashboardService = {
    getInitData: async () => {
        const response = await fetch(`${API_URL}/dashboard/init`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard init data');
        return response.json();
    }
};
