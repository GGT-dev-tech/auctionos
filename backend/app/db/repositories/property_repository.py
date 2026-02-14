from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.property import Property, PropertyDetails, Media, AuctionDetails
from app.schemas.property import PropertyCreate, PropertyUpdate

class PropertyRepository:
    def get(self, db: Session, id: str) -> Optional[Property]:
        return db.query(Property).filter(Property.id == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100, 
        state: Optional[str] = None, city: Optional[str] = None,
        county: Optional[str] = None, zip_code: Optional[str] = None,
        min_price: Optional[float] = None, max_price: Optional[float] = None,
        status: Optional[List[str]] = None,
        min_date: Optional[str] = None, max_date: Optional[str] = None,
        sort_by: Optional[str] = None, sort_desc: bool = False
    ) -> List[Property]:
        query = db.query(Property)
        
        # Joins if needed (for date filtering)
        if min_date or max_date or sort_by == 'auction_date':
            query = query.join(AuctionDetails, Property.id == AuctionDetails.property_id, isouter=True)

        if state:
            query = query.filter(Property.state == state)
        if city:
            query = query.filter(Property.city.ilike(f"%{city}%"))
        if county:
            query = query.filter(Property.county.ilike(f"%{county}%"))
        if zip_code:
            query = query.filter(Property.zip_code == zip_code)
            
        if min_price is not None:
             query = query.filter(Property.price >= min_price)
        if max_price is not None:
             query = query.filter(Property.price <= max_price)
             
        if status:
             query = query.filter(Property.status.in_(status))
             
        if min_date:
             query = query.filter(AuctionDetails.auction_date >= min_date)
        if max_date:
             query = query.filter(AuctionDetails.auction_date <= max_date)
             
        # Sorting
        if sort_by:
            if sort_by == 'price':
                sort_col = Property.price
            elif sort_by == 'auction_date':
                sort_col = AuctionDetails.auction_date
            elif sort_by == 'title':
                sort_col = Property.title
            else:
                sort_col = Property.created_at # Default
                
            if sort_desc:
                query = query.order_by(sort_col.desc())
            else:
                query = query.order_by(sort_col.asc())
        else:
            # Default sort by created_at desc
            query = query.order_by(Property.created_at.desc())

        return query.offset(skip).limit(limit).all()

    def get_by_parcel_id(self, db: Session, parcel_id: str) -> Optional[Property]:
        if not parcel_id:
            return None
        return db.query(Property).filter(Property.parcel_id == parcel_id).first()

    def get_by_address(self, db: Session, address: str) -> Optional[Property]:
        if not address:
            return None
        return db.query(Property).filter(Property.address == address).first()

    def create(self, db: Session, *, obj_in: PropertyCreate) -> Property:
        db_obj = Property(
            title=obj_in.title,
            address=obj_in.address,
            city=obj_in.city,
            state=obj_in.state,
            zip_code=obj_in.zip_code,
            county=obj_in.county,
            price=obj_in.price,
            status=obj_in.status,
            property_type=obj_in.property_type,
            description=obj_in.description,
            latitude=obj_in.latitude,
            longitude=obj_in.longitude,
            parcel_id=obj_in.parcel_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        if obj_in.details:
            # Use model_dump or dict to get all fields automatically
            details_data = obj_in.details.model_dump(exclude_unset=True) if hasattr(obj_in.details, 'model_dump') else obj_in.details.dict(exclude_unset=True)
            details_obj = PropertyDetails(
                property_id=db_obj.id,
                **details_data
            )
            db.add(details_obj)
        
        if obj_in.media:
            for media_item in obj_in.media:
                media_obj = Media(
                    property_id=db_obj.id,
                    media_type=media_item.media_type,
                    url=media_item.url,
                    is_primary=media_item.is_primary
                )

                db.add(media_obj)
        
        if obj_in.auction_details:
            auction_data = obj_in.auction_details.model_dump(exclude_unset=True) if hasattr(obj_in.auction_details, 'model_dump') else obj_in.auction_details.dict(exclude_unset=True)
            auction_obj = AuctionDetails(
                property_id=db_obj.id,
                **auction_data
            )
            db.add(auction_obj)

        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Property, obj_in: PropertyUpdate
    ) -> Property:
        obj_data = obj_in.model_dump(exclude_unset=True)
        
        # Handle details separately
        details_data = obj_data.pop("details", None)
        
        # Update Property fields
        for field in obj_data:
            setattr(db_obj, field, obj_data[field])
            
        # Update Details if provided
        if details_data:
            if db_obj.details:
                for field, value in details_data.items():
                    setattr(db_obj.details, field, value)
            else:
                # Create new details if they don't exist
                new_details = PropertyDetails(property_id=db_obj.id, **details_data)
                new_details = PropertyDetails(property_id=db_obj.id, **details_data)
                db.add(new_details)

        # Handle Auction Details
        if hasattr(obj_in, 'auction_details') and obj_in.auction_details:
             try:
                 if isinstance(obj_in.auction_details, dict):
                     auction_data = obj_in.auction_details
                 else:
                     auction_data = obj_in.auction_details.model_dump(exclude_unset=True) if hasattr(obj_in.auction_details, 'model_dump') else obj_in.auction_details.dict(exclude_unset=True)
                 
                 if db_obj.auction_details:
                     for field, value in auction_data.items():
                         setattr(db_obj.auction_details, field, value)
                 else:
                     new_auction = AuctionDetails(property_id=db_obj.id, **auction_data)
                     db.add(new_auction)
             except Exception as e:
                 print(f"Error updating auction details: {e}")
                 # Don't block the main update
                 pass


        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: str) -> Property:
        obj = db.query(Property).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def update_status_bulk(self, db: Session, *, ids: List[str], status: str) -> int:
        count = db.query(Property).filter(Property.id.in_(ids)).update(
            {Property.status: status}, synchronize_session=False
        )
        db.commit()
        return count

property_repo = PropertyRepository()
