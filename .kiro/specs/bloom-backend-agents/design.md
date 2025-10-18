# Design Document

## Overview

The Bloom backend system implements a hierarchical multi-agent architecture using Google's Agent Development Kit (ADK). The system consists of four specialized agents that work together to provide comprehensive farming assistance through a FastAPI web interface. The architecture follows a hub-and-spoke pattern where a main orchestrator agent delegates tasks to three domain-specific specialist agents.

## Architecture

### High-Level Architecture

```
User Query → FastAPI → ADK Runner → Main Agent
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
                    FastAPI Response → Frontend
```

### Agent Hierarchy

1. **Main Agent (Orchestrator)**
   - Routes queries based on intent analysis
   - Coordinates multi-agent workflows
   - Synthesizes responses from multiple agents
   - Handles general queries directly

2. **Specialist Agents**
   - **Planner Agent**: Crop planning, rotation, budgeting
   - **Farm Agent**: Real-time monitoring, operations
   - **Market Agent**: Pricing, supply chain, profitability

### Tool Architecture

Each agent has access to specific tools based on their domain expertise:

```
Tools Layer:
├── earth_engine.py     # Satellite data, NDVI, soil analysis
├── weather_api.py      # Forecasts, climate data
├── web_search.py       # Market prices, suppliers
└── farm_data.py        # Farm profiles, historical data
```

## Components and Interfaces

### Agent Components

#### Main Agent
```python
# Agent Configuration
model: 'gemini-2.5-flash'
tools: [planner_tool, farm_tool, market_tool]
delegation_strategy: LLM-driven intent classification
```

**Key Responsibilities:**
- Query intent analysis and routing
- Multi-agent coordination for complex queries
- Response synthesis and formatting
- Session context management

#### Planner Agent
```python
# Agent Configuration
model: 'gemini-2.5-flash'
tools: [get_soil_suitability, get_seasonal_forecast, get_farm_profile, google_search]
specialization: Crop planning and resource management
```

**Key Capabilities:**
- Soil suitability analysis using Earth Engine
- Seasonal weather forecast integration
- Budget calculation and resource planning
- Crop rotation optimization

#### Farm Agent
```python
# Agent Configuration
model: 'gemini-2.5-flash'
tools: [get_ndvi_data, get_weather_forecast, get_farm_profile, get_plot_details, google_search]
specialization: Real-time monitoring and operations
```

**Key Capabilities:**
- NDVI-based crop health monitoring
- Irrigation scheduling and recommendations
- Pest/disease identification and treatment
- Daily task management

#### Market Agent
```python
# Agent Configuration
model: 'gemini-2.5-flash'
tools: [get_weather_forecast, get_farm_profile, get_expense_history, google_search]
specialization: Market intelligence and financial analysis
```

**Key Capabilities:**
- Real-time commodity price tracking
- Supplier comparison and sourcing
- Profitability analysis and forecasting
- Expense tracking and budget management

### Tool Interfaces

#### Earth Engine Tool
```python
def get_ndvi_data(plot_coordinates: List[List[float]], start_date: str, end_date: str, tool_context: ToolContext) -> Dict[str, Any]
def get_soil_suitability(plot_coordinates: List[List[float]], crop_type: str, tool_context: ToolContext) -> Dict[str, Any]
```

**Data Sources:**
- Sentinel-2 satellite imagery for NDVI
- OpenLandMap soil datasets
- Historical climate data

#### Weather API Tool
```python
def get_weather_forecast(latitude: float, longitude: float, days: int, tool_context: ToolContext) -> Dict[str, Any]
def get_seasonal_forecast(latitude: float, longitude: float, season_months: int, tool_context: ToolContext) -> Dict[str, Any]
```

**Data Sources:**
- WeatherAPI.com for forecasts
- Historical weather patterns
- Seasonal climate predictions

#### Farm Data Tool
```python
def get_farm_profile(farmer_id: str, tool_context: ToolContext) -> Dict[str, Any]
def get_plot_details(plot_id: str, tool_context: ToolContext) -> Dict[str, Any]
def get_expense_history(farmer_id: str, months: int, tool_context: ToolContext) -> Dict[str, Any]
```

**Data Management:**
- Farm profile and plot information
- Historical yield and performance data
- Inventory and expense tracking

### FastAPI Backend Interface

#### Core Endpoints
```python
POST /chat
- Input: ChatRequest (message, user_id, session_id, farm_location)
- Output: ChatResponse (response, session_id, widgets, agent_used)

GET /health
- Output: HealthResponse (status, version)

POST /sessions/reset
- Input: user_id, session_id
- Output: Success/error status
```

#### Request/Response Models
```python
class ChatRequest(BaseModel):
    message: str
    user_id: str = "default_user"
    session_id: Optional[str] = None
    farm_location: Optional[Dict[str, float]] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    widgets: List[Dict[str, Any]] = []
    agent_used: Optional[str] = None
```

## Data Models

### Session State Schema
```python
{
    'farm_profile': {
        'farmer_id': str,
        'farm_name': str,
        'location': {'latitude': float, 'longitude': float},
        'total_area_hectares': float,
        'plots': [PlotData],
        'historical_yields': Dict[str, Dict[str, float]],
        'inventory': Dict[str, float]
    },
    'farm_location': {'latitude': float, 'longitude': float},
    'current_widget': WidgetData  # Temporary storage for current response
}
```

### Session State Management Strategy

**Storage Approach:**
- **Development**: InMemorySessionService (ADK built-in, lost on restart)
- **Production**: External persistent storage (Cloud SQL, Firestore, or Redis)
- **Scope**: Per-session (unique session_id per conversation thread)
- **Persistence**: User farm_profile persists across sessions, conversation state is session-specific

**Widget State Handling:**
- `current_widget` is temporary storage during agent execution
- Widgets are extracted and returned in the API response, then cleared from session state
- This prevents widget accumulation in session state while ensuring proper delivery to frontend
- Conversation history with widgets would be managed separately if needed for context

**Session Lifecycle:**
```python
# Session creation with farm context
session_id = generate_unique_id()
initial_state = {
    'farm_location': request.farm_location,
    'farm_profile': load_or_create_farm_profile(user_id)
}

# During agent execution
tool_context.state['current_widget'] = widget_data

# After response generation
widgets = [session.state.pop('current_widget')] if 'current_widget' in session.state else []
return ChatResponse(widgets=widgets, ...)
```

### Plot Data Schema
```python
{
    'plot_id': str,
    'name': str,
    'area_hectares': float,
    'current_crop': str,
    'planting_date': str,
    'expected_harvest': str,
    'coordinates': List[List[float]]
}
```

### Widget Data Schema
```python
{
    'type': str,  # Widget type identifier
    'data': Dict[str, Any]  # Widget-specific data
}
```

### Supported Widget Types
- `ndvi-chart`: Vegetation health time series
- `farm-map`: Interactive satellite view with plot overlays
- `planting-calendar`: Seasonal planting schedule
- `crop-recommendation`: Crop suitability analysis
- `budget-calculator`: Season cost projections
- `price-chart`: Commodity price trends
- `weather-today`: Current conditions and forecast
- `irrigation-schedule`: Watering recommendations

## Error Handling

### Tool Error Handling
```python
# Standardized error response format
{
    'status': 'error',
    'message': str,
    'error_code': Optional[str],
    'retry_after': Optional[int]
}
```

### Error Categories
1. **API Errors**: External service failures (Earth Engine, Weather API)
2. **Data Errors**: Missing or invalid farm data
3. **Authentication Errors**: API key or permission issues
4. **Rate Limiting**: API quota exceeded
5. **Network Errors**: Connectivity issues

### Error Recovery Strategies
- Graceful degradation with cached data
- Fallback to alternative data sources
- User-friendly error messages
- Automatic retry with exponential backoff

### FastAPI Error Handling
```python
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "timestamp": datetime.utcnow().isoformat()}
    )
```

## Testing Strategy

### Unit Testing
- Individual tool function testing
- Agent response validation
- Widget data format verification
- Error handling scenarios

### Integration Testing
- End-to-end agent workflows
- Multi-agent collaboration scenarios
- External API integration testing
- Session state management

### Performance Testing
- Response time benchmarks
- Concurrent user handling
- Memory usage optimization
- API rate limit compliance

### Test Data Management
- Mock farm profiles and plot data
- Simulated satellite imagery responses
- Weather forecast test datasets
- Market price historical data

### Testing Tools and Frameworks
- pytest for unit and integration tests
- ADK CLI for local agent testing
- FastAPI TestClient for API testing
- Mock libraries for external service simulation

## Session State Architecture

### Development vs Production Storage

**Development Environment:**
```python
# Uses ADK's InMemorySessionService
session_service = InMemorySessionService()
# Pros: Simple setup, no external dependencies
# Cons: Data lost on restart, not suitable for production
```

**Production Environment:**
```python
# External persistent storage options:
# Option 1: Cloud SQL with SQLAlchemy session service
# Option 2: Firestore with custom session service  
# Option 3: Redis with custom session service

# Example Firestore implementation:
from google.cloud import firestore
session_service = FirestoreSessionService(
    project_id=PROJECT_ID,
    collection_name="bloom_sessions"
)
```

### Session vs User Data Separation

**User-Level Data (Persistent across sessions):**
- Farm profile and plot information
- Historical yield data
- Inventory and expense records
- User preferences and settings

**Session-Level Data (Conversation-specific):**
- Current conversation context
- Temporary widget data
- Query-specific state
- Agent execution context

### Migration Path
1. **Phase 1**: Start with InMemorySessionService for MVP
2. **Phase 2**: Implement Firestore session service for production
3. **Phase 3**: Add user data persistence layer separate from session management

## Deployment Architecture

### Google Cloud Run Configuration
```dockerfile
# Container specifications
Memory: 2Gi
CPU: 2 cores
Timeout: 300 seconds
Concurrency: 100 requests per instance
```

### Environment Configuration
```python
# Required environment variables
GOOGLE_CLOUD_PROJECT: Project ID
GOOGLE_CLOUD_LOCATION: Deployment region
GOOGLE_GENAI_USE_VERTEXAI: Enable Vertex AI
GOOGLE_API_KEY: Gemini API key
EARTH_ENGINE_SERVICE_ACCOUNT: EE credentials
WEATHER_API_KEY: Weather service key
```

### Scalability Considerations
- Horizontal scaling via Cloud Run
- Session state externalization for multi-instance deployment
- Caching layer for frequently accessed data
- Load balancing and traffic distribution

### Security Measures
- API key management via Secret Manager
- Input validation and sanitization
- Rate limiting and abuse prevention
- CORS configuration for frontend integration

This design provides a robust, scalable foundation for the Bloom multi-agent farming assistant backend, ensuring reliable performance and maintainable code structure.