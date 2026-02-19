Especificação Técnica para Integração da Gestão de Leilões ao Sistema de Propriedades
Como Engenheiro de Software Sênior e Especialista em GIS, elaborei uma especificação técnica detalhada para integrar a nova feature de gestão de leilões (auctions) ao módulo administrativo de propriedades existente. Essa integração mantém a stack atual (FastAPI backend, React frontend, PostgreSQL com PostGIS, Redis cache, Docker/Railway deploy), adicionando relacionamentos entre entidades para rastreamento de status, histórico e calendários. Foco em normalização de dados, processamento assíncrono para escalabilidade, validação de segurança e otimização de performance.
A integração considera:

Dados Fornecidos pelo Usuário: Todos os dados de leilões e atualizações de status são inseridos manualmente ou via CSV, sem automação externa inicial.
Controle de Status: Adição de um enum para status de propriedades (ex: 'available', 'sold', 'redeemed', 'pending_auction').
Histórico e Vinculação: Registros históricos em tabelas dedicadas; leilões vinculam múltiplas propriedades via tabela de junção.
Calendário: Gerado dinamicamente via queries SQL, alimentando um componente React (ex: FullCalendar) no frontend para visualização de eventos por data.
Eventos de Sistema: Criação de eventos como anúncio de leilão, vinculação de propriedades e atualizações propagadas para histórico.
Requisitos Não Funcionais:
Segurança: Autenticação JWT para endpoints admin; validação de CSVs contra schemas.
Escalabilidade: Tasks background para imports; índices para queries frequentes.
Performance: Cache de listagens/calendários no Redis (TTL 30min).
Custos: Minimizar queries desnecessárias; usar views SQL para agregações.

1. Atualizações nos Modelos de Dados (PostgreSQL)
Expando as tabelas existentes para suportar leilões, status e histórico. Adicione um campo status em properties e novas tabelas para leilões e vinculações.

Atualização em properties (Adicionar status e timestamps para rastreamento):SQLALTER TABLE properties
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'redeemed', 'pending_auction', 'auctioned')),
ADD COLUMN IF NOT EXISTS last_updated_by_user_id INTEGER;  -- FK para users, se autenticado
CREATE INDEX idx_properties_status ON properties (status);
Nova Tabela: auctions (Detalhes de leilões, baseado nas colunas fornecidas):SQLCREATE TABLE IF NOT EXISTS auctions (
    id SERIAL PRIMARY KEY,
    search_link TEXT,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    tax_status VARCHAR(100),
    parcels INTEGER,  -- Número estimado de parcels/propriedades
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
CREATE INDEX idx_auctions_date ON auctions (auction_date);
CREATE INDEX idx_auctions_county ON auctions (county_code);
Nova Tabela: property_auction_links (Junção muitos-para-muitos entre properties e auctions, com histórico de status por leilão):SQLCREATE TABLE IF NOT EXISTS property_auction_links (
    id SERIAL PRIMARY KEY,
    property_parcel_id VARCHAR(50) REFERENCES properties(parcel_id) ON DELETE CASCADE,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
    link_status VARCHAR(50) DEFAULT 'pending' CHECK (link_status IN ('pending', 'sold', 'redeemed', 'auctioned')),  -- Status específico por leilão
    notes TEXT,  -- Notas sobre o vínculo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (property_parcel_id, auction_id)  -- Evita duplicatas
);
CREATE INDEX idx_property_auction_links_property ON property_auction_links (property_parcel_id);
CREATE INDEX idx_property_auction_links_auction ON property_auction_links (auction_id);
Atualização em auction_history (Expansão para incluir auction_id e status updates):SQLALTER TABLE auction_history
ADD COLUMN IF NOT EXISTS auction_id INTEGER REFERENCES auctions(id),
ADD COLUMN IF NOT EXISTS status_update VARCHAR(50);  -- Registro de mudanças de status
View para Calendário de Leilões (Agregação dinâmica para frontend):SQLCREATE OR REPLACE VIEW auction_calendar AS
SELECT
    a.id AS auction_id,
    a.name AS event_title,
    a.auction_date AS event_date,
    a.time AS event_time,
    a.location AS event_location,
    a.notes AS event_notes,
    COUNT(pal.id) AS property_count,
    STRING_AGG(p.parcel_id, ', ') AS linked_properties,  -- Lista de parcels vinculados
    (SELECT STRING_AGG(status, ', ') FROM property_auction_links WHERE auction_id = a.id) AS statuses
FROM auctions a
LEFT JOIN property_auction_links pal ON pal.auction_id = a.id
LEFT JOIN properties p ON p.parcel_id = pal.property_parcel_id
GROUP BY a.id
ORDER BY a.auction_date ASC;Essa view alimenta o calendário, permitindo queries como SELECT * FROM auction_calendar WHERE auction_date >= CURRENT_DATE;.

1. Fluxos Funcionais para Gestão de Leilões

Criação/Edição Manual de Leilões:
Frontend: Formulário React em nova aba /auctions/new (similar a /properties/new), com campos mapeados às colunas de auctions. Use Formik para validação e dropdown para vincular propriedades existentes.
Backend: Endpoints POST/PUT /api/admin/auctions (FastAPI), inserindo em auctions e opcionalmente em property_auction_links.
Vinculação: Ao salvar, permita seleção de parcel_ids para criar entradas em property_auction_links, atualizando properties.status (ex: de 'available' para 'pending_auction') via trigger SQL ou lógica no código.

Importação de CSV para Leilões:
Similar ao import de propriedades, mas com mapeamento para auctions e vinculações.
Frontend: Componente de upload em /auctions/new, enviando multipart para backend.
Backend: Endpoint POST /api/admin/import-auctions, usando pandas para parsing e inserção transacional.Pythonfrom fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
import pandas as pd
import io
import uuid
from sqlalchemy import create_engine, text
from redis import Redis

router = APIRouter(prefix="/admin", tags=["admin"])
engine = create_engine(os.getenv("DATABASE_URL"))
redis = Redis.from_url(os.getenv("REDIS_URL"))

@router.post("/import-auctions")
async def import_auctions_csv(background_tasks: BackgroundTasks, csv_file: UploadFile = File(...)):
    if not csv_file.filename.endswith('.csv'):
        raise HTTPException(400, detail="Arquivo deve ser CSV")

    job_id = str(uuid.uuid4())
    redis.set(f"import_auctions_status:{job_id}", "pending")
    
    background_tasks.add_task(process_auctions_csv, csv_file.file.read(), job_id)
    return {"job_id": job_id, "status": "processing"}

async def process_auctions_csv(file_content: bytes, job_id: str):
    try:
        df = pd.read_csv(io.BytesIO(file_content))

        # Validação e mapeamento (ex: "Search Link" -> "search_link")
        required_cols = ["search_link", "name", "short_name", ...]  # Todas as colunas
        df = df.rename(columns={"Search Link": "search_link", "Auction Date": "auction_date", ...})
        
        with engine.begin() as conn:
            for _, row in df.iterrows():
                # Inserir auction
                query_auction = text("""
                    INSERT INTO auctions (search_link, name, short_name, ...)
                    VALUES (:search_link, :name, :short_name, ...)
                    RETURNING id
                """)
                auction_id = conn.execute(query_auction, row.to_dict()).scalar()
                
                # Se houver parcels (ex: coluna "Parcels" como lista comma-separated), vincular
                if 'parcels' in row and pd.notna(row['parcels']):
                    for parcel_id in str(row['parcels']).split(','):
                        query_link = text("""
                            INSERT INTO property_auction_links (property_parcel_id, auction_id)
                            VALUES (:parcel_id, :auction_id)
                            ON CONFLICT DO NOTHING
                        """)
                        conn.execute(query_link, {"parcel_id": parcel_id.strip(), "auction_id": auction_id})
                        
                        # Atualizar status da property
                        update_status = text("UPDATE properties SET status = 'pending_auction' WHERE parcel_id = :parcel_id")
                        conn.execute(update_status, {"parcel_id": parcel_id.strip()})
        
        redis.set(f"import_auctions_status:{job_id}", f"success: {len(df)} leilões importados", ex=3600)
    except Exception as e:
        redis.set(f"import_auctions_status:{job_id}", f"error: {str(e)}", ex=3600)
Tratamento: Se CSV incluir parcels, parse como lista e crie vínculos; logue erros por linha.

Atualização de Status e Histórico:
Endpoint PATCH /api/admin/properties/{parcel_id}/update-status:Python@router.patch("/properties/{parcel_id}/update-status")
def update_property_status(parcel_id: str, data: dict, db=Depends(get_db)):
    new_status = data['status']
    query = text("UPDATE properties SET status = :new_status, updated_at = CURRENT_TIMESTAMP WHERE parcel_id = :parcel_id")
    db.execute(query, {"new_status": new_status, "parcel_id": parcel_id})

    # Propagar para histórico
    if 'auction_id' in data:
        history_query = text("""
            INSERT INTO auction_history (parcel_id, auction_id, status_update)
            VALUES (:parcel_id, :auction_id, :new_status)
        """)
        db.execute(history_query, {"parcel_id": parcel_id, "auction_id": data['auction_id'], "new_status": new_status})
    
    # Invalidar cache Redis
    redis.delete(f"property:{parcel_id}")
    return {"status": "updated"}
Trigger SQL Opcional: Para automação, crie trigger que insira em auction_history ao atualizar status.

Calendário de Leilões:
Frontend: Componente React usando @fullcalendar/react em /auctions/calendar. Fetch dados da view auction_calendar via GET /api/auctions/calendar.tsximport FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useEffect, useState } from 'react';
import axios from 'axios';

const AuctionCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/auctions/calendar').then(res => {
      setEvents(res.data.map((item: any) => ({
        title: `${item.event_title} (${item.property_count} propriedades)`,
        start: `${item.event_date}T${item.event_time || '00:00'}`,
        extendedProps: { location: item.event_location, notes: item.event_notes, linked_properties: item.linked_properties }
      })));
    });
  }, []);

  return <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={events} eventClick={(info) => alert(`Detalhes: ${JSON.stringify(info.event.extendedProps)}`)} />;
};
Backend: GET /api/auctions/calendar consultando a view, com filtros (ex: state, date range). Cache no Redis:Python@router.get("/auctions/calendar")
def get_auction_calendar(db=Depends(get_db)):
    cache_key = "auction_calendar"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)

    query = text("SELECT * FROM auction_calendar")
    results = db.execute(query).fetchall()
    data = [dict(row) for row in results]
    
    redis.set(cache_key, json.dumps(data), ex=1800)  # 30min TTL
    return data
Interatividade: Clique em evento exibe propriedades vinculadas; avisos via tooltips ou modals.

Eventos de Sistema:
Anúncio de Leilão: Ao criar auction, insira evento em log ou notifique via WebSocket.
Vinculação de Propriedades: Ao importar/atualizar, verifique se property existe; atualize contagens em auctions.parcels.
Atualizações Propagadas: Use listeners (ex: SQL triggers ou Celery tasks) para sincronizar status entre tables e histórico.

1. Atualizações no Deploy (Docker/Railway)

docker-compose.yml: Adicione dependências se necessário (ex: Celery worker para tasks longas).YAMLservices:
  celery:
    build: ./backend
    command: celery -A app.celery worker --loglevel=info
    depends_on:
      - redis
      - db
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
No Railway: Adicione variáveis para limites de import (ex: MAX_ROWS=10000); monitore tasks via logs.

Essa integração é modular, permitindo expansão futura (ex: notificações por email para atualizações de status). Teste end-to-end com dados mock para validar fluxos. Se precisar de código adicional ou refinamentos, Gustavo, forneça mais detalhes!
