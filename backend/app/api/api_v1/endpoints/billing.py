from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps
from app.models.user import User

router = APIRouter()

class SubscriptionPlanInfo(BaseModel):
    name: str
    price_usd: float
    features: list[str]

PLANS = {
    "trial": SubscriptionPlanInfo(
        name="Trial", 
        price_usd=0.0, 
        features=["7-day access", "5 property searches", "Basic view"]
    ),
    "pro": SubscriptionPlanInfo(
        name="Pro Investor", 
        price_usd=130.0, 
        features=["5000 searches", "5000 custom properties", "Tasks & Exports"]
    ),
    "enterprise": SubscriptionPlanInfo(
        name="Enterprise", 
        price_usd=350.0, 
        features=["Unlimited searches", "Unlimited properties", "Dedicated Support"]
    )
}

class SubscribePayload(BaseModel):
    plan_type: str
    payment_method: str = "stub_card_token"

@router.get("/plans")
def get_plans() -> dict:
    """Returns available subscription plans."""
    return PLANS

@router.get("/subscription")
def get_my_subscription(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Returns the current user's subscription and usage metrics."""
    sub = db.execute(
        text("SELECT * FROM user_subscriptions WHERE user_id = :uid"),
        {"uid": current_user.id}
    ).fetchone()
    
    if not sub:
        # Auto-create trial if it doesn't exist
        end_date = datetime.now(timezone.utc) + timedelta(days=7)
        row = db.execute(text("""
            INSERT INTO user_subscriptions (user_id, plan_type, status, end_date)
            VALUES (:uid, 'trial', 'active', :end_date)
            RETURNING *
        """), {"uid": current_user.id, "end_date": end_date}).fetchone()
        db.commit()
        sub = row
        
    return dict(sub._mapping)

@router.post("/subscribe")
def subscribe_to_plan(
    payload: SubscribePayload,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Stub endpoint for payment processing."""
    if payload.plan_type not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    # In a real app, integrate Stripe/PayPal here.
    
    end_date = datetime.now(timezone.utc) + timedelta(days=30) if payload.plan_type != "enterprise" else datetime.now(timezone.utc) + timedelta(days=365)
    
    db.execute(text("""
        INSERT INTO user_subscriptions (user_id, plan_type, status, end_date)
        VALUES (:uid, :plan, 'active', :end_date)
        ON CONFLICT (user_id) DO UPDATE 
        SET plan_type = EXCLUDED.plan_type,
            status = 'active',
            end_date = EXCLUDED.end_date
    """), {
        "uid": current_user.id,
        "plan": payload.plan_type,
        "end_date": end_date
    })
    db.commit()
    
    return {"ok": True, "message": f"Successfully subscribed to {payload.plan_type}"}

@router.get("/usage")
def get_storage_usage(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Returns storage usage for the company."""
    if not current_user.company_id and not current_user.active_company_id:
        return {"total_bytes": 0, "limit_bytes": 5 * 1024 * 1024 * 1024} # 5GB free limit
        
    company_id = current_user.company_id or current_user.active_company_id
    usage = db.execute(
        text("SELECT * FROM storage_usage WHERE company_id = :cid"),
        {"cid": company_id}
    ).fetchone()
    
    # Calculate usage based on properties in lists and team members
    prop_count = db.execute(text("""
        SELECT COUNT(*) FROM list_properties lp 
        JOIN user_lists ul ON lp.list_id = ul.id 
        WHERE ul.company_id = :cid
    """), {"cid": company_id}).scalar() or 0
    
    team_count = db.execute(text("""
        SELECT COUNT(*) FROM users 
        WHERE company_id = :cid AND role IN ('manager', 'agent')
    """), {"cid": company_id}).scalar() or 0
    
    # Proxy: 1.5MB per property in lists, 10MB per team member
    bytes_used = usage.total_bytes if usage else ((prop_count * 1500 * 1024) + (team_count * 10 * 1024 * 1024))
    
    # Fetch subscription to define limit
    sub = db.execute(
        text("SELECT plan_type FROM user_subscriptions WHERE user_id = :uid"),
        {"uid": current_user.id}
    ).fetchone()
    
    plan = sub.plan_type if sub else 'trial'
    limits = {
        "trial": 5 * 1024 * 1024 * 1024, # 5GB
        "pro": 100 * 1024 * 1024 * 1024, # 100GB
        "enterprise": 1024 * 1024 * 1024 * 1024 # 1TB
    }
    limit_bytes = limits.get(plan, limits["trial"])
    
    return {
        "total_bytes": bytes_used,
        "limit_bytes": limit_bytes,
        "usage_percent": round((bytes_used / limit_bytes) * 100, 2)
    }
