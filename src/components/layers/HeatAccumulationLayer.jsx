import { CircleMarker, Tooltip } from 'react-leaflet';
import { getHeatColor, getHeatLevel } from '../../data/mockData';

export default function HeatAccumulationLayer({ districts, onDistrictClick, selectedId }) {
  return (
    <>
      {districts.map((district) => {
        const color = getHeatColor(district.heatValue);
        const level = getHeatLevel(district.heatValue);
        const isSelected = selectedId === district.id;
        const baseRadius = 20 + district.heatValue * 18;

        return (
          <g key={district.id}>
            {/* Outermost glow ring */}
            <CircleMarker
              center={[district.lat, district.lng]}
              radius={baseRadius + 18}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.06,
                stroke: false,
              }}
            />
            {/* Middle glow */}
            <CircleMarker
              center={[district.lat, district.lng]}
              radius={baseRadius + 8}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.15,
                stroke: false,
              }}
            />
            {/* Inner glow */}
            <CircleMarker
              center={[district.lat, district.lng]}
              radius={baseRadius}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.30,
                stroke: false,
              }}
            />
            {/* Core dot */}
            <CircleMarker
              center={[district.lat, district.lng]}
              radius={isSelected ? 14 : 10}
              pathOptions={{
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.88,
                color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)',
                weight: isSelected ? 2.5 : 1,
              }}
              eventHandlers={{ click: () => onDistrictClick(district) }}
            >
              <Tooltip
                direction="top"
                offset={[0, -6]}
                className="custom-tooltip"
              >
                <div className="font-medium">{district.name}</div>
                <div style={{ color }}>
                  การสะสมความร้อน: <strong>{level.label}</strong>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                  ดัชนีความร้อน: {Math.round(district.heatValue * 100)}%
                </div>
              </Tooltip>
            </CircleMarker>
          </g>
        );
      })}
    </>
  );
}
