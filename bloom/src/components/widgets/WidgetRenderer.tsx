import React from 'react';
import WeatherTodayWidget from './WeatherTodayWidget';

interface Widget {
  type: string;
  data: any;
}

interface WidgetRendererProps {
  widget: Widget;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  switch (widget.type) {
    case 'weather-today':
      return <WeatherTodayWidget data={widget.data} />;
    
    case 'ndvi-chart':
      // TODO: Implement NDVI chart widget
      return (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Crop Health Analysis</h3>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-800 text-sm">NDVI Chart widget coming soon...</p>
            <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-32">
              {JSON.stringify(widget.data, null, 2)}
            </pre>
          </div>
        </div>
      );
    
    default:
      return (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Unknown Widget</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-600 text-sm">Widget type "{widget.type}" is not supported yet.</p>
            <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-32">
              {JSON.stringify(widget.data, null, 2)}
            </pre>
          </div>
        </div>
      );
  }
};

export default WidgetRenderer;