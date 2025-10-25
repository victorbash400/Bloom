'use client';

import React from 'react';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PricePoint {
  year: string;
  season: string;
  period: string;
  price: number;
}

interface SellTimingData {
  analysis_type: string;
  crop: string;
  current_price: number;
  best_season: string;
  best_season_avg_price: number;
  recommendation: string;
  timing: string;
  price_history: PricePoint[];
  season_averages: Record<string, number>;
  analysis_timestamp: string;
}

interface SellTimingWidgetProps {
  data: SellTimingData;
}

const SellTimingWidget: React.FC<SellTimingWidgetProps> = ({ data }) => {
  const getTimingColor = (timing: string) => {
    switch (timing.toLowerCase()) {
      case 'sell now':
        return 'text-green-700 bg-green-50 border-green-300';
      case 'sell soon':
        return 'text-blue-700 bg-blue-50 border-blue-300';
      case 'wait':
        return 'text-orange-700 bg-orange-50 border-orange-300';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-300';
    }
  };

  const getTimingIcon = (timing: string) => {
    switch (timing.toLowerCase()) {
      case 'sell now':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'sell soon':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'wait':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-800">Sell Timing</h3>
        </div>
        <div className="text-xs text-gray-600">{data.crop}</div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-lg p-3 mb-3 border-2 ${getTimingColor(data.timing)}`}>
        <div className="flex items-center gap-2 mb-2">
          {getTimingIcon(data.timing)}
          <div>
            <div className="text-xs font-medium mb-1">Recommendation</div>
            <div className="text-sm font-bold">{data.timing}</div>
          </div>
        </div>
        <div className="text-xs italic">{data.recommendation}</div>
      </div>

      {/* Price Comparison */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="text-xs text-blue-700 mb-1">Current Price</div>
          <div className="text-lg font-bold text-blue-900">
            KES {data.current_price}/kg
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <div className="text-xs text-green-700 mb-1">Peak Price ({data.best_season})</div>
          <div className="text-lg font-bold text-green-900">
            KES {data.best_season_avg_price}/kg
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Price History</div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data.price_history}>
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
              formatter={(value: any) => ['KES ' + value + '/kg', 'Price']}
            />
            <ReferenceLine 
              y={data.best_season_avg_price} 
              stroke="#22c55e" 
              strokeDasharray="3 3"
              label={{ value: 'Peak', fontSize: 10, fill: '#22c55e' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Seasonal Averages */}
      <div className="border-t border-gray-200 pt-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Seasonal Averages</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(data.season_averages).map(([season, price], index) => (
            <div key={index} className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600">{season}</div>
              <div className="text-sm font-semibold text-gray-800">KES {price}/kg</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellTimingWidget;
