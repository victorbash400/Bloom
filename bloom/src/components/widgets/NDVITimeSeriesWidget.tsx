'use client';

import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface NDVIDataPoint {
  date: string;
  ndvi: number;
  health_status: string;
}

interface NDVITimeSeriesData {
  analysis_type: string;
  coordinates: number[][];
  time_period: string;
  data_points: number;
  time_series_data: NDVIDataPoint[];
  trend_analysis: {
    overall_trend: string;
    latest_ndvi: number;
    latest_health: string;
  };
  analysis_timestamp: string;
}

interface NDVITimeSeriesWidgetProps {
  data: NDVITimeSeriesData;
}

const NDVITimeSeriesWidget: React.FC<NDVITimeSeriesWidgetProps> = ({ data }) => {
  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'improving':
        return 'text-green-700 bg-green-50 border-green-300';
      case 'stable':
        return 'text-blue-700 bg-blue-50 border-blue-300';
      case 'declining':
        return 'text-orange-700 bg-orange-50 border-orange-300';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return '#22c55e';
      case 'good':
        return '#84cc16';
      case 'moderate':
        return '#eab308';
      case 'poor':
        return '#f97316';
      default:
        return '#ef4444';
    }
  };

  // Format data for chart
  const chartData = data.time_series_data.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ndvi: point.ndvi,
    health: point.health_status
  }));

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-700" />
          <h3 className="text-base font-semibold text-gray-800">Crop Health Trends</h3>
        </div>
        <div className="text-xs text-gray-600">
          {data.data_points} readings
        </div>
      </div>

      {/* Trend Status */}
      <div className={`rounded-lg p-3 mb-3 border flex items-center justify-between ${getTrendColor(data.trend_analysis.overall_trend)}`}>
        <div>
          <div className="text-xs font-medium mb-1">Overall Trend</div>
          <div className="text-sm font-semibold">{data.trend_analysis.overall_trend}</div>
        </div>
        <div className="text-2xl">{getTrendIcon(data.trend_analysis.overall_trend)}</div>
      </div>

      {/* Chart */}
      <div className="mb-3">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
            />
            <YAxis 
              domain={[0, 1]}
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'ndvi') return [value.toFixed(3), 'NDVI'];
                return [value, name];
              }}
            />
            <Area 
              type="monotone" 
              dataKey="ndvi" 
              stroke="#22c55e" 
              strokeWidth={2}
              fill="url(#ndviGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">Latest NDVI</div>
          <div className="text-lg font-bold text-gray-800">
            {data.trend_analysis.latest_ndvi?.toFixed(3) || 'N/A'}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">Health Status</div>
          <div 
            className="text-sm font-semibold"
            style={{ color: getHealthColor(data.trend_analysis.latest_health) }}
          >
            {data.trend_analysis.latest_health || 'N/A'}
          </div>
        </div>
      </div>

      {/* Time Period */}
      <div className="text-xs text-gray-500 text-center">
        {data.time_period}
      </div>
    </div>
  );
};

export default NDVITimeSeriesWidget;
