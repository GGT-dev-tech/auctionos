import { API_URL, getHeaders } from './httpClient';

export interface CustomPropertyPayload {
  parcel_id?: string;
  address?: string;
  city?: string;
  state?: string;
  county?: string;
  zip_code?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lot_size?: number;
  year_built?: number;
  owner_name?: string;
  amount_due?: number;
  assessed_value?: number;
  property_type?: string;
  occupancy?: string;
  tax_amount?: number;
  tax_year?: number;
  legal_description?: string;
  zoning?: string;
  num_units?: number;
  target_list_id?: number;
}

export const UserPropertyService = {
  getAll: async (skip = 0, limit = 100): Promise<any[]> => {
    const response = await fetch(`${API_URL}/client-data/custom-properties`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  },

  create: async (data: CustomPropertyPayload): Promise<any> => {
    const response = await fetch(`${API_URL}/client-data/custom-properties`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create custom property');
    return response.json();
  },

  // Legacy placeholders
  update: async (id: string, data: any): Promise<any> => {
    throw new Error('Not implemented for unified properties yet');
  },

  delete: async (id: string): Promise<void> => {
    throw new Error('Not implemented for unified properties yet');
  }
};
