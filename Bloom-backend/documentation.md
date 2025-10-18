Bloom: AI-Powered Farming Assistant - Technical
 Documentation
 Project Overview
 Bloom is a cloud-based, multi-agent AI farming assistant built for Google Cloud's hackathon. It
 leverages Google's Agent Development Kit (ADK), Gemini 2.5 Flash, and the Agent-to-Agent (A2A)
 protocol to provide farmers with intelligent insights on planning, farm monitoring, and market
 intelligence.
 Technology Stack
 Backend Framework: FastAPI
 Agent Framework: Google ADK (Agent Development Kit)
 LLM Model: Gemini 2.5 Flash
 Deployment Platform: Google Cloud Run
 Communication Protocol: A2A (Agent-to-Agent)
 External APIs:
 Google Earth Engine (satellite imagery, NDVI, soil data)
 Weather API (forecasts, historical climate data)
 Web Search (market prices, suppliers, research)
 Architecture Overview
 Multi-Agent System Design
 Bloom implements a hierarchical multi-agent architecture where a main orchestrator agent
 delegates tasks to three specialized agents:
 1. Main Agent (Orchestrator)
 2. Planner Agent (Crop planning and rotation)
 3. Farm Agent (Real-time monitoring and operations)
 4. Market Agent (Pricing and supply chain)
User Query → FastAPI Endpoint → ADK Runner → Main Agent
                                                ↓
                                    ┌───────────┴───────────┐
                                    ↓           ↓           ↓
                            Planner Agent  Farm Agent  Market Agent
                                    ↓           ↓           ↓
                            [Tools: EE,    [Tools: EE,  [Tools: Web
                            Weather, Web]  Weather, Web] Search, Weather]
                                    ↓           ↓           ↓
                            Widget Data ← Response + Insights
                                    ↓
                            FastAPI Response → Frontend Rendering
 Purpose: Routes user queries to the appropriate specialized agent based on intent classification.
 Configuration:
 Key Responsibilities:
 Example Queries:
 Agent Communication Flow
 Agent Specifications
 1. Main Agent (Orchestrator)
 Model: gemini-2.5-flash
 Role: Router/Orchestrator
 Tools: None (delegates to sub-agents)
 Delegation Strategy: LLM-driven delegation based on query analysis
 Analyze incoming user queries
 Determine which specialist agent should handle the request
 Coordinate multi-agent workflows for complex queries
 Synthesize responses from multiple agents when needed
 "Hello" → Handle directly with general greeting
 "How does Bloom work?" → Provide system overview
 "Tell me about farming" → General knowledge response
2. Planner Agent
 Purpose: Handles crop planning, rotation strategies, budgeting, and season preparation.
 Questions It Answers:
 "What should I plant this season?"
 "When should I plant maize?"
 "Help me plan crop rotation"
 "How much will this season cost?"
 "What's my planting schedule?"
 "Should I grow tomatoes or maize?"
 "Plan my next 6 months"
 "How much seed do I need?"
 "What fertilizer should I buy?"
 Widgets Rendered:
 Widget Name
 planting-calendar
 crop-recommendation
 Description
 Seasonal planting schedule
 Crop suitability analysis
 Data Source
 Weather API + Earth Engine
 budget-calculator
 resource-planner
 Season cost projections
 Earth Engine (soil, climate)
 Web Search (input prices)
 Seed/fertilizer quantities
 Farm data + calculations
 rotation-plan
 profitability-forecast
 Multi-season crop rotation map
 Revenue/margin predictions
 Historical farm data
 Market data + yield estimates
 Tools:
 Earth Engine: Historical climate data, soil suitability maps, past NDVI trends
 Weather API: Seasonal forecasts (3-6 months)
 Web Search: Crop research, best practices, input costs
 Farm Data Access: Past yields, plot characteristics, farm profile
 3. Farm Agent
 Purpose: Provides real-time farm monitoring, operational insights, and task management.
 Questions It Answers:
 "How's my farm looking?"
 "Show me Plot B"
 "Why is Plot B underperforming?"
"Do I need to water today?"
 "What should I do this week?"
 "Is there pest activity?"
 "Check crop health"
 "What's my soil moisture?"
 "Show vegetation health"
 "What tasks do I have today?"
 Widgets Rendered:
 Widget Name
 farm-map
 Description
 Interactive satellite view with plot overlays
 ndvi-chart
 Vegetation health time series
 Data Source
 Earth Engine
 Earth Engine (Sentinel-2)
 soil-moisture-map
 task-list
 Plot-level moisture heatmap
 Daily/weekly to-do items
 Earth Engine + Weather
 growth-tracker
 alert-dashboard
 Crop development stage indicators
 Urgent issues (drought, pests, disease)
 Farm data + agent recommendations
 Earth Engine NDVI + farm logs
 Multi-source analysis
 weather-today
 irrigation-schedule
 Current conditions + hourly forecast
 Watering recommendations
 Weather API
 Soil moisture + weather
 Tools:
 Earth Engine: Real-time NDVI, crop health indices, satellite imagery
 Weather API: Daily/hourly forecasts, precipitation data
 Web Search: Pest/disease identification and remediation
 Farm Data Access: Activity logs, plot information, crop stages
 4. Market Agent
 Purpose: Market intelligence, pricing analysis, and supply chain optimization.
 Questions It Answers:
 "What are maize prices today?"
 "Should I sell now or wait?"
 "Where can I buy cheap fertilizer?"
 "Find seed suppliers near me"
 "What's the market forecast?"
 "When is the best time to sell?"
"Compare fertilizer prices"
 "How much profit will I make?"
 "Track my expenses"
 "Show my inventory"
 Widgets Rendered:
 Widget Name
 price-chart
 sell-timing-recommendation
 Description
 Commodity price trends (30-90 days)
 Data Source
 Web Search (market APIs)
 Optimal selling window analysis
 supplier-comparison
 profit-calculator
 Input supplier price comparison table
 Price forecasts + inventory
 Web Search (supplier data)
 Revenue projections based on yields
 expense-tracker
 inventory-status
 Cost breakdown (seeds, fertilizer, labor)
 Current stock levels
 Market prices + farm data
 Farm data
 Farm data
 market-forecast
 Tools:
 30-60 day price predictions
 Weather + market trends
 Web Search: Real-time commodity prices, supplier information, market trends
 Weather API: Supply chain impact analysis (drought, floods)
 Farm Data Access: Inventory, past sales records, expense logs
 Implementation Guide
 Project Structure
 bloom/
 ├── main.py                 
├── requirements.txt        
├── Dockerfile             
├── .env                   
├── agents/
 │   ├── __init__.py
 │   ├── main_agent.py      
# FastAPI application entry point
 # Python dependencies
 # Cloud Run container configuration
 # Environment variables (API keys)
 # Main orchestrator agent
 │   ├── planner_agent.py   # Planner specialist
 │   ├── farm_agent.py      
# Farm monitoring specialist
 │   └── market_agent.py    
├── tools/
 │   ├── __init__.py
 │   ├── earth_engine.py    
│   ├── weather_api.py     
│   ├── web_search.py      
│   └── farm_data.py       
# Market intelligence specialist
 # Earth Engine API wrapper
 # Weather API integration
 # Web search tool
 # Farm data access layer
 ├── models/
 │   ├── __init__.py
│   └── schemas.py         
└── utils/
 ├── __init__.py
 └── session_manager.py # ADK session management
 # Pydantic models for requests/responses
 Step-by-Step Implementation
 Step 1: Environment Setup
 Install Dependencies:
 pip install google-adk fastapi uvicorn python-dotenv earthengine-api requests
 Configure Environment Variables (
 .env):
 # Google Cloud Configuration
 GOOGLE_CLOUD_PROJECT=your-project-id
 GOOGLE_CLOUD_LOCATION=us-central1
 GOOGLE_GENAI_USE_VERTEXAI=1
 # API Keys
 GOOGLE_API_KEY=your-gemini-api-key
 EARTH_ENGINE_SERVICE_ACCOUNT=your-ee-service-account.json
 WEATHER_API_KEY=your-weather-api-key
 # ADK Configuration
 ADK_SESSION_DB=sqlite:///bloom_sessions.db
 Step 2: Create Custom Tools
 Earth Engine Tool (
 tools/earth_engine.py)
 """
 Google Earth Engine integration for satellite data and NDVI analysis.
 """
 import ee
 from google.adk.tools import ToolContext
 from typing import Dict, Any, List
 import json
 # Initialize Earth Engine
 ee.Initialize()
 def get_ndvi_data(
 plot_coordinates: List[List[float]],
 start_date: str,
 end_date: str,
 tool_context: ToolContext
) -&gt; Dict[str, Any]:
    """
    Get NDVI (vegetation health) data for a farm plot.
    
    Args:
        plot_coordinates: List of [lon, lat] pairs defining the plot boundary
        start_date: Start date in 'YYYY-MM-DD' format
        end_date: End date in 'YYYY-MM-DD' format
        tool_context: ADK tool context for state access
    
    Returns:
        Dictionary containing NDVI statistics and time series data
    """
    try:
        # Create geometry from coordinates
        geometry = ee.Geometry.Polygon(plot_coordinates)
        
        # Load Sentinel-2 imagery
        collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                     .filterBounds(geometry)
                     .filterDate(start_date, end_date)
                     .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))
        
        # Calculate NDVI
        def add_ndvi(image):
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            return image.addBands(ndvi)
        
        ndvi_collection = collection.map(add_ndvi)
        
        # Get mean NDVI over time
        ndvi_series = ndvi_collection.select('NDVI').getRegion(geometry, 10).getInfo()
        
        # Calculate statistics
        mean_ndvi = ndvi_collection.select('NDVI').mean().reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=geometry,
            scale=10
        ).getInfo()
        
        # Store in session state for widget rendering
        widget_data = {
            'type': 'ndvi-chart',
            'data': {
                'time_series': ndvi_series,
                'mean_ndvi': mean_ndvi.get('NDVI', 0),
                'health_status': 'Healthy' if mean_ndvi.get('NDVI', 0) &gt; 0.6 else 'Mod
                'plot_area': geometry.area().divide(10000).getInfo()  # hectares
            }
        }
        
        tool_context.state['current_widget'] = widget_data
        
        return {
            'status': 'success',
            'mean_ndvi': mean_ndvi.get('NDVI', 0),
            'observation_count': len(ndvi_series) - 1,
            'health_assessment': widget_data['data']['health_status']
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Earth Engine error: {str(e)}'
        }
 def get_soil_suitability(
    plot_coordinates: List[List[float]],
    crop_type: str,
    tool_context: ToolContext
 ) -&gt; Dict[str, Any]:
    """
    Analyze soil suitability for a specific crop.
    
    Args:
        plot_coordinates: Plot boundary coordinates
        crop_type: Crop to evaluate (e.g., 'maize', 'wheat', 'tomato')
        tool_context: ADK tool context
    
    Returns:
        Soil suitability analysis and recommendations
    """
    try:
        geometry = ee.Geometry.Polygon(plot_coordinates)
        
        # Load soil data from Earth Engine
        soil_texture = ee.Image('OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02')
        soil_ph = ee.Image('OpenLandMap/SOL/SOL_PH-H2O_USDA-4C1A2A_M/v02')
        
        # Get soil properties
        soil_info = {
            'texture': soil_texture.reduceRegion(
                reducer=ee.Reducer.mode(),
                geometry=geometry,
                scale=250
            ).getInfo(),
            'ph': soil_ph.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=250
            ).getInfo()
        }
        
        # Simple suitability logic (in production, use comprehensive models)
        crop_requirements = {
            'maize': {'ph_range': (5.8, 7.0), 'texture': 'loam'},
            'wheat': {'ph_range': (6.0, 7.5), 'texture': 'loam'},
            'tomato': {'ph_range': (6.0, 6.8), 'texture': 'sandy_loam'}
        }
        
        requirements = crop_requirements.get(crop_type.lower(), crop_requirements['maize'
        
        # Calculate suitability score
        soil_ph_value = soil_info['ph'].get('b0', 7.0) / 10  # Convert to pH scale
        ph_suitable = requirements['ph_range'][^0] &lt;= soil_ph_value &lt;= requirements
        
        suitability_score = 0.85 if ph_suitable else 0.60
        
        widget_data = {
            'type': 'crop-recommendation',
            'data': {
                'crop': crop_type,
                'suitability_score': suitability_score,
                'soil_ph': soil_ph_value,
                'recommendations': [
                    'Soil pH is optimal for this crop' if ph_suitable else 'Consider pH a
                    'Add organic matter to improve soil structure',
                    'Monitor drainage in heavy rain seasons'
                ]
            }
        }
        
        tool_context.state['current_widget'] = widget_data
        
        return {
            'status': 'success',
            'suitability_score': suitability_score,
            'soil_ph': soil_ph_value,
            'recommendation': 'Suitable' if suitability_score &gt; 0.7 else 'Marginally s
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Soil analysis error: {str(e)}'
        }
 """
 Weather API integration for forecasts and climate data.
 """
 import requests
 from typing import Dict, Any, Optional
 from google.adk.tools import ToolContext
 from datetime import datetime, timedelta
 import os
 WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
 WEATHER_API_BASE = 'https://api.weatherapi.com/v1'
 def get_weather_forecast(
    latitude: float,
    longitude: float,
    days: int = 7,
 Weather API Tool (tools/weather_api.py)
    tool_context: Optional[ToolContext] = None
 ) -&gt; Dict[str, Any]:
    """
    Get weather forecast for farm location.
    
    Args:
        latitude: Farm latitude
        longitude: Farm longitude
        days: Number of days to forecast (1-14)
        tool_context: ADK tool context
    
    Returns:
        Weather forecast data including temperature, precipitation, and recommendations
    """
    try:
        url = f'{WEATHER_API_BASE}/forecast.json'
        params = {
            'key': WEATHER_API_KEY,
            'q': f'{latitude},{longitude}',
            'days': min(days, 14),
            'aqi': 'no',
            'alerts': 'yes'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Extract key information
        current = data['current']
        forecast = data['forecast']['forecastday']
        
        # Calculate irrigation needs
        total_rain = sum(day['day']['totalprecip_mm'] for day in forecast)
        avg_temp = sum(day['day']['avgtemp_c'] for day in forecast) / len(forecast)
        
        irrigation_needed = total_rain &lt; 25 and avg_temp &gt; 25
        
        # Prepare widget data
        widget_data = {
            'type': 'weather-today',
            'data': {
                'current_temp': current['temp_c'],
                'condition': current['condition']['text'],
                'humidity': current['humidity'],
                'wind_speed': current['wind_kph'],
                'forecast': [
                    {
                        'date': day['date'],
                        'max_temp': day['day']['maxtemp_c'],
                        'min_temp': day['day']['mintemp_c'],
                        'rain_mm': day['day']['totalprecip_mm'],
                        'condition': day['day']['condition']['text']
                    }
                    for day in forecast
                ],
                'irrigation_recommendation': 'Needed' if irrigation_needed else 'Not need
                'total_rainfall_7d': total_rain
            }
        }
        
        if tool_context:
            tool_context.state['current_widget'] = widget_data
        
        return {
            'status': 'success',
            'current_temperature': current['temp_c'],
            'condition': current['condition']['text'],
            'forecast_summary': f'{len(forecast)}-day forecast: {total_rain}mm total rain
            'irrigation_needed': irrigation_needed
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Weather API error: {str(e)}'
        }
 def get_seasonal_forecast(
    latitude: float,
    longitude: float,
    season_months: int = 3,
    tool_context: Optional[ToolContext] = None
 ) -&gt; Dict[str, Any]:
    """
    Get seasonal climate forecast for crop planning.
    
    Args:
        latitude: Farm latitude
        longitude: Farm longitude
        season_months: Number of months to forecast (3-6)
        tool_context: ADK tool context
    
    Returns:
        Seasonal climate predictions
    """
    # In production, use a proper seasonal forecast API
    # For now, we'll use historical averages as a proxy
    
    try:
        # Get historical data (simplified - use proper API in production)
        url = f'{WEATHER_API_BASE}/history.json'
        
        # Get data from last year same period
        historical_data = []
        base_date = datetime.now() - timedelta(days=365)
        
        for month in range(season_months):
            date = base_date + timedelta(days=30 * month)
            params = {
                'key': WEATHER_API_KEY,
                'q': f'{latitude},{longitude}',
                'dt': date.strftime('%Y-%m-%d')
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                historical_data.append(response.json())
        
        # Simplified forecast based on historical trends
        avg_rainfall = 150  # mm per month (placeholder)
        avg_temp = 24  # °C (placeholder)
        
        widget_data = {
            'type': 'planting-calendar',
            'data': {
                'season_length_months': season_months,
                'expected_rainfall_mm': avg_rainfall * season_months,
                'average_temperature': avg_temp,
                'planting_recommendation': 'Favorable conditions expected',
                'risk_factors': ['Monitor for drought in month 2', 'High temperatures pos
            }
        }
        
        if tool_context:
            tool_context.state['current_widget'] = widget_data
        
        return {
            'status': 'success',
            'season_months': season_months,
            'expected_rainfall': avg_rainfall * season_months,
            'avg_temperature': avg_temp,
            'recommendation': 'Favorable planting conditions expected'
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Seasonal forecast error: {str(e)}'
        }
 """
 Farm data access layer for retrieving farm profile, plots, and historical data.
 """
 from typing import Dict, Any, List, Optional
 from google.adk.tools import ToolContext
 def get_farm_profile(
    farmer_id: str,
    tool_context: ToolContext
 ) -&gt; Dict[str, Any]:
    """
    Get farm profile information.
 Farm Data Access Tool (tools/farm_data.py)
    
    Args:
        farmer_id: Unique farmer identifier
        tool_context: ADK tool context
    
    Returns:
        Farm profile data including plots, crops, and historical performance
    """
    # In production, query from database
    # Here's a mock implementation
    
    farm_data = {
        'farmer_id': farmer_id,
        'farm_name': 'Sunshine Farm',
        'location': {
            'latitude': -1.2921,
            'longitude': 36.8219,
            'region': 'Nairobi County'
        },
        'total_area_hectares': 5.5,
        'plots': [
            {
                'plot_id': 'plot_a',
                'name': 'Plot A',
                'area_hectares': 2.0,
                'current_crop': 'maize',
                'planting_date': '2024-03-15',
                'expected_harvest': '2024-09-15',
                'coordinates': [[36.82, -1.29], [36.83, -1.29], [36.83, -1.30], [36.82, 
            },
            {
                'plot_id': 'plot_b',
                'name': 'Plot B',
                'area_hectares': 1.5,
                'current_crop': 'tomatoes',
                'planting_date': '2024-04-01',
                'expected_harvest': '2024-08-01',
                'coordinates': [[36.82, -1.30], [36.83, -1.30], [36.83, -1.31], [36.82, 
            },
            {
                'plot_id': 'plot_c',
                'name': 'Plot C',
                'area_hectares': 2.0,
                'current_crop': 'fallow',
                'coordinates': [[36.82, -1.31], [36.83, -1.31], [36.83, -1.32], [36.82, 
            }
        ],
        'historical_yields': {
            '2023': {
                'maize': 4.5,  # tons/hectare
                'tomatoes': 12.0
            },
            '2022': {
                'maize': 4.2,
                'tomatoes': 11.5
            }
        },
        'inventory': {
            'maize_kg': 500,
            'tomatoes_kg': 150,
            'fertilizer_bags': 10,
            'seeds_maize_kg': 5
        }
    }
    
    # Store in session state
    tool_context.state['farm_profile'] = farm_data
    
    return {
        'status': 'success',
        'farm_name': farm_data['farm_name'],
        'total_plots': len(farm_data['plots']),
        'total_area': farm_data['total_area_hectares'],
        'active_crops': [p['current_crop'] for p in farm_data['plots'] if p['current_crop
    }
 def get_plot_details(
    plot_id: str,
    tool_context: ToolContext
 ) -&gt; Dict[str, Any]:
    """
    Get detailed information about a specific plot.
    
    Args:
        plot_id: Plot identifier (e.g., 'plot_a')
        tool_context: ADK tool context
    
    Returns:
        Detailed plot information
    """
    farm_profile = tool_context.state.get('farm_profile', {})
    plots = farm_profile.get('plots', [])
    
    plot = next((p for p in plots if p['plot_id'] == plot_id), None)
    
    if not plot:
        return {
            'status': 'error',
            'message': f'Plot {plot_id} not found'
        }
    
    return {
        'status': 'success',
        'plot': plot
    }
 def get_expense_history(
    farmer_id: str,
    months: int = 6,
    tool_context: Optional[ToolContext] = None
) -&gt; Dict[str, Any]:
    """
    Get farm expense history for budgeting.
    
    Args:
        farmer_id: Farmer identifier
        months: Number of months of history
        tool_context: ADK tool context
    
    Returns:
        Expense breakdown by category
    """
    # Mock expense data
    expenses = {
        'seeds': 12000,  # KES
        'fertilizer': 28000,
        'pesticides': 8500,
        'labor': 45000,
        'fuel': 6000,
        'equipment_maintenance': 5500,
        'total': 105000
    }
    
    widget_data = {
        'type': 'expense-tracker',
        'data': {
            'period_months': months,
            'expenses': expenses,
            'breakdown': [
                {'category': k, 'amount': v}
                for k, v in expenses.items() if k != 'total'
            ]
        }
    }
    
    if tool_context:
        tool_context.state['current_widget'] = widget_data
    
    return {
        'status': 'success',
        'total_expenses': expenses['total'],
        'period_months': months,
        'top_expense': 'labor'
    }
 Step 3: Define Agents
Main Agent (
 agents/main_agent.py)
 """
 Main orchestrator agent that routes queries to specialist agents.
 """
 from google.adk.agents import Agent
 from google.adk.tools import AgentTool
 from .planner_agent import planner_agent
 from .farm_agent import farm_agent
 from .market_agent import market_agent
 # Wrap specialist agents as tools for explicit delegation
 planner_tool = AgentTool(
 agent=planner_agent,
 description="Use this agent for crop planning, rotation strategies, budgeting, and se
 )
 farm_tool = AgentTool(
 agent=farm_agent,
 description="Use this agent for real-time farm monitoring, plot analysis, crop health
 )
 market_tool = AgentTool(
 agent=market_agent,
 description="Use this agent for market prices, selling timing, supplier information, 
)
 # Main orchestrator agent
 main_agent = Agent(
 model='gemini-2.5-flash',
 name='main_agent',
 description='Main Bloom assistant that routes farmer queries to specialist agents.',
 instruction="""
 You are Bloom, an AI farming assistant. Your role is to understand farmers' questions
 and route them to the appropriate specialist:
 )- **Planner Agent**: Use for questions about what to plant, when to plant, crop rotat
 budgeting, resource planning, and season preparation.- **Farm Agent**: Use for questions about current farm conditions, plot monitoring, 
crop health, irrigation needs, weather updates, and daily tasks.- **Market Agent**: Use for questions about commodity prices, selling timing, 
supplier information, expense tracking, and profit calculations.
 For general questions like "Hello", "How does Bloom work?", or "Tell me about farming
 respond directly without delegating.
 Always be helpful, practical, and farmer-focused in your responses.
 """,
 tools=[planner_tool, farm_tool, market_tool]
Planner Agent (
 agents/planner_agent.py)
 """
 Planner agent for crop planning and season preparation.
 """
 from google.adk.agents import Agent
 from google.adk.tools import FunctionTool, google_search
 from tools.earth_engine import get_soil_suitability
 from tools.weather_api import get_seasonal_forecast
 from tools.farm_data import get_farm_profile
 planner_agent = Agent(
 model='gemini-2.5-flash',
 name='planner_agent',
 description='Specialist in crop planning, rotation strategies, and season budgeting.'
 instruction="""
 You are the Planner specialist for Bloom. Your expertise includes:- Crop selection based on soil suitability, climate, and market demand- Planting calendar creation using seasonal weather forecasts- Crop rotation planning for soil health and pest management- Budget estimation for seeds, fertilizers, and inputs- Resource planning (quantities needed for the season)- Profitability forecasting based on expected yields and market prices
 When answering:
 1. Always use tools to get real data (Earth Engine for soil, Weather API for climate,
 2. Provide specific, actionable recommendations with timelines
 3. Consider the farmer's location, plot characteristics, and historical data
 4. Include cost estimates when discussing inputs
 5. Generate appropriate widgets (planting-calendar, crop-recommendation, budget-calcu
 Be practical and farmer-focused. Explain technical concepts in simple terms.
 """,
 tools=[
 FunctionTool(get_soil_suitability),
 FunctionTool(get_seasonal_forecast),
 FunctionTool(get_farm_profile),
 google_search
 ]
 )
 Farm Agent (
 agents/farm_agent.py)
 """
 Farm agent for real-time monitoring and operations.
 """
 from google.adk.agents import Agent
 from google.adk.tools import FunctionTool, google_search
 from tools.earth_engine import get_ndvi_data
 from tools.weather_api import get_weather_forecast
 from tools.farm_data import get_farm_profile, get_plot_details
 farm_agent = Agent(
    model='gemini-2.5-flash',
    name='farm_agent',
    description='Specialist in real-time farm monitoring, crop health, and daily operatio
    instruction="""
    You are the Farm Monitor specialist for Bloom. Your expertise includes:
    
    - Real-time crop health monitoring using satellite NDVI data
    - Plot-specific analysis and comparisons
    - Irrigation scheduling based on soil moisture and weather
    - Pest and disease identification from symptoms
    - Daily and weekly task recommendations
    - Growth stage tracking and harvest timing
    
    When answering:
    1. Use Earth Engine to get current NDVI and crop health metrics
    2. Check weather forecasts for irrigation and task planning
    3. Access farm data to get plot-specific information
    4. Generate alerts for urgent issues (drought stress, pest outbreaks)
    5. Create appropriate widgets (farm-map, ndvi-chart, task-list, irrigation-schedule)
    
    Provide immediate, actionable insights. If you detect problems, suggest specific solu
    Be clear about urgency levels.
    """,
    tools=[
        FunctionTool(get_ndvi_data),
        FunctionTool(get_weather_forecast),
        FunctionTool(get_farm_profile),
        FunctionTool(get_plot_details),
        google_search
    ]
 )
 """
 Market agent for pricing intelligence and supply chain.
 """
 from google.adk.agents import Agent
 from google.adk.tools import FunctionTool, google_search
 from tools.weather_api import get_weather_forecast
 from tools.farm_data import get_farm_profile, get_expense_history
 market_agent = Agent(
    model='gemini-2.5-flash',
    name='market_agent',
    description='Specialist in market intelligence, pricing analysis, and supply chain op
    instruction="""
    You are the Market Intelligence specialist for Bloom. Your expertise includes:
    
    - Real-time commodity pricing for crops and inputs
    - Selling timing recommendations based on price trends
    - Supplier comparison for seeds, fertilizers, and equipment
    - Profit/loss calculations based on yields and market prices
    - Expense tracking and budget management
    - Market forecast analysis incorporating weather and supply chain factors
 Market Agent (agents/market_agent.py)
When answering:
 1. Use web search to find current market prices for crops and inputs
 2. Compare prices from multiple sources and suppliers
 3. Consider weather impacts on supply and demand
 4. Access farm data for inventory and expense history
 5. Generate widgets (price-chart, supplier-comparison, profit-calculator)
 Provide data-driven recommendations. Always cite sources for price information.
 Help farmers maximize profits while managing costs.
 """,
 tools=[
 FunctionTool(get_weather_forecast),
 FunctionTool(get_farm_profile),
 FunctionTool(get_expense_history),
 google_search
 ]
 )
 Step 4: FastAPI Backend Implementation
 Main Application (
 main.py)
 """
 FastAPI backend for Bloom multi-agent farming assistant.
 """
 import os
 import uvicorn
 from fastapi import FastAPI, HTTPException
 from fastapi.middleware.cors import CORSMiddleware
 from pydantic import BaseModel
 from typing import Optional, Dict, Any, List
 from google.adk.runners import Runner
 from google.adk.sessions import InMemorySessionService
 from google.genai.types import Content, Part
 from agents.main_agent import main_agent
 from dotenv import load_dotenv
 import uuid
 # Load environment variables
 load_dotenv()
 # Initialize FastAPI app
 app = FastAPI(
 title="Bloom AgTech API",
 description="Multi-agent AI farming assistant powered by Google ADK",
 version="1.0.0"
 )
 # Enable CORS for frontend
 app.add_middleware(
 CORSMiddleware,
 allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
 )
 # Initialize ADK session service
 session_service = InMemorySessionService()
 # Initialize ADK runner
 runner = Runner(
    agent=main_agent,
    app_name="bloom_assistant",
    session_service=session_service
 )
 # Request/Response Models
 class ChatRequest(BaseModel):
    message: str
    user_id: str = "default_user"
    session_id: Optional[str] = None
    farm_location: Optional[Dict[str, float]] = None  # {'latitude': -1.29, 'longitude': 
class ChatResponse(BaseModel):
    response: str
    session_id: str
    widgets: List[Dict[str, Any]] = []
    agent_used: Optional[str] = None
 class HealthResponse(BaseModel):
    status: str
    version: str
 # API Endpoints
 @app.get("/health", response_model=HealthResponse)
 async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0")
 @app.post("/chat", response_model=ChatResponse)
 async def chat(request: ChatRequest):
    """
    Main chat endpoint for farmer queries.
    
    Processes user messages through the multi-agent system and returns
    responses with optional widget data for frontend rendering.
    """
    try:
        # Generate or use existing session ID
        session_id = request.session_id or str(uuid.uuid4())
        
        # Check if session exists, create if not
        existing_sessions = session_service.list_sessions(
            app_name="bloom_assistant",
            user_id=request.user_id
        )
        
        session_ids = [s.id for s in existing_sessions]
        
        if session_id not in session_ids:
            # Create new session with initial state
            initial_state = {}
            if request.farm_location:
                initial_state['farm_location'] = request.farm_location
            
            await session_service.create_session(
                app_name="bloom_assistant",
                user_id=request.user_id,
                session_id=session_id,
                state=initial_state
            )
        
        # Create message content
        content = Content(
            role="user",
            parts=[Part.from_text(request.message)]
        )
        
        # Run agent
        response_text = None
        agent_used = None
        widgets = []
        
        async for event in runner.run_async(
            user_id=request.user_id,
            session_id=session_id,
            content=content
        ):
            # Capture final response
            if event.type == "content" and event.content.role == "agent":
                response_text = event.content.parts[^0].text
            
            # Track which agent was used
            if hasattr(event, 'agent_name'):
                agent_used = event.agent_name
        
        # Retrieve session to get widget data
        session = await session_service.get_session(
            app_name="bloom_assistant",
            user_id=request.user_id,
            session_id=session_id
        )
        
        # Extract widgets from session state
        if 'current_widget' in session.state:
            widgets.append(session.state['current_widget'])
            # Clear widget after extraction
            session.state.pop('current_widget', None)
        
        if not response_text:
            raise HTTPException(status_code=500, detail="Failed to generate response")
        
        return ChatResponse(
            response=response_text,
            session_id=session_id,
            widgets=widgets,
            agent_used=agent_used
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 @app.post("/sessions/reset")
 async def reset_session(user_id: str, session_id: str):
    """
    Reset a user session (useful for starting fresh conversations).
    """
    try:
        await session_service.delete_session(
            app_name="bloom_assistant",
            user_id=user_id,
            session_id=session_id
        )
        return {"status": "success", "message": "Session reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 @app.get("/")
 async def root():
    """Root endpoint with API information."""
    return {
        "name": "Bloom AgTech API",
        "version": "1.0.0",
        "description": "Multi-agent AI farming assistant",
        "endpoints": {
            "chat": "/chat",
            "health": "/health",
            "docs": "/docs"
        }
    }
 # Run server
 if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
Step 5: Deployment Configuration
 Requirements File (
 requirements.txt)
 # ADK and Google Cloud
 google-adk&gt;=1.15.0
 google-generativeai&gt;=0.8.0
 google-cloud-aiplatform&gt;=1.60.0
 # FastAPI and Web Server
 fastapi&gt;=0.115.0
 uvicorn[standard]&gt;=0.30.0
 pydantic&gt;=2.9.0
 # External APIs
 earthengine-api&gt;=0.1.400
 requests&gt;=2.32.0
 # Utilities
 python-dotenv&gt;=1.0.0
 Dockerfile
 # Use Python 3.11 slim image
 FROM python:3.11-slim
 # Set working directory
 WORKDIR /app
 # Copy requirements first for better caching
 COPY requirements.txt .
 # Install dependencies
 RUN pip install --no-cache-dir -r requirements.txt
 # Copy application code
 COPY . .
 # Set environment variables
 ENV PORT=8080
 ENV PYTHONUNBUFFERED=1
 # Expose port
 EXPOSE 8080
 # Run the application
 CMD ["python", "main.py"]
Cloud Run Deployment Script (
 #!/bin/bash
 deploy.sh)
 # Set variables
 PROJECT_ID="your-google-cloud-project-id"
 REGION="us-central1"
 SERVICE_NAME="bloom-assistant"
 # Set project
 gcloud config set project $PROJECT_ID
 # Build and deploy to Cloud Run
 gcloud run deploy $SERVICE_NAME \--source . \--region $REGION \--platform managed \--allow-unauthenticated \--set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=$REGION" \--memory 2Gi \--cpu 2 \--timeout 300
 echo "Deployment complete!"
 echo "Service URL:"
 gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
 Advanced Features
 Cross-Agent Collaboration
 Bloom supports complex queries that require multiple agents working together:
 Example: "Should I harvest my maize now?"
 1. Farm Agent checks crop maturity (NDVI analysis shows 95% maturity)
 2. Market Agent checks current maize prices (45 KES/kg, forecast shows +8% increase in 2 weeks)
 3. Planner Agent checks storage capacity (500kg available)
 4. Main Agent synthesizes: "Wait 2 weeks - crop is mature but prices are rising"
 Session State Management
 Bloom maintains contextual information across conversations:
 # Session state structure
 {
 'farm_profile': {...},        
'farm_location': {...},       
'current_widget': {...},      
# Farmer's farm data
 # GPS coordinates
 # Widget to render
'conversation_history': [...] # Past interactions
 }
 Widget System
 Agents generate structured widget data that the frontend renders:
 {
 }
 "type": "ndvi-chart",
 "data": {
 "time_series": [[...], [...]],
 "mean_ndvi": 0.72,
 "health_status": "Healthy",
 "plot_area": 2.0
 }
 Frontend uses widget 
Testing Guide
 type to determine which React component to render.
 Local Testing with ADK CLI
 # Test individual agents locally
 adk web agents/planner_agent.py
 # Test full system
 python main.py
 # Query the API
 curl -X POST http://localhost:8080/chat \-H "Content-Type: application/json" \-d '{
 "message": "What should I plant this season?",
 "user_id": "test_farmer",
 "farm_location": {"latitude": -1.2921, "longitude": 36.8219}
 }'
 Example Queries for Each Agent
 Planner Agent:
 "What should I plant this season in Nairobi?"
 "Plan crop rotation for my 5-hectare farm"
 "How much will it cost to plant maize on 2 hectares?"
 Farm Agent:
 "How is Plot B doing?"
"Do I need to water my crops today?"
 "Check the health of my maize crop"
 Market Agent:
 "What are current maize prices in Kenya?"
 "Find me fertilizer suppliers near Nairobi"
 "Should I sell my tomatoes now or wait?"
 Production Considerations
 Security
 1. API Key Management: Use Google Secret Manager for sensitive credentials
 2. Authentication: Implement user authentication (Firebase Auth, OAuth)
 3. Rate Limiting: Add rate limiting to prevent abuse
 4. Input Validation: Validate all user inputs
 Scalability
 1. Database: Replace InMemorySessionService with Cloud SQL or Firestore
 2. Caching: Cache Earth Engine and Weather API responses
 3. Load Balancing: Cloud Run automatically handles this
 4. Monitoring: Set up Cloud Monitoring and Logging
 Cost Optimization
 1. Earth Engine: Cache satellite data, batch requests
 2. Gemini API: Monitor token usage, implement request quotas
 3. Cloud Run: Set appropriate memory/CPU limits
 4. Weather API: Cache forecasts, use free tier wisely
 Future Enhancements
 A2A Protocol Integration
 Convert specialist agents into standalone A2A services:
 # Expose agent as A2A server
 from google.adk.a2a import A2AServer
 a2a_server = A2AServer(
 agent=planner_agent,
    host="0.0.0.0",
    port=8001
 )
 a2a_server.run()
 Then connect via RemoteA2aAgent:
 from google.adk.agents import RemoteA2aAgent
 remote_planner = RemoteA2aAgent(
    url="https://planner-agent-service.run.app"
 )
 Google Cloud Blog: ADK Hackathon Guide
 ADK Documentation: Multi-Agent Systems
 ADK Documentation: Agent2Agent Protocol
 Google Earth Engine Python API Documentation
 Gemini API Documentation: Gemini 2.5 Flash
 FastAPI Documentation
 Cloud Run Deployment Guide
 Built with ❤  for farmers using Google Cloud ADK
 ⁂
 Additional Features
 Voice Interface: Speech-to-text for farmer queries
 SMS Integration: Twilio for text message alerts
 Multilingual Support: Swahili, Kikuyu, Luo translations
 Offline Mode: Local database sync for areas with poor connectivity
 IoT Integration: Direct sensor data from soil moisture/weather stations
 References
 