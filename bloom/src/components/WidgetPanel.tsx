import React from 'react';
import WidgetRenderer from './widgets/WidgetRenderer';

interface Widget {
  type: string;
  data: any;
  id: string;
  timestamp: number;
}

interface WidgetPanelProps {
  widgets: Widget[];
  selectedIndex: number;
  onSelectWidget?: (index: number) => void;
}

const getWidgetLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'farm-map': '🗺️ Farm Map',
    'weather-today': '🌤️ Weather',
    'satellite-imagery': '🛰️ Satellite',
    'ndvi-chart': '📈 NDVI',
    'growth-tracker': '🌱 Growth',
    'soil-moisture-map': '💧 Moisture',
    'crop-recommendation': '🌾 Crops',
    'profitability-forecast': '💰 Profit',
    'rotation-plan': '🔄 Rotation',
    'price-chart': '📊 Prices',
    'expense-tracker': '💵 Expenses',
    'inventory-status': '📦 Inventory',
    'sell-timing': '⏰ Timing',
  };
  return labels[type] || '📊 Widget';
};

const WidgetPanel: React.FC<WidgetPanelProps> = ({ widgets, selectedIndex, onSelectWidget }) => {
  if (widgets.length === 0) return null;

  const currentWidget = widgets[selectedIndex];

  return (
    <div className="fixed right-8 top-20 w-80 z-40 max-h-[calc(100vh-6rem)] flex flex-col">
      {/* Widget Picker - only show if more than 1 widget */}
      {widgets.length > 1 && (
        <div className="mb-2 flex gap-2 flex-wrap">
          {widgets.map((widget, index) => (
            <button
              key={widget.id}
              onClick={() => onSelectWidget?.(index)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                index === selectedIndex
                  ? 'bg-white text-gray-800 shadow-md'
                  : 'bg-white/60 text-gray-600 hover:bg-white/80'
              }`}
            >
              {getWidgetLabel(widget.type)}
            </button>
          ))}
        </div>
      )}
      
      {/* Current Widget Display */}
      <div className="rounded-lg p-1 overflow-y-auto" style={{ backgroundColor: '#D3E1C4' }}>
        <WidgetRenderer widget={currentWidget} />
      </div>
    </div>
  );
};

export default WidgetPanel;