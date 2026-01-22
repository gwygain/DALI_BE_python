"""
Shipping service for calculating shipping fees.
"""
import logging
from decimal import Decimal
from geopy.distance import geodesic
from app.models import Address
from app.core.config import settings

logger = logging.getLogger(__name__)


class ShippingService:
    """Service for shipping calculations."""
    
    # Constants
    BASE_RATE = 50.0  # Base shipping rate in pesos
    PER_KM_RATE = 20.0  # Rate per kilometer (₱20/km)
    PRIORITY_FEE_ADDITION = 100.0  # Additional fee for priority delivery
    
    # Metro Manila city IDs (province_id = 1)
    METRO_MANILA_CITY_IDS = {
        1356,  # Caloocan City
        1360,  # Las Piñas City
        1361,  # Makati City
        1357,  # Malabon City
        1351,  # Mandaluyong City
        1350,  # Manila
        1352,  # Marikina City
        1362,  # Muntinlupa City
        1358,  # Navotas City
        1353,  # Parañaque City
        1354,  # Pasay City
        1355,  # Pasig City
        1359,  # Quezon City
        1363,  # San Juan City
        1364,  # Taguig City
        1365,  # Valenzuela City
        1366,  # Pateros
    }
    
    @staticmethod
    def calculate_shipping_fee(address: Address, delivery_method: str) -> float:
        """Calculate shipping fee based on distance and delivery method.
        
        Formula: BASE_RATE + (distance_km * PER_KM_RATE)
        For Priority Delivery: add PRIORITY_FEE_ADDITION
        """
        # Check if address has coordinates
        if not address.latitude or not address.longitude:
            # Return base rate if no coordinates (shouldn't happen with new validation)
            logger.warning(f"Address {address.address_id} has no coordinates, using base rate")
            return ShippingService.BASE_RATE
        
        # Calculate distance from warehouse to customer
        warehouse_coords = (settings.WAREHOUSE_LAT, settings.WAREHOUSE_LON)
        customer_coords = (float(address.latitude), float(address.longitude))
        
        distance_km = geodesic(warehouse_coords, customer_coords).kilometers
        
        # Calculate fee: base + (distance * per_km_rate)
        fee = ShippingService.BASE_RATE + (distance_km * ShippingService.PER_KM_RATE)
        
        # Add priority fee if needed
        if delivery_method == "Priority Delivery":
            fee += ShippingService.PRIORITY_FEE_ADDITION
        
        return round(fee, 2)
    
    @staticmethod
    def calculate_distance(address: Address) -> float:
        """Calculate distance in km from warehouse to address."""
        if not address.latitude or not address.longitude:
            return 0.0
        
        warehouse_coords = (settings.WAREHOUSE_LAT, settings.WAREHOUSE_LON)
        customer_coords = (float(address.latitude), float(address.longitude))
        
        return round(geodesic(warehouse_coords, customer_coords).kilometers, 2)
    
    @staticmethod
    def is_metro_manila(address: Address) -> bool:
        """Check if address is within Metro Manila.
        
        Returns:
            True if address is in Metro Manila (province_id=1 and city is in Metro Manila cities)
            False otherwise
        """
        # Check if province is Metro Manila (province_id = 1)
        if address.province_id != 1:
            return False
        
        # Check if city is one of the Metro Manila cities
        return address.city_id in ShippingService.METRO_MANILA_CITY_IDS
    
    @staticmethod
    def is_store_in_metro_manila(store) -> bool:
        """Check if store is within Metro Manila based on coordinates.
        
        Metro Manila approximate boundaries:
        - Latitude: 14.4° to 14.8° N
        - Longitude: 120.9° to 121.15° E
        
        Returns:
            True if store coordinates are within Metro Manila bounds
            False otherwise
        """
        if not store.store_lat or not store.store_lng:
            return False
        
        lat = float(store.store_lat)
        lng = float(store.store_lng)
        
        # Metro Manila boundaries
        return (14.4 <= lat <= 14.8) and (120.9 <= lng <= 121.15)
