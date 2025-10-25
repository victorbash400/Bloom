'use client';

import React, { useEffect, useRef } from 'react';

interface Plot {
  plot_name: string;
  area_hectares: number;
  coordinates: number[][];
}

interface FarmMapData {
  farm_name: string;
  farm_center: {
    latitude: number;
    longitude: number;
  };
  county: string;
  total_area_hectares: number;
  plots: Record<string, Plot>;
}

interface FarmMapWidgetProps {
  data: FarmMapData;
}

const FarmMapWidget: React.FC<FarmMapWidgetProps> = ({ data }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedPlot, setSelectedPlot] = React.useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!mapContainerRef.current || !apiKey) return;

    // Load Google Maps API safely and only once
    const loadGoogleMaps = () =>
      new Promise<void>((resolve) => {
        if ((window as any).google?.maps) return resolve();

        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    loadGoogleMaps().then(() => {
      const google = (window as any).google;
      if (!google) return;

      // Initialize map only once
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapContainerRef.current!, {
          center: {
            lat: data.farm_center.latitude,
            lng: data.farm_center.longitude,
          },
          zoom: 15,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          gestureHandling: 'greedy',
        });
      } else {
        // Just recenter if data changes
        mapInstanceRef.current.setCenter({
          lat: data.farm_center.latitude,
          lng: data.farm_center.longitude,
        });
      }

      const map = mapInstanceRef.current;

      // Clear existing polygons before drawing new ones
      if ((map as any).__polygons) {
        (map as any).__polygons.forEach((p: any) => p.polygon.setMap(null));
      }

      (map as any).__polygons = Object.entries(data.plots).map(([key, plot]) => {
        const coords = plot.coordinates.map(([lng, lat]) => ({ lat, lng }));
        const isSelected = selectedPlot === key;
        return {
          key,
          polygon: new google.maps.Polygon({
            paths: coords,
            strokeColor: isSelected ? '#ef4444' : '#22c55e',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: isSelected ? '#ef4444' : '#22c55e',
            fillOpacity: 0.25,
            map,
          })
        };
      });
    });
  }, [data, apiKey, selectedPlot]);

  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm border border-gray-200/50 dark:border-zinc-800/50 transition-all">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {data.farm_name}
        </h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {data.county} • {data.total_area_hectares} ha
        </p>
      </div>

      {/* The actual map container — single layer only */}
      <div
        ref={mapContainerRef}
        className="rounded-xl overflow-hidden border border-gray-200/40 dark:border-zinc-700/50 shadow-inner"
        style={{ height: '200px', width: '100%' }}
      />

      <div className="mt-3 space-y-1.5">
        {Object.entries(data.plots).map(([key, plot]) => (
          <button
            key={key}
            onClick={() => setSelectedPlot(selectedPlot === key ? null : key)}
            className={`w-full flex justify-between items-center text-xs px-2.5 py-1.5 rounded-lg border transition ${
              selectedPlot === key
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                : 'bg-gray-50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-700/40 hover:bg-gray-100/70 dark:hover:bg-zinc-700/40'
            }`}
          >
            <span className={`font-medium ${selectedPlot === key ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
              {plot.plot_name}
            </span>
            <span className={selectedPlot === key ? 'text-red-600 dark:text-red-500' : 'text-gray-500 dark:text-gray-400'}>
              {plot.area_hectares} ha
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FarmMapWidget;
