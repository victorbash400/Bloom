import React from 'react';
import WeatherTodayWidget from './WeatherTodayWidget';
import FarmMapWidget from './FarmMapWidget';
import SatelliteImageryWidget from './SatelliteImageryWidget';
import NDVITimeSeriesWidget from './NDVITimeSeriesWidget';
import GrowthTrackerWidget from './GrowthTrackerWidget';
import SoilMoistureMapWidget from './SoilMoistureMapWidget';

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

    case 'farm-map':
      return <FarmMapWidget data={widget.data} />;

    case 'satellite-imagery':
      return <SatelliteImageryWidget data={widget.data} />;

    case 'ndvi-chart':
      return <NDVITimeSeriesWidget data={widget.data} />;

    case 'growth-tracker':
      return <GrowthTrackerWidget data={widget.data} />;

    case 'soil-moisture-map':
      return <SoilMoistureMapWidget data={widget.data} />;

    default:
      return (
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Unknown Widget</h3>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-600 text-sm">Widget type "{widget.type}" is not supported yet.</p>
          </div>
        </div>
      );
  }
};

export default WidgetRenderer;