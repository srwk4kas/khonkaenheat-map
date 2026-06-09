import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

/* ── Pixel Box icon ─────────────────────────────────────────────────
   ล่าสุด → สีน้ำเงิน + inner dot สว่าง
   ก่อนหน้า → สีม่วง + inner dot จางลง
   ──────────────────────────────────────────────────────────────────── */
const PIXEL_BOX = (isLast) => {
  const bg     = isLast ? '#3b82f6' : '#6366f1';
  const border = isLast ? '#1d4ed8' : '#4338ca';
  const dot    = isLast ? '#ffffff' : 'rgba(255,255,255,0.55)';
  return `
    <div style="
      position: relative;
      width: 20px; height: 20px;
      background: ${bg};
      border: 2.5px solid ${border};
      border-radius: 3px;
      box-shadow:
        inset 1px 1px 0 rgba(255,255,255,0.35),
        inset -1px -1px 0 rgba(0,0,0,0.25),
        0 2px 8px ${bg}88;
      image-rendering: pixelated;
    ">
      <!-- pixel highlight top-left -->
      <div style="
        position:absolute; top:2px; left:2px;
        width:4px; height:4px;
        background: rgba(255,255,255,0.55);
      "></div>
      <!-- center dot -->
      <div style="
        position:absolute;
        top:50%; left:50%;
        transform:translate(-50%,-50%);
        width:5px; height:5px;
        background:${dot};
        border-radius:1px;
      "></div>
    </div>
  `;
};

export default function PinLayer({ pins }) {
  const map = useMap();

  useEffect(() => {
    if (!pins?.length) return;

    const markers = pins.map((pin, i) => {
      const isLast = i === 0;
      const color  = isLast ? '#3b82f6' : '#6366f1';

      const icon = L.divIcon({
        className:   '',
        html:        PIXEL_BOX(isLast),
        iconSize:    [20, 20],
        iconAnchor:  [10, 10],
        popupAnchor: [0, -14],
      });

      const d = new Date(pin.created_at);
      const timeStr = d.toLocaleString('th-TH', {
        hour: '2-digit', minute: '2-digit',
        day: 'numeric', month: 'short',
        timeZone: 'Asia/Bangkok',
      });

      const marker = L.marker([pin.lat, pin.lng], { icon });
      marker.bindTooltip(
        `<div style="font-size:12px">
          <div style="font-weight:700;color:${color};margin-bottom:2px">
            ${isLast ? '⬛ บล็อกล่าสุด' : '⬛ บล็อก'}
          </div>
          <div style="color:#475569;font-size:10px;font-family:monospace">
            ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}
          </div>
          <div style="color:#94a3b8;font-size:10px;margin-top:2px">${timeStr}</div>
        </div>`,
        { direction: 'top', className: 'custom-tooltip' }
      );
      return marker;
    });

    const group = L.layerGroup(markers);
    group.addTo(map);
    return () => group.removeFrom(map);
  }, [map, pins]);

  return null;
}
