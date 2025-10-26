'use client';

import React from 'react';
import { Sprout } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    if (!data.recommendations || data.recommendations.length === 0) {
        return null;
    }

    const topCrop = data.recommendations[0];

    return (
        <div className="rounded-2xl border-2 border-black p-4 bg-white">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-5 h-5 text-green-600" />
                <div>
                    <h3 className="text-base font-semibold text-gray-800">Best Crop</h3>
                    {data.plot_name && (
                        <p className="text-xs text-gray-500">{data.plot_name}</p>
                    )}
                </div>
            </div>

            {/* Top Recommendation */}
            <div className="bg-green-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-green-900">{topCrop.crop}</div>
                    <div className="text-2xl">🌟</div>
                </div>
                <p className="text-sm text-green-700 mb-3">{topCrop.recommendation}</p>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <div className="text-xs text-green-700">Profit Margin</div>
                        <div className="text-lg font-bold text-green-900">{topCrop.avg_profit_margin}%</div>
                    </div>
                    <div>
                        <div className="text-xs text-green-700">Avg Yield</div>
                        <div className="text-lg font-bold text-green-900">{topCrop.avg_yield_tons_per_ha} t/ha</div>
                    </div>
                </div>
            </div>

            {/* Comparison Chart */}
            {data.recommendations.length > 1 && (
                <>
                    <div className="text-xs text-gray-600 mb-2">Compare with alternatives</div>
                    <ResponsiveContainer width="100%" height={120}>
                        <BarChart
                            data={data.recommendations.slice(0, 3)}
                            layout="vertical"
                            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        >
                            <XAxis
                                type="number"
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="crop"
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                                width={50}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    padding: '8px'
                                }}
                                formatter={(value: any) => [value + '%', 'Margin']}
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            />
                            <Bar dataKey="avg_profit_margin" radius={[0, 4, 4, 0]}>
                                {data.recommendations.slice(0, 3).map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === 0 ? '#22c55e' : index === 1 ? '#3b82f6' : '#9ca3af'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </>
            )}

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                Based on historical performance data
            </div>
        </div>
    );
};

export default CropRecommendationWidget;
