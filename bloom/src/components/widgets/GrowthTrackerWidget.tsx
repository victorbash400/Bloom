'use client';

import React from 'react';
import { Sprout } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
      <div className="flex items-center gap-2 mb-4">
        <Sprout className="w-5 h-5 text-green-600" />
        <div>
          <h3 className="text-base font-semibold text-gray-800">{plotName}</h3>
          <p className="text-xs text-gray-500">{plotData.crops_grown.join(', ')}</p>
        </div>
      </div>

      {/* Trend Highlight */}
      <div className="bg-green-50 rounded-xl p-3 mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-green-700 mb-1">Yield Trend</div>
          <div className="text-xl font-bold text-green-900">
            {plotData.yield_trend} {getTrendIcon(plotData.yield_trend)}
          </div>
          <div className="text-sm text-green-700">
            {plotData.yield_change_percent > 0 ? '+' : ''}{plotData.yield_change_percent}% change
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-green-700">Avg Yield</div>
          <div className="text-2xl font-bold text-green-900">{plotData.avg_yield}</div>
          <div className="text-xs text-green-700">t/ha</div>
        </div>
      </div>

      {/* Yield Chart */}
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="period"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '8px'
            }}
            formatter={(value: any) => [value.toFixed(1) + ' t/ha', 'Yield']}
            cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey="yield"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Recent Seasons */}
      <div className="mt-4 space-y-1.5">
        {plotData.time_series.slice(-3).reverse().map((record, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <div className="text-xs font-medium text-gray-800">{record.period}</div>
              <div className="text-xs text-gray-500">{record.crop}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-600">{record.yield_tons_per_ha} t/ha</div>
              <div className="text-xs text-gray-500">{(record.revenue_kes / 1000).toFixed(0)}K</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
        {plotData.total_seasons} seasons tracked
      </div>
    </div>
  );
};

export default GrowthTrackerWidget;
