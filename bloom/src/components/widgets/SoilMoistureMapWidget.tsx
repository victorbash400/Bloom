'use client';

import React from 'react';
import { Droplets, AlertTriangle, CheckCircle, Info } from 'lucide-react';

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
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
        return 'text-green-700 bg-green-50 border-green-300';
      case 'moderate':
        return 'text-blue-700 bg-blue-50 border-blue-300';
      case 'low':
        return 'text-orange-700 bg-orange-50 border-orange-300';
      case 'very low':
        return 'text-red-700 bg-red-50 border-red-300';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'moderate':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'low':
      case 'very low':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Droplets className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const moisturePercentage = Math.round(data.moisture_analysis.level * 100);

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-800">Soil Moisture Map</h3>
        </div>
        <div className="text-xs text-gray-600">
          {data.area_hectares} ha
        </div>
      </div>

      {/* Moisture Status */}
      <div className={`rounded-lg p-3 mb-3 border flex items-center justify-between ${getStatusColor(data.moisture_analysis.status)}`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(data.moisture_analysis.status)}
          <div>
            <div className="text-xs font-medium mb-1">Moisture Status</div>
            <div className="text-sm font-semibold">{data.moisture_analysis.status}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{moisturePercentage}%</div>
        </div>
      </div>

      {/* Visual Moisture Indicator */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Moisture Level</div>
        <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full transition-all duration-500"
            style={{ 
              width: `${moisturePercentage}%`,
              backgroundColor: data.moisture_map.color
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-800 mix-blend-difference">
              {moisturePercentage}%
            </span>
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Dry</span>
          <span className="text-xs text-gray-500">Optimal</span>
          <span className="text-xs text-gray-500">Wet</span>
        </div>
      </div>

      {/* Irrigation Priority */}
      <div className={`rounded-lg p-2 mb-3 border ${getPriorityColor(data.irrigation_priority)}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Irrigation Priority</span>
          <span className="text-sm font-bold">{data.irrigation_priority}</span>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <div className="text-xs font-medium text-blue-900 mb-1">Recommendation</div>
        <div className="text-sm text-blue-800">{data.moisture_analysis.recommendation}</div>
      </div>

      {/* Soil Properties */}
      {data.soil_properties && (
        <div className="space-y-2 mb-3">
          <div className="text-xs font-medium text-gray-700">Soil Properties</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1">pH Level</div>
              <div className="text-sm font-bold text-gray-800">
                {data.soil_properties.ph}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {data.soil_properties.ph_interpretation}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1">Texture</div>
              <div className="text-sm font-bold text-gray-800">
                {data.soil_properties.texture_name}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {data.soil_properties.texture_suitability}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Info */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Analysis: {data.moisture_analysis.method}</span>
          <span>{data.moisture_analysis.analysis_date}</span>
        </div>
      </div>
    </div>
  );
};

export default SoilMoistureMapWidget;
