"""Mock tools for Bloom sub-agents to simulate functionality."""

def recall_memory(query: str) -> str:
    """
    Simulates retrieving information from internal memory based on a query.
    Use this tool to find information related to farming plans, market data, or farm conditions.
    """
    print(f"--- Mock Tool Called: recall_memory with query: {query} ---")
    if "water" in query.lower():
        return "From memory: Check the soil moisture. If the top 2 inches are dry, it's time to water the crops."
    if "plan" in query.lower():
        return "From memory: The current plan is to plant corn in Sector A and soybeans in Sector B."
    if "price" in query.lower():
        return "From memory: The last recorded price for corn was $5.50/bushel."
    
    return "From memory: No specific information found for that query. Please be more specific."
