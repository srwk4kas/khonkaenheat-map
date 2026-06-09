import { useState, useEffect } from 'react';

const KK_WMO       = '48381'; // KHON KAEN Weather Observing Station
const STORAGE_KEY  = 'tmd_kk_daily';
const CACHE_KEY    = 'tmd_kk_last';

/* Bangkok-local date string YYYY-MM-DD */
function bkkDateStr() {
  return new Date().toLocaleString('sv', { timeZone: 'Asia/Bangkok' }).slice(0, 10);
}

/* Persist a temperature reading and return today's accumulated max/min */
function recordReading(temp) {
  const today = bkkDateStr();
  let store = {};
  try { store = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch {}

  // Keep only today's readings
  const readings = (store[today] ?? []).filter(r => typeof r === 'number');
  readings.push(temp);

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ [today]: readings }));

  return {
    max: Math.max(...readings),
    min: Math.min(...readings),
  };
}

/* Save/load the last successful TMD observation to localStorage */
function saveLastData(d) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch {}
}
function loadLastData() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null'); } catch { return null; }
}

/* Read accumulated max/min for today without adding a new reading */
function getDailyMaxMin() {
  const today = bkkDateStr();
  try {
    const store    = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    const readings = (store[today] ?? []).filter(r => typeof r === 'number');
    if (!readings.length) return { max: null, min: null };
    return { max: Math.max(...readings), min: Math.min(...readings) };
  } catch {
    return { max: null, min: null };
  }
}

function parseNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : Math.round(n * 10) / 10;
}

function extractKhonKaen(xmlText) {
  const doc      = new DOMParser().parseFromString(xmlText, 'text/xml');
  const stations = doc.querySelectorAll('Station');

  for (const s of stations) {
    if (s.querySelector('WmoStationNumber')?.textContent?.trim() !== KK_WMO) continue;
    const obs = s.querySelector('Observation');
    if (!obs) break;

    return {
      temperature: parseNum(obs.querySelector('Temperature')?.textContent),
      tempMax:     parseNum(obs.querySelector('MaxTemperature')?.textContent),
      tempMin:     parseNum(obs.querySelector('MinTemperature')?.textContent),
      humidity:    parseNum(obs.querySelector('RelativeHumidity')?.textContent),
      windSpeed:   parseNum(obs.querySelector('WindSpeed')?.textContent),
      windDir:     parseNum(obs.querySelector('WindDirection')?.textContent),
      pressure:    parseNum(obs.querySelector('MeanSeaLevelPressure')?.textContent),
      rainfall:    parseNum(obs.querySelector('Rainfall')?.textContent),
      observedAt:  obs.querySelector('DateTime')?.textContent?.trim() ?? null,
    };
  }
  return null;
}

export function useTMDWeather() {
  const [data,        setData]        = useState(() => loadLastData());
  const [dailyMaxMin, setDailyMaxMin] = useState(() => getDailyMaxMin());
  const [status,      setStatus]      = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const url = import.meta.env.PROD ? '/api/tmd-legacy' : '/tmd-weather';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const kk = extractKhonKaen(await res.text());

        if (!cancelled) {
          if (kk?.temperature != null) {
            recordReading(kk.temperature);
          }
          // Prefer direct API max/min; fall back to accumulated localStorage values
          const apiMM = { max: kk?.tempMax ?? null, min: kk?.tempMin ?? null };
          const stored = getDailyMaxMin();
          setDailyMaxMin({
            max: apiMM.max ?? stored.max,
            min: apiMM.min ?? stored.min,
          });
          if (kk) saveLastData(kk);
          setData(kk ?? loadLastData());
          setStatus(kk ? 'ok' : 'error');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    run();
    const id = setInterval(run, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return {
    data,
    status,
    dailyMax: dailyMaxMin.max,
    dailyMin: dailyMaxMin.min,
  };
}
