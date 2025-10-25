'use client';

import React, { useState } from 'react';
import { Satellite, Activity } from 'lucide-react';

interface SatelliteImageryData {
  analysis_type: string;
  coordinates: number[][];
  image_info: {
    date: string;
    cloud_cover_percent: number;
    satellite: string;
  };
  ndvi_analysis: {
    mean_ndvi: number;
    min_ndvi: number;
    max_ndvi: number;
    std_deviation: number;
  };
  crop_health: {
    health_status: string;
    description: string;
    recommendation: string;
  };
  imagery: {
    rgb_image_url: string | null;
    ndvi_image_url: string | null;
  };
  analysis_timestamp: string;
}

interface SatelliteImageryWidgetProps {
  data: SatelliteImageryData;
}

const SatelliteImageryWidget: React.FC<SatelliteImageryWidgetProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'rgb' | 'ndvi'>('rgb');

  const getHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'moderate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'poor':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const currentImageUrl = viewMode === 'rgb' ? data.imagery.rgb_image_url : data.imagery.ndvi_image_url;

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-gray-700" />
          <h3 className="text-base font-semibold text-gray-800">Satellite Imagery</h3>
        </div>
        <div className="text-xs text-gray-600">
          {data.image_info.date}
        </div>
      </div>

      {/* Image Display */}
      <div className="mb-3">
        {currentImageUrl ? (
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img 
              src={currentImageUrl} 
              alt={`${viewMode.toUpperCase()} Satellite View`}
              className="w-full h-auto"
            />
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {data.image_info.satellite}
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500 text-sm">
            Image not available
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setViewMode('rgb')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${
            viewMode === 'rgb'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          True Color
        </button>
        <button
          onClick={() => setViewMode('ndvi')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${
            viewMode === 'ndvi'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          NDVI Health
        </button>
      </div>

      {/* Health Status */}
      <div className={`rounded-lg p-3 mb-3 border ${getHealthColor(data.crop_health.health_status)}`}>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4" />
          <span className="text-sm font-semibold">{data.crop_health.health_status}</span>
        </div>
        <p className="text-xs">{data.crop_health.description}</p>
      </div>

      {/* NDVI Stats */}
      <div className="bg-gray-50 rounded-lg p-2 mb-2">
        <div className="text-xs font-medium text-gray-700 mb-1">NDVI Analysis</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-gray-600">Mean</div>
            <div className="font-semibold text-gray-800">{data.ndvi_analysis.mean_ndvi.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-gray-600">Min</div>
            <div className="font-semibold text-gray-800">{data.ndvi_analysis.min_ndvi.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-gray-600">Max</div>
            <div className="font-semibold text-gray-800">{data.ndvi_analysis.max_ndvi.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-green-50 rounded-lg p-2 border border-green-200 text-xs">
        <span className="font-medium text-green-800">Tip: </span>
        <span className="text-green-700">{data.crop_health.recommendation}</span>
      </div>
    </div>
  );
};

export default SatelliteImageryWidget;
