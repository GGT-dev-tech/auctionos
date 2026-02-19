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

export enum FloodZone {
  ZoneX = "Zone X (Low Risk)",
  ZoneAE = "Zone AE (High Risk)",
  ZoneVE = "Zone VE (Coastal)",
  Undetermined = "Undetermined",
}

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
  max_bid?: number;

  // Phase 4 additions
  estimated_arv?: number;
  estimated_rent?: number;
  purchase_option_type?: string;
  auction_event_id?: number;
  auction_event?: AuctionEvent;
  total_market_value?: number;
  property_category?: string;
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

  // Relations
  details?: PropertyDetails;
  media?: Media[];
  auction_details?: AuctionDetails;
  auction_history?: PropertyAuctionHistory[];

  // Phase 4 New Fields
  owner_name?: string;
  owner_address?: string;
  amount_due?: number;
  next_auction_date?: string;
  occupancy?: string;
  tax_sale_year?: number;
  cs_number?: string;
  parcel_code?: string;
  map_link?: string;

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