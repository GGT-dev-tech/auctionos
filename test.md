1. Configuração de Dados
Como base para o sistema, precisamos configurar o banco de dados PostgreSQL com a extensão PostGIS para lidar com dados geográficos. Assumindo que você já tem o PostgreSQL rodando, ative o PostGIS com o comando SQL:
SQLCREATE EXTENSION IF NOT EXISTS postgis;
Agora, crie a tabela para armazenar as propriedades. A tabela incluirá o Parcel ID como chave primária, dados da propriedade (ex: endereço, proprietário, etc., em um campo JSONB para flexibilidade), o GeoJSON convertido para geometria PostGIS, e campos para os links das imagens (snapshot do mapa e fachada). Adicionei índices para performance, especialmente no campo geométrico.
SQLCREATE TABLE IF NOT EXISTS properties (
    parcel_id VARCHAR(50) PRIMARY KEY,
    property_data JSONB NOT NULL,  -- Armazena dados como endereço, proprietário, etc.
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,  -- SRID 4326 para WGS84 (padrão GeoJSON)
    map_snapshot_url TEXT,  -- Link para o snapshot do mapa no S3
    facade_image_url TEXT,  -- Link para a imagem da fachada no S3
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_properties_geometry ON properties USING GIST(geometry);
CREATE INDEX idx_properties_parcel_id ON properties (parcel_id);
Para inserir o GeoJSON coletado pelo web scraper, use a função ST_GeomFromGeoJSON. Aqui vai um exemplo de inserção (assumindo que você tem o GeoJSON como string em Python, mas o SQL é assim):
SQLINSERT INTO properties (parcel_id, property_data, geometry)
VALUES (
    'PARCEL-12345',
    '{"address": "123 Main St", "owner": "John Doe", "area": 5000}',
    ST_GeomFromGeoJSON('{"type": "Polygon", "coordinates": [[[ -74.0, 40.7 ], [ -73.9, 40.7 ], [ -73.9, 40.6 ], [ -74.0, 40.6 ], [ -74.0, 40.7 ]]]}')
) ON CONFLICT (parcel_id) DO UPDATE SET
    property_data = EXCLUDED.property_data,
    geometry = EXCLUDED.geometry,
    updated_at = CURRENT_TIMESTAMP;
No seu código Python (no scraper ou em um script de ingestão), use SQLAlchemy ou psycopg2 para executar isso. Exemplo com SQLAlchemy:
Pythonfrom sqlalchemy import create_engine, text

engine = create_engine('postgresql://user:pass@localhost/dbname')

geojson_str = '{"type": "Polygon", ...}'  # Do scraper
query = text("""
    INSERT INTO properties (parcel_id, property_data, geometry)
    VALUES (:parcel_id, :property_data, ST_GeomFromGeoJSON(:geojson))
    ON CONFLICT (parcel_id) DO UPDATE SET
        property_data = EXCLUDED.property_data,
        geometry = EXCLUDED.geometry,
        updated_at = CURRENT_TIMESTAMP;
""")

with engine.connect() as conn:
    conn.execute(query, {"parcel_id": "PARCEL-12345", "property_data": {"address": "123 Main St", ...}, "geojson": geojson_str})
Isso garante que os dados geográficos sejam armazenados de forma eficiente e indexados para consultas rápidas.
2. Backend (FastAPI)
No backend, crie um endpoint para retornar o GeoJSON de uma propriedade específica, otimizado com ST_Simplify para reduzir a complexidade do polígono (melhor performance no frontend, especialmente para shapes grandes). Use tolerância de simplificação baixa (ex: 0.0001 graus) para preservar precisão.
Instale dependências: pip install fastapi sqlalchemy psycopg2-binary geojson.
Estrutura modular: Crie um arquivo app/api/v1/endpoints/properties.py:
Pythonfrom fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from geojson import Feature, dumps as geojson_dumps
import os

router = APIRouter(prefix="/properties", tags=["properties"])

# Dependência para conexão com DB (use SQLAlchemy para escalabilidade)

def get_db():
    engine = create_engine(os.getenv("DATABASE_URL"))  # Use env var para segurança
    with engine.connect() as conn:
        yield conn

@router.get("/{parcel_id}/geojson")
def get_property_geojson(parcel_id: str, db: Session = Depends(get_db)):
    query = text("""
        SELECT ST_AsGeoJSON(ST_Simplify(geometry, 0.0001))::json AS geojson
        FROM properties
        WHERE parcel_id = :parcel_id
    """)
    result = db.execute(query, {"parcel_id": parcel_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Retorna como Feature GeoJSON para compatibilidade com Mapbox
    feature = Feature(geometry=result["geojson"])
    return {"geojson": geojson_dumps(feature)}
No main.py, inclua o router: app.include_router(properties.router).
Para segurança: Use variáveis de ambiente para chaves (ex: DATABASE_URL). Adicione autenticação JWT se necessário para endpoints sensíveis. Para escalabilidade, use caching no Redis (ver seção 4 para detalhes).
3. Frontend (React + Mapbox)
Integre Mapbox GL JS no React com Vite. Instale: npm install mapbox-gl react-map-gl.
Crie um componente PropertyMap.tsx para o mapa interativo. Ele carrega o mapa em satélite, faz zoom suave ao clicar em um resultado, e adiciona a layer do polígono dinamicamente.
tsximport React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;  // Use env var para segurança

interface PropertyMapProps {
  parcelId: string | null;  // ID da propriedade clicada
}

const PropertyMap: React.FC<PropertyMapProps> = ({ parcelId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const [geojson, setGeojson] = useState<any>(null);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/satellite-v9',  // Visão de satélite
        center: [-74.5, 40],  // Centro inicial (ex: NYC)
        zoom: 9,
      });
    }
  }, []);

  useEffect(() => {
    if (parcelId) {
      // Fetch GeoJSON do backend
      fetch(`/api/properties/${parcelId}/geojson`)
        .then(res => res.json())
        .then(data => {
          setGeojson(data.geojson);
        })
        .catch(err => console.error(err));
    }
  }, [parcelId]);

  useEffect(() => {
    if (geojson && map.current) {
      // Remove layer anterior se existir
      if (map.current.getSource('property')) {
        map.current.removeLayer('property-fill');
        map.current.removeLayer('property-outline');
        map.current.removeSource('property');
      }

      // Adiciona source e layers
      map.current.addSource('property', { type: 'geojson', data: geojson });
      map.current.addLayer({
        id: 'property-fill',
        type: 'fill',
        source: 'property',
        paint: { 'fill-color': '#088', 'fill-opacity': 0.5 },
      });
      map.current.addLayer({
        id: 'property-outline',
        type: 'line',
        source: 'property',
        paint: { 'line-color': '#088', 'line-width': 3 },
      });

      // Zoom suave para o bounding box do polígono
      const bounds = new mapboxgl.LngLatBounds();
      geojson.geometry.coordinates[0].forEach(([lng, lat]: [number, number]) => bounds.extend([lng, lat]));
      map.current.fitBounds(bounds, { padding: 50, duration: 1000 });  // Zoom suave em 1s
    }
  }, [geojson]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
};

export default PropertyMap;
No componente principal (ex: resultados de busca), passe o parcelId ao clicar: <PropertyMap parcelId={selectedParcelId} />.
Para segurança: Armazene VITE_MAPBOX_TOKEN no .env e não commite. Para escalabilidade, debounce fetches se houver muitos cliques.
4. Automação de Snapshots
Para gerar snapshots automáticos, use um worker background com Celery (para Python) e Puppeteer (via node) no Docker. Mas para simplicidade e custo baixo, integre Puppeteer diretamente em um endpoint async no FastAPI, ou use um container separado. Cacheie no Redis para evitar chamadas redundantes.
Worker com Puppeteer: Crie um serviço Node.js no Docker para tirar prints. Instale: npm install puppeteer aws-sdk (para S3).
Arquivo snapshot-worker.js:
JavaScriptconst puppeteer = require('puppeteer');
const AWS = require('aws-sdk');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);
const s3 = new AWS.S3({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

async function generateSnapshot(parcelId, mapUrl, address) {
  const cacheKey = `snapshot:${parcelId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);  // Retorna links cached

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Snapshot do mapa (assuma que mapUrl é uma URL do frontend com o mapa renderizado, ex: localhost:3000/map?parcelId=xxx)
  await page.goto(mapUrl, { waitUntil: 'networkidle2' });
  const mapScreenshot = await page.screenshot({ type: 'png' });

  // Fachada via Google Street View Static API (precisa de chave)
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`;
  await page.goto(streetViewUrl);
  const facadeScreenshot = await page.screenshot({ type: 'png' });

  await browser.close();

  // Upload para S3
  const mapKey = `maps/${parcelId}.png`;
  await s3.putObject({ Bucket: process.env.S3_BUCKET, Key: mapKey, Body: mapScreenshot, ContentType: 'image/png' }).promise();
  const mapUrlS3 = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${mapKey}`;

  const facadeKey = `facades/${parcelId}.png`;
  await s3.putObject({ Bucket: process.env.S3_BUCKET, Key: facadeKey, Body: facadeScreenshot, ContentType: 'image/png' }).promise();
  const facadeUrlS3 = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${facadeKey}`;

  // Cache no Redis (expire em 30 dias)
  await redis.set(cacheKey, JSON.stringify({ map: mapUrlS3, facade: facadeUrlS3 }), 'EX', 2592000);

  // Atualiza DB
  // Chame um endpoint FastAPI para update (ou integre diretamente se worker for Python)
  await fetch(`http://backend:8000/properties/${parcelId}/update-images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ map_snapshot_url: mapUrlS3, facade_image_url: facadeUrlS3 }),
  });

  return { map: mapUrlS3, facade: facadeUrlS3 };
}

// Exemplo: rodar como queue com Bull ou similar, mas para simplicidade, expose como API.
No FastAPI, crie endpoint para trigger:
<Python@router.post>("/{parcel_id}/generate-snapshot")
async def generate_snapshot(parcel_id: str, background_tasks: BackgroundTasks):
    # Verifique se já existe no DB/Redis, senão adicione task
    background_tasks.add_task(call_worker, parcel_id)  # Use Celery ou httpx para chamar o worker Node
    return {"status": "processing"}
Para cache: Redis evita chamadas redundantes à Google API e Puppeteer. Cheque cache primeiro no worker. Para menor custo: Use heading/pitch na Street View para otimizar (ex: &heading=0&pitch=0), e limite chamadas com rate limiting no Redis.
Atualize a tabela no FastAPI após sucesso:
<Python@router.post>("/{parcel_id}/update-images")
def update_images(parcel_id: str, data: dict, db: Session = Depends(get_db)):
    query = text("""
        UPDATE properties SET map_snapshot_url = :map_url, facade_image_url = :facade_url
        WHERE parcel_id = :parcel_id
    """)
    db.execute(query, {"parcel_id": parcel_id, "map_url": data["map_snapshot_url"], "facade_url": data["facade_image_url"]})
5. Deploy & Custos
docker-compose.yml: Atualize para incluir PostGIS, Redis, o worker Node, e o resto. Para Railway, use volumes persistentes e env vars.
YAMLversion: '3.8'

services:
  db:
    image: postgis/postgis:15-3.4  # Com PostGIS
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: dbname
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"

  backend:
    build: ./backend  # Assuma Dockerfile com FastAPI
    restart: always
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/dbname
      REDIS_URL: redis://redis:6379/0
      MAPBOX_TOKEN: ${MAPBOX_TOKEN}  # Env var
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      S3_BUCKET: your-bucket
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend  # Vite + React
    restart: always
    depends_on:
      - backend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: <http://backend:8000>
      VITE_MAPBOX_TOKEN: ${MAPBOX_TOKEN}

  snapshot-worker:
    build: ./worker  # Dockerfile com Node + Puppeteer
    restart: always
    depends_on:
      - redis
      - backend
    environment:
      REDIS_URL: redis://redis:6379/0
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      S3_BUCKET: your-bucket

volumes:
  postgres_data:
Para Railway: Push para Git, configure services via UI, use env vars para chaves (nunca hardcode). Para custos:

Mapbox: Para não exceder 50k loads/mês free tier, cacheie GeoJSON no Redis (TTL 1h): No endpoint FastAPI, cheque Redis primeiro. Use static maps para previews se possível. Monitore uso via Mapbox dashboard.
Google Street View: Otimize com cache no Redis (ver acima). Use tamanho pequeno (ex: 400x300), e só chame se não cached. Custo ~$0.007 por request; com cache, reduza 90% para usuários recorrentes.
Geral: Use S3 com lifecycle para deletar imagens antigas. Escala com Railway's scaling automático.

Para Redis em chamadas redundantes: No worker e endpoints, sempre cheque redis.get(key) antes de API calls, setando com expire para evitar armazenamento infinito.
