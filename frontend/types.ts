export enum PropertyStatus {
  Draft = "Draft",
  Active = "active",
  Pending = "pending",
  Sold = "sold",
  Inactive = "inactive",
}

export enum PropertyType {
  Residential = "residential",
  Commercial = "commercial",
  Land = "land",
  Industrial = "industrial",
}

export enum AuctionEventType {
  TAX_DEED = "tax_deed",
  TAX_LIEN = "tax_lien",
  FORECLOSURE = "foreclosure",
  SHERIFF_SALE = "sheriff_sale",
  REDEEMABLE_DEED = "redeemable_deed",
}

export enum FloodZone {
  ZoneX = "Zone X (Low Risk)",
  ZoneAE = "Zone AE (High Risk)",
  ZoneVE = "Zone VE (Coastal)",
  Undetermined = "Undetermined",
}

export interface AuctionDetails {
  id: number;
  property_id: string;
  auction_date: string;
  scraped_file?: string;
  status_detail?: string;
  amount?: number;
  sold_to?: string;
  auction_type?: string;
  case_number?: string;
  certificate_number?: string;
  opening_bid?: number;
  raw_text?: string;
}

export interface PropertyDetails {
  id: number;
  property_id: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lot_size?: number;
  year_built?: number;

  // Identification
  state_parcel_id?: string;
  account_number?: string;
  attom_id?: string;

  // Legal & Zoning
  use_code?: string;
  use_description?: string;
  zoning?: string;
  zoning_description?: string;
  legal_description?: string;
  subdivision?: string;

  // Structure
  num_stories?: number;
  num_units?: number;
  structure_style?: string;
  building_area_sqft?: number;

  // Land
  lot_acres?: number;

  // Valuation & Tax
  assessed_value?: number;
  land_value?: number;
  improvement_value?: number;
  tax_amount?: number;
  tax_year?: number;
  homestead_exemption?: boolean;

  // Risk
  flood_zone_code?: string;
  is_qoz?: boolean;

  estimated_value?: number;
  rental_value?: number;
  market_value_url?: string;
  legal_tags?: string; // JSON or comma-separated

  // External Links & Descriptions
  appraisal_desc?: string;
  regrid_url?: string;
  fema_url?: string;
  zillow_url?: string;
  gsi_url?: string;
  gsi_data?: string;
  market_values?: any; // JSON
  max_bid?: number;
}

export interface Media {
  id: number;
  property_id: string;
  media_type: string;
  url: string;
  is_primary: boolean;
  created_at?: string;
}

export interface Property {
  id: string;
  title: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  price?: number;
  status: PropertyStatus;
  property_type: PropertyType;
  description?: string;
  parcel_id?: string;
  created_at: string;
  updated_at: string;
  latitude?: number;
  longitude?: number;
  smart_tag?: string;
  local_id?: number;

  // ParcelFair Specific
  inventory_type?: string;
  legal_description?: string;
  owner_info?: string;
  tax_status?: string;
  next_auction_date?: string;
  amount_due?: number;
  polygon?: any; // JSON

  // Relations
  details?: PropertyDetails;
  media?: Media[];
  auction_details?: AuctionDetails;

  // Frontend specific (optional or mapped)
  imageUrl?: string;
  marketValue?: number;
  startingBid?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Agent";
  avatar: string;
  companies?: Company[];
  is_superuser?: boolean;
}

export interface Company {
  id: number;
  name: string;
  balance?: number;
}

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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface AuctionEvent {
  id: string;
  state: string;
  county: string;
  auction_type: AuctionEventType | string;
  start_date: string;
  end_date?: string;
  status: string;
  max_interest_rate?: number;
  redemption_period?: number;
  total_assets?: number;
}