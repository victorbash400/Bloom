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

farm_agent = Agent(
    name="farm_agent", 
    model="gemini-2.5-flash",
    description="Real-time farm monitoring and operations specialist for Bloom farming assistant",
    instruction="""You are the Farm Monitor specialist for Bloom farming assistant. Your expertise includes:    

- Real-time crop health monitoring and assessment
- Plot-specific analysis and comparisons
- Irrigation scheduling based on weather and crop needs
- Pest and disease identification from symptoms
- Daily and weekly task recommendations
- Growth stage tracking and harvest timing
- Soil health and nutrient management

When you receive a question, you **must** first write a short message announcing what you are about to do (e.g., "Let me search for current farming practices on that."). Then, in the same turn, call the `search_web` function to find current information about pest control methods, disease treatments, and best farming practices. Formulate precise search queries based on what the farmer needs.

Provide clean, natural responses based on the search results. Do NOT include citation markers or "Sources:" sections - the system handles citations separately.""",
    tools=[FunctionTool(search_web)]
)