import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom pink marker icon
const pinkMarkerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path fill="#D5A8B0" stroke="#8B5A5A" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z"/>
      <circle fill="white" cx="12" cy="12" r="5"/>
    </svg>
  `,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

// Component to handle map clicks
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={pinkMarkerIcon} /> : null;
};

// Component to recenter map
const MapController = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  
  return null;
};

const LocationPicker = ({ 
  latitude, 
  longitude, 
  onChange, 
  onValidate,
  provinceName,
  cityName,
  barangayName 
}) => {
  // Default center (Manila)
  const defaultCenter = [14.5995, 120.9842];
  
  // Parse lat/lng to ensure they're numbers
  const parsedLat = latitude ? parseFloat(latitude) : null;
  const parsedLng = longitude ? parseFloat(longitude) : null;
  
  const [position, setPosition] = useState(
    parsedLat && parsedLng ? { lat: parsedLat, lng: parsedLng } : null
  );
  const [mapCenter, setMapCenter] = useState(
    parsedLat && parsedLng ? [parsedLat, parsedLng] : defaultCenter
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Update position when lat/lng props change
  useEffect(() => {
    const lat = latitude ? parseFloat(latitude) : null;
    const lng = longitude ? parseFloat(longitude) : null;
    if (lat && lng) {
      setPosition({ lat, lng });
      setMapCenter([lat, lng]);
    }
  }, [latitude, longitude]);

  // When position changes, notify parent
  useEffect(() => {
    if (position) {
      onChange(position.lat, position.lng);
    }
  }, [position]);

  // Search for location based on address
  const searchLocation = async () => {
    if (!provinceName || !cityName || !barangayName) {
      setSearchError('Please select province, city, and barangay first');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      // Use Nominatim for geocoding
      const query = `${barangayName}, ${cityName}, ${provinceName}, Philippines`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'DALI-Ecommerce/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        setPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        // Fallback: try just city and province
        const fallbackQuery = `${cityName}, ${provinceName}, Philippines`;
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1`,
          {
            headers: {
              'User-Agent': 'DALI-Ecommerce/1.0'
            }
          }
        );
        
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData && fallbackData.length > 0) {
          const { lat, lon } = fallbackData[0];
          const newCenter = [parseFloat(lat), parseFloat(lon)];
          setMapCenter(newCenter);
          setSearchError('Area found! Please click on the map to pin your exact location.');
        } else {
          setSearchError('Location not found. Please manually pin your location on the map.');
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setSearchError('Failed to search location. Please manually pin your location.');
    } finally {
      setIsSearching(false);
    }
  };

  // Use current location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setIsSearching(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setSearchError('Unable to get your location. Please pin manually.');
        setIsSearching(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="location-picker">
      <div className="location-picker-header">
        <label>Pin Your Exact Location <span className="required">*</span></label>
        <p className="location-picker-hint">
          Click on the map to mark your delivery location, or use the buttons below.
        </p>
      </div>

      <div className="location-picker-buttons">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={searchLocation}
          disabled={isSearching || !provinceName || !cityName || !barangayName}
        >
          {isSearching ? 'Searching...' : '📍 Find My Area'}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={useCurrentLocation}
          disabled={isSearching}
        >
          📱 Use Current Location
        </button>
      </div>

      {searchError && (
        <div className="location-picker-error">{searchError}</div>
      )}

      <div className="location-picker-map">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '300px', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
          <MapController center={mapCenter} />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      {position && (
        <div className="location-picker-coords">
          <span className="location-confirmed">✓ Location pinned</span>
          <small>
            ({Number(position.lat).toFixed(6)}, {Number(position.lng).toFixed(6)})
          </small>
        </div>
      )}

      {!position && (
        <div className="location-picker-warning">
          ⚠️ Please pin your location on the map to enable accurate delivery fee calculation
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
