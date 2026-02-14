from fpdf import FPDF
from app.models.property import Property

class PDFReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'AuctionOS Property Report', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

class ReportGenerator:
    def generate_property_report(self, prop: Property) -> str:
        pdf = PDFReport()
        pdf.add_page()
        
        # Title
        pdf.set_font('Arial', 'B', 16)
        pdf.multi_cell(0, 10, f"Property: {prop.title}")
        pdf.ln(5)
        
        # Details
        pdf.set_font('Arial', '', 12)
        
        details = [
            f"Address: {prop.address}, {prop.city}, {prop.state} {prop.zip_code}",
            f"Status: {prop.status}",
            f"Type: {prop.property_type}",
            f"Price/Opening Bid: ${prop.price:,.2f}" if prop.price else "Price: N/A",
            f"Parcel ID: {prop.parcel_id}",
            f"Smart Tag: {prop.smart_tag or 'N/A'}",
        ]

        if prop.details:
            details.extend([
                f"Legal Description: {prop.details.legal_description or 'N/A'}",
                f"Flood Zone: {prop.details.flood_zone_code or 'N/A'}",
                f"Market Value URL: {prop.details.market_value_url or 'N/A'}",
            ])
            
            # Financial Metrics
            pdf.ln(5)
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, "Financial Analysis", 0, 1)
            pdf.set_font('Arial', '', 12)
            
            equity = (prop.details.estimated_value or 0) - (prop.price or 0)
            fin_info = [
                f"Estimated Market Value: ${prop.details.estimated_value:,.2f}" if prop.details.estimated_value else "Est. Market Value: N/A",
                f"Max Bid Recommendation: ${prop.details.max_bid:,.2f}" if prop.details.max_bid else "Max Bid: N/A",
                f"Potential Equity Spread: ${equity:,.2f}",
                f"Annual Rental Estimate: ${prop.details.rental_value:,.2f}" if prop.details.rental_value else "Rental Estimate: N/A",
            ]
            for line in fin_info:
                pdf.cell(0, 10, line, 0, 1)

            # Property Stats
            pdf.ln(5)
            pdf.set_font('Arial', 'B', 12)
            stats_text = (
                f"Beds: {prop.details.bedrooms or 'N/A'}  |  "
                f"Baths: {prop.details.bathrooms or 'N/A'}  |  "
                f"Sqft: {prop.details.sqft or 'N/A'}"
            )
            pdf.cell(0, 10, stats_text, 0, 1)

        # Location / Map Snippet
        if prop.latitude and prop.longitude:
            pdf.ln(5)
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, "Location Map", 0, 1)
            # Use a public static map provider (OSM based)
            # Note: Many requires keys, using a reliable structured URL placeholder
            map_url = f"https://static-maps.yandex.ru/1.x/?l=map&z=14&pt={prop.longitude},{prop.latitude},pmwtm&size=450,300"
            try:
                pdf.image(map_url, w=100)
            except Exception:
                pdf.set_font('Arial', 'I', 10)
                pdf.cell(0, 10, "[Map visualization not available]", 0, 1)

        # Images
        if prop.media:
            pdf.ln(10)
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, "Property Images", 0, 1)
            
            y_start = pdf.get_y()
            for i, media in enumerate(prop.media[:2]): # Limit to top 2 for report
                try:
                    # FPDF supports remote URLs in some versions, but let's be careful.
                    # Best approach is to download first if needed, but fpdf2 supports URL.
                    pdf.image(media.url, x=10 + (i*95), y=y_start, w=90)
                except Exception as e:
                    pdf.set_font('Arial', 'I', 10)
                    pdf.cell(0, 10, f"[Image load failed: {media.url[:30]}...]", 0, 1)
            
        # Output
        output_dir = os.path.join(os.getcwd(), "data", "reports")
        os.makedirs(output_dir, exist_ok=True)
        filename = f"report_{prop.id}.pdf"
        filepath = os.path.join(output_dir, filename)
        
        pdf.output(filepath)
        return f"/static/reports/{filename}"

    def generate_inventory_summary(self, properties: list[Property]) -> str:
        pdf = PDFReport()
        pdf.add_page()
        
        # Title
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, 'Inventory Summary Report', 0, 1, 'C')
        pdf.ln(5)
        
        # Table Header
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(60, 10, 'Details', 1)
        pdf.cell(30, 10, 'Status', 1)
        pdf.cell(40, 10, 'Price', 1)
        pdf.cell(60, 10, 'Location', 1)
        pdf.ln()
        
        # Table Rows
        pdf.set_font('Arial', '', 9)
        for prop in properties:
            # Address/Title
            title = prop.address if prop.address else prop.title
            pdf.cell(60, 10, title[:30], 1)
            pdf.cell(30, 10, prop.status, 1)
            
            price_str = f"${prop.price:,.0f}" if prop.price else "N/A"
            pdf.cell(40, 10, price_str, 1)
            
            loc = f"{prop.city}, {prop.state}"
            pdf.cell(60, 10, loc[:30], 1)
            pdf.ln()

        # Output
        output_dir = "/app/data/reports"
        import os
        os.makedirs(output_dir, exist_ok=True)
        filename = f"inventory_summary.pdf"
        filepath = os.path.join(output_dir, filename)
        
        pdf.output(filepath)
        return f"/static/reports/{filename}"

report_generator = ReportGenerator()
