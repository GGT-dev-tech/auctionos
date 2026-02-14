import asyncio
import csv
import os
from datetime import datetime
from typing import List, Dict, Optional
from playwright.async_api import async_playwright

DATA_DIR = "/app/data"

class CountyScraper:
    def __init__(self):
        self.counties = [
            # Colorado – Treasurer Deed Sale
            {"url": "https://adams.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "adams_co"},
            {"url": "https://denver.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "denver_co"},
            {"url": "https://eagle.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "eagle_co"},
            {"url": "https://elpasoco.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "elpaso_co"},
            {"url": "https://larimer.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "larimer_co"},
            {"url": "https://mesa.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "mesa_co"},
            {"url": "https://pitkin.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "pitkin_co"},
            {"url": "https://weld.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "weld_co"},

            # Florida – RealTaxDeed / RealForeclose
            {"url": "https://alachua.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "alachua_fl"},
            {"url": "https://baker.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "baker_fl"},
            {"url": "https://bay.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "bay_fl"},
            {"url": "https://brevard.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "brevard_fl"},
            {"url": "https://calhoun.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "calhoun_fl"},
            {"url": "https://charlotte.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "charlotte_fl"},
            {"url": "https://citrus.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "citrus_fl"},
            {"url": "https://clay.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "clay_fl"},
            {"url": "https://duval.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "duval_fl"},
            {"url": "https://escambia.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "escambia_fl"},
            {"url": "https://flagler.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "flagler_fl"},
            {"url": "https://gilchrist.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "gilchrist_fl"},
            {"url": "https://gulf.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "gulf_fl"},
            {"url": "https://hendry.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "hendry_fl"},
            {"url": "https://hernando.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "hernando_fl"},
            {"url": "https://highlands.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "highlands_fl"},
            {"url": "https://hillsborough.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "hillsborough_fl"},
            {"url": "https://indian-river.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "indian_river_fl"},
            {"url": "https://jackson.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "jackson_fl"},
            {"url": "https://lake.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "lake_fl"},
            {"url": "https://lee.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "lee_fl"},
            {"url": "https://leon.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "leon_fl"},
            {"url": "https://manatee.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "manatee_fl"},
            {"url": "https://marion.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "marion_fl"},
            {"url": "https://martin.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "martin_fl"},
            {"url": "https://monroe.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "monroe_fl"},
            {"url": "https://nassau.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "nassau_fl"},
            {"url": "https://okeechobee.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "okeechobee_fl"},
            {"url": "https://orange.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "orange_fl"},
            {"url": "https://osceola.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "osceola_fl"},
            {"url": "https://palmbeach.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "palmbeach_fl"},
            {"url": "https://pasco.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "pasco_fl"},
            {"url": "https://pinellas.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "pinellas_fl"},
            {"url": "https://polk.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "polk_fl"},
            {"url": "https://putnam.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "putnam_fl"},
            {"url": "https://santarosa.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "santarosa_fl"},
            {"url": "https://sarasota.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "sarasota_fl"},
            {"url": "https://seminole.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "seminole_fl"},
            {"url": "https://stlucie.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "stlucie_fl"},
            {"url": "https://suwannee.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "suwannee_fl"},
            {"url": "https://volusia.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "volusia_fl"},
            {"url": "https://walton.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "walton_fl"},
            {"url": "https://washington.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "washington_fl"},

            # New Jersey
            {"url": "https://newarknj.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "name": "newark_nj"}
        ]

    async def scrape_county(self, county: Dict, headless: bool = True):
        base_url = county["url"]
        output_file = os.path.join(DATA_DIR, f"{county['name']}_{datetime.now().strftime('%Y%m%d')}.csv")
        
        print(f"🚀 Starting scrape for {county['name']} -> {output_file}")

        async with async_playwright() as p:
            executable_path = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH")
            launch_args = {
                "headless": headless,
                "args": ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            }
            if executable_path:
                launch_args["executable_path"] = executable_path

            browser = await p.chromium.launch(**launch_args)
            page = await browser.new_page()

            # Create CSV
            with open(output_file, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=["auction_date", "item_id", "raw_text"])
                writer.writeheader()

                try:
                    print(f"🌐 Accessing: {base_url}")
                    await page.goto(base_url, timeout=90000, wait_until="domcontentloaded")

                    # Check current month then next month
                    # Strategy: Use loop but break if "Next Month" not found
                    
                    months_to_check = 2 # Check current and next month
                    for _ in range(months_to_check):
                        
                        # Wait for calendar table
                        try:
                            await page.wait_for_selector('div.CALNAV', state='visible', timeout=20000)
                        except Exception:
                            print(f"⚠️ Calendar navigation not found for {county['name']}, stopping.")
                            break

                        # Find Tax Deed / Foreclosure days
                        day_selector = 'div.CALBOX.CALSELT'
                        tax_days = await page.evaluate(f"""
                            [...document.querySelectorAll('{day_selector}')]
                              .filter(d => {{
                                  const text = d.innerText.toUpperCase();
                                  return text.includes('TAX DEED') || text.includes('FORECLOSURE');
                              }})
                              .map(d => d.getAttribute('dayid'))
                        """)
                        
                        print(f"📅 Days with auctions: {tax_days}")

                        for day in tax_days:
                            if not day: continue
                            
                            # Construct direct URL for that day to avoid navigation hell
                            auction_url = f"{base_url.split('?')[0]}?zaction=AUCTION&Zmethod=PREVIEW&AUCTIONDATE={day}"
                            print(f"➡️ Checking auction day: {day}")
                            
                            try:
                                await page.goto(auction_url, timeout=60000, wait_until="domcontentloaded")
                                await page.wait_for_timeout(2000)

                                # Extract items
                                item_selector = 'div[id^="AITEM"]'
                                items = await page.evaluate(f"""
                                    [...document.querySelectorAll('{item_selector}')]
                                    .map(div => ({{
                                        id: div.id,
                                        text: div.innerText.trim()
                                    }}))
                                """)
                                
                                print(f"📦 Items found: {len(items)}")
                                for item in items:
                                    writer.writerow({
                                        "auction_date": day,
                                        "item_id": item["id"],
                                        "raw_text": item["text"]
                                    })
                                    
                                # Go back to calendar to continue
                                # But actually, for the loop, we can just go back to base_url + next month navigation
                                # However, staying on calendar page is safer for "Next Month" clicking.
                                # So let's re-load calendar base or navigate back.
                                
                            except Exception as e:
                                print(f"❌ Error on day {day}: {e}")
                                continue

                        # Navigate to Next Month
                        # We need to be on the calendar view to find the button
                        print("🔄 Returning to calendar view...")
                        await page.goto(base_url, timeout=60000, wait_until="domcontentloaded")
                        await page.wait_for_selector('div.CALNAV', state='visible')

                        next_month_selector = 'div.CALNAV a[aria-label^="Next Month"]'
                        next_month_btn = await page.query_selector(next_month_selector)
                        
                        if next_month_btn:
                            print("➡️ Navigating to Next Month...")
                            # Some sites use href, some JS. Click is safest.
                            await next_month_btn.click()
                            await page.wait_for_timeout(3000) # Wait for reload
                            # Now the loop continues to process the new month
                        else:
                            print("⛔ No Next Month button found. End of calendar.")
                            break

                except Exception as e:
                    print(f"❌ Critical error scraping {county['name']}: {e}")

            await browser.close()
        
        return output_file

    async def run_all(self):
        results = []
        for county in self.counties:
            path = await self.scrape_county(county)
            results.append(path)
        return results

scraper_service = CountyScraper()
