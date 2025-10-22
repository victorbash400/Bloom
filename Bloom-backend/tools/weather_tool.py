"""
Weather Tool for Bloom Agents
Provides current weather, forecasts, and agricultural weather insights using OpenWeatherMap API.
"""

import os
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenWeatherMap API configuration
OPENWEATHER_API_KEY = os.getenv("OPEN_WEATHER_API")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"

if not OPENWEATHER_API_KEY:
    raise ValueError("Missing required environment variable: OPEN_WEATHER_API")

class WeatherTool:
    def __init__(self):
        self.api_key = OPENWEATHER_API_KEY
        self.base_url = OPENWEATHER_BASE_URL
    
    def _make_request(self, endpoint: str, params: Dict) -> Optional[Dict]:
        """Make request to OpenWeatherMap API"""
        params['appid'] = self.api_key
        params['units'] = 'metric'  # Use Celsius
        
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Weather API request failed: {e}")
            return None
    
    def _calculate_irrigation_need(self, weather_data: Dict, forecast_data: List[Dict]) -> Dict:
        """Calculate irrigation recommendations based on weather"""
        current_humidity = weather_data.get('main', {}).get('humidity', 50)
        current_temp = weather_data.get('main', {}).get('temp', 20)
        
        # Calculate total rainfall in next 3 days
        total_rainfall = 0
        for day in forecast_data[:3]:
            if 'rain' in day:
                total_rainfall += day['rain'].get('3h', 0)
        
        # Simple irrigation logic
        irrigation_needed = False
        irrigation_priority = "Low"
        
        if total_rainfall < 5:  # Less than 5mm in 3 days
            if current_temp > 25 and current_humidity < 60:
                irrigation_needed = True
                irrigation_priority = "High"
            elif current_temp > 20:
                irrigation_needed = True
                irrigation_priority = "Medium"
        
        return {
            "irrigation_needed": irrigation_needed,
            "priority": irrigation_priority,
            "reason": f"Rainfall: {total_rainfall:.1f}mm, Temp: {current_temp}°C, Humidity: {current_humidity}%",
            "next_3_days_rainfall": total_rainfall
        }
    
    def _assess_farming_conditions(self, weather_data: Dict, forecast_data: List[Dict]) -> Dict:
        """Assess current conditions for farming activities"""
        current = weather_data.get('main', {})
        wind = weather_data.get('wind', {})
        
        temp = current.get('temp', 0)
        humidity = current.get('humidity', 0)
        wind_speed = wind.get('speed', 0)
        
        # Assess conditions for different activities
        conditions = {
            "planting": "Good" if 15 <= temp <= 30 and humidity > 40 else "Poor",
            "spraying": "Good" if wind_speed < 3 and humidity > 50 else "Poor",
            "harvesting": "Good" if humidity < 70 and wind_speed < 5 else "Fair",
            "field_work": "Good" if temp > 10 and wind_speed < 8 else "Fair"
        }
        
        # Overall assessment
        good_conditions = sum(1 for c in conditions.values() if c == "Good")
        if good_conditions >= 3:
            overall = "Excellent"
        elif good_conditions >= 2:
            overall = "Good"
        else:
            overall = "Fair"
        
        return {
            "overall_conditions": overall,
            "activity_conditions": conditions,
            "temperature": temp,
            "humidity": humidity,
            "wind_speed": wind_speed
        }

def get_current_weather(latitude: float, longitude: float) -> str:
    """
    Get current weather conditions for a farm location.
    
    Args:
        latitude: Farm latitude
        longitude: Farm longitude
    
    Returns:
        JSON string with current weather data and farming insights
    """
    tool = WeatherTool()
    
    # Get current weather
    current_params = {
        'lat': latitude,
        'lon': longitude
    }
    
    weather_data = tool._make_request('weather', current_params)
    if not weather_data:
        return json.dumps({"error": "Failed to fetch current weather data"})
    
    # Get 5-day forecast for additional insights
    forecast_data = tool._make_request('forecast', current_params)
    forecast_list = forecast_data.get('list', []) if forecast_data else []
    
    # Calculate irrigation needs
    irrigation = tool._calculate_irrigation_need(weather_data, forecast_list)
    
    # Assess farming conditions
    conditions = tool._assess_farming_conditions(weather_data, forecast_list)
    
    # Format response
    main = weather_data.get('main', {})
    weather_desc = weather_data.get('weather', [{}])[0]
    wind = weather_data.get('wind', {})
    
    result = {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "city": weather_data.get('name', 'Unknown')
        },
        "current_weather": {
            "temperature": main.get('temp'),
            "feels_like": main.get('feels_like'),
            "humidity": main.get('humidity'),
            "pressure": main.get('pressure'),
            "description": weather_desc.get('description', '').title(),
            "wind_speed": wind.get('speed'),
            "wind_direction": wind.get('deg'),
            "visibility": weather_data.get('visibility', 0) / 1000  # Convert to km
        },
        "farming_conditions": conditions,
        "irrigation_recommendation": irrigation,
        "timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

def get_weather_forecast(latitude: float, longitude: float, days: int = 5) -> str:
    """
    Get weather forecast for farm planning.
    
    Args:
        latitude: Farm latitude
        longitude: Farm longitude
        days: Number of days to forecast (max 5)
    
    Returns:
        JSON string with weather forecast and agricultural insights
    """
    tool = WeatherTool()
    
    params = {
        'lat': latitude,
        'lon': longitude
    }
    
    forecast_data = tool._make_request('forecast', params)
    if not forecast_data:
        return json.dumps({"error": "Failed to fetch weather forecast"})
    
    forecast_list = forecast_data.get('list', [])
    
    # Group forecast by days
    daily_forecasts = {}
    total_rainfall = 0
    
    for item in forecast_list[:days * 8]:  # 8 forecasts per day (3-hour intervals)
        dt = datetime.fromtimestamp(item['dt'])
        date_key = dt.strftime('%Y-%m-%d')
        
        if date_key not in daily_forecasts:
            daily_forecasts[date_key] = {
                'date': date_key,
                'day_name': dt.strftime('%A'),
                'temperatures': [],
                'humidity': [],
                'descriptions': [],
                'rainfall': 0,
                'wind_speeds': []
            }
        
        daily_forecasts[date_key]['temperatures'].append(item['main']['temp'])
        daily_forecasts[date_key]['humidity'].append(item['main']['humidity'])
        daily_forecasts[date_key]['descriptions'].append(item['weather'][0]['description'])
        daily_forecasts[date_key]['wind_speeds'].append(item.get('wind', {}).get('speed', 0))
        
        # Add rainfall
        if 'rain' in item:
            rainfall = item['rain'].get('3h', 0)
            daily_forecasts[date_key]['rainfall'] += rainfall
            total_rainfall += rainfall
    
    # Process daily summaries
    processed_forecast = []
    for date_key, day_data in daily_forecasts.items():
        temps = day_data['temperatures']
        processed_day = {
            'date': day_data['date'],
            'day_name': day_data['day_name'],
            'temperature': {
                'min': round(min(temps), 1),
                'max': round(max(temps), 1),
                'avg': round(sum(temps) / len(temps), 1)
            },
            'humidity_avg': round(sum(day_data['humidity']) / len(day_data['humidity']), 1),
            'rainfall_mm': round(day_data['rainfall'], 1),
            'wind_speed_avg': round(sum(day_data['wind_speeds']) / len(day_data['wind_speeds']), 1),
            'description': max(set(day_data['descriptions']), key=day_data['descriptions'].count)
        }
        processed_forecast.append(processed_day)
    
    # Agricultural insights
    insights = {
        "total_rainfall_forecast": round(total_rainfall, 1),
        "irrigation_needed": total_rainfall < 10,  # Less than 10mm in forecast period
        "best_days_for_fieldwork": [],
        "rainy_days": 0
    }
    
    for day in processed_forecast:
        if day['rainfall_mm'] > 1:
            insights["rainy_days"] += 1
        if day['rainfall_mm'] < 1 and day['wind_speed_avg'] < 5:
            insights["best_days_for_fieldwork"].append(day['day_name'])
    
    result = {
        "location": {
            "latitude": latitude,
            "longitude": longitude
        },
        "forecast_days": len(processed_forecast),
        "daily_forecast": processed_forecast,
        "agricultural_insights": insights,
        "timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

def get_planting_weather_advice(latitude: float, longitude: float, crop_type: str = "general") -> str:
    """
    Get weather-based planting advice for specific crops.
    
    Args:
        latitude: Farm latitude
        longitude: Farm longitude
        crop_type: Type of crop (maize, beans, potatoes, etc.)
    
    Returns:
        JSON string with planting recommendations based on weather
    """
    tool = WeatherTool()
    
    # Get current weather and forecast
    current_params = {'lat': latitude, 'lon': longitude}
    weather_data = tool._make_request('weather', current_params)
    forecast_data = tool._make_request('forecast', current_params)
    
    if not weather_data or not forecast_data:
        return json.dumps({"error": "Failed to fetch weather data for planting advice"})
    
    current_temp = weather_data.get('main', {}).get('temp', 0)
    current_humidity = weather_data.get('main', {}).get('humidity', 0)
    
    # Calculate upcoming rainfall
    forecast_list = forecast_data.get('list', [])
    next_week_rainfall = 0
    for item in forecast_list[:14]:  # Next 2 days (3-hour intervals)
        if 'rain' in item:
            next_week_rainfall += item['rain'].get('3h', 0)
    
    # Crop-specific recommendations
    crop_requirements = {
        "maize": {"min_temp": 15, "max_temp": 35, "min_rainfall": 5},
        "beans": {"min_temp": 18, "max_temp": 30, "min_rainfall": 3},
        "potatoes": {"min_temp": 10, "max_temp": 25, "min_rainfall": 8},
        "general": {"min_temp": 15, "max_temp": 30, "min_rainfall": 5}
    }
    
    requirements = crop_requirements.get(crop_type.lower(), crop_requirements["general"])
    
    # Assess planting conditions
    temp_suitable = requirements["min_temp"] <= current_temp <= requirements["max_temp"]
    rainfall_adequate = next_week_rainfall >= requirements["min_rainfall"]
    
    if temp_suitable and rainfall_adequate:
        recommendation = "Excellent"
        advice = f"Conditions are ideal for planting {crop_type}. Temperature and expected rainfall are optimal."
    elif temp_suitable:
        recommendation = "Good with irrigation"
        advice = f"Temperature is suitable for {crop_type}, but consider irrigation due to low expected rainfall."
    elif rainfall_adequate:
        recommendation = "Wait for better temperature"
        advice = f"Expected rainfall is good, but wait for more suitable temperatures for {crop_type}."
    else:
        recommendation = "Poor"
        advice = f"Both temperature and rainfall conditions are not ideal for planting {crop_type}."
    
    result = {
        "crop_type": crop_type,
        "location": {"latitude": latitude, "longitude": longitude},
        "current_conditions": {
            "temperature": current_temp,
            "humidity": current_humidity,
            "next_week_rainfall": round(next_week_rainfall, 1)
        },
        "crop_requirements": requirements,
        "planting_recommendation": recommendation,
        "advice": advice,
        "conditions_assessment": {
            "temperature_suitable": temp_suitable,
            "rainfall_adequate": rainfall_adequate
        },
        "timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

# Export the main functions for use by agents
__all__ = [
    'get_current_weather',
    'get_weather_forecast', 
    'get_planting_weather_advice'
]