import { useState, useCallback } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';
import ForecastTimePicker, { toApiStr } from './components/ForecastTimePicker';
import MonthPicker from './components/MonthPicker';

export default function App() {
  const [activeLayer, setActiveLayer] = useState('temperature');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layerSettings, setLayerSettings] = useState({
    temperature:  { visible: true, opacity: 0.75 },
    pm25:         { visible: true, opacity: 0.78 },
    heat:         { visible: true, opacity: 0.78 },
    stream:       { visible: true, opacity: 0.85 },
    monthly_temp: { visible: true, opacity: 0.80 },
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const updateLayerSetting = useCallback((id, key, value) => {
    setLayerSettings(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  }, []);
  const [forecastDatetime, setForecastDatetime] = useState(() => {
    const now = new Date();
    const h = Math.floor(now.getUTCHours() / 3) * 3;
    return toApiStr(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h)));
  });

  const handleMapClick = useCallback(() => {
    setSelectedDistrict(null);
  }, []);

  const handleDistrictSelect = useCallback((district) => {
    setSelectedDistrict(district);
    if (district) {
      setSearchQuery('');
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      <MapView
        activeLayer={activeLayer}
        selectedDistrict={selectedDistrict}
        onDistrictClick={handleDistrictSelect}
        onMapClick={handleMapClick}
        forecastDatetime={forecastDatetime}
        layerSettings={layerSettings}
        selectedMonth={selectedMonth}
      />
      <Sidebar
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
        selectedDistrict={selectedDistrict}
        onDistrictSelect={handleDistrictSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        layerSettings={layerSettings}
        onLayerSettingChange={updateLayerSetting}
      />
      {activeLayer === 'temperature' && (
        <ForecastTimePicker
          datetime={forecastDatetime}
          onChange={setForecastDatetime}
          sidebarOpen={sidebarOpen}
        />
      )}
      {activeLayer === 'monthly_temp' && (
        <MonthPicker
          selectedMonth={selectedMonth}
          onChange={setSelectedMonth}
          sidebarOpen={sidebarOpen}
        />
      )}
      <ChatBot />
    </div>
  );
}
