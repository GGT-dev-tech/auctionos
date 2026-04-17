import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CompanyService, Company } from '../services/company.service';
import { AuthService } from '../services/auth.service';

interface CompanyContextType {
    companies: Company[];
    activeCompany: Company | null;
    loading: boolean;
    refresh: () => Promise<void>;
    selectCompany: (id: number) => Promise<void>;
    createCompany: (name: string, address?: string, contact?: string) => Promise<Company>;
    updateCompany: (id: number, data: Partial<Company>) => Promise<void>;
    deleteCompany: (id: number) => Promise<void>;
}

const CACHE_KEY = 'goauct_companies';

const CompanyContext = createContext<CompanyContextType | null>(null);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from cache to prevent first-render flicker
    const cached = (() => {
        try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') as Company[]; }
        catch { return [] as Company[]; }
    })();

    const [companies, setCompanies] = useState<Company[]>(cached);
    const [loading, setLoading] = useState(cached.length === 0); // Only show loading if no cached data
    const user = AuthService.getCurrentUser();

    const refresh = useCallback(async () => {
        if (!user) return;
        try {
            const data = await CompanyService.list();
            setCompanies(data);
            // Persist to localStorage to avoid next-session flicker
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
            // Keep previous data on error
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.role === 'client') {
            refresh();
        } else {
            setLoading(false);
        }
    }, [user?.id, refresh]);

    const activeCompany = companies.find(c => c.is_active) || companies[0] || null;

    const selectCompany = async (id: number) => {
        await CompanyService.selectActive(id);
        await refresh();
    };

    const createCompany = async (name: string, address?: string, contact?: string): Promise<Company> => {
        const created = await CompanyService.create({ name, address, contact });
        await refresh();
        return created;
    };

    const updateCompany = async (id: number, data: Partial<Company>) => {
        await CompanyService.update(id, data);
        await refresh();
    };

    const deleteCompany = async (id: number) => {
        await CompanyService.delete(id);
        await refresh();
    };

    return (
        <CompanyContext.Provider value={{
            companies,
            activeCompany,
            loading,
            refresh,
            selectCompany,
            createCompany,
            updateCompany,
            deleteCompany,
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = (): CompanyContextType => {
    const ctx = useContext(CompanyContext);
    if (!ctx) throw new Error('useCompany must be used within a CompanyProvider');
    return ctx;
};
