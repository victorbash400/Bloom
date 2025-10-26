'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(0)}K`;
        }
        return amount.toFixed(0);
    };

    return (
        <div className="rounded-2xl border-2 border-black p-4 bg-white">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                    <h3 className="text-base font-semibold text-gray-800">{data.crop}</h3>
                    <p className="text-xs text-gray-500">{data.area_hectares} hectare forecast</p>
                </div>
            </div>

            {/* Main Profit Display */}
            <div className="bg-green-50 rounded-xl p-4 mb-4">
                <div className="text-xs text-green-700 mb-1">Expected Profit</div>
                <div className="text-3xl font-bold text-green-900">
                    KES {formatCurrency(data.forecast.expected_profit_kes)}
                </div>
                <div className="text-sm text-green-700 mt-1">
                    {data.forecast.expected_margin_percent}% margin
                </div>
            </div>

            {/* Simple Breakdown Chart */}
            <ResponsiveContainer width="100%" height={140}>
                <BarChart
                    data={[
                        { name: 'Revenue', value: data.forecast.expected_revenue_kes, color: '#3b82f6' },
                        { name: 'Cost', value: data.forecast.expected_cost_kes, color: '#f97316' },
                        { name: 'Profit', value: data.forecast.expected_profit_kes, color: '#22c55e' }
                    ]}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                >
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px',
                            padding: '8px'
                        }}
                        formatter={(value: any) => ['KES ' + formatCurrency(value), '']}
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
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

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                Based on {data.data_points} seasons • {data.confidence} confidence
            </div>
        </div>
    );
};

export default ProfitabilityForecastWidget;
