// Core Enums
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent'
}

// Minimal Users
export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  role: UserRole;
  avatar?: string;
  name?: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}

// Auction Event
export interface AuctionEvent {
  id: number;
  name: string;
  short_name?: string;
  auction_date: string;
  time?: string;
  location?: string;
  county?: string;
  state?: string;
  notes?: string;
  search_link?: string;
  register_date?: string;
  register_link?: string;
  list_link?: string;
  purchase_info_link?: string;
  properties_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Property Auction History
export interface PropertyAuctionHistory {
  id: number;
  property_id: string;
  auction_name?: string;
  auction_date?: string;
  location?: string;
  listed_as?: string;
  taxes_due?: number;
  info_link?: string;
  list_link?: string;
  created_at?: string;
}

// Property Main Model
export interface Property {
  id: string | number;
  parcel_id?: string;
  title: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status: string;
  smart_tag?: string;
  price?: number;
  amount_due?: number;
  occupancy?: string;
  owner_name?: string;
  owner_address?: string;
  tax_sale_year?: number;
  cs_number?: string;
  parcel_code?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  auction_id?: number | null;
  details?: PropertyDetails;
  media?: any[];
  auction_history?: PropertyAuctionHistory[];
}

// Property Details
export interface PropertyDetails {
  id: number;
  property_id: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lot_size?: number;
  year_built?: number;

  estimated_value?: number;
  rental_value?: number;

  state_parcel_id?: string;
  account_number?: string;
  attom_id?: string;

  use_code?: string;
  use_description?: string;
  zoning?: string;
  zoning_description?: string;
  legal_description?: string;
  subdivision?: string;

  num_stories?: number;
  num_units?: number;
  structure_style?: string;
  building_area_sqft?: number;

  lot_acres?: number;

  assessed_value?: number;
  land_value?: number;
  improvement_value?: number;
  tax_amount?: number;
  tax_year?: number;
  homestead_exemption?: boolean;

  last_sale_date?: string;
  last_sale_price?: number;
  last_transfer_date?: string;

  flood_zone_code?: string;
  is_qoz?: boolean;

  legal_tags?: string;
  market_value_url?: string;
  appraisal_desc?: string;
  regrid_url?: string;
  fema_url?: string;
  zillow_url?: string;
  gsi_url?: string;
  gsi_data?: string;
  max_bid?: number;
}