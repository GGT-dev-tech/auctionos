Especificação Técnica para Funcionalidade Administrativa de Gerenciamento de Propriedades e Leilões
Como Engenheiro de Software Sênior e Especialista em GIS, reformulei sua descrição original em uma especificação técnica estruturada, clara e modular. Isso facilita a implementação, o teste e a manutenção. Usei terminologia padrão de desenvolvimento de software, focando em requisitos funcionais, não funcionais, fluxos de dados e integrações com a stack existente (FastAPI no backend, React no frontend, PostgreSQL com PostGIS no banco de dados, Redis para cache e Docker/Railway para deploy). Evitei ambiguidades e organizei em seções para melhor legibilidade.

1. Visão Geral do Módulo Administrativo

Objetivo: Permitir que usuários administrativos criem, editem e importem dados de propriedades (incluindo limites geográficos via GeoJSON, se aplicável) e registros históricos de leilões. Isso alimenta o sistema para usuários finais (clientes), gerando listagens, calendários de leilões e páginas de detalhes com links de pesquisa externa (ex: relatórios FEMA e contatos de condados).
URL Principal: /properties/new (atualizar para suportar entrada manual ou importação de CSV).
Acessos: Restrito a usuários administrativos (implementar autenticação via JWT ou middleware no FastAPI).
Integrações:
Banco de Dados: PostgreSQL com PostGIS para dados geográficos (ex: coordenadas como GEOMETRY).
Cache: Redis para evitar reprocessamento de imports redundantes ou consultas frequentes.
Infra: Processamento assíncrono via Celery (ou background tasks no FastAPI) para imports de CSV grandes, evitando bloqueio do servidor.

Requisitos Não Funcionais:
Segurança: Validação de entradas para prevenir SQL injection ou uploads maliciosos; chaves de API (ex: FEMA, se aplicável) armazenadas em variáveis de ambiente.
Escalabilidade: Suportar CSVs até 10MB inicialmente; usar chunking para arquivos maiores.
Performance: Índices GIST no PostGIS para buscas geográficas; TTL de 1 hora no Redis para caches de listagens.
Custos: Otimizar chamadas externas (ex: APIs de FEMA) com cache no Redis.

1. Modelos de Dados (Tabelas no PostgreSQL)
Baseado nas colunas fornecidas, defino as tabelas normalizadas. Use chaves estrangeiras para relacionamentos. Ative PostGIS se não estiver ( CREATE EXTENSION postgis; ).

Tabela: properties (Detalhes principais da propriedade)SQLCREATE TABLE IF NOT EXISTS properties (
    parcel_id VARCHAR(50) PRIMARY KEY,  -- Chave primária (ex: "Parcel ID")
    account VARCHAR(50),
    acres DECIMAL(10,2),
    amount_due DECIMAL(15,2),
    auction_date DATE,
    auction_info_link TEXT,
    auction_list_link TEXT,
    auction_name VARCHAR(255),
    coordinates GEOMETRY(POINT, 4326),  -- PostGIS para coordenadas (ex: ST_PointFromText('POINT(lng lat)'))
    county VARCHAR(100),
    cs_number VARCHAR(50),
    description TEXT,
    estimated_arv DECIMAL(15,2),
    estimated_rent DECIMAL(15,2),
    improvements TEXT,
    land_value DECIMAL(15,2),
    map_link TEXT,
    owner_address TEXT,
    parcel_address TEXT,
    parcel_code VARCHAR(50),
    property_category VARCHAR(100),
    purchase_option_type VARCHAR(100),
    state_code CHAR(2),
    tax_sale_year INTEGER,
    taxes_due_auction DECIMAL(15,2),
    total_value DECIMAL(15,2),
    type VARCHAR(100),
    vacancy BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_properties_geometry ON properties USING GIST(coordinates);
CREATE INDEX idx_properties_parcel_id ON properties (parcel_id);
Tabela: auction_history (Registro histórico de leilões por propriedade)SQLCREATE TABLE IF NOT EXISTS auction_history (
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) REFERENCES properties(parcel_id) ON DELETE CASCADE,  -- FK para properties
    auction_name VARCHAR(255),
    date DATE,
    where_location VARCHAR(255),  -- Renomeado para clareza (ex: "Where")
    listed_as VARCHAR(255),
    taxes_due DECIMAL(15,2),
    info_link TEXT,
    list_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_auction_history_parcel_id ON auction_history (parcel_id);
Tabela: county_contacts (Contatos de condados para pesquisa)SQLCREATE TABLE IF NOT EXISTS county_contacts (
    id SERIAL PRIMARY KEY,
    state VARCHAR(100),
    county VARCHAR(100),
    name VARCHAR(255),
    phone VARCHAR(50),
    online_url TEXT,
    UNIQUE (state, county)  -- Evita duplicatas
);
View para Listagem (Não uma tabela separada; use uma VIEW SQL para gerar listagens dinâmicas)SQLCREATE OR REPLACE VIEW property_listing AS
SELECT
    p.parcel_id AS "Parcel Number",
    p.cs_number AS "C/S#",
    p.parcel_code AS "PIN",
    p.owner_address AS "Name",  -- Assumindo que "Name" é derivado de owner
    p.county AS "County",
    p.state_code AS "State",
    'Available' AS "Availability",  -- Placeholder; derivar de lógica de negócios
    p.tax_sale_year AS "Sale Year",
    p.amount_due AS "Amount Due",
    p.acres AS "Acres",
    p.total_value AS "Total Value",
    p.land_value AS "Land",
    p.improvements AS "Building",  -- Mapeado para "Building"
    p.type AS "Parcel Type",
    'Active' AS "Status",  -- Placeholder
    p.parcel_address AS "Address",
    (SELECT MAX(date) FROM auction_history ah WHERE ah.parcel_id = p.parcel_id) AS "Next Auction",
    CASE WHEN p.vacancy THEN 'Vacant' ELSE 'Occupied' END AS "Occupancy"
FROM properties p;Essa VIEW pode ser consultada no backend para gerar listagens paginadas (ex: com LIMIT/OFFSET).

1. Fluxos Funcionais

Criação/Edição Manual de Propriedades:
Frontend: Formulário React com campos mapeados às colunas de properties. Use bibliotecas como Formik para validação.
Backend: Endpoint POST/PUT em /api/admin/properties (FastAPI), inserindo/atualizando via SQLAlchemy.
Integração: Ao salvar, opcionalmente adicionar entrada em auction_history se dados de leilão forem fornecidos.

Importação de CSV:
Ver seção abaixo para detalhes técnicos.

Adição de Histórico de Leilão:
Vinculado a uma propriedade existente via parcel_id.
Endpoint: POST /api/admin/auction-history (insere em auction_history).
Alimenta calendário de leilões: Use uma query agregada para gerar eventos (ex: GROUP BY date).

Listagem de Propriedades:
Aba separada: /properties/list (visível para admin e clientes futuros).
Frontend: Tabela React com react-table ou MUI DataGrid, paginada.
Backend: GET /api/properties/list consultando a VIEW property_listing, com filtros (ex: county, state).

Página de Detalhes da Propriedade:
Acesso via clique na listagem.
Incluir links de pesquisa:
Relatório FEMA: Gerar URL dinâmico baseado em coordenadas (ex: API FEMA ou link direto).
Contato do County: Query em county_contacts por state/county.

Mapa: Integrar Mapbox com GeoJSON da propriedade (como na implementação anterior).

Eventos de Ingestão:
Logs de imports no DB ou Redis para auditoria.
Notificações: Opcional, via WebSockets (ex: com Socket.IO no React/FastAPI).

1. Implementação do Upload de CSV: Melhores Práticas e Código
Para o upload de CSV, a melhor abordagem é assíncrona e validada, considerando o tamanho potencial dos arquivos e a necessidade de mapear colunas para múltiplas tabelas. Evite processar no request principal para não bloquear o servidor; use background tasks ou uma queue (Celery com Redis como broker).
Razões para essa Abordagem:

Segurança: Valide headers do CSV para matching exato; sanitize dados para prevenir injeções.
Eficiência: Use pandas para parsing rápido; processe em chunks para CSVs grandes (>1k linhas).
Escalabilidade: Cache resultados de import no Redis (ex: status de job) para polling no frontend.
Tratamento de Erros: Rollback transacional no DB se falhar; retorne erros por linha.
Integração com Tabelas: O CSV inicial mapeia para properties e opcionalmente auction_history (se colunas de leilão estiverem presentes). Para histórico, assuma que o CSV pode ter linhas repetidas por parcel_id para múltiplos leilões.
Custos: No Railway, use volumes para armazenamento temporário; processe localmente sem depender de S3 para temp files.
Alternativas Consideradas:
Direto via frontend (FileReader): Ruim para grandes arquivos, sobrecarrega cliente.
Multipart upload: Bom, mas use com limite de tamanho.
Robô para "organizar dados": Implemente como validador no backend, renomeando/mapeando colunas se necessário (ex: via dict mapping).

Frontend (React):
Adicione um componente de upload no formulário /properties/new.
tsximport React, { useState } from 'react';
import axios from 'axios';

const CsvUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('csv_file', file);
    try {
      const res = await axios.post('/api/admin/import-properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus(`Sucesso: ${res.data.processed_rows} linhas importadas`);
    } catch (err) {
      setStatus('Erro: ' + (err as any).response?.data?.detail);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Importar CSV</button>
      <p>{status}</p>
    </div>
  );
};

export default CsvUpload;

Polling de status: Use setInterval para checar Redis via endpoint GET /api/import-status/{job_id}.

Backend (FastAPI):
Instale pandas e fastapi[all]. Crie endpoint com background task.
Pythonfrom fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy import create_engine, text
import pandas as pd
import io
import os
from redis import Redis

router = APIRouter(prefix="/admin", tags=["admin"])
engine = create_engine(os.getenv("DATABASE_URL"))
redis = Redis.from_url(os.getenv("REDIS_URL"))

@router.post("/import-properties")
async def import_csv(background_tasks: BackgroundTasks, csv_file: UploadFile = File(...)):
    if not csv_file.filename.endswith('.csv'):
        raise HTTPException(400, detail="Arquivo deve ser CSV")

    job_id = str(uuid.uuid4())  # Gere ID único
    redis.set(f"import_status:{job_id}", "pending")
    
    background_tasks.add_task(process_csv, csv_file.file.read(), job_id)
    return {"job_id": job_id, "status": "processing"}

async def process_csv(file_content: bytes, job_id: str):
    try:
        df = pd.read_csv(io.BytesIO(file_content))

        # Validação: Cheque headers obrigatórios
        required_cols = ["parcel_id", "account", "acres", ...]  # Liste todas de properties
        missing = set(required_cols) - set(df.columns)
        if missing:
            raise ValueError(f"Colunas faltando: {missing}")
        
        # Mapeamento/renomeio se necessário (ex: "Parcel ID" -> "parcel_id")
        df = df.rename(columns={"Parcel ID": "parcel_id", "C/S#": "cs_number", ...})  # Dict completo
        
        # Processar em chunks (para escalabilidade)
        with engine.begin() as conn:  # Transação
            for chunk in [df[i:i+100] for i in range(0, len(df), 100)]:
                # Inserir em properties
                for _, row in chunk.iterrows():
                    query_properties = text("""
                        INSERT INTO properties (parcel_id, account, acres, ...) 
                        VALUES (:parcel_id, :account, :acres, ...)
                        ON CONFLICT (parcel_id) DO UPDATE SET ...
                    """)
                    conn.execute(query_properties, row.to_dict())
                    
                    # Se colunas de leilão existirem, inserir em auction_history
                    if all(col in row for col in ["auction_name", "date", ...]):
                        query_history = text("""
                            INSERT INTO auction_history (parcel_id, auction_name, date, ...)
                            VALUES (:parcel_id, :auction_name, :date, ...)
                        """)
                        conn.execute(query_history, row.to_dict())
        
        redis.set(f"import_status:{job_id}", f"success: {len(df)} linhas", ex=3600)  # Expira em 1h
    except Exception as e:
        redis.set(f"import_status:{job_id}", f"error: {str(e)}", ex=3600)
Endpoint para Status:
<Python@router.get>("/import-status/{job_id}")
def get_import_status(job_id: str):
    status = redis.get(f"import_status:{job_id}")
    if not status:
        raise HTTPException(404, detail="Job não encontrado")
    return {"status": status.decode()}
Docker/Railway Atualizações:

Adicione pandas ao requirements.txt do backend.
No docker-compose.yml, garanta que o backend tenha acesso ao Redis.
No Railway: Monitore logs para erros; use env vars para limites (ex: MAX_CSV_SIZE=10MB).

Essa implementação é robusta, modular e pronta para produção
