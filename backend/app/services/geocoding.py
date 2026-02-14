import httpx
from typing import Optional, Tuple, Any

class GeocodingService:
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.user_agent = "AuctionOS/1.0"

    async def get_coordinates(self, address: str, multiple: bool = False) -> Any:
        """
        Fetch latitude, longitude, and address details for a given address using Nominatim.
        Returns dict with keys: lat, lon, state, county, zip, city or None if not found.
        If multiple is True, returns a list of such dicts.
        """
        try:
            params = {
                "q": address,
                "format": "json",
                "limit": 5 if multiple else 1,
                "addressdetails": 1
            }
            headers = {"User-Agent": self.user_agent}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(self.base_url, params=params, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                results = []
                if data:
                    for item in data:
                        addr = item.get("address", {})
                        res = {
                            "latitude": float(item["lat"]),
                            "longitude": float(item["lon"]),
                            "display_name": item.get("display_name"),
                            "state": addr.get("state"),
                            "county": addr.get("county"),
                            "city": addr.get("city") or addr.get("town") or addr.get("village"),
                            "zip_code": addr.get("postcode")
                        }
                        if not multiple:
                            return res
                        results.append(res)
                
                return results if multiple else None
        except Exception as e:
            print(f"Geocoding error: {e}")
            return [] if multiple else None
        return [] if multiple else None

geocoding_service = GeocodingService()
