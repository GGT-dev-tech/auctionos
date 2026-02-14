import json
from typing import Any, List, Optional
from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.api import deps
from app.models.user_role import UserRole
from app.models.property import Property, PropertyStatus, AuctionDetails

router = APIRouter()

from pydantic import BaseModel

class DashboardInit(BaseModel):
    role: UserRole
    linked_companies: List[schemas.Company]
    county_stats: List[dict]
    recent_activity: List[schemas.Property]
    quick_stats: dict
    analytics: dict

@router.get("/init", response_model=DashboardInit)
def get_dashboard_init(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all necessary data to initialize the dashboard based on user role.
    """
    # 1. Determine Scope
    company_ids = []
    if current_user.role == UserRole.MANAGER:
        company_ids = [c.id for c in current_user.companies]
    
    # 2. Base Query
    query = db.query(Property)
    if current_user.role == UserRole.MANAGER:
        if not company_ids:
            query = query.filter(Property.id == -1) # No companies linked
        else:
            query = query.filter(Property.company_id.in_(company_ids))
    elif current_user.role == UserRole.AGENT:
        # Agents see only their assigned or public properties (mock logic for now, show all for unassigned)
        pass 

    # 3. County Stats for Map
    # Group by State, County
    stats_query = db.query(
        Property.state,
        Property.county,
        func.count(Property.id).label("count")
    )
    
    if current_user.role == UserRole.MANAGER and company_ids:
        stats_query = stats_query.filter(Property.company_id.in_(company_ids))
    
    stats_query = stats_query.group_by(Property.state, Property.county).all()
    
    county_stats = [
        {"state": s[0], "county": s[1], "count": s[2]} 
        for s in stats_query if s[0] and s[1]
    ]

    # 4. Recent Activity (Last 5 added)
    recent_activity = query.order_by(Property.created_at.desc()).limit(5).all()

    # 5. Quick Stats
    # Join with AuctionDetails to get opening_bid
    total_value = query.join(AuctionDetails).with_entities(func.sum(AuctionDetails.opening_bid)).scalar() or 0.0
    active_count = query.filter(Property.status == PropertyStatus.ACTIVE).count()
    pending_count = query.filter(Property.status.in_([PropertyStatus.PENDING, PropertyStatus.DRAFT])).count()

    quick_stats = {
        "total_value": total_value,
        "active_count": active_count,
        "pending_count": pending_count
    }

    # 6. Analytics (New)
    from app.models.property import PropertyDetails
    
    # Status Distribution
    status_counts = db.query(
        Property.status,
        func.count(Property.id)
    ).group_by(Property.status).all()
    status_dist = {s[0]: s[1] for s in status_counts}

    # Potential Equity (Estimated Value - Price)
    equity_query = query.join(PropertyDetails, isouter=True)
    total_est_value = equity_query.with_entities(func.sum(PropertyDetails.estimated_value)).scalar() or 0.0
    total_potential_equity = total_est_value - total_value

    analytics = {
        "status_distribution": status_dist,
        "total_equity": total_potential_equity,
        "total_market_value": total_est_value,
        "spend_vs_equity": [
            {"name": "Total Spend", "value": total_value},
            {"name": "Potential Equity", "value": total_potential_equity}
        ],
        "county_breakdown": [{"range": f"{s['county']}, {s['state']}", "value": s['count']} for s in county_stats]
    }

    return {
        "role": current_user.role,
        "linked_companies": current_user.companies if current_user.role != UserRole.AGENT else [],
        "county_stats": county_stats,
        "recent_activity": recent_activity,
        "quick_stats": quick_stats,
        "analytics": analytics
    }
