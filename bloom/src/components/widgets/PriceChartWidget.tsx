'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PricePoint {
  year: string;
  season: string;
  period: string;
  price_per_kg: number;
}

interface CropTrend {
  trend: string;
  change_percent: number;
  current_price: number;
  avg_price: number;
}

interface PriceChartData {
  analysis_type: string;
  crop_filter: string | null;
  price_data: Record<string, PricePoint[]>;
  trends: Record<string, CropTrend>;
  analysis_timestamp: string;
}

interface PriceChartWidgetProps {
  data: PriceChartData;
}

const PriceChartWidget: React.FC<PriceChartWidgetProps> = ({ data }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
        return 'text-green-700 bg-green-50 border-green-300';
      case 'decreasing':
        return 'text-red-700 bg-red-50 border-red-300';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-300';
    }
  };

  // Prepare chart data - combine all crops
  const chartData: any[] = [];
  const crops = Object.keys(data.price_data);
  
  // Get all unique periods
  const allPeriods = new Set<string>();
  crops.forEach(crop => {
    data.price_data[crop].forEach(point => allPeriods.add(point.period));
  });
  
  // Create data points for each period
  Array.from(allPeriods).sort().forEach(period => {
    const dataPoint: any = { period };
    crops.forEach(crop => {
      const point = data.price_data[crop].find(p => p.period === period);
      if (point) {
        dataPoint[crop] = point.price_per_kg;
      }
    });
    chartData.push(dataPoint);
  });

  const colors = ['#22c55e', '#3b82f6', '#f97316'];

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-800">Price Trends</h3>
        </div>
        {data.crop_filter && (
          <div className="text-xs text-gray-600">{data.crop_filter}</div>
        )}
      </div>

      {/* Price Chart */}
      <div className="mb-3">
        <ResponsiveContainer width="100%" height={200}>
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
              label={{ value: 'KES/kg', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => ['KES ' + value + '/kg', '']}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {crops.map((crop, index) => (
              <Line
                key={crop}
                type="monotone"
                dataKey={crop}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Summary */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700 mb-2">Current Trends</div>
        {Object.entries(data.trends).map(([crop, trend], index) => (
          <div key={index} className={`rounded-lg p-2 border ${getTrendColor(trend.trend)}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {getTrendIcon(trend.trend)}
                <span className="text-sm font-bold text-gray-800">{crop}</span>
              </div>
              <span className="text-xs font-medium">
                {trend.change_percent > 0 ? '+' : ''}{trend.change_percent}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Current: </span>
                <span className="font-semibold">KES {trend.current_price}/kg</span>
              </div>
              <div>
                <span className="text-gray-600">Avg: </span>
                <span className="font-semibold">KES {trend.avg_price}/kg</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceChartWidget;
