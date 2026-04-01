BEGIN;  -- Inicia transação (caso dê erro, nada é aplicado)

-- =============================================
-- 1. ADICIONANDO COLUNAS NOVAS NA TABELA property_details
-- =============================================

ALTER TABLE property_details
ADD COLUMN IF NOT EXISTS attom_id                  varchar(50),
ADD COLUMN IF NOT EXISTS publishing_date           date,

-- Parcel - campos novos importantes
ADD COLUMN IF NOT EXISTS apn_unformatted           varchar(100),
ADD COLUMN IF NOT EXISTS apn_previous              varchar(100),
ADD COLUMN IF NOT EXISTS fips_code                 varchar(10),
ADD COLUMN IF NOT EXISTS county_land_use_code      varchar(50),
ADD COLUMN IF NOT EXISTS county_land_use_description varchar(255),
ADD COLUMN IF NOT EXISTS standardized_land_use_category varchar(100),
ADD COLUMN IF NOT EXISTS standardized_land_use_type varchar(100),
ADD COLUMN IF NOT EXISTS zoning                    varchar(100),
ADD COLUMN IF NOT EXISTS legal_description         text,
ADD COLUMN IF NOT EXISTS lot_number                varchar(100),
ADD COLUMN IF NOT EXISTS subdivision               varchar(255),
ADD COLUMN IF NOT EXISTS municipality              varchar(100),
ADD COLUMN IF NOT EXISTS section_township_range    varchar(100),

-- Structure - campos detalhados
ADD COLUMN IF NOT EXISTS effective_year_built      integer,
ADD COLUMN IF NOT EXISTS stories                   varchar(50),
ADD COLUMN IF NOT EXISTS rooms_count               integer,
ADD COLUMN IF NOT EXISTS partial_baths_count       integer,
ADD COLUMN IF NOT EXISTS parking_type              varchar(100),
ADD COLUMN IF NOT EXISTS parking_spaces_count      integer,
ADD COLUMN IF NOT EXISTS pool_type                 varchar(50),
ADD COLUMN IF NOT EXISTS architecture_type         varchar(100),
ADD COLUMN IF NOT EXISTS construction_type         varchar(100),
ADD COLUMN IF NOT EXISTS exterior_wall_type        varchar(100),
ADD COLUMN IF NOT EXISTS foundation_type           varchar(100),
ADD COLUMN IF NOT EXISTS roof_material_type        varchar(100),
ADD COLUMN IF NOT EXISTS roof_style_type           varchar(100),
ADD COLUMN IF NOT EXISTS heating_type              varchar(100),
ADD COLUMN IF NOT EXISTS heating_fuel_type         varchar(100),
ADD COLUMN IF NOT EXISTS air_conditioning_type     varchar(100),
ADD COLUMN IF NOT EXISTS fireplaces                varchar(20),
ADD COLUMN IF NOT EXISTS basement_type             varchar(100),
ADD COLUMN IF NOT EXISTS quality                   varchar(10),
ADD COLUMN IF NOT EXISTS condition                 varchar(100),
ADD COLUMN IF NOT EXISTS water_type                varchar(50),
ADD COLUMN IF NOT EXISTS sewer_type                varchar(50),

-- Valuation e Market Assessments
ADD COLUMN IF NOT EXISTS market_land_value         bigint,
ADD COLUMN IF NOT EXISTS market_improvement_value  bigint,
ADD COLUMN IF NOT EXISTS market_total_value        bigint,
ADD COLUMN IF NOT EXISTS proprietary_value         bigint,
ADD COLUMN IF NOT EXISTS proprietary_value_high    bigint,
ADD COLUMN IF NOT EXISTS proprietary_value_low     bigint,
ADD COLUMN IF NOT EXISTS proprietary_forecast_std_dev integer,
ADD COLUMN IF NOT EXISTS proprietary_valuation_date date,

-- Owner
ADD COLUMN IF NOT EXISTS owner_name                     varchar(255),
ADD COLUMN IF NOT EXISTS owner_second_name              varchar(255),
ADD COLUMN IF NOT EXISTS owner_formatted_street_address varchar(255),
ADD COLUMN IF NOT EXISTS owner_city                     varchar(100),
ADD COLUMN IF NOT EXISTS owner_state                    varchar(50),
ADD COLUMN IF NOT EXISTS owner_zip_code                 varchar(20),
ADD COLUMN IF NOT EXISTS owner_occupied                 varchar(20);

-- Campos complexos → JSONB (melhor prática)
ALTER TABLE property_details
ADD COLUMN IF NOT EXISTS other_areas          jsonb,
ADD COLUMN IF NOT EXISTS other_features       jsonb,
ADD COLUMN IF NOT EXISTS other_improvements   jsonb,
ADD COLUMN IF NOT EXISTS other_rooms          jsonb,
ADD COLUMN IF NOT EXISTS amenities            jsonb,
ADD COLUMN IF NOT EXISTS flooring_types       text[];

-- =============================================
-- 2. COMENTÁRIOS NAS COLUNAS (para documentação)
-- =============================================

COMMENT ON COLUMN property_details.attom_id IS 'ID único da ATTOM (metadata)';
COMMENT ON COLUMN property_details.publishing_date IS 'Data de publicação dos dados do assessor (metadata)';

COMMENT ON COLUMN property_details.apn_unformatted IS 'APN sem formatação (parcel)';
COMMENT ON COLUMN property_details.fips_code IS 'Código FIPS do condado (parcel)';
COMMENT ON COLUMN property_details.standardized_land_use_category IS 'Categoria padronizada de uso do solo (parcel)';
COMMENT ON COLUMN property_details.zoning IS 'Zoneamento municipal (parcel)';
COMMENT ON COLUMN property_details.legal_description IS 'Descrição legal completa da propriedade (parcel)';

COMMENT ON COLUMN property_details.effective_year_built IS 'Ano de reforma significativa da estrutura';
COMMENT ON COLUMN property_details.quality IS 'Qualidade da estrutura (A+ a E+)';
COMMENT ON COLUMN property_details.condition IS 'Condição atual da estrutura';

COMMENT ON COLUMN property_details.market_total_value IS 'Valor de mercado total segundo o assessor';
COMMENT ON COLUMN property_details.proprietary_value IS 'Valor proprietário calculado pelo algoritmo da ATTOM';

COMMENT ON COLUMN property_details.owner_name IS 'Nome do proprietário atual';
COMMENT ON COLUMN property_details.owner_occupied IS 'Indica se o proprietário ocupa o imóvel (YES/PROBABLE)';

COMMENT ON COLUMN property_details.other_areas IS 'Áreas adicionais dentro do imóvel (JSONB)';
COMMENT ON COLUMN property_details.other_features IS 'Características adicionais (JSONB)';
COMMENT ON COLUMN property_details.amenities IS 'Amenidades da propriedade (JSONB ou array)';

-- =============================================
-- 3. ÍNDICES ÚTEIS (performance)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_property_details_attom_id 
    ON property_details (attom_id);

CREATE INDEX IF NOT EXISTS idx_property_details_fips_code 
    ON property_details (fips_code);

CREATE INDEX IF NOT EXISTS idx_property_details_standardized_land_use 
    ON property_details (standardized_land_use_category);

CREATE INDEX IF NOT EXISTS idx_property_details_zoning 
    ON property_details (zoning);

CREATE INDEX IF NOT EXISTS idx_property_details_quality 
    ON property_details (quality);

-- Índice em GIN para buscas em JSONB (muito útil)
CREATE INDEX IF NOT EXISTS idx_property_details_amenities_gin 
    ON property_details USING GIN (amenities);

-- =============================================
-- 4. TABELA SEPARADA PARA DEEDS (Histórico de vendas)
-- =============================================

CREATE TABLE IF NOT EXISTS property_deeds (
    id                    bigserial PRIMARY KEY,
    property_id           integer NOT NULL REFERENCES property_details(id) ON DELETE CASCADE,
    attom_id              varchar(50),
    document_type         varchar(100),
    recording_date        date,
    original_contract_date date,
    sale_price            bigint,
    sale_price_description varchar(255),
    distressed_sale       boolean,
    buyer_first_name      varchar(100),
    buyer_last_name       varchar(100),
    buyer2_first_name     varchar(100),
    buyer2_last_name      varchar(100),
    seller_first_name     varchar(100),
    seller_last_name      varchar(100),
    loan_amount           bigint,
    lender_name           varchar(255),
    loan_type             varchar(100),
    loan_due_date         date,
    created_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_deeds_property_id ON property_deeds(property_id);
CREATE INDEX IF NOT EXISTS idx_property_deeds_recording_date ON property_deeds(recording_date);
CREATE INDEX IF NOT EXISTS idx_property_deeds_sale_price ON property_deeds(sale_price);

-- =============================================
-- 5. TABELA SEPARADA PARA BOUNDARY (se usar pacote Enhanced)
-- =============================================

CREATE TABLE IF NOT EXISTS property_boundary (
    id            bigserial PRIMARY KEY,
    property_id   integer NOT NULL REFERENCES property_details(id) ON DELETE CASCADE,
    attom_id      varchar(50),
    wkt           text,                    -- Well-Known Text
    geojson       jsonb,                   -- GeoJSON format
    created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_boundary_property_id ON property_boundary(property_id);

-- =============================================
-- FIM DA MIGRAÇÃO
-- =============================================

COMMIT;
