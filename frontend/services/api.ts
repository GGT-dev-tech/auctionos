import { Property } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const API_BASE_URL = API_URL.replace('/api/v1', '');

// Basic auth header helper
export const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const getMultiPartHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const AuctionService = {
    getProperties: async (filters: any = {}): Promise<Property[]> => {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v));
                    } else {
                        queryParams.append(key, String(value));
                    }
                }
            });

            const response = await fetch(`${API_URL}/properties/?${queryParams.toString()}`, {
                headers: getHeaders()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch properties');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching properties:', error);
            throw error;
        }
    },

    bulkUpdate: async (ids: string[], action: 'update_status' | 'delete', status?: string): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/bulk-update`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ids, action, status })
        });
        if (!response.ok) throw new Error('Failed to perform bulk update');
        return response.json();
    },

    getProperty: async (id: string): Promise<Property> => {
        try {
            const response = await fetch(`${API_URL}/properties/${id}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch property');
            return await response.json();
        } catch (error) {
            console.error('Error fetching property:', error);
            throw error;
        }
    },

    createProperty: async (data: Partial<Property>): Promise<Property> => {
        try {
            const response = await fetch(`${API_URL}/properties/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create property');
            return await response.json();
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    },

    updateProperty: async (id: string, data: Partial<Property>): Promise<Property> => {
        try {
            const response = await fetch(`${API_URL}/properties/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update property');
            return await response.json();
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    },

    deleteProperty: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete property');
    },

    getStats: async (): Promise<any> => {
        const response = await fetch(`${API_URL}/reports/stats`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    generateReport: async (id: string): Promise<{ url: string }> => {
        const response = await fetch(`${API_URL}/reports/${id}/pdf`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to generate report');
        return response.json();
    },

    scrape: async () => {
        try {
            const response = await fetch(`${API_URL}/ingestion/scrape`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Scrape trigger failed');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    import: async () => {
        try {
            const response = await fetch(`${API_URL}/ingestion/import`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Import trigger failed');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    login: async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_URL}/login/access-token`, {
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
    },

    geocodeAddress: async (address: string, autocomplete: boolean = false): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/properties/geocode?address=${encodeURIComponent(address)}&autocomplete=${autocomplete}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            // if autocomplete is true, we might get 404 if no results, handled by empty list usually
            // but backend returns 404 if not found and not autocomplete
            if (autocomplete && response.status === 404) return [];
            throw new Error('Geocoding failed');
        }
        return response.json();
    },

    uploadMedia: async (propertyId: string, file: File) => {
        const formData = new FormData();
        formData.append('files', file);

        const response = await fetch(`${API_URL}/media/${propertyId}/upload`, {
            method: 'POST',
            headers: getMultiPartHeaders(),
            body: formData,
        });

        if (!response.ok) throw new Error('File upload failed');
        return response.json();
    },

    uploadCSV: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/ingestion/upload-csv`, {
            method: 'POST',
            headers: getMultiPartHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'CSV upload failed');
        }
        return response.json();
    },

    getLocations: async (query: string = '') => {
        try {
            const response = await fetch(`${API_URL}/locations/?q=${query}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch locations');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    getCounties: async (stateCode: string) => {
        try {
            const response = await fetch(`${API_URL}/counties/${stateCode}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch counties');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    generateAggregateReport: async (type: string): Promise<{ url: string }> => {
        const response = await fetch(`${API_URL}/reports/summary`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to generate report');
        return response.json();
    },

    // Expenses
    getExpenses: async (propertyId: string): Promise<any[]> => {
        const response = await fetch(`${API_URL}/expenses/property/${propertyId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch expenses');
        return response.json();
    },

    createExpense: async (data: any): Promise<any> => {
        const response = await fetch(`${API_URL}/expenses/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create expense');
        return response.json();
    },

    deleteExpense: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete expense');
    },

    // Notes
    getNotes: async (propertyId: string): Promise<any[]> => {
        const response = await fetch(`${API_URL}/notes/${propertyId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch notes');
        return response.json();
    },

    createNote: async (data: { property_id: string, content: string }): Promise<any> => {
        const response = await fetch(`${API_URL}/notes/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create note');
        return response.json();
    },

    deleteNote: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete note');
    },

    exportToInventory: async (propertyId: string, data: { company_id: number, folder_id?: string, status?: string, user_notes?: string }): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/${propertyId}/export`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Export failed');
        }
        return response.json();
    },

    enrichProperty: async (id: string): Promise<Property> => {
        const response = await fetch(`${API_URL}/properties/${id}/enrich`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Enrichment failed');
        return response.json();
    },

    getPropertyReport: async (id: string): Promise<{ report_url: string }> => {
        const response = await fetch(`${API_URL}/properties/${id}/report`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch report');
        return response.json();
    },

    validateGSI: async (id: string): Promise<any> => {
        const response = await fetch(`${API_URL}/properties/${id}/validate-gsi`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('GSI Validation failed');
        return response.json();
    }
};

// --- New Interfaces ---

export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    AGENT = 'agent'
}

export interface Company {
    id: number;
    name: string;
    owner_id?: number;
    created_at?: string;
    users?: User[]; // Users linked to this company
}

export interface User {
    id: number;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    role: UserRole;
    companies?: Company[];
}

// --- New Services ---

export const CompanyService = {
    list: async (): Promise<Company[]> => {
        const response = await fetch(`${API_URL}/companies/`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch companies');
        return response.json();
    },

    create: async (data: { name: string, owner_id?: number }): Promise<Company> => {
        const response = await fetch(`${API_URL}/companies/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to create company');
        }
        return response.json();
    },

    linkUser: async (companyId: number, userId: number): Promise<Company> => {
        const response = await fetch(`${API_URL}/companies/${companyId}/link-user?user_id=${userId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to link user');
        return response.json();
    },

    update: async (id: number, data: { name?: string, owner_id?: number }): Promise<Company> => {
        const response = await fetch(`${API_URL}/companies/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to update company');
        }
        return response.json();
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/companies/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete company');
    }
};

export const DashboardService = {
    getInitData: async () => {
        const response = await fetch(`${API_URL}/dashboard/init`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard init data');
        return response.json();
    }
};

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

export const InventoryService = {
    getFolders: async (companyId?: number): Promise<any[]> => {
        const queryParams = companyId ? `?company_id=${companyId}` : '';
        const response = await fetch(`${API_URL}/inventory/folders${queryParams}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch folders');
        return response.json();
    },

    createFolder: async (name: string): Promise<any> => {
        const response = await fetch(`${API_URL}/inventory/folders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Failed to create folder');
        return response.json();
    },

    getItems: async (params: { folder_id?: string, status?: string } = {}): Promise<any[]> => {
        const queryParams = new URLSearchParams();
        if (params.folder_id) queryParams.append('folder_id', params.folder_id);
        if (params.status) queryParams.append('status', params.status);

        const response = await fetch(`${API_URL}/inventory/items?${queryParams.toString()}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch inventory items');
        return response.json();
    },

    updateItem: async (itemId: string, data: any): Promise<any> => {
        const response = await fetch(`${API_URL}/inventory/items/${itemId}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update inventory item');
        return response.json();
    },

    deleteItem: async (itemId: string): Promise<void> => {
        const response = await fetch(`${API_URL}/inventory/items/${itemId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete inventory item');
    }
};

export interface Transaction {
    id: string;
    amount: number;
    type: string;
    description: string;
    category?: string;
    created_at: string;
    property_id?: string;
}

export interface FinanceStats {
    total_balance: number;
    total_invested: number;
    total_expenses: number;
    available_limit: number;
    realized_roi: number;
}

export const FinanceService = {
    getStats: async (companyId: number): Promise<FinanceStats> => {
        const response = await fetch(`${API_URL}/finance/stats?company_id=${companyId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },
    getTransactions: async (companyId: number): Promise<Transaction[]> => {
        const response = await fetch(`${API_URL}/finance/transactions?company_id=${companyId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return response.json();
    },
    deposit: async (data: { company_id: number, amount: number, description?: string }): Promise<Transaction> => {
        const response = await fetch(`${API_URL}/finance/deposit`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Deposit failed');
        return response.json();
    }
};
