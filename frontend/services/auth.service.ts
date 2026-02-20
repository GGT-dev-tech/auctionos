import { API_URL, getHeaders } from './httpClient';

export const AuthService = {
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
    }
};
