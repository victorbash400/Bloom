"""
Test script for the Weather Tool
Tests all weather functions with sample farm coordinates.
"""

import json
from tools.weather_tool import get_current_weather, get_weather_forecast, get_planting_weather_advice

def test_weather_tool():
    """Test all weather tool functions"""
    print("🌤️ Testing Weather Tool")
    print("=" * 50)
    
    # Sample farm coordinates (Nairobi area - good for testing)
    latitude = -1.2921
    longitude = 36.8219
    
    print(f"📍 Testing with coordinates: {latitude}, {longitude}")
    print()
    
    # Test 1: Current Weather
    print("🌡️ Test 1: Current Weather")
    print("-" * 30)
    try:
        current_weather = get_current_weather(latitude, longitude)
        weather_data = json.loads(current_weather)
        
        if "error" in weather_data:
            print(f"❌ Error: {weather_data['error']}")
        else:
            print("✅ Current weather retrieved successfully!")
            print(f"   Location: {weather_data['location']['city']}")
            print(f"   Temperature: {weather_data['current_weather']['temperature']}°C")
            print(f"   Description: {weather_data['current_weather']['description']}")
            print(f"   Humidity: {weather_data['current_weather']['humidity']}%")
            print(f"   Irrigation needed: {weather_data['irrigation_recommendation']['irrigation_needed']}")
            print(f"   Farming conditions: {weather_data['farming_conditions']['overall_conditions']}")
    except Exception as e:
        print(f"❌ Current weather test failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 2: Weather Forecast
    print("📅 Test 2: 5-Day Weather Forecast")
    print("-" * 30)
    try:
        forecast = get_weather_forecast(latitude, longitude, 5)
        forecast_data = json.loads(forecast)
        
        if "error" in forecast_data:
            print(f"❌ Error: {forecast_data['error']}")
        else:
            print("✅ Weather forecast retrieved successfully!")
            print(f"   Forecast days: {forecast_data['forecast_days']}")
            print(f"   Total rainfall expected: {forecast_data['agricultural_insights']['total_rainfall_forecast']}mm")
            print(f"   Irrigation needed: {forecast_data['agricultural_insights']['irrigation_needed']}")
            print(f"   Rainy days: {forecast_data['agricultural_insights']['rainy_days']}")
            
            print("\n   📊 Daily Forecast Summary:")
            for day in forecast_data['daily_forecast'][:3]:  # Show first 3 days
                print(f"   {day['day_name']}: {day['temperature']['min']}-{day['temperature']['max']}°C, "
                      f"{day['rainfall_mm']}mm rain, {day['description']}")
    except Exception as e:
        print(f"❌ Weather forecast test failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 3: Planting Advice
    print("🌱 Test 3: Planting Weather Advice")
    print("-" * 30)
    
    crops_to_test = ["maize", "beans", "potatoes"]
    
    for crop in crops_to_test:
        try:
            advice = get_planting_weather_advice(latitude, longitude, crop)
            advice_data = json.loads(advice)
            
            if "error" in advice_data:
                print(f"❌ Error for {crop}: {advice_data['error']}")
            else:
                print(f"✅ {crop.title()} planting advice:")
                print(f"   Recommendation: {advice_data['planting_recommendation']}")
                print(f"   Current temp: {advice_data['current_conditions']['temperature']}°C")
                print(f"   Expected rainfall: {advice_data['current_conditions']['next_week_rainfall']}mm")
                print(f"   Advice: {advice_data['advice']}")
                print()
        except Exception as e:
            print(f"❌ Planting advice test failed for {crop}: {e}")
    
    print("=" * 50)
    print("🎉 Weather Tool testing completed!")
    print("\n💡 If all tests passed, the weather tool is ready for integration with your agents!")

def test_api_key():
    """Test if the API key is working"""
    print("🔑 Testing OpenWeather API Key")
    print("-" * 30)
    
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    api_key = os.getenv("OPEN_WEATHER_API")
    
    if not api_key:
        print("❌ OPEN_WEATHER_API not found in environment variables")
        return False
    
    print(f"✅ API key found: {api_key[:8]}...")
    
    # Test with a simple API call
    import requests
    
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            'lat': -1.2921,
            'lon': 36.8219,
            'appid': api_key,
            'units': 'metric'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        print(f"✅ API key is valid! Test location: {data.get('name', 'Unknown')}")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ API key test failed: {e}")
        return False

if __name__ == "__main__":
    # First test the API key
    if test_api_key():
        print("\n")
        # Then test the full weather tool
        test_weather_tool()
    else:
        print("\n❌ Cannot proceed with weather tool tests - API key issue")
        print("💡 Check your OPEN_WEATHER_API key in the .env file")