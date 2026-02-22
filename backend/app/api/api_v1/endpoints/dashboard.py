from fastapi import APIRouter
from typing import Any

router = APIRouter()

@router.get("/init")
def get_dashboard_init() -> Any:
    # Providing the mocked structure expected by the React Dashboard
    return {
        "quick_stats": {
            "total_value": 0,
            "active_count": 0,
            "pending_count": 0
        },
        "county_stats": [],
        "analytics": {
            "status_distribution": {
                "active": 0,
                "sold": 0,
                "pending": 0
            },
            "spend_vs_equity": [
                {"name": "Spend", "value": 0},
                {"name": "Equity", "value": 0}
            ],
            "county_breakdown": [
                {"range": "None", "value": 0}
            ]
        },
        "recent_activity": []
    }
