import React from 'react';
import { Cloud, Droplets, Wind, Thermometer, Eye, Gauge } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface CurrentWeatherData {
  location: {
    latitude: number;
    longitude: number;
    city?: string;
  };
  current_weather?: {
    temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    description: string;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
  };
  farming_conditions?: {
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
  irrigation_recommendation?: {
    irrigation_needed: boolean;
    priority: string;
    reason: string;
    next_3_days_rainfall: number;
  };
  timestamp: string;
}

interface ForecastWeatherData {
  location: {
    latitude: number;
    longitude: number;
  };
  forecast_days: number;
  daily_forecast: Array<{
    date: string;
    day_name: string;
    temperature: {
      min: number;
      max: number;
      avg: number;
    };
    humidity_avg: number;
    rainfall_mm: number;
    wind_speed_avg: number;
    description: string;
  }>;
  agricultural_insights: {
    total_rainfall_forecast: number;
    irrigation_needed: boolean;
    best_days_for_fieldwork: string[];
    rainy_days: number;
  };
  timestamp: string;
}

type WeatherData = CurrentWeatherData | ForecastWeatherData;

interface WeatherTodayWidgetProps {
  data: WeatherData;
}

const WeatherTodayWidget: React.FC<WeatherTodayWidgetProps> = ({ data }) => {
  // Check if this is forecast data or current weather data
  const isForecast = 'daily_forecast' in data;
  const currentData = data as CurrentWeatherData;
  const forecastData = data as ForecastWeatherData;

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

  // If forecast data, show forecast view
  if (isForecast) {
    const today = forecastData.daily_forecast[0];
    return (
      <div className="rounded-2xl border-2 border-black p-4 bg-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Weather Forecast</h3>
            <p className="text-xs text-gray-600">{forecastData.forecast_days} Day Forecast</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{Math.round(today.temperature.avg)}°C</div>
            <div className="text-xs text-gray-600">{today.temperature.min}° - {today.temperature.max}°</div>
          </div>
        </div>

        {/* Daily Forecast */}
        <div className="space-y-2">
          {forecastData.daily_forecast.map((day, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-800">{day.day_name}</div>
                  <div className="text-xs text-gray-600 capitalize">{day.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {Math.round(day.temperature.min)}° - {Math.round(day.temperature.max)}°
                  </div>
                  <div className="text-xs text-blue-600">
                    {day.rainfall_mm > 0 ? `${day.rainfall_mm}mm rain` : 'No rain'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agricultural Insights */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Agricultural Insights</span>
          </div>
          <div className="space-y-2">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-xs text-gray-600">Total Rainfall Expected</div>
              <div className="text-sm font-semibold text-blue-800">
                {forecastData.agricultural_insights.total_rainfall_forecast}mm
              </div>
            </div>
            <div className={`rounded-lg p-2 ${forecastData.agricultural_insights.irrigation_needed ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <div className="text-xs text-gray-600">Irrigation</div>
              <div className={`text-sm font-semibold ${forecastData.agricultural_insights.irrigation_needed ? 'text-yellow-800' : 'text-green-800'}`}>
                {forecastData.agricultural_insights.irrigation_needed ? 'Needed' : 'Not Needed'}
              </div>
            </div>
            {forecastData.agricultural_insights.best_days_for_fieldwork.length > 0 && (
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xs text-gray-600">Best Days for Fieldwork</div>
                <div className="text-sm font-semibold text-green-800">
                  {forecastData.agricultural_insights.best_days_for_fieldwork.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500 text-center mt-3">
          Updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>
    );
  }

  // Create chart data for conditions (current weather only)
  const conditionsData = Object.entries(currentData.farming_conditions?.activity_conditions || {}).map(([activity, condition]) => ({
    activity: activity.replace('_', ' '),
    score: condition === 'Good' ? 3 : condition === 'Fair' ? 2 : 1,
    condition
  }));

  // Current weather view
  return (
    <div className="rounded-2xl border-2 border-black p-4 bg-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Weather Today</h3>
          <p className="text-xs text-gray-600">{currentData.location.city || 'Your Farm'}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{Math.round(currentData.current_weather?.temperature || 0)}°C</div>
          <div className="text-xs text-gray-600">Feels like {Math.round(currentData.current_weather?.feels_like || 0)}°C</div>
        </div>
      </div>

      {/* Current Conditions */}
      <div className="mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Cloud className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Conditions</span>
          </div>
          <p className="text-sm text-blue-800 font-medium capitalize">{currentData.current_weather?.description || 'N/A'}</p>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">Humidity</div>
          <div className="text-sm font-semibold text-gray-800">{currentData.current_weather?.humidity || 0}%</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <Wind className="w-4 h-4 text-gray-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">Wind</div>
          <div className="text-sm font-semibold text-gray-800">{currentData.current_weather?.wind_speed || 0} m/s</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <Gauge className="w-4 h-4 text-purple-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">Pressure</div>
          <div className="text-sm font-semibold text-gray-800">{currentData.current_weather?.pressure || 0} hPa</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <Eye className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">Visibility</div>
          <div className="text-sm font-semibold text-gray-800">{currentData.current_weather?.visibility || 0} km</div>
        </div>
      </div>

      {/* Farming Conditions Chart */}
      {currentData.farming_conditions && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Farming Conditions</span>
          </div>

          <div className={`rounded-lg p-2 mb-3 ${getConditionColor(currentData.farming_conditions.overall_conditions)}`}>
            <div className="text-sm font-medium">Overall: {currentData.farming_conditions.overall_conditions}</div>
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
                  formatter={(_value, _name, props) => [props.payload.condition, 'Condition']}
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
      )}

      {/* Irrigation Recommendation */}
      {currentData.irrigation_recommendation && (
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Irrigation</span>
          </div>

          <div className={`rounded-lg p-3 ${getPriorityColor(currentData.irrigation_recommendation.priority)}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                {currentData.irrigation_recommendation.irrigation_needed ? 'Needed' : 'Not Needed'}
              </span>
              <span className="text-xs font-medium">
                {currentData.irrigation_recommendation.priority} Priority
              </span>
            </div>
            <p className="text-xs">{currentData.irrigation_recommendation.reason}</p>
            {currentData.irrigation_recommendation.next_3_days_rainfall > 0 && (
              <p className="text-xs mt-1 opacity-75">
                Expected: {currentData.irrigation_recommendation.next_3_days_rainfall.toFixed(1)}mm
              </p>
            )}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-500 text-center mt-3">
        Updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default WeatherTodayWidget;