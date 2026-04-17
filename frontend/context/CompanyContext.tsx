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

const CompanyContext = createContext<CompanyContextType | null>(null);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const user = AuthService.getCurrentUser();

    const refresh = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await CompanyService.list();
            setCompanies(data);
        } catch {
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === 'client') {
            refresh();
        }
    }, [user, refresh]);

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
