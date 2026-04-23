import { API_URL, getHeaders } from './httpClient';

export interface UserProperty {
  id?: string;
  user_id?: number;
  company_id?: number;
  title?: string;
  address?: string;
  state?: string;
  city?: string;
  zip_code?: string;
  property_type?: string;
  estimated_value?: number;
  rent_estimate?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const UserPropertyService = {
  getAll: async (skip = 0, limit = 100): Promise<UserProperty[]> => {
    const response = await fetch(`${API_URL}/user-properties/?skip=${skip}&limit=${limit}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  },

  create: async (data: UserProperty): Promise<UserProperty> => {
    const response = await fetch(`${API_URL}/user-properties/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create property');
    return response.json();
  },

  update: async (id: string, data: UserProperty): Promise<UserProperty> => {
    const response = await fetch(`${API_URL}/user-properties/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update property');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/user-properties/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete property');
  }
};
