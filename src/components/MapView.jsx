import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { KK_CENTER, KK_BOUNDS, KK_DEFAULT_ZOOM, hotspots } from '../data/mockData';
import TemperatureLayer from './layers/TemperatureLayer';
import PM25Layer from './layers/PM25Layer';
import HeatAccumulationLayer from './layers/HeatAccumulationLayer';
import TMDTempTileLayer from './layers/TMDTempTileLayer';
import StreamLayer from './layers/StreamLayer';
import NASATempMonthlyLayer from './layers/NASATempMonthlyLayer';
import HotspotLayer from './layers/HotspotLayer';
import 'leaflet/dist/leaflet.css';

function BoundsLocker() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(KK_BOUNDS);
    map.options.maxBoundsViscosity = 0.9;
    map.options.minZoom = 10;
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

export default function MapView({ activeLayers, tambons, selectedDistrict, onDistrictClick, onMapClick, forecastDatetime, layerSettings, selectedMonth }) {
  const selectedId = selectedDistrict?.id;
  const s = (id) => layerSettings?.[id] ?? { visible: true, opacity: 0.75 };
  const has = (id) => activeLayers?.has(id) ?? false;

  return (
    <MapContainer
      center={KK_CENTER}
      zoom={KK_DEFAULT_ZOOM}
      maxBounds={KK_BOUNDS}
      maxBoundsViscosity={0.9}
      minZoom={10}
      maxZoom={17}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
      className="z-0"
    >
      {/* Satellite basemap */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
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

      {has('temperature') && s('temperature').visible && forecastDatetime && (
        <TMDTempTileLayer datetime={forecastDatetime} opacity={s('temperature').opacity} />
      )}

      {has('temperature') && s('temperature').visible && (
        <TemperatureLayer
          districts={tambons}
          onDistrictClick={onDistrictClick}
          selectedId={selectedId}
          opacity={s('temperature').opacity}
        />
      )}

      {has('pm25') && s('pm25').visible && (
        <PM25Layer
          districts={tambons}
          onDistrictClick={onDistrictClick}
          selectedId={selectedId}
          opacity={s('pm25').opacity}
        />
      )}

      {has('heat') && s('heat').visible && (
        <HeatAccumulationLayer
          districts={tambons}
          onDistrictClick={onDistrictClick}
          selectedId={selectedId}
          opacity={s('heat').opacity}
        />
      )}

      {has('stream') && s('stream').visible && (
        <StreamLayer opacity={s('stream').opacity} />
      )}

      {has('monthly_temp') && s('monthly_temp').visible && selectedMonth && (
        <NASATempMonthlyLayer month={selectedMonth} opacity={s('monthly_temp').opacity} />
      )}

      {has('hotspot') && s('hotspot').visible && (
        <HotspotLayer hotspots={hotspots} opacity={s('hotspot').opacity} />
      )}
    </MapContainer>
  );
}
