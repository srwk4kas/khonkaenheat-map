import { useState, useEffect, useCallback } from 'react';
import { tambons as baseTambons } from '../data/mockData';

const REFRESH_MS = 30 * 60 * 1000; // รีเฟรชทุก 30 นาที

// แปลงอุณหภูมิเป็นดัชนีความร้อนสะสม (0–1)
function heatFromTemp(temp) {
  return Math.min(1, Math.max(0, (temp - 28) / 15));
}

export function useRealtimeWeather() {
  const [tambons, setTambons] = useState(baseTambons);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setStatus(prev => (prev === 'ok' ? 'refreshing' : 'loading'));
    try {
      const lats = baseTambons.map(t => t.lat).join(',');
      const lngs = baseTambons.map(t => t.lng).join(',');

      // ดึงข้อมูลอุณหภูมิ + ความชื้น + ความเร็วลม
      const wxPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m` +
        `&timezone=Asia%2FBangkok&wind_speed_unit=kmh`
      ).then(r => r.json());

      // ดึงข้อมูลคุณภาพอากาศ PM2.5
      const aqPromise = fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lngs}` +
        `&current=pm2_5&timezone=Asia%2FBangkok`
      ).then(r => r.json());

      const [wxResult, aqResult] = await Promise.allSettled([wxPromise, aqPromise]);

      // รองรับทั้ง response แบบ array (multi-location) และ object (single)
      const wxArr = wxResult.status === 'fulfilled'
        ? (Array.isArray(wxResult.value) ? wxResult.value : [wxResult.value])
        : [];
      const aqArr = aqResult.status === 'fulfilled'
        ? (Array.isArray(aqResult.value) ? aqResult.value : [aqResult.value])
        : [];

      const updated = baseTambons.map((t, i) => {
        const w = wxArr[i]?.current;
        const a = aqArr[i]?.current;
        const temp = w?.temperature_2m ?? t.temperature;
        return {
          ...t,
          temperature: Math.round(temp * 10) / 10,
          humidity:    w?.relative_humidity_2m != null ? Math.round(w.relative_humidity_2m) : t.humidity,
          windSpeed:   w?.wind_speed_10m       != null ? Math.round(w.wind_speed_10m * 10) / 10 : t.windSpeed,
          pm25:        a?.pm2_5               != null ? Math.round(a.pm2_5) : t.pm25,
          heatValue:   heatFromTemp(temp),
        };
      });

      setTambons(updated);
      setLastUpdated(new Date());
      setStatus('ok');
    } catch {
      setStatus(prev => (prev === 'loading' ? 'error' : 'ok'));
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { tambons, status, lastUpdated, refresh };
}
