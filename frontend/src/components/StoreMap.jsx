import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Custom pink marker icon using SVG data URL
const pinkIcon = new L.DivIcon({
  className: 'custom-pink-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path fill="#E91E63" stroke="#C2185B" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24C24 5.4 18.6 0 12 0z"/>
    <circle fill="white" cx="12" cy="12" r="5"/>
  </svg>`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36]
});

const StoreMap = ({ stores, selectedStore, onStoreSelect }) => {
  const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]); // Manila default

  useEffect(() => {
    if (selectedStore && selectedStore.store_lat && selectedStore.store_lng) {
      setMapCenter([parseFloat(selectedStore.store_lat), parseFloat(selectedStore.store_lng)]);
    } else if (stores && stores.length > 0) {
      const firstStoreWithCoords = stores.find(s => s.store_lat && s.store_lng);
      if (firstStoreWithCoords) {
        setMapCenter([parseFloat(firstStoreWithCoords.store_lat), parseFloat(firstStoreWithCoords.store_lng)]);
      }
    }
  }, [selectedStore, stores]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      key={`${mapCenter[0]}-${mapCenter[1]}`}
    >
      <TileLayer
        attribution='&copy; Google'
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      />
      {stores.map((store) =>
        store.store_lat && store.store_lng ? (
          <Marker
            key={store.store_id}
            position={[parseFloat(store.store_lat), parseFloat(store.store_lng)]}
            icon={pinkIcon}
            eventHandlers={{
              click: () => onStoreSelect && onStoreSelect(store),
            }}
          >
            <Tooltip direction="top" offset={[0, -30]} permanent={false}>
              {store.store_name}
            </Tooltip>
            <Popup>
              <strong>{store.store_name}</strong>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
};

export default StoreMap;
