import { API_URL, getHeaders } from './httpClient';

export const DashboardService = {
    getInitData: async (filters: any = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, String(value));
            }
        });

        const response = await fetch(`${API_URL}/dashboard/init?${queryParams.toString()}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard init data');
        return response.json();
    }
};
