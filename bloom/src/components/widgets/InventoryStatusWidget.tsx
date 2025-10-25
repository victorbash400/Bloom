'use client';

import React from 'react';
import { Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface InventoryItem {
  crop: string;
  stock_kg: number;
  value_kes: number;
  value_per_kg: number;
}

interface InventoryStatusData {
  analysis_type: string;
  total_inventory_value: number;
  inventory_items: InventoryItem[];
  crops_in_stock: number;
  analysis_timestamp: string;
}

interface InventoryStatusWidgetProps {
  data: InventoryStatusData;
}

const InventoryStatusWidget: React.FC<InventoryStatusWidgetProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toFixed(0);
  };

  const formatWeight = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)}t`;
    }
    return `${kg}kg`;
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f97316'];

  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-semibold text-gray-800">Inventory Status</h3>
        </div>
        <div className="text-xs text-gray-600">{data.crops_in_stock} crops</div>
      </div>

      {/* Total Value */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">Total Inventory Value</span>
        </div>
        <div className="text-2xl font-bold text-purple-900">
          KES {formatCurrency(data.total_inventory_value)}
        </div>
      </div>

      {/* Stock Chart */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Stock Levels</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data.inventory_items}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="crop" 
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
              tickFormatter={(value) => formatWeight(value)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => [formatWeight(value), 'Stock']}
            />
            <Bar dataKey="stock_kg" radius={[8, 8, 0, 0]}>
              {data.inventory_items.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Details */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700 mb-2">Detailed Breakdown</div>
        {data.inventory_items.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-gray-800">{item.crop}</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatWeight(item.stock_kg)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Value: </span>
                <span className="font-semibold">KES {formatCurrency(item.value_kes)}</span>
              </div>
              <div>
                <span className="text-gray-600">Price: </span>
                <span className="font-semibold">KES {item.value_per_kg}/kg</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryStatusWidget;
