from fastapi import APIRouter
from typing import Any

router = APIRouter()

@router.get("/init")
def get_dashboard_init() -> Any:
    # Providing the mocked structure expected by the React Dashboard
    return {
        "quick_stats": {
            "total_value": 3450000,
            "total_value_trend": "+12.5%",
            "active_count": 42,
            "active_count_trend": "+4",
            "pending_count": 18,
            "pending_count_trend": "-2"
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
