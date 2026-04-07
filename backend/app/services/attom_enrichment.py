import os
import json
import logging
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

import redis
import requests
from sqlalchemy.orm import Session
from sqlalchemy import update
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from fastapi import HTTPException

# Assuming the model is imported from here based on the standard project structure
from app.models.property import PropertyDetails

# Configuração de Logs
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
# Criar um log estruturado básico
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '{"time": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# Constantes ATTOM
ATTOM_API_KEY = os.getenv("ATTOM_API_KEY")
ATTOM_BASE_URL = "https://api.gateway.attomdata.com/propertyapi/v1.0.0"

# Configuração Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
except Exception as e:
    logger.warning(f"Não foi possível conectar ao Redis: {e}")
    redis_client = None

CACHE_TTL_SECONDS = 60 * 24 * 60 * 60  # 60 dias


def get_missing_fields(prop: PropertyDetails) -> List[str]:
    """
    Função auxiliar que verifica quais campos importantes estão faltando.
    Caso o cliente já possua esta função globalmente, ela pode ser importada.
    """
    missing = []
    # Definindo uma lista de campos cruciais que esperamos preencher com a ATTOM
    crucial_fields = [
        "year_built", "latitude", "longitude", "estimated_value",
        "lot_size", "bedrooms", "bathrooms", "owner_name", "owner_occupied"
    ]
    
    for field in crucial_fields:
        if not hasattr(prop, field) or getattr(prop, field) is None:
            missing.append(field)
            
    return missing


def map_attom_to_db(attom_data: Dict[str, Any], existing_prop: PropertyDetails, missing_fields: List[str]) -> Dict[str, Any]:
    """
    Mapeia os dados da API ATTOM para os campos do banco de dados (PropertyDetails).
    Atualiza SOMENTE os campos que estão na lista `missing_fields` (ou pode atualizar todos vazios).
    """
    if "property" not in attom_data or not attom_data["property"]:
        return {}

    p_data = attom_data["property"][0]
    
    # Extração de seções seguras
    address = p_data.get("address", {})
    location = p_data.get("location", {})
    summary = p_data.get("summary", {})
    building = p_data.get("building", {})
    b_size = building.get("size", {})
    b_rooms = building.get("rooms", {})
    b_interior = building.get("interior", {})
    b_construction = building.get("construction", {})
    lot = p_data.get("lot", {})
    avm = p_data.get("avm", {})
    owner = p_data.get("owner", {})
    utilities = p_data.get("utilities", {})

    update_data = {}

    # Mapeamento
    # ATTOM ID
    if "attom_id" in missing_fields or not getattr(existing_prop, "attom_id", None):
        update_data["attom_id"] = str(p_data.get("identifier", {}).get("attomId", ""))
    
    if "apn_unformatted" in missing_fields or not getattr(existing_prop, "apn_unformatted", None):
        update_data["apn_unformatted"] = p_data.get("identifier", {}).get("apn", "")
    
    # Location
    if "latitude" in missing_fields:
        update_data["latitude"] = float(location.get("latitude")) if location.get("latitude") else None
    if "longitude" in missing_fields:
        update_data["longitude"] = float(location.get("longitude")) if location.get("longitude") else None

    # Building details
    if "year_built" in missing_fields:
        update_data["year_built"] = building.get("yearBuilt")
    if "bedrooms" in missing_fields:
        update_data["bedrooms"] = b_rooms.get("beds")
    if "bathrooms" in missing_fields:
        update_data["bathrooms"] = b_rooms.get("bathsTotal")
    if "sqft" in missing_fields:
        update_data["sqft"] = b_size.get("livingSize") or b_size.get("bldgSize")

    # Lot size
    if "lot_size" in missing_fields:
        update_data["lot_size"] = lot.get("lotSize2") # lotSize1 é acres, lotSize2 geralmente sqft
    
    # Values
    if "estimated_value" in missing_fields:
        update_data["estimated_value"] = avm.get("amount", {}).get("value")

    # Owners
    if "owner_name" in missing_fields:
        update_data["owner_name"] = owner.get("owner1", {}).get("fullName")
    if "owner_occupied" in missing_fields:
        update_data["owner_occupied"] = owner.get("ownerOccupied")

    # Property characteristics
    if hasattr(existing_prop, "heating_type") and (getattr(existing_prop, "heating_type") is None):
        update_data["heating_type"] = utilities.get("heatingType")
        
    if hasattr(existing_prop, "sewer_type") and (getattr(existing_prop, "sewer_type") is None):
        update_data["sewer_type"] = utilities.get("sewerType")

    # Limpa valores nulos no dict
    return {k: v for k, v in update_data.items() if v is not None}


class CircuitBreakerException(Exception):
    pass


@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type((requests.exceptions.RequestException, CircuitBreakerException))
)
def fetch_attom_data_sync(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Busca os dados na API da ATTOM sincronamente.
    Inclui lógica de Retry e um simples Circuit Breaker (lança CircuitBreakerException se falhar com 429).
    """
    if not ATTOM_API_KEY:
        raise ValueError("ATTOM_API_KEY não está configurada no ambiente.")

    headers = {
        "Accept": "application/json",
        "apikey": ATTOM_API_KEY
    }

    url = f"{ATTOM_BASE_URL}/property/detail"
    
    logger.info(f"Chamando ATTOM API com parametros: {params}")
    response = requests.get(url, headers=headers, params=params, timeout=10)

    if response.status_code == 429:
        logger.warning("ATTOM API Rate Limit Exceeded (429).")
        raise CircuitBreakerException("Rate limit exceeded")
    
    response.raise_for_status()
    
    return response.json()

# async def fetch_attom_data_async(params: Dict[str, Any]) -> Dict[str, Any]:
#     """
#     Versão assimétrica para futura migração (usando httpx).
#     """
#     import httpx
#     if not ATTOM_API_KEY:
#         raise ValueError("ATTOM_API_KEY não configurada")
#     
#     headers = {
#         "Accept": "application/json",
#         "apikey": ATTOM_API_KEY
#     }
#     
#     url = f"{ATTOM_BASE_URL}/property/detail"
#     async with httpx.AsyncClient() as client:
#         response = await client.get(url, headers=headers, params=params)
#         
#         if response.status_code == 429:
#             raise CircuitBreakerException("Rate limit exceeded")
#         
#         response.raise_for_status()
#         return response.json()


def enrich_property(db: Session, property_id: str) -> Dict[str, Any]:
    """
    Função principal que enriquece os dados da propriedade listada on-demand.
    Totalmente sincrona para compatibilidade atual, mas num contexto FastAPI pode ser
    envolta ou trocada para async.
    """
    
    # 1. Recupera propriedade no BD
    prop = db.query(PropertyDetails).filter(PropertyDetails.property_id == property_id).first()
    if not prop:
        logger.error(f"Propriedade não encontrada. ID: {property_id}")
        raise HTTPException(status_code=404, detail="Property not found")

    # 2. Verifica campos faltantes
    missing_fields = get_missing_fields(prop)
    if not missing_fields:
        logger.info(f"Property {property_id} já está completa. Nenhum enriquecimento necessário.")
        return {"status": "skipped", "message": "No missing fields", "property_id": property_id}

    # 3. Monta a chave de Cache
    # Se existe attom_id usamos na chave, caso contrário fazemos hash do endereço
    if prop.attom_id:
        cache_key = f"attom:property:{prop.attom_id}"
        query_params = {"attomId": prop.attom_id}
    else:
        # Assumindo que endereço exista
        addr = prop.address or ""
        city_state = f"{prop.county or ''} {prop.state or ''}" 
        full_address = f"{addr} {city_state}".strip().lower()
        
        addr_hash = hashlib.md5(full_address.encode('utf-8')).hexdigest()
        cache_key = f"attom:property:addr:{addr_hash}"
        query_params = {
            "address1": prop.address,
            "address2": city_state
        }
    
    attom_data = None
    
    # 4. Verifica Redis (Cache Hit)
    if redis_client:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                logger.info(f"Cache hit para chave: {cache_key}")
                attom_data = json.loads(cached_result)
        except Exception as e:
            logger.error(f"Erro ao ler do Redis: {e}")

    # 5. Se não tem no cache, busca na ATTOM API
    if not attom_data:
        logger.info(f"Cache miss para {cache_key}. Buscando na ATTOM.")
        try:
            attom_data = fetch_attom_data_sync(query_params)
            
            # Salva no Redis
            if redis_client and attom_data:
                redis_client.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(attom_data))
                
        except requests.exceptions.RequestException as e:
            logger.error(f"ATTOM API erro de requisição: {e}")
            raise HTTPException(status_code=502, detail="Error communicating with ATTOM API")
        except CircuitBreakerException:
            logger.error("ATTOM API erro: Rate Limit Excedido (429).")
            raise HTTPException(status_code=429, detail="ATTOM API Rate limit exceeded")
        except Exception as e:
            logger.error(f"Erro inesperado durante enriquecimento: {e}")
            raise HTTPException(status_code=500, detail="Internal server error during enrichment")

    # 6. Mapeamento dos dados retornados e UPSERT
    if attom_data:
        update_data = map_attom_to_db(attom_data, prop, missing_fields)
        
        if update_data:
            logger.info(f"Atualizando BD para propriedade {property_id} com {len(update_data)} campos.")
            # Atualiza apenas os campos necessários
            db.query(PropertyDetails).filter(PropertyDetails.id == prop.id).update(update_data)
            db.commit()
            
            # Atualiza o objeto da sessão com os novos dados
            db.refresh(prop)
        else:
            logger.info("ATTOM não retornou dados relevantes adicionais.")

    return {
        "status": "success",
        "enriched_fields": update_data if 'update_data' in locals() else {},
        "missing_fields_before": missing_fields,
        "property_id": property_id
    }
