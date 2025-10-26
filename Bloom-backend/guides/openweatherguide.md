Here are the best resources to use OpenWeatherMap API for forecasts and historical weather data:

**1. Official OpenWeatherMap API Guide**  
- This covers how to use their API for current, forecast, and historical weather. It explains endpoints, parameters, step-by-step calls, and options for different data granularities (minutely, hourly, daily, etc.).[1]

**2. One Call API 3.0**  
- This is the most versatile API, combining forecasts, current, and historical data (up to 46+ years) in one endpoint. You can get minute forecasts for 1 hour, hourly for 48 hours, daily for 8 days, and aggregated historical data. Example API call:
```plaintext
https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={API key}
```
Docs:.[2]

**3. Historical Weather API**  
- For hourly historical weather per location:
```plaintext
https://history.openweathermap.org/data/2.5/history/city?id={city_id}&type=hour&appid={API key}
```
Docs:.[3]

**4. History API Full Archive**  
- For extensive historical weather archives (since 1979), add location, check status, then request data. It's a 3-step process.  
Docs:.[4]

**5. History API by Timestamp**  
- Get historical weather at any point from 1979 to now by coordinates and UNIX timestamp:
```plaintext
https://history.openweathermap.org/data/3.0/history/timemachine?lat={lat}&lon={lon}&dt={timestamp}&appid={API key}
```
Docs:.[5]
