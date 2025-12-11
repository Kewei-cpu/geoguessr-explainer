import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoLocationResult } from '../types';

// Fix for default Leaflet marker icons in some bundlers
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapDisplayProps {
  result: GeoLocationResult | null;
}

// Helper component to update map view when coordinates change
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 6, {
      duration: 2
    });
  }, [center, map]);
  return null;
};

export const MapDisplay: React.FC<MapDisplayProps> = ({ result }) => {
  const defaultCenter: [number, number] = [20, 0]; // World view

  // Validate coordinates to prevent Leaflet crashes (NaN errors)
  const hasValidCoordinates = result && 
    typeof result.latitude === 'number' && 
    typeof result.longitude === 'number' && 
    !isNaN(result.latitude) && 
    !isNaN(result.longitude);

  const center: [number, number] = hasValidCoordinates
    ? [result!.latitude, result!.longitude]
    : defaultCenter;

  return (
    <div className="h-full w-full rounded-xl overflow-hidden relative z-0">
      <MapContainer
        center={center}
        zoom={2}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ background: '#1f2937' }} // Matches gray-800
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {hasValidCoordinates && result && (
          <>
            <Marker position={[result.latitude, result.longitude]} icon={customIcon}>
              <Popup className="text-black">
                <strong className="block text-lg">{result.country}</strong>
                {result.region && <span className="block text-sm text-gray-600">{result.region}</span>}
                <span className="block text-xs text-gray-500 mt-1">
                  {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                </span>
              </Popup>
            </Marker>
            <MapUpdater center={[result.latitude, result.longitude]} />
          </>
        )}
      </MapContainer>
      
      {/* Decorative Overlay for "Map" label */}
      <div className="absolute top-4 right-4 z-[400] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono tracking-wider text-gray-300 pointer-events-none">
        交互式地图
      </div>
    </div>
  );
};