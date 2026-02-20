import { API_URL, getHeaders } from './httpClient';
import { UserRole, User } from '../types';

export const UserService = {
    list: async (): Promise<User[]> => {
        const response = await fetch(`${API_URL}/users/`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    create: async (data: { email: string, password: string, role: UserRole, company_ids?: number[] }): Promise<User> => {
        const response = await fetch(`${API_URL}/users/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to create user');
        }
        return response.json();
    },

    update: async (id: number, data: { email?: string, password?: string, role?: UserRole, company_ids?: number[], is_active?: boolean }): Promise<User> => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to update user');
        }
        return response.json();
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete user');
    }
};
