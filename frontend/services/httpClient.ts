// Use environment variable with fallback to production URL
const isProd = import.meta.env.PROD;
export const API_URL = isProd
    ? 'https://auctionos-production.up.railway.app/api/v1'
    : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1');
export const API_BASE_URL = API_URL.replace('/api/v1', '');

console.log('API Config:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_URL,
    isProd
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
