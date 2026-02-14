import asyncio
from app.services.scraper import scraper_service

async def main():
    print("Testing Scraper manually...")
    # Test only one county for speed
    county = scraper_service.counties[0]
    print(f"Scraping {county['name']}...")
    try:
        path = await scraper_service.scrape_county(county, headless=True)
        print(f"Success! Data saved to {path}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
