// Use environment variable with fallback to production URL
const PROD_API_URL = 'https://auctionos-production.up.railway.app/api/v1';
export const API_URL = import.meta.env.VITE_API_URL || PROD_API_URL;
export const API_BASE_URL = API_URL.replace('/api/v1', '');

console.log('API Config:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_URL,
    PROD_API_URL
});

export const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const getMultiPartHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};
