# Bloom Backend Setup Guide

Complete guide for setting up the Bloom farming assistant backend.

## Prerequisites

- Python 3.11+
- Google Cloud Platform account
- OpenWeatherMap API key
- Perplexity API key (for web search)

## Quick Start

### 1. Clone and Setup Environment

```bash
cd Bloom-backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Google Cloud Platform
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GCP_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GCP_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# API Keys
PERPLEXITY_API_KEY=your-perplexity-api-key
OPEN_WEATHER_API=your-openweather-api-key

# Vector Search (if using)
VECTOR_SEARCH_API_ENDPOINT=your-endpoint
VECTOR_SEARCH_INDEX_ENDPOINT=your-index-endpoint
VECTOR_SEARCH_DEPLOYED_INDEX_ID=your-index-id
```

### 3. Get API Keys

#### Google Cloud Platform
1. Create project at https://console.cloud.google.com
2. Enable APIs:
   - Vertex AI API
   - Generative Language API
   - Vector Search API (optional)
3. Create service account and download JSON key
4. Place key in `Bloom-backend/` directory

#### Perplexity API
1. Sign up at https://www.perplexity.ai/
2. Get API key from dashboard
3. Add to `.env` file

#### OpenWeatherMap
1. Sign up at https://openweathermap.org/
2. Get free API key
3. Add to `.env` file

### 4. Run the Backend

```bash
python main.py
```

The server will start at `http://localhost:8000`

## Project Structure

```
Bloom-backend/
├── agents/              # AI agent definitions
│   ├── mainagent.py    # Main coordinator agent
│   ├── farm_agent.py   # Farm monitoring specialist
│   ├── market_agent.py # Market intelligence specialist
│   └── planner_agent.py # Crop planning specialist
├── tools/              # Agent tools
│   ├── search_tool.py  # Web search
│   ├── weather_tool.py # Weather data
│   ├── report_tool.py  # PDF report generation
│   ├── widget_tool.py  # UI widget creation
│   └── vector_search_tool.py # Semantic search
├── utils/              # Utility modules
│   └── json_parser.py  # Robust JSON parsing
├── setup/              # Setup scripts
│   ├── data_processing.py
│   └── setup_vector_search_cli.py
├── tests/              # Test files
├── guides/             # Documentation
├── main.py             # FastAPI application
└── requirements.txt    # Python dependencies
```

## Features

### 1. Multi-Agent System
- **Main Agent**: Coordinates between specialists
- **Farm Agent**: Real-time monitoring, weather, crop health
- **Market Agent**: Prices, trends, selling recommendations
- **Planner Agent**: Crop selection, rotation, profitability

### 2. Tools Available
- Web search with citations
- Weather forecasts and advice
- PDF report generation
- Interactive widgets
- Vector semantic search (optional)
- Satellite imagery analysis

### 3. API Endpoints

#### Chat Endpoint
```
POST /chat/stream
Content-Type: application/json

{
  "message": "What's the weather forecast?",
  "user_id": "farmer123",
  "session_id": "optional-session-id"
}
```

#### Health Check
```
GET /health
```

#### Report Download
```
GET /api/reports/{filename}
```

## Testing

Run tests:

```bash
# All tests
pytest

# Specific test file
pytest tests/test_json_parser.py -v

# With coverage
pytest --cov=. --cov-report=html
```

## Optional: Vector Search Setup

For semantic search over farm data:

1. Ensure GCP credentials are configured
2. Run the setup script:
   ```bash
   python setup/setup_vector_search_cli.py
   ```
3. Follow the manual steps printed by the script
4. Update `.env` with the endpoint details

See `guides/embedding-guide.md` for more details.

## Troubleshooting

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### GCP Authentication Issues
```bash
# Verify credentials
gcloud auth application-default login

# Check service account
gcloud auth list
```

### Port Already in Use
```bash
# Change port in .env
PORT=8001
```

### JSON Parsing Errors
The system has robust JSON parsing with multiple fallback strategies. Check logs for details.

## Security

⚠️ **Important**: Never commit sensitive files!

- `.env` files
- Service account JSON keys
- Generated embeddings
- API keys

See `SECURITY.md` for detailed security guidelines.

## Development

### Adding a New Tool

1. Create tool file in `tools/`:
```python
def my_new_tool(param: str) -> str:
    """Tool description"""
    # Implementation
    return result
```

2. Add to agent in `agents/`:
```python
from tools.my_tool import my_new_tool
from google.adk.tools import FunctionTool

agent = Agent(
    tools=[FunctionTool(my_new_tool)]
)
```

### Adding a New Agent

1. Create agent file in `agents/`
2. Define agent with tools and instructions
3. Add to main agent's transfer list

## Production Deployment

### Environment Variables
- Use proper secrets management (GCP Secret Manager, AWS Secrets Manager)
- Never use development credentials in production

### Scaling
- Use proper database instead of in-memory sessions
- Consider Redis for session management
- Use Cloud Run or similar for auto-scaling

### Monitoring
- Enable logging to Cloud Logging
- Set up error tracking (Sentry, etc.)
- Monitor API usage and costs

## Support

For issues or questions:
1. Check existing documentation in `guides/`
2. Review `SECURITY.md` for security concerns
3. Check test files for usage examples

## License

[Your License Here]
