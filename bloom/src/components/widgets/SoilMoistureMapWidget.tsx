'use client';

import React from 'react';
import { Droplets } from 'lucide-react';

interface SoilProperties {
  ph: number;
  texture_name: string;
  ph_interpretation: string;
  texture_suitability: string;
}

interface MoistureMap {
  coordinates: number[][];
  moisture_level: number;
  moisture_status: string;
  color: string;
  area_hectares: number;
}

interface SoilMoistureData {
  analysis_type: string;
  coordinates: number[][];
  area_hectares: number;
  moisture_analysis: {
    status: string;
    level: number;
    recommendation: string;
    analysis_date: string;
    method: string;
  };
  soil_properties: SoilProperties | null;
  moisture_map: MoistureMap;
  irrigation_priority: string;
  analysis_timestamp: string;
}

interface SoilMoistureMapWidgetProps {
  data: SoilMoistureData;
}

const SoilMoistureMapWidget: React.FC<SoilMoistureMapWidgetProps> = ({ data }) => {
  const moisturePercentage = Math.round(data.moisture_analysis.level * 100);
  const isLow = data.irrigation_priority === 'High';

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-base font-semibold text-gray-800">Soil Moisture</h3>
          <p className="text-xs text-gray-500">{data.area_hectares} hectares</p>
        </div>
      </div>

      {/* Main Status Display */}
      <div className={`${isLow ? 'bg-orange-50' : 'bg-blue-50'} rounded-xl p-4 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className={`text-xs ${isLow ? 'text-orange-700' : 'text-blue-700'}`}>
            {data.moisture_analysis.status}
          </div>
          <div className={`text-3xl font-bold ${isLow ? 'text-orange-900' : 'text-blue-900'}`}>
            {moisturePercentage}%
          </div>
        </div>

        {/* Visual Bar */}
        <div className="relative h-3 bg-white bg-opacity-50 rounded-full overflow-hidden mb-3">
          <div
            className="absolute top-0 left-0 h-full transition-all duration-500 rounded-full"
            style={{
              width: `${moisturePercentage}%`,
              backgroundColor: data.moisture_map.color
            }}
          />
        </div>

        <p className={`text-sm ${isLow ? 'text-orange-800' : 'text-blue-800'}`}>
          {data.moisture_analysis.recommendation}
        </p>
      </div>

      {/* Soil Properties - Simplified */}
      {data.soil_properties && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500">pH</div>
            <div className="text-lg font-bold text-gray-800">{data.soil_properties.ph}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500">Texture</div>
            <div className="text-sm font-semibold text-gray-800">{data.soil_properties.texture_name}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
        {data.moisture_analysis.analysis_date} • NDVI-based
      </div>
    </div>
  );
};

export default SoilMoistureMapWidget;
