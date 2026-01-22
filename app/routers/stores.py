"""
Stores router - handles store listing and search (JSON API).
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.models import Store
from app.schemas import StoreResponse
from app.services.shipping_service import ShippingService

router = APIRouter(prefix="/api/stores", tags=["stores"])


@router.get("", response_model=List[StoreResponse])
async def list_stores(
    search: Optional[str] = Query(None),
    metro_manila_only: bool = Query(False, description="Filter stores to Metro Manila only"),
    db: Session = Depends(get_db)
):
    """Get all stores with optional search and Metro Manila filter."""
    query = db.query(Store)
    
    if search:
        query = query.filter(Store.store_name.ilike(f"%{search}%"))
    
    stores = query.all()
    
    # Filter to Metro Manila stores if requested
    if metro_manila_only:
        stores = [s for s in stores if ShippingService.is_store_in_metro_manila(s)]
    
    return stores


@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(
    store_id: int,
    db: Session = Depends(get_db)
):
    """Get store by ID."""
    store = db.query(Store).filter(Store.store_id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store
