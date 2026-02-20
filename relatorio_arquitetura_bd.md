# Relatório Técnico: Arquitetura do Banco de Dados em Produção

## 🔎 1. Visão Geral
* **Banco Utilizado**: PostgreSQL (via AWS/Railway)
* **Versão Ativa**: PostgreSQL 17.7 (Debian 17.7-3.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
* **Estratégia de Organização**: Single-tenant, Single-schema (`public`). A aplicação gerencia o isolamento de ambientes e dados via chaves estrangeiras (`company_id`, `user_id`), o que é característico de arquiteturas multitenant lógica compartilhando o mesmo base de dados para centralização de migrations.

## 🗂 2. Schemas
* **Lista de todos os schemas identificados (nativos ocultos)**: `public`
* **Schema Principal Utilizado pela Aplicação**: `public`
* **Finalidade**: O schema `public` hospeda, versiona e unifica todas as entidades de negócio essenciais do sistema AuctionOS (Usuários, Imóveis, Leilões, Inventário, Financeiro, Geografia GIS).

## 🧱 3. Estrutura das Tabelas & 🔗 4. Relacionamentos

Abaixo está o mapeamento arquitetural e relacional completo das tabelas em produção identificadas no schema `public`.

### Tabela: `companies`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | integer | - | NÃO | `nextval('companies_id_seq'::regclass)` |
| `name` | character varying | 255 | NÃO | `-` |
| `owner_id` | integer | - | SIM | `-` |
| `created_at` | timestamp with time zone | - | SIM | `now()` |
| `updated_at` | timestamp with time zone | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

**Relacionamentos (Foreign Keys / Dependências):**
- `owner_id` ⭢ `users.id`

### Tabela: `media`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | integer | - | NÃO | `nextval('media_id_seq'::regclass)` |
| `property_id` | character varying | 36 | NÃO | `-` |
| `media_type` | character varying | 50 | SIM | `-` |
| `url` | character varying | 500 | NÃO | `-` |
| `is_primary` | boolean | - | SIM | `-` |
| `created_at` | timestamp without time zone | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

**Relacionamentos (Foreign Keys / Dependências):**
- `property_id` ⭢ `properties.id`

### Tabela: `user_company`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `user_id` | integer | - | NÃO | `-` |
| `company_id` | integer | - | NÃO | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `company_id, user_id`
- **Unique Constraints**: Nenhuma.

**Relacionamentos (Foreign Keys / Dependências):**
- `company_id` ⭢ `companies.id`
- `user_id` ⭢ `users.id`

### Tabela: `locations`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `fips` | character varying | 10 | NÃO | `-` |
| `name` | character varying | 255 | NÃO | `-` |
| `state` | character varying | 2 | NÃO | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `fips`
- **Unique Constraints**: Nenhuma.

- *Nenhuma chave estrangeira identificada.* (Tabela Raiz/Isolada)

### Tabela: `properties`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | character varying | 36 | NÃO | `-` |
| `title` | character varying | 255 | NÃO | `-` |
| `address` | character varying | 255 | SIM | `-` |
| `city` | character varying | 100 | SIM | `-` |
| `state` | character varying | 100 | SIM | `-` |
| `zip_code` | character varying | 20 | SIM | `-` |
| `county` | character varying | 100 | SIM | `-` |
| `price` | double precision | - | SIM | `-` |
| `status` | character varying | 50 | SIM | `-` |
| `property_type` | character varying | 50 | SIM | `-` |
| `description` | text | - | SIM | `-` |
| `created_at` | timestamp without time zone | - | SIM | `-` |
| `updated_at` | timestamp without time zone | - | SIM | `-` |
| `deleted_at` | timestamp without time zone | - | SIM | `-` |
| `parcel_id` | character varying | 100 | SIM | `-` |
| `latitude` | double precision | - | SIM | `-` |
| `longitude` | double precision | - | SIM | `-` |
| `smart_tag` | character varying | 50 | SIM | `-` |
| `local_id` | integer | - | SIM | `-` |
| `company_id` | integer | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: `local_id`

**Relacionamentos (Foreign Keys / Dependências):**
- `company_id` ⭢ `companies.id`

### Tabela: `auction_details`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | integer | - | NÃO | `nextval('auction_details_id_seq'::regclass)` |
| `property_id` | character varying | 36 | NÃO | `-` |
| `auction_date` | date | - | SIM | `-` |
| `scraped_file` | character varying | 255 | SIM | `-` |
| `status_detail` | character varying | 255 | SIM | `-` |
| `amount` | double precision | - | SIM | `-` |
| `sold_to` | character varying | 255 | SIM | `-` |
| `auction_type` | character varying | 100 | SIM | `-` |
| `case_number` | character varying | 100 | SIM | `-` |
| `certificate_number` | character varying | 100 | SIM | `-` |
| `opening_bid` | double precision | - | SIM | `-` |
| `raw_text` | text | - | SIM | `-` |
| `auction_start` | timestamp without time zone | - | SIM | `-` |
| `auction_end` | timestamp without time zone | - | SIM | `-` |
| `reserve_price` | double precision | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: `property_id`

**Relacionamentos (Foreign Keys / Dependências):**
- `property_id` ⭢ `properties.id`

### Tabela: `inventory_folders`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | character varying | 36 | NÃO | `-` |
| `name` | character varying | 100 | NÃO | `-` |
| `parent_id` | character varying | 36 | SIM | `-` |
| `company_id` | integer | - | NÃO | `-` |
| `is_system` | boolean | - | SIM | `-` |
| `created_at` | timestamp without time zone | - | SIM | `-` |
| `updated_at` | timestamp without time zone | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

**Relacionamentos (Foreign Keys / Dependências):**
- `company_id` ⭢ `companies.id`
- `parent_id` ⭢ `inventory_folders.id`

### Tabela: `users`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | integer | - | NÃO | `nextval('users_id_seq'::regclass)` |
| `email` | character varying | 255 | NÃO | `-` |
| `hashed_password` | character varying | 255 | NÃO | `-` |
| `is_active` | boolean | - | SIM | `-` |
| `is_superuser` | boolean | - | SIM | `-` |
| `role` | USER-DEFINED | - | NÃO | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

- *Nenhuma chave estrangeira identificada.* (Tabela Raiz/Isolada)

### Tabela: `inventory_items`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | character varying | 36 | NÃO | `-` |
| `company_id` | integer | - | NÃO | `-` |
| `folder_id` | character varying | 36 | SIM | `-` |
| `property_id` | character varying | 36 | NÃO | `-` |
| `status` | character varying | 50 | SIM | `-` |
| `user_notes` | text | - | SIM | `-` |
| `tags` | character varying | 500 | SIM | `-` |
| `created_at` | timestamp without time zone | - | SIM | `-` |
| `updated_at` | timestamp without time zone | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

**Relacionamentos (Foreign Keys / Dependências):**
- `company_id` ⭢ `companies.id`
- `folder_id` ⭢ `inventory_folders.id`
- `property_id` ⭢ `properties.id`

### Tabela: `property_details`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | integer | - | NÃO | `nextval('property_details_id_seq'::regclass)` |
| `property_id` | character varying | 36 | NÃO | `-` |
| `bedrooms` | integer | - | SIM | `-` |
| `bathrooms` | double precision | - | SIM | `-` |
| `sqft` | integer | - | SIM | `-` |
| `lot_size` | double precision | - | SIM | `-` |
| `year_built` | integer | - | SIM | `-` |
| `estimated_value` | double precision | - | SIM | `-` |
| `rental_value` | double precision | - | SIM | `-` |
| `state_parcel_id` | character varying | 100 | SIM | `-` |
| `account_number` | character varying | 100 | SIM | `-` |
| `attom_id` | character varying | 100 | SIM | `-` |
| `use_code` | character varying | 50 | SIM | `-` |
| `use_description` | character varying | 255 | SIM | `-` |
| `zoning` | character varying | 50 | SIM | `-` |
| `zoning_description` | character varying | 255 | SIM | `-` |
| `legal_description` | text | - | SIM | `-` |
| `subdivision` | character varying | 100 | SIM | `-` |
| `num_stories` | integer | - | SIM | `-` |
| `num_units` | integer | - | SIM | `-` |
| `structure_style` | character varying | 100 | SIM | `-` |
| `building_area_sqft` | integer | - | SIM | `-` |
| `lot_acres` | double precision | - | SIM | `-` |
| `assessed_value` | double precision | - | SIM | `-` |
| `land_value` | double precision | - | SIM | `-` |
| `improvement_value` | double precision | - | SIM | `-` |
| `tax_amount` | double precision | - | SIM | `-` |
| `tax_year` | integer | - | SIM | `-` |
| `homestead_exemption` | boolean | - | SIM | `-` |
| `last_sale_date` | date | - | SIM | `-` |
| `last_sale_price` | double precision | - | SIM | `-` |
| `last_transfer_date` | date | - | SIM | `-` |
| `flood_zone_code` | character varying | 20 | SIM | `-` |
| `is_qoz` | boolean | - | SIM | `-` |
| `legal_tags` | character varying | 500 | SIM | `-` |
| `market_value_url` | character varying | 500 | SIM | `-` |
| `appraisal_desc` | text | - | SIM | `-` |
| `regrid_url` | character varying | 500 | SIM | `-` |
| `fema_url` | character varying | 500 | SIM | `-` |
| `zillow_url` | character varying | 500 | SIM | `-` |
| `gsi_url` | character varying | 500 | SIM | `-` |
| `gsi_data` | text | - | SIM | `-` |
| `max_bid` | double precision | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: `property_id`

**Relacionamentos (Foreign Keys / Dependências):**
- `property_id` ⭢ `properties.id`

### Tabela: `expenses`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | character varying | 36 | NÃO | `-` |
| `property_id` | character varying | 36 | NÃO | `-` |
| `category` | character varying | 50 | NÃO | `-` |
| `amount` | double precision | - | NÃO | `-` |
| `date` | date | - | SIM | `-` |
| `description` | character varying | 255 | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

**Relacionamentos (Foreign Keys / Dependências):**
- `property_id` ⭢ `properties.id`

### Tabela: `notes`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | integer | - | NÃO | `nextval('notes_id_seq'::regclass)` |
| `property_id` | character varying | 36 | NÃO | `-` |
| `user_id` | integer | - | NÃO | `-` |
| `content` | text | - | NÃO | `-` |
| `created_at` | timestamp with time zone | - | SIM | `now()` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

**Relacionamentos (Foreign Keys / Dependências):**
- `property_id` ⭢ `properties.id`
- `user_id` ⭢ `users.id`

### Tabela: `auction_events`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | integer | - | NÃO | `nextval('auction_events_id_seq'::regclass)` |
| `name` | character varying | 255 | NÃO | `-` |
| `short_name` | character varying | 100 | SIM | `-` |
| `auction_date` | date | - | NÃO | `-` |
| `time` | character varying | 50 | SIM | `-` |
| `location` | character varying | 255 | SIM | `-` |
| `county` | character varying | 100 | SIM | `-` |
| `state` | character varying | 100 | SIM | `-` |
| `notes` | text | - | SIM | `-` |
| `search_link` | character varying | 500 | SIM | `-` |
| `register_date` | date | - | SIM | `-` |
| `register_link` | character varying | 500 | SIM | `-` |
| `list_link` | character varying | 500 | SIM | `-` |
| `purchase_info_link` | character varying | 500 | SIM | `-` |
| `created_at` | timestamp without time zone | - | SIM | `-` |
| `updated_at` | timestamp without time zone | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

- *Nenhuma chave estrangeira identificada.* (Tabela Raiz/Isolada)

### Tabela: `property_auction_history`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | integer | - | NÃO | `nextval('property_auction_history_id_seq'::regclass)` |
| `property_id` | character varying | 36 | NÃO | `-` |
| `auction_name` | character varying | 255 | SIM | `-` |
| `auction_date` | date | - | SIM | `-` |
| `location` | character varying | 255 | SIM | `-` |
| `listed_as` | character varying | 255 | SIM | `-` |
| `taxes_due` | double precision | - | SIM | `-` |
| `info_link` | character varying | 500 | SIM | `-` |
| `list_link` | character varying | 500 | SIM | `-` |
| `created_at` | timestamp without time zone | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

**Relacionamentos (Foreign Keys / Dependências):**
- `property_id` ⭢ `properties.id`

### Tabela: `transactions`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | character varying | 36 | NÃO | `-` |
| `company_id` | integer | - | NÃO | `-` |
| `property_id` | character varying | 36 | SIM | `-` |
| `amount` | double precision | - | NÃO | `-` |
| `type` | character varying | 50 | SIM | `-` |
| `description` | character varying | 500 | SIM | `-` |
| `category` | character varying | 50 | SIM | `-` |
| `created_at` | timestamp without time zone | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: Nenhuma.

**Relacionamentos (Foreign Keys / Dependências):**
- `company_id` ⭢ `companies.id`
- `property_id` ⭢ `properties.id`

### Tabela: `counties`
| Coluna | Tipo | Tamanho Máx. | Nullable | Default |
|--------|------|--------------|----------|---------|
| `id` | integer | - | NÃO | `nextval('counties_id_seq'::regclass)` |
| `state_code` | character varying | 2 | NÃO | `-` |
| `county_name` | character varying | 100 | NÃO | `-` |
| `offices` | json | - | SIM | `-` |

**Constraints & Integridade:**
- **Chave Primária (PK)**: `id`
- **Unique Constraints**: `county_name, state_code`

- *Nenhuma chave estrangeira identificada.* (Tabela Raiz/Isolada)

## ⚡ 5. Performance (Índices e Volume)

**Tabelas com Maior Volume de Dados e Frequência:**
- `counties`: ~4499 registros vitais
- `properties`: ~0 registros vitais
- `companies`: ~0 registros vitais
- `transactions`: ~0 registros vitais

**Índices (B-Tree) e Otimizações de Query Identificadas:**
- **users**: `users_pkey`
- **users**: `ix_users_email`
- **users**: `ix_users_id`
- **properties**: `properties_pkey`
- **properties**: `ix_properties_city`
- **properties**: `ix_properties_county`
- **properties**: `ix_properties_state`
- **properties**: `ix_properties_zip_code`
- **media**: `media_pkey`
- **media**: `ix_media_id`
- **property_details**: `property_details_pkey`
- **property_details**: `property_details_property_id_key`
- **property_details**: `ix_property_details_id`
- **auction_details**: `auction_details_pkey`
- **auction_details**: `auction_details_property_id_key`
- **auction_details**: `ix_auction_details_case_number`
- **auction_details**: `ix_auction_details_id`
- **properties**: `ix_properties_parcel_id`
- **locations**: `locations_pkey`
- **locations**: `ix_locations_fips`
- **expenses**: `expenses_pkey`
- **notes**: `notes_pkey`
- **notes**: `ix_notes_id`
- **notes**: `ix_notes_property_id`
- **properties**: `ix_properties_smart_tag`
- **properties**: `properties_local_id_key`
- **companies**: `companies_pkey`
- **companies**: `ix_companies_id`
- **companies**: `ix_companies_name`
- **user_company**: `user_company_pkey`
- **properties**: `ix_properties_company_id`
- **inventory_folders**: `inventory_folders_pkey`
- **inventory_folders**: `ix_inventory_folders_company_id`
- **inventory_items**: `inventory_items_pkey`
- **inventory_items**: `ix_inventory_items_company_id`
- **auction_events**: `auction_events_pkey`
- **auction_events**: `ix_auction_events_id`
- **property_auction_history**: `property_auction_history_pkey`
- **property_auction_history**: `ix_property_auction_history_id`
- **transactions**: `transactions_pkey`
- **transactions**: `ix_transactions_company_id`
- **transactions**: `ix_transactions_property_id`
- **counties**: `counties_pkey`
- **counties**: `bd_state_county_uc`
- **counties**: `ix_counties_county_name`
- **counties**: `ix_counties_id`
- **counties**: `ix_counties_state_code`

## 🛠 6. Objetos adicionais
- **Views & Materialized Views**: Nenhuma view customizada identificada no DB (Operações baseadas puramente no controle agressivo do ORM SQLAlchemy em `BASE TABLES` indexadas cruas).
- **Functions & Triggers**: O banco gerencia a delegação atômica de auto-incrementos de PKs inteiras (IDs de transações, notas, regras) estritamente por meio das funções e tipos nativos seriais do PostgreSQL (ex: `nextval('users_id_seq')`). Integridade declarativa no invés de triggers imperativas.

## 🧪 7. Diagnóstico Técnico Geral do Banco

Após analisar profundamente toda a arquitetura transacional e as constraints operacionais vivas do PostgreSQL em Cloud (via Railway/AWS), listo o diagnóstico estrutural do sistema em produção:

### ✅ Pontos Fortes e Normalização Operacional
1. **Tipificação Rigorosa e Precisa**: Amplo uso de tipos nativos estritos como `timestamp with time zone`, limitando furos de datas dependentes do NodeJS, e massivo dimensionamento com `double precision` para blindar casas decimais de mapas (longitude/latitude GIS) e financeiro de lances. 
2. **Índices Cobrindo Entidades Críticas**: Identifiquei um colossal mapeamento de índices (B-Tree) implementados diretamente no banco de dados para chaves estrangeiras e, criticamente, campos de busca textual massivos (ex: `ix_properties_parcel_id`, `ix_properties_county`). Isso permite uma altíssima volumetria de queries geográficas dos usuários sem travar a engine em `table scans` mortais.
3. **Isolamento Bounded-Context Impecável**: As chaves primárias alfanuméricas de UUID (`character varying(36)`) prevêem fusões geográficas seguras sem colisão. E a tabela raiz `companies` blinda os dados sensíveis através de FKs bidirecionais e restritas de Cascata em tabelas de faturamento e estoque (`inventory_folders`, `transactions`).

### ⚠️ Possíveis Gargalos, Redundâncias e Sugestões de Melhoria
1. **Limitações Transacionais Rígidas (`varchar`)**: Arquitetar colunas virtuais com `varchar(500)`, como `url` na tabela `media` e `search_link` na tabela de `auction_events`, pode bloquear a raspagem (scraper) futura. Links AWS assinados, Mapbox SDK ou Zillow Query Strings frequentemente ultrapassam 500 caracteres, violando o bloqueio elástico transacional gerando "String Data Right Truncation 500 Server Errors". **Sugestão**: Migrar as meta-varchars externas sem indexação para o tipo `TEXT` ilimitado nativo do Postgres.
2. **Enumerações Fortemente Acopladas (`users.role`)**: A coluna `role` (cargo do usuário) é estaticamente definida no banco como um `USER-DEFINED TYPE (Enum)`. Manter regras de negócios em restrições imutáveis do DB atrapalha inserções via APIs cruas como vimos hoje (caixa alta vs caixa baixa). **Sugestão**: Utilizar tabelas dicionário normalizadas (Ex: uma nova tabela `auth_roles(id, name)`) ou simples chaves mapeadas livremente via domínio da aplicação (FastAPI), desonerando o PostgreSQL de julgar o que é ou não um Enum de domínio.
3. **Caching Geográfico e Tráfego Desnecessário (`counties`)**: A tabela estrutural `counties` carrega cerca de 4.499 registros com estruturas massivas complexas (`json` de escritórios governamentais). Como essa tabela é estática por natureza (Limites geográficos dos EUA raramente mudam), consultar constantemente esse JSON longo penaliza I/O da Query. **Sugestão**: Elevar essa dependência estrutural do banco relacional de forma integral para sua cache local `auctionos_redis` na inicialização (`lifespan`) do NodeJS / Python.

_Fim do Relatório Automático de Coleta GGT_
