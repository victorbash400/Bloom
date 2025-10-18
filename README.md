# Bloom Backend

AI-powered farming assistant backend built with Google ADK (Agent Development Kit) and FastAPI.

## Setup

1. **Virtual Environment** (already created):
   ```bash
   # Activate the virtual environment
   venv\Scripts\activate  # Windows
   ```

2. **Dependencies** (already installed):
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**:
   - The `.env` file is already configured with Google Cloud settings
   - Service account credentials are set up in `ascendant-woods-462020-n0-78d818c9658e.json`

## Running the Application

### Option 1: FastAPI Server (Recommended)
```bash
python main.py
```
The API will be available at `http://localhost:8000`

### Option 2: Test the Agent Directly
```bash
python test_agent.py
```

### Option 3: ADK Web UI
```bash
adk web agents
```
Then open `http://localhost:8000` in your browser.

## API Endpoints

### POST /chat
Main chat endpoint for interacting with the farming assistant.

**Request:**
```json
{
  "message": "How do I water my tomatoes?",
  "user_id": "farmer123",
  "session_id": "session456",
  "farm_location": {"latitude": 40.7128, "longitude": -74.0060}
}
```

**Response:**
```json
{
  "response": "For tomatoes, water deeply but less frequently...",
  "session_id": "session456",
  "widgets": [],
  "agent_used": "mainagent"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### POST /sessions/reset
Reset a user session.

## Architecture

```
main.py (FastAPI)
├── /chat endpoint
├── CORS middleware
└── agents/
    └── mainagent.py (Main AI Agent)
        ├── get_basic_farming_info()
        └── get_seasonal_advice()
```

## Current Features

- **Basic Farming Q&A**: Answers questions about irrigation, fertilizers, pest control, soil health, crop rotation, and composting
- **Seasonal Advice**: Provides season-specific farming guidance
- **Session Management**: Maintains conversation context across multiple interactions
- **CORS Support**: Ready for frontend integration

## Next Steps

The current implementation provides a solid foundation. Future enhancements will include:

1. **Specialist Agents**: Planner, Farm, and Market agents
2. **External Tools**: Google Earth Engine, Weather API, Web Search
3. **Widget System**: Structured data for frontend visualization
4. **Farm Data Management**: Persistent storage for farm profiles and data

## Testing

Test the agent with various farming questions:
- "What's the best way to water my tomatoes?"
- "How do I improve my soil health?"
- "What should I plant in spring?"
- "Tell me about pest control methods"

The agent provides practical, actionable farming advice suitable for farmers of all experience levels.