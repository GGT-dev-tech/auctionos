from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.property import Property
from app.models.user import User
from app.services.report_generator import report_generator

router = APIRouter()

@router.get("/{property_id}/pdf", response_model=dict)
def generate_report(
    property_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Generate a PDF report for a property.
    """
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    try:
        report_url = report_generator.generate_property_report(prop)
        return {"url": report_url}
    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail="Could not generate report")

@router.get("/summary", response_model=dict)
def generate_summary_report(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Generate a full inventory summary PDF.
    """
    try:
        properties = db.query(Property).all()
        report_url = report_generator.generate_inventory_summary(properties)
        return {"url": report_url}
    except Exception as e:
        print(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail="Could not generate summary")

@router.get("/stats", response_model=dict)
def get_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get aggregated statistics for dashboard/analysis.
    """
    try:
        total_properties = db.query(Property).count()
        active_count = db.query(Property).filter(Property.status == 'active').count()
        pending_count = db.query(Property).filter(Property.status == 'pending').count()
        sold_count = db.query(Property).filter(Property.status == 'sold').count()

        draft_count = db.query(Property).filter(Property.status == 'draft').count()

        draft_count = db.query(Property).filter(Property.status == 'draft').count()

        # Calculate Financials
        from sqlalchemy import func
        from app.models.property import PropertyDetails, AuctionDetails
        
        from app.models.expense import Expense

        # Total Assessed Value (from PropertyDetails)
        total_assessed_value = db.query(func.sum(PropertyDetails.assessed_value)).scalar() or 0
        
        # Total Potential Value (Opening Bids of Active/Draft)
        total_opening_bids = db.query(func.sum(Property.price)).filter(
            Property.status.in_(['active', 'draft'])
        ).scalar() or 0
        
        # Total Sold Value
        total_sold_value = db.query(func.sum(Property.price)).filter(Property.status == 'sold').scalar() or 0

        # Total Expenses
        total_expenses = db.query(func.sum(Expense.amount)).scalar() or 0
        
        # Net Profit (Sold - (Purchase + Expenses))
        # Note: Purchase price is often not tracked directly, assuming 'opening_bid' or 'price' at acquisition?
        # For now, let's use:
        # Gross Revenue = Total Sold Value
        # Total Cost = Total Expenses (plus acquisition cost if available)
        # Net Profit = Gross Revenue - Total Expenses
        net_profit = total_sold_value - total_expenses
        
        # Group by County (Top 5)

        # Group by County (Top 5)
        county_stats = db.query(
            Property.county, func.count(Property.id)
        ).group_by(Property.county).order_by(func.count(Property.id).desc()).limit(5).all()
        
        county_data = [{"name": c[0] or "Unknown", "count": c[1]} for c in county_stats]

        return {
            "total_properties": total_properties,
            "active_count": active_count,
            "pending_count": pending_count,
            "sold_count": sold_count,
            "draft_count": draft_count,
            "total_assessed_value": total_assessed_value,
            "total_opening_bids": total_opening_bids,
            "total_sold_value": total_sold_value,
            "total_expenses": total_expenses,
            "net_profit": net_profit,
            "county_stats": county_data
        }
    except Exception as e:
        print(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch stats")
