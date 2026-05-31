import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { KK_CENTER, KK_BOUNDS, KK_DEFAULT_ZOOM, districts } from '../data/mockData';
import TemperatureLayer from './layers/TemperatureLayer';
import PM25Layer from './layers/PM25Layer';
import HeatAccumulationLayer from './layers/HeatAccumulationLayer';
import 'leaflet/dist/leaflet.css';

function BoundsLocker() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(KK_BOUNDS);
    map.options.maxBoundsViscosity = 0.85;
    map.options.minZoom = 8;
  }, [map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', onMapClick);
    return () => map.off('click', onMapClick);
  }, [map, onMapClick]);
  return null;
}

export default function MapView({ activeLayer, selectedDistrict, onDistrictClick, onMapClick }) {
  const selectedId = selectedDistrict?.id;

  return (
    <MapContainer
      center={KK_CENTER}
      zoom={KK_DEFAULT_ZOOM}
      maxBounds={KK_BOUNDS}
      maxBoundsViscosity={0.85}
      minZoom={8}
      maxZoom={14}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
      className="z-0"
    >
      {/* Dark styled basemap */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />

      <BoundsLocker />
      <MapClickHandler onMapClick={onMapClick} />

      {/* Zoom control — bottom right */}
      <div className="leaflet-control-container">
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control-zoom leaflet-bar leaflet-control" />
        </div>
      </div>

      {activeLayer === 'temperature' && (
        <TemperatureLayer
          districts={districts}
          onDistrictClick={onDistrictClick}
          selectedId={selectedId}
        />
      )}

      {activeLayer === 'pm25' && (
        <PM25Layer
          districts={districts}
          onDistrictClick={onDistrictClick}
          selectedId={selectedId}
        />
      )}

      {activeLayer === 'heat' && (
        <HeatAccumulationLayer
          districts={districts}
          onDistrictClick={onDistrictClick}
          selectedId={selectedId}
        />
      )}
    </MapContainer>
  );
}
