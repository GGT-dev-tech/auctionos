from typing import List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import asc, or_, text
from app.models.auction_event import AuctionEvent

class AuctionRepository:
    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100,
        name: Optional[str] = None,
        state: Optional[str] = None,
        county: Optional[str] = None,
        is_presential: Optional[bool] = None,
        sort_by_date: bool = True
    ) -> List[AuctionEvent]:
        query = db.query(AuctionEvent)

        if name:
            query = query.filter(or_(
                AuctionEvent.name.ilike(f"%{name}%"),
                AuctionEvent.short_name.ilike(f"%{name}%")
            ))
        if state:
            query = query.filter(AuctionEvent.state.ilike(f"%{state}%"))
        if county:
            query = query.filter(AuctionEvent.county.ilike(f"%{county}%"))
        if is_presential is not None:
            if is_presential:
                query = query.filter(AuctionEvent.location != "Online")
            else:
                query = query.filter(AuctionEvent.location == "Online")

        if sort_by_date:
            query = query.order_by(asc(AuctionEvent.auction_date))

        return query.offset(skip).limit(limit).all()

    def get_calendar_events(
        self, db: Session,
        name: Optional[str] = None,
        state: Optional[str] = None,
        county: Optional[str] = None,
        is_presential: Optional[bool] = None,
    ) -> List[Any]:
        # Build dynamic WHERE clause
        where_clauses = []
        params = {}
        
        if name:
            where_clauses.append("(name ILIKE :name OR short_name ILIKE :name)")
            params['name'] = f"%{name}%"
        if state:
            where_clauses.append("state ILIKE :state")
            params['state'] = f"%{state}%"
        if county:
            where_clauses.append("county ILIKE :county")
            params['county'] = f"%{county}%"
        if is_presential is not None:
            if is_presential:
                where_clauses.append("location != 'Online'")
            else:
                where_clauses.append("location = 'Online'")

        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)

        query = text(f"""
            SELECT 
                id as auction_id,
                name as event_title,
                auction_date as event_date,
                time as event_time,
                location as event_location,
                notes as event_notes,
                tax_status,
                parcels_count as property_count,
                '' as linked_properties,
                '' as statuses,
                register_link,
                list_link
            FROM auction_events
            {where_sql}
            ORDER BY auction_date ASC
        """)
        
        results = db.execute(query, params).fetchall()
        return [dict(r._mapping) for r in results]

auction_repo = AuctionRepository()
