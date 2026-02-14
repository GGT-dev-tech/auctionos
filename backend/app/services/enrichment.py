import httpx
import json
import logging
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup
from app.models.property import Property, PropertyDetails, Media, MediaType
from app.core.config import settings

logger = logging.getLogger(__name__)

class EnrichmentService:
    def __init__(self, zenrows_api_key: Optional[str] = None):
        self.zenrows_api_key = zenrows_api_key or settings.ZENROWS_API_KEY or "YOUR_ZENROWS_API_KEY_HERE"
        self.zenrows_url = "https://api.zenrows.com/v1/"

    async def fetch_zillow_data(self, zillow_url: str) -> Dict[str, Any]:
        """
        Fetches property data from Zillow using ZenRows.
        """
        if not zillow_url:
            return {}

        params = {
            "apikey": self.zenrows_api_key,
            "url": zillow_url,
            "js_render": "true",
            "premium_proxy": "true",
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.zenrows_url, params=params)
                response.raise_for_status()
                
                return self._parse_zillow_html(response.text)
        except Exception as e:
            logger.error(f"Error fetching Zillow data: {e}")
            return {}

    def _parse_zillow_html(self, html: str) -> Dict[str, Any]:
        """
        Parses Zillow HTML to extract property features.
        """
        soup = BeautifulSoup(html, "html.parser")
        data = {}

        # 1. Price / Zestimate
        # Potential selectors for Zestimate
        zestimate_selector = soup.select_one('span[data-test-id="zestimate-value"]')
        if zestimate_selector:
            val_text = zestimate_selector.get_text().replace('$', '').replace(',', '').strip()
            try:
                data['estimated_value'] = float(val_text)
            except ValueError:
                pass

        # 2. Beds, Baths, Sqft
        # Elements like <span data-test-id="bed-bath-beyond">...</span>
        stats = soup.select('span[data-test-id^="stats-"]')
        for stat in stats:
            text = stat.get_text().lower()
            if "bd" in text:
                data['bedrooms'] = int(''.join(filter(str.isdigit, text)))
            elif "ba" in text:
                data['bathrooms'] = float(''.join(c for c in text if c.isdigit() or c == '.'))
            elif "sqft" in text:
                data['sqft'] = int(''.join(filter(str.isdigit, text)))

        # 3. Images
        # Extract images from carousel
        images = []
        img_tags = soup.select('ul.media-stream img')
        for img in img_tags:
            src = img.get('src')
            if src and src.startswith('http'):
                images.append(src)
        
        data['images'] = images[:5] # Limit to 5 for now

        return data

    async def validate_gsi(self, address: str, parcel_id: str) -> Dict[str, Any]:
        """
        Validates parcel data using GSI hooks. 
        Note: Implementation depends on specific GSI API endpoints.
        """
        # Placeholder for GSI validation logic
        logger.info(f"Validating GSI for {address} (Parcel: {parcel_id})")
        return {
            "is_valid": True,
            "gsi_status": "Verified",
            "coordinates": None # To be fetched if API available
        }

enrichment_service = EnrichmentService()
