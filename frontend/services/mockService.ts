import { Property, PropertyStatus, PropertyType, FloodZone, User } from "../types";

const MOCK_USER: User = {
  id: "u1",
  name: "Alex Morgan",
  email: "admin@auctionpro.com",
  role: "Admin",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzHCmK4J45o0beR-1xxZUm2NGCGFvT0TaN2wDxCL7g2PZ1Xjc6dppgoNLRRluAVrvHNM7UE-IFhjxDvjB8WUYjOnLabDtYjatl7kMap4kLIaP-Izezc4VFHmUn6dUXgKsGqGiEQDl47eB7LLlJxl4AV8HuK2L35fZiTX7OkNMZ3dOWlHGyNfE2hHy5ifs9aVs5OHio4KxRtFsBgHhbaKsuBYUWGhCZF8UlIF9E4T15Wo8D4BuBDQofdmbBNQuv7ojpYlSQfWo9uAs",
};

const INITIAL_PROPERTIES: Property[] = [
  {
    id: "p1",
    title: "Modern Suburban Home",
    address: "1243 Maple Ave",
    city: "Springfield",
    state: "IL",
    zip: "62704",
    price: 320000,
    status: PropertyStatus.Active,
    type: PropertyType.Residential,
    imageUrl: "https://picsum.photos/id/1/400/300",
    floodZone: FloodZone.ZoneX,
    marketValue: 340000,
    startingBid: 300000,
  },
  {
    id: "p2",
    title: "Luxury Ocean Villa",
    address: "88 Ocean Drive",
    city: "Miami",
    state: "FL",
    zip: "33139",
    price: 1200000,
    status: PropertyStatus.Pending,
    type: PropertyType.Residential,
    imageUrl: "https://picsum.photos/id/2/400/300",
    floodZone: FloodZone.ZoneAE,
    marketValue: 1400000,
    startingBid: 1100000,
  },
  {
    id: "p3",
    title: "Downtown Commercial Lot",
    address: "45 Ranch Road",
    city: "Austin",
    state: "TX",
    zip: "78701",
    price: 550000,
    status: PropertyStatus.Sold,
    type: PropertyType.Commercial,
    imageUrl: "https://picsum.photos/id/3/400/300",
    floodZone: FloodZone.ZoneX,
    marketValue: 600000,
    startingBid: 500000,
  },
  {
    id: "p4",
    title: "Lakeview Cottage",
    address: "2208 Lakeview Dr",
    city: "Seattle",
    state: "WA",
    zip: "98109",
    price: 890000,
    status: PropertyStatus.Active,
    type: PropertyType.Residential,
    imageUrl: "https://picsum.photos/id/4/400/300",
    floodZone: FloodZone.ZoneAE,
    marketValue: 920000,
    startingBid: 850000,
  },
];

export const MockService = {
  login: async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          localStorage.setItem("auth_token", "mock_token_123");
          localStorage.setItem("user", JSON.stringify(MOCK_USER));
          resolve(MOCK_USER);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 800);
    });
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },

  getCurrentUser: (): User | null => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },

  getProperties: async (): Promise<Property[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve([...INITIAL_PROPERTIES]), 500);
    });
  },

  saveProperty: async (property: Partial<Property>): Promise<Property> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProp: Property = {
          ...INITIAL_PROPERTIES[0], // Fallback defaults
          ...property,
          id: Math.random().toString(36).substr(2, 9),
          imageUrl: `https://picsum.photos/400/300?random=${Math.random()}`,
        } as Property;
        INITIAL_PROPERTIES.push(newProp);
        resolve(newProp);
      }, 1000);
    });
  }
};