'use client';

import React from 'react';
import { TrendingUp, Sprout, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SeasonRecord {
  plot_id: string;
  plot_name: string;
  year: string;
  season: string;
  period: string;
  crop: string;
  yield_tons_per_ha: number;
  revenue_kes: number;
  profit_kes: number;
  profit_margin: number;
  crop_stage: string;
  planting_date: string;
  expected_harvest: string;
  area_hectares: number;
}

interface PlotSummary {
  total_seasons: number;
  crops_grown: string[];
  avg_yield: number;
  yield_trend: string;
  yield_change_percent: number;
  avg_revenue: number;
  time_series: SeasonRecord[];
}

interface GrowthTrackerData {
  analysis_type: string;
  filters: {
    plot_name?: string;
    crop_type?: string;
  };
  plots_analyzed: number;
  plot_data: Record<string, PlotSummary>;
}

interface GrowthTrackerWidgetProps {
  data: GrowthTrackerData;
}

const GrowthTrackerWidget: React.FC<GrowthTrackerWidgetProps> = ({ data }) => {
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

  // Get the first plot for display (or could show all plots)
  const plotName = Object.keys(data.plot_data)[0];
  const plotData = data.plot_data[plotName];

  if (!plotData) {
    return (
      <div className="rounded-2xl border-2 border-black p-4 bg-white">
        <p className="text-gray-600">No growth tracking data available</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = plotData.time_series.map(record => ({
    period: record.period,
    yield: record.yield_tons_per_ha,
    revenue: record.revenue_kes / 1000, // Convert to thousands
    crop: record.crop
  }));

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-600" />
          <h3 className="text-base font-semibold text-gray-800">Growth Tracker</h3>
        </div>
        <div className="text-xs text-gray-600">
          {plotName}
        </div>
      </div>

      {/* Trend Status */}
      <div className={`rounded-lg p-3 mb-3 border flex items-center justify-between ${getTrendColor(plotData.yield_trend)}`}>
        <div>
          <div className="text-xs font-medium mb-1">Yield Trend</div>
          <div className="text-sm font-semibold">
            {plotData.yield_trend} ({plotData.yield_change_percent > 0 ? '+' : ''}{plotData.yield_change_percent}%)
          </div>
        </div>
        <div className="text-2xl">{getTrendIcon(plotData.yield_trend)}</div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">Seasons</div>
          <div className="text-lg font-bold text-gray-800">
            {plotData.total_seasons}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">Avg Yield</div>
          <div className="text-lg font-bold text-gray-800">
            {plotData.avg_yield} t/ha
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">Crops</div>
          <div className="text-xs font-semibold text-gray-800 mt-1">
            {plotData.crops_grown.join(', ')}
          </div>
        </div>
      </div>

      {/* Yield Chart */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Yield Over Time</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
              label={{ value: 'Tons/Ha', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'yield') return [value.toFixed(2) + ' t/ha', 'Yield'];
                if (name === 'revenue') return ['KES ' + (value * 1000).toLocaleString(), 'Revenue'];
                return [value, name];
              }}
            />
            <Line 
              type="monotone" 
              dataKey="yield" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: '#22c55e', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Seasons */}
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Recent Seasons</div>
        <div className="space-y-2">
          {plotData.time_series.slice(-3).reverse().map((record, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-2 flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">{record.period}</div>
                <div className="text-xs text-gray-600">{record.crop}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-600">{record.yield_tons_per_ha} t/ha</div>
                <div className="text-xs text-gray-600">KES {record.revenue_kes.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Average Revenue */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">Avg Revenue</span>
          </div>
          <span className="text-sm font-bold text-gray-800">
            KES {plotData.avg_revenue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GrowthTrackerWidget;
