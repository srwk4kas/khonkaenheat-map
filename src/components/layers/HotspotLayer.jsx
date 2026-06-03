import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

export default function HotspotLayer({ hotspots, opacity = 0.9 }) {
  const map = useMap();

  useEffect(() => {
    const markers = hotspots.map((h) => {
      const isExtreme = h.intensity === 'extreme';
      const color = isExtreme ? '#FF3300' : '#FF7700';
      const size = isExtreme ? 48 : 38;
      const half = size / 2;

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
            <div class="hotspot-ring" style="
              position:absolute;inset:0;border-radius:50%;
              border:2px solid ${color};
              opacity:${opacity * 0.6};
            "></div>
            <div class="hotspot-ring" style="
              position:absolute;inset:${size * 0.2}px;border-radius:50%;
              border:2px solid ${color};
              animation-delay:0.6s;
              opacity:${opacity * 0.6};
            "></div>
            <div style="
              width:${isExtreme ? 14 : 11}px;
              height:${isExtreme ? 14 : 11}px;
              border-radius:50%;
              background:${color};
              opacity:${opacity};
              box-shadow:0 0 10px ${color},0 0 20px ${color}80;
              position:relative;z-index:1;
            "></div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [half, half],
      });

      const marker = L.marker([h.lat, h.lng], { icon });
      marker.bindTooltip(
        `<div>
          <div style="font-weight:600;margin-bottom:2px">🔥 ${h.description}</div>
          <div style="color:${color}">อุณหภูมิ: <strong>${h.temperature}°C</strong></div>
          <div style="color:#94a3b8;font-size:11px">${isExtreme ? 'ระดับวิกฤต' : 'ระดับสูงมาก'}</div>
        </div>`,
        { direction: 'top', offset: [0, -half], className: 'custom-tooltip' }
      );
      return marker;
    });

    const group = L.layerGroup(markers);
    group.addTo(map);
    return () => group.removeFrom(map);
  }, [map, hotspots, opacity]);

  return null;
}
