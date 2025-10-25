import React from 'react';
import { Cloud, Droplets, Wind, Thermometer, Eye, Gauge } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  current_weather: {
    temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    description: string;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
  };
  farming_conditions: {
    overall_conditions: string;
    activity_conditions: {
      planting: string;
      spraying: string;
      harvesting: string;
      field_work: string;
    };
    temperature: number;
    humidity: number;
    wind_speed: number;
  };
  irrigation_recommendation: {
    irrigation_needed: boolean;
    priority: string;
    reason: string;
    next_3_days_rainfall: number;
  };
  timestamp: string;
}

interface WeatherTodayWidgetProps {
  data: WeatherData;
}

const WeatherTodayWidget: React.FC<WeatherTodayWidgetProps> = ({ data }) => {
  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-green-600 bg-green-50';
      case 'fair':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Create chart data for conditions
  const conditionsData = Object.entries(data.farming_conditions?.activity_conditions || {}).map(([activity, condition]) => ({
    activity: activity.replace('_', ' '),
    score: condition === 'Good' ? 3 : condition === 'Fair' ? 2 : 1,
    condition
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Weather Today</h3>
          <p className="text-xs text-gray-600">{data.location.city}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{Math.round(data.current_weather.temperature)}°C</div>
          <div className="text-xs text-gray-600">Feels like {Math.round(data.current_weather.feels_like)}°C</div>
        </div>
      </div>

      {/* Current Conditions */}
      <div className="mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Cloud className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Conditions</span>
          </div>
          <p className="text-sm text-blue-800 font-medium capitalize">{data.current_weather.description}</p>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">Humidity</div>
          <div className="text-sm font-semibold text-gray-800">{data.current_weather.humidity}%</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <Wind className="w-4 h-4 text-gray-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">Wind</div>
          <div className="text-sm font-semibold text-gray-800">{data.current_weather.wind_speed} m/s</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <Gauge className="w-4 h-4 text-purple-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">Pressure</div>
          <div className="text-sm font-semibold text-gray-800">{data.current_weather.pressure} hPa</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <Eye className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">Visibility</div>
          <div className="text-sm font-semibold text-gray-800">{data.current_weather.visibility} km</div>
        </div>
      </div>

      {/* Farming Conditions Chart */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Thermometer className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Farming Conditions</span>
        </div>

        <div className={`rounded-lg p-2 mb-3 ${getConditionColor(data.farming_conditions.overall_conditions)}`}>
          <div className="text-sm font-medium">Overall: {data.farming_conditions.overall_conditions}</div>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conditionsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="activity"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={40}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value, name, props) => [props.payload.condition, 'Condition']}
                labelFormatter={(label) => `Activity: ${label}`}
              />
              <Bar
                dataKey="score"
                fill="#3b82f6"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Irrigation Recommendation */}
      <div className="border-t pt-3">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Irrigation</span>
        </div>

        <div className={`rounded-lg p-3 ${getPriorityColor(data.irrigation_recommendation.priority)}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">
              {data.irrigation_recommendation.irrigation_needed ? 'Needed' : 'Not Needed'}
            </span>
            <span className="text-xs font-medium">
              {data.irrigation_recommendation.priority} Priority
            </span>
          </div>
          <p className="text-xs">{data.irrigation_recommendation.reason}</p>
          {data.irrigation_recommendation.next_3_days_rainfall > 0 && (
            <p className="text-xs mt-1 opacity-75">
              Expected: {data.irrigation_recommendation.next_3_days_rainfall.toFixed(1)}mm
            </p>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-gray-500 text-center mt-3">
        Updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default WeatherTodayWidget;