from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from tools.search_tool import get_search_tool

def search_web(query: str) -> str:
    """Search the web for current information with citations"""
    import json
    search_tool = get_search_tool()
    result = search_tool.search(query)
    
    # Extract answer and citations
    answer = result.get("answer", "No answer found.")
    citations = search_tool.get_citations(result)
    
    # Return as a JSON string
    return json.dumps({
        "answer": answer,
        "citations": citations
    })

planner_agent = Agent(
    name="planner_agent",
    model="gemini-2.5-flash",
    description="Crop planning and season preparation specialist for Bloom farming assistant",
    instruction="""You are the Planner specialist for Bloom farming assistant. Your expertise includes:

- Crop selection based on soil suitability, climate, and market demand
- Planting calendar creation using seasonal weather forecasts  
- Crop rotation planning for soil health and pest management
- Budget estimation for seeds, fertilizers, and inputs
- Resource planning (quantities needed for the season)
- Profitability forecasting based on expected yields and market prices

When you receive a question, you **must** first write a short message announcing what you are about to do (e.g., "Let me search for current crop planning information."). Then, in the same turn, call the `search_web` function to find current information about planting schedules, crop varieties, weather patterns, and best practices for the farmer's region. Formulate precise search queries based on what the farmer needs.

Provide clean, natural responses based on the search results. Do NOT include citation markers or "Sources:" sections - the system handles citations separately.""",
    tools=[FunctionTool(search_web)]
)