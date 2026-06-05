import { FaExclamationTriangle, FaThermometerHalf, FaTint, FaWind } from 'react-icons/fa';
import { getHeatColor, getHeatLevel, hotspots } from '../data/mockData';

export default function RiskAreasView({ tambons }) {
  const riskTambons = [...(tambons || [])].sort((a, b) => b.heatValue - a.heatValue).slice(0, 8);

  return (
    <div
      className="absolute top-0 right-0 bottom-0 overflow-y-auto pb-[72px] md:pb-8"
      style={{ left: 'var(--nav-x)', background: 'linear-gradient(180deg,#fff7ed 0%,#f8faff 100%)' }}
    >
      <div className="max-w-md md:max-w-2xl mx-auto px-4 md:px-8 pt-5 pb-4 space-y-3">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#fed7aa,#fdba74)' }}>
            <FaExclamationTriangle className="text-orange-600" size={16} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base">พื้นที่เสี่ยงภัย</h2>
            <p className="text-xs text-slate-400">อ.เมืองขอนแก่น · อัปเดตล่าสุด</p>
          </div>
        </div>

        {/* Hotspot cards */}
        <div>
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2">
            จุดความร้อนสูงสุด
          </p>
          <div className="space-y-2">
            {hotspots.map(h => {
              const isExtreme = h.intensity === 'extreme';
              const dotColor  = isExtreme ? '#ef4444' : '#f97316';
              return (
                <div key={h.id} className="rounded-2xl p-4 bg-white"
                  style={{ border: `1.5px solid ${isExtreme ? '#fca5a5' : '#fed7aa'}` }}>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: dotColor }} />
                      <div className="absolute inset-0 rounded-full animate-ping" style={{ background: dotColor, opacity: 0.4 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{h.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{h.lat.toFixed(3)}, {h.lng.toFixed(3)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-base" style={{ color: dotColor }}>{h.temperature}°C</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${dotColor}15`, color: dotColor }}>
                        {isExtreme ? 'วิกฤต' : 'สูง'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High-risk tambons */}
        <div>
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2">
            ตำบลเสี่ยงสูง (ความร้อนสะสม)
          </p>
          <div className="space-y-2">
            {riskTambons.map((d, i) => {
              const hColor = getHeatColor(d.heatValue);
              const hLevel = getHeatLevel(d.heatValue);
              return (
                <div key={d.id} className="rounded-2xl px-4 py-3 bg-white flex items-center gap-3"
                  style={{ border: '1px solid #ffe4cc' }}>
                  <span className="text-sm font-black w-5 text-right flex-shrink-0"
                    style={{ color: i < 3 ? '#ef4444' : '#f97316' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">ต.{d.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <FaThermometerHalf size={8} className="text-orange-300" />{d.temperature}°C
                      </span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <FaTint size={8} className="text-blue-300" />{d.humidity}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black" style={{ color: hColor }}>
                      {Math.round(d.heatValue * 100)}%
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${hColor}15`, color: hColor }}>
                      {hLevel.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
