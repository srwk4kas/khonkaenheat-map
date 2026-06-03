import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

// ขอบเขตโดยประมาณของอำเภอเมืองขอนแก่น (GeoJSON ใช้ [lng, lat])
const BOUNDARY = {
  type: 'Feature',
  properties: { name: 'อำเภอเมืองขอนแก่น' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [102.708, 16.545],
      [102.722, 16.558],
      [102.752, 16.566],
      [102.788, 16.563],
      [102.820, 16.560],
      [102.850, 16.557],
      [102.882, 16.548],
      [102.915, 16.532],
      [102.940, 16.513],
      [102.955, 16.485],
      [102.958, 16.452],
      [102.950, 16.418],
      [102.940, 16.388],
      [102.927, 16.360],
      [102.910, 16.340],
      [102.890, 16.325],
      [102.862, 16.318],
      [102.832, 16.316],
      [102.800, 16.320],
      [102.770, 16.330],
      [102.748, 16.346],
      [102.728, 16.366],
      [102.715, 16.390],
      [102.708, 16.418],
      [102.706, 16.455],
      [102.706, 16.495],
      [102.708, 16.520],
      [102.708, 16.545],
    ]],
  },
};

export default function MueangBoundaryLayer() {
  const map = useMap();

  useEffect(() => {
    // เส้นกลอว์ด้านนอก (ความหนา)
    const glowLayer = L.geoJSON(BOUNDARY, {
      style: {
        color: '#FFD700',
        weight: 6,
        opacity: 0.18,
        fillOpacity: 0,
        lineCap: 'round',
        lineJoin: 'round',
      },
    });

    // เส้นหลัก
    const lineLayer = L.geoJSON(BOUNDARY, {
      style: {
        color: '#FFD700',
        weight: 2,
        opacity: 0.88,
        fillOpacity: 0.03,
        fillColor: '#FFD700',
        dashArray: '10, 8',
        lineCap: 'round',
        lineJoin: 'round',
      },
    });

    // ป้ายชื่ออำเภอ
    const labelIcon = L.divIcon({
      className: '',
      html: `<div style="
        font-family:'Noto Sans Thai',sans-serif;
        font-size:12px;
        font-weight:700;
        color:#FFD700;
        text-shadow:0 0 6px rgba(0,0,0,0.9),0 1px 3px rgba(0,0,0,0.8);
        white-space:nowrap;
        letter-spacing:0.05em;
        pointer-events:none;
      ">อำเภอเมืองขอนแก่น</div>`,
      iconAnchor: [72, 8],
    });
    const label = L.marker([16.535, 102.820], { icon: labelIcon, interactive: false });

    glowLayer.addTo(map);
    lineLayer.addTo(map);
    label.addTo(map);

    return () => {
      glowLayer.removeFrom(map);
      lineLayer.removeFrom(map);
      label.removeFrom(map);
    };
  }, [map]);

  return null;
}
