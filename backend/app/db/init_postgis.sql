-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create properties table for GIS data
CREATE TABLE IF NOT EXISTS properties (
    parcel_id VARCHAR(50) PRIMARY KEY,
    property_data JSONB NOT NULL,  -- Stores address, owner, etc.
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,  -- SRID 4326 for WGS84
    map_snapshot_url TEXT,
    facade_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_geometry ON properties USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_properties_parcel_id ON properties (parcel_id);
