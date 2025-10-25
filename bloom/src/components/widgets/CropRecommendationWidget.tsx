'use client';

import React from 'react';
import { Sprout, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CropRecommendation {
  crop: string;
  score: number;
  avg_profit_margin: number;
  avg_yield_tons_per_ha: number;
  avg_revenue_kes: number;
  success_rate: number;
  recommendation: string;
}

interface CropRecommendationData {
  analysis_type: string;
  plot_name: string | null;
  recommendations: CropRecommendation[];
  top_crop: string;
  analysis_timestamp: string;
}

interface CropRecommendationWidgetProps {
  data: CropRecommendationData;
}

const CropRecommendationWidget: React.FC<CropRecommendationWidgetProps> = ({ data }) => {
  const getScoreColor = (index: number) => {
    if (index === 0) return 'bg-green-50 border-green-300';
    if (index === 1) return 'bg-blue-50 border-blue-300';
    return 'bg-gray-50 border-gray-300';
  };

  const getScoreBadge = (index: number) => {
    if (index === 0) return { icon: '🥇', text: 'Best Choice', color: 'text-green-700' };
    if (index === 1) return { icon: '🥈', text: 'Good Option', color: 'text-blue-700' };
    return { icon: '🥉', text: 'Alternative', color: 'text-gray-700' };
  };

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-600" />
          <h3 className="text-base font-semibold text-gray-800">Crop Recommendations</h3>
        </div>
        {data.plot_name && (
          <div className="text-xs text-gray-600">{data.plot_name}</div>
        )}
      </div>

      {/* Top Recommendation Highlight */}
      {data.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-green-900">Top Recommendation</span>
            </div>
            <span className="text-2xl">🌟</span>
          </div>
          <div className="text-lg font-bold text-green-900 mb-1">
            {data.recommendations[0].crop}
          </div>
          <div className="text-xs text-green-700">
            {data.recommendations[0].recommendation}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white bg-opacity-50 rounded p-1">
              <div className="text-xs text-green-700">Profit Margin</div>
              <div className="text-sm font-bold text-green-900">
                {data.recommendations[0].avg_profit_margin}%
              </div>
            </div>
            <div className="bg-white bg-opacity-50 rounded p-1">
              <div className="text-xs text-green-700">Avg Yield</div>
              <div className="text-sm font-bold text-green-900">
                {data.recommendations[0].avg_yield_tons_per_ha} t/ha
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Profitability Comparison</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart
            data={data.recommendations}
            layout="vertical"
            margin={{ left: 10, right: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number"
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
            />
            <YAxis 
              type="category"
              dataKey="crop"
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
              width={60}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => [value + '%', 'Profit Margin']}
            />
            <Bar dataKey="avg_profit_margin" radius={[0, 4, 4, 0]}>
              {data.recommendations.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? '#22c55e' : index === 1 ? '#3b82f6' : '#9ca3af'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* All Recommendations */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700 mb-2">Detailed Breakdown</div>
        {data.recommendations.map((rec, index) => {
          const badge = getScoreBadge(index);
          return (
            <div
              key={index}
              className={`rounded-lg p-3 border ${getScoreColor(index)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{badge.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{rec.crop}</div>
                    <div className={`text-xs ${badge.color}`}>{badge.text}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Score</div>
                  <div className="text-lg font-bold text-gray-800">{rec.score}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-600">Margin</div>
                  <div className="font-semibold text-gray-800">{rec.avg_profit_margin}%</div>
                </div>
                <div>
                  <div className="text-gray-600">Yield</div>
                  <div className="font-semibold text-gray-800">{rec.avg_yield_tons_per_ha} t/ha</div>
                </div>
                <div>
                  <div className="text-gray-600">Revenue</div>
                  <div className="font-semibold text-gray-800">
                    {(rec.avg_revenue_kes / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-600 italic">
                {rec.recommendation}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
        Based on {data.recommendations.reduce((sum, r) => sum + r.success_rate, 0)} historical records
      </div>
    </div>
  );
};

export default CropRecommendationWidget;
