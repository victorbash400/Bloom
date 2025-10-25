'use client';

import React from 'react';
import { DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExpenseItem {
  category: string;
  amount: number;
  percentage: number;
}

interface ExpenseTrackerData {
  analysis_type: string;
  total_expenses: number;
  expense_breakdown: ExpenseItem[];
  top_expense: string;
  analysis_timestamp: string;
}

interface ExpenseTrackerWidgetProps {
  data: ExpenseTrackerData;
}

const ExpenseTrackerWidget: React.FC<ExpenseTrackerWidgetProps> = ({ data }) => {
  const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#14b8a6'];

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
          <PieChartIcon className="w-5 h-5 text-orange-600" />
          <h3 className="text-base font-semibold text-gray-800">Expense Tracker</h3>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-medium text-orange-700">Total Expenses</span>
        </div>
        <div className="text-2xl font-bold text-orange-900">
          KES {formatCurrency(data.total_expenses)}
        </div>
        <div className="text-xs text-orange-700 mt-1">
          Top expense: {data.top_expense}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="mb-3">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data.expense_breakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage}%`}
              outerRadius={70}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.expense_breakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => ['KES ' + formatCurrency(value), '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Breakdown List */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700 mb-2">Breakdown by Category</div>
        {data.expense_breakdown.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-800">{item.category}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-800">
                KES {formatCurrency(item.amount)}
              </div>
              <div className="text-xs text-gray-600">{item.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseTrackerWidget;
