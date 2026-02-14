from playwright.sync_api import sync_playwright
import csv
import time

def scrape_county(
    base_url,
    output_file,
    day_selector='div.CALBOX.CALSELT',
    item_selector='div[id^="AITEM"]',
    next_month_selector='div.CALNAV a[aria-label^="Next Month"]'
):
    """
    Scraper genérico para sites de Tax Deed que seguem o mesmo padrão.
    """
    def extract_items_from_page(page, auction_date):
        """
        Extrai todos os divs AITEM da página de leilão
        """
        page.wait_for_timeout(2000)  # esperar carregamento JS

        items = page.evaluate(f"""
            [...document.querySelectorAll('{item_selector}')]
              .map(div => ({{
                  id: div.id,
                  text: div.innerText.trim()
              }}))
        """)

        rows = []
        for item in items:
            rows.append({
                "auction_date": auction_date,
                "item_id": item["id"],
                "raw_text": item["text"]
            })

        return rows

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # CSV setup
        with open(output_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=["auction_date", "item_id", "raw_text"]
            )
            writer.writeheader()

            # 1️⃣ Abre calendário
            print(f"🌐 Acessando: {base_url}")
            page.goto(base_url, timeout=60000)

            while True:
                print("📅 Analisando mês atual...")

                # 2️⃣ Dias com Tax Deed
                tax_days = page.evaluate(f"""
                    [...document.querySelectorAll('{day_selector}')]
                      .filter(d => d.innerText.includes('Tax Deed'))
                      .map(d => d.getAttribute('dayid'))
                """)

                if not tax_days:
                    print("⚠️ Nenhum dia com Tax Deed encontrado neste mês")
                else:
                    print(f"🟢 Tax Deed days: {tax_days}")

                for day in tax_days:
                    auction_url = f"{base_url.split('?')[0]}?zaction=AUCTION&Zmethod=PREVIEW&AUCTIONDATE={day}"

                    print(f"➡️ Entrando no leilão: {day}")
                    page.goto(auction_url, timeout=60000)

                    rows = extract_items_from_page(page, day)
                    print(f"📦 Itens encontrados: {len(rows)}")

                    for r in rows:
                        writer.writerow(r)

                # 3️⃣ Próximo mês
                next_month = page.query_selector(next_month_selector)
                if not next_month:
                    print("⛔ Fim do calendário")
                    break

                next_href = next_month.get_attribute("href")
                print("➡️ Indo para o próximo mês")
                page.goto(base_url.split('?')[0] + next_href, timeout=60000)
                time.sleep(2)

        browser.close()
    print(f"✅ Scraping finalizado com sucesso! CSV: {output_file}")


# 🔹 Exemplo de uso para múltiplos condados
counties = [
    # 🔹 Colorado – Treasurer Deed Sale
    {"url": "https://adams.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "adams_co.csv"},
    {"url": "https://denver.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "denver_co.csv"},
    {"url": "https://eagle.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "eagle_co.csv"},
    {"url": "https://elpasoco.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "elpaso_co.csv"},
    {"url": "https://larimer.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "larimer_co.csv"},
    {"url": "https://mesa.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "mesa_co.csv"},
    {"url": "https://pitkin.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "pitkin_co.csv"},
    {"url": "https://weld.treasurersdeedsale.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "weld_co.csv"},

    # 🔹 Florida – RealTaxDeed / RealForeclose
    {"url": "https://alachua.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "alachua_fl.csv"},
    {"url": "https://baker.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "baker_fl.csv"},
    {"url": "https://bay.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "bay_fl.csv"},
    {"url": "https://brevard.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "brevard_fl.csv"},
    {"url": "https://calhoun.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "calhoun_fl.csv"},
    {"url": "https://charlotte.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "charlotte_fl.csv"},
    {"url": "https://citrus.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "citrus_fl.csv"},
    {"url": "https://clay.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "clay_fl.csv"},
    {"url": "https://duval.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "duval_fl.csv"},
    {"url": "https://escambia.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "escambia_fl.csv"},
    {"url": "https://flagler.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "flagler_fl.csv"},
    {"url": "https://gilchrist.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "gilchrist_fl.csv"},
    {"url": "https://gulf.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "gulf_fl.csv"},
    {"url": "https://hendry.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "hendry_fl.csv"},
    {"url": "https://hernando.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "hernando_fl.csv"},
    {"url": "https://highlands.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "highlands_fl.csv"},
    {"url": "https://hillsborough.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "hillsborough_fl.csv"},
    {"url": "https://indian-river.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "indian_river_fl.csv"},
    {"url": "https://jackson.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "jackson_fl.csv"},
    {"url": "https://lake.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "lake_fl.csv"},
    {"url": "https://lee.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "lee_fl.csv"},
    {"url": "https://leon.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "leon_fl.csv"},
    {"url": "https://manatee.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "manatee_fl.csv"},
    {"url": "https://marion.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "marion_fl.csv"},
    {"url": "https://martin.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "martin_fl.csv"},
    {"url": "https://monroe.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "monroe_fl.csv"},
    {"url": "https://nassau.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "nassau_fl.csv"},
    {"url": "https://okeechobee.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "okeechobee_fl.csv"},
    {"url": "https://orange.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "orange_fl.csv"},
    {"url": "https://osceola.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "osceola_fl.csv"},
    {"url": "https://palmbeach.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "palmbeach_fl.csv"},
    {"url": "https://pasco.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "pasco_fl.csv"},
    {"url": "https://pinellas.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "pinellas_fl.csv"},
    {"url": "https://polk.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "polk_fl.csv"},
    {"url": "https://putnam.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "putnam_fl.csv"},
    {"url": "https://santarosa.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "santarosa_fl.csv"},
    {"url": "https://sarasota.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "sarasota_fl.csv"},
    {"url": "https://seminole.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "seminole_fl.csv"},
    {"url": "https://stlucie.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "stlucie_fl.csv"},
    {"url": "https://suwannee.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "suwannee_fl.csv"},
    {"url": "https://volusia.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "volusia_fl.csv"},
    {"url": "https://walton.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "walton_fl.csv"},
    {"url": "https://washington.realtaxdeed.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "washington_fl.csv"},

    # 🔹 New Jersey
    {"url": "https://newarknj.realforeclose.com/index.cfm?zaction=USER&zmethod=CALENDAR", "output": "newark_nj.csv"}
]

for county in counties:
    scrape_county(county["url"], county["output"])
