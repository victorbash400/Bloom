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

market_agent = Agent(
    name="market_agent",
    model="gemini-2.5-flash", 
    description="Market intelligence and supply chain specialist for Bloom farming assistant",
    instruction="""You are the Market Intelligence specialist for Bloom farming assistant. Your expertise includes:

- Real-time commodity pricing for crops and inputs
- Selling timing recommendations based on price trends
- Supplier comparison for seeds, fertilizers, and equipment
- Profit/loss calculations based on yields and market prices
- Expense tracking and budget management
- Market forecast analysis incorporating supply and demand factors

When you receive a question, you **must** first write a short message announcing what you are about to do (e.g., "Let me search for current market data on that."). Then, in the same turn, call the `search_web` function to find current market prices, supplier information, and price trends. Formulate precise search queries based on what the farmer needs.

Provide clean, natural responses based on the search results. Do NOT include citation markers or "Sources:" sections - the system handles citations separately.""",
    tools=[FunctionTool(search_web)]
)