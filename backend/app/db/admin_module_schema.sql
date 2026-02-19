-- Admin Module Schema Extensions

-- 1. Updates to 'properties' table
-- Adding new columns as per spec. 
-- Note: 'geometry' already exists from init_postgis.sql.
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS account VARCHAR(50),
ADD COLUMN IF NOT EXISTS acres DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS amount_due DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS auction_date DATE,
ADD COLUMN IF NOT EXISTS auction_info_link TEXT,
ADD COLUMN IF NOT EXISTS auction_list_link TEXT,
ADD COLUMN IF NOT EXISTS auction_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS county VARCHAR(100),
ADD COLUMN IF NOT EXISTS cs_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS estimated_arv DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS estimated_rent DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS improvements TEXT,
ADD COLUMN IF NOT EXISTS land_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS map_link TEXT,
ADD COLUMN IF NOT EXISTS owner_address TEXT,
ADD COLUMN IF NOT EXISTS parcel_address TEXT,
ADD COLUMN IF NOT EXISTS parcel_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS property_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS purchase_option_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS state_code CHAR(2),
ADD COLUMN IF NOT EXISTS tax_sale_year INTEGER,
ADD COLUMN IF NOT EXISTS taxes_due_auction DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS total_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS type VARCHAR(100),
ADD COLUMN IF NOT EXISTS vacancy BOOLEAN,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'redeemed', 'pending_auction', 'auctioned')),
ADD COLUMN IF NOT EXISTS last_updated_by_user_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);

-- 2. Auctions Table
CREATE TABLE IF NOT EXISTS auctions (
    id SERIAL PRIMARY KEY,
    search_link TEXT,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    tax_status VARCHAR(100),
    parcels INTEGER,
    county_code VARCHAR(50),
    county_name VARCHAR(100),
    state CHAR(2),
    auction_date DATE NOT NULL,
    time TIME,
    location TEXT,
    notes TEXT,
    register_date DATE,
    register_link TEXT,
    list_link TEXT,
    purchase_info_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auctions_date ON auctions (auction_date);
CREATE INDEX IF NOT EXISTS idx_auctions_county ON auctions (county_code);

-- 3. Property <-> Auction Links (Many-to-Many)
CREATE TABLE IF NOT EXISTS property_auction_links (
    id SERIAL PRIMARY KEY,
    property_parcel_id VARCHAR(50) REFERENCES properties(parcel_id) ON DELETE CASCADE,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
    link_status VARCHAR(50) DEFAULT 'pending' CHECK (link_status IN ('pending', 'sold', 'redeemed', 'auctioned')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (property_parcel_id, auction_id)
);

CREATE INDEX IF NOT EXISTS idx_property_auction_links_property ON property_auction_links (property_parcel_id);
CREATE INDEX IF NOT EXISTS idx_property_auction_links_auction ON property_auction_links (auction_id);

-- 4. Auction History
CREATE TABLE IF NOT EXISTS auction_history (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) REFERENCES properties(parcel_id) ON DELETE CASCADE,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE SET NULL, -- Link to main auction table if exists
    auction_name VARCHAR(255), -- Fallback if not linked
    date DATE,
    where_location VARCHAR(255),
    listed_as VARCHAR(255),
    taxes_due DECIMAL(15,2),
    info_link TEXT,
    list_link TEXT,
    status_update VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auction_history_parcel_id ON auction_history (parcel_id);

-- 5. County Contacts
CREATE TABLE IF NOT EXISTS county_contacts (
    id SERIAL PRIMARY KEY,
    state VARCHAR(100),
    county VARCHAR(100),
    name VARCHAR(255),
    phone VARCHAR(50),
    online_url TEXT,
    UNIQUE (state, county)
);

-- 6. Views

-- Auction Calendar View
CREATE OR REPLACE VIEW auction_calendar AS
SELECT
    a.id AS auction_id,
    a.name AS event_title,
    a.auction_date AS event_date,
    a.time AS event_time,
    a.location AS event_location,
    a.notes AS event_notes,
    COUNT(pal.id) AS property_count,
    STRING_AGG(p.parcel_id, ', ') AS linked_properties,
    (SELECT STRING_AGG(status, ', ') FROM property_auction_links WHERE auction_id = a.id) AS statuses
FROM auctions a
LEFT JOIN property_auction_links pal ON pal.auction_id = a.id
LEFT JOIN properties p ON p.parcel_id = pal.property_parcel_id
GROUP BY a.id
ORDER BY a.auction_date ASC;

-- Property Listing View
CREATE OR REPLACE VIEW property_listing AS
SELECT
    p.parcel_id AS "Parcel Number",
    p.cs_number AS "C/S#",
    p.parcel_code AS "PIN",
    p.owner_address AS "Name",
    p.county AS "County",
    p.state_code AS "State",
    CASE WHEN p.status IS NULL THEN 'Available' ELSE p.status END AS "Availability",
    p.tax_sale_year AS "Sale Year",
    p.amount_due AS "Amount Due",
    p.acres AS "Acres",
    p.total_value AS "Total Value",
    p.land_value AS "Land",
    p.improvements AS "Building",
    p.type AS "Parcel Type",
    p.status AS "Status",
    p.parcel_address AS "Address",
    (SELECT MAX(date) FROM auction_history ah WHERE ah.parcel_id = p.parcel_id) AS "Next Auction",
    CASE WHEN p.vacancy THEN 'Vacant' ELSE 'Occupied' END AS "Occupancy"
FROM properties p;
