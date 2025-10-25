'use client';

import React from 'react';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface ProfitabilityForecastData {
  analysis_type: string;
  crop: string;
  area_hectares: number;
  forecast: {
    expected_revenue_kes: number;
    expected_cost_kes: number;
    expected_profit_kes: number;
    expected_margin_percent: number;
  };
  historical_averages: {
    profit_per_ha: number;
    revenue_per_ha: number;
    cost_per_ha: number;
    margin_percent: number;
  };
  data_points: number;
  confidence: string;
  analysis_timestamp: string;
}

interface ProfitabilityForecastWidgetProps {
  data: ProfitabilityForecastData;
}

const ProfitabilityForecastWidget: React.FC<ProfitabilityForecastWidgetProps> = ({ data }) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'text-green-700 bg-green-50 border-green-300';
      case 'medium':
        return 'text-blue-700 bg-blue-50 border-blue-300';
      default:
        return 'text-orange-700 bg-orange-50 border-orange-300';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toFixed(0);
  };

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-base font-semibold text-gray-800">Profitability Forecast</h3>
        </div>
        <div className={`text-xs px-2 py-1 rounded border ${getConfidenceColor(data.confidence)}`}>
          {data.confidence} Confidence
        </div>
      </div>

      {/* Crop and Area */}
      <div className="bg-gray-50 rounded-lg p-2 mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-600">Crop</div>
          <div className="text-sm font-bold text-gray-800">{data.crop}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">Area</div>
          <div className="text-sm font-bold text-gray-800">{data.area_hectares} ha</div>
        </div>
      </div>

      {/* Expected Profit Highlight */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium text-green-700">Expected Profit</span>
        </div>
        <div className="text-2xl font-bold text-green-900 mb-1">
          KES {formatCurrency(data.forecast.expected_profit_kes)}
        </div>
        <div className="text-xs text-green-700">
          {data.forecast.expected_margin_percent}% profit margin
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Financial Breakdown</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={[
              {
                name: 'Revenue',
                value: data.forecast.expected_revenue_kes,
                color: '#3b82f6'
              },
              {
                name: 'Cost',
                value: data.forecast.expected_cost_kes,
                color: '#f97316'
              },
              {
                name: 'Profit',
                value: data.forecast.expected_profit_kes,
                color: '#22c55e'
              }
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => ['KES ' + formatCurrency(value), '']}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {[
                { color: '#3b82f6' },
                { color: '#f97316' },
                { color: '#22c55e' }
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Historical Averages */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-gray-600" />
          <span className="text-xs font-medium text-gray-700">Historical Averages (per hectare)</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-600">Revenue/ha</div>
            <div className="text-sm font-semibold text-gray-800">
              KES {formatCurrency(data.historical_averages.revenue_per_ha)}
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-600">Cost/ha</div>
            <div className="text-sm font-semibold text-gray-800">
              KES {formatCurrency(data.historical_averages.cost_per_ha)}
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-600">Profit/ha</div>
            <div className="text-sm font-semibold text-gray-800">
              KES {formatCurrency(data.historical_averages.profit_per_ha)}
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-600">Margin</div>
            <div className="text-sm font-semibold text-gray-800">
              {data.historical_averages.margin_percent}%
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
        Based on {data.data_points} historical seasons
      </div>
    </div>
  );
};

export default ProfitabilityForecastWidget;
