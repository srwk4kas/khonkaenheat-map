import { useState, useCallback } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';

export default function App() {
  const [activeLayer, setActiveLayer] = useState('temperature');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      />
    </div>
  );
}
