import { API_URL, getHeaders } from './httpClient';
import { AuctionEvent } from '../types';

export const AuctionService = {
    getAuctionEvents: async (): Promise<AuctionEvent[]> => {
        const response = await fetch(`${API_URL}/auctions/`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch auction events');
        return response.json();
    },

    createAuctionEvent: async (data: Partial<AuctionEvent>): Promise<AuctionEvent> => {
        const response = await fetch(`${API_URL}/auctions/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create auction event');
        return response.json();
    },

    updateAuctionEvent: async (id: number, data: Partial<AuctionEvent>): Promise<AuctionEvent> => {
        const response = await fetch(`${API_URL}/auctions/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update auction event');
        return response.json();
    },

    deleteAuctionEvent: async (id: number) => {
        const response = await fetch(`${API_URL}/auctions/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete auction');
        return true;
    },

    getCounties: async (stateCode: string): Promise<any> => {
        const response = await fetch(`${API_URL}/auctions/counties?state=${stateCode}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch counties');
        return response.json();
    },

    getCalendarEvents: async (): Promise<any[]> => {
        const response = await fetch(`${API_URL}/auctions/calendar`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch calendar');
        return response.json();
    }
};
