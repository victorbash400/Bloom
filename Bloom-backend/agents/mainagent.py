from google.adk.agents import Agent

def get_farming_info(topic: str) -> str:
    """
    Provides basic farming information.
    
    Args:
        topic (str): The farming topic to get information about
    
    Returns:
        str: Farming information and advice
    """
    farming_knowledge = {
        "irrigation": "Proper irrigation is crucial for crop health. Water early morning or late evening to reduce evaporation. Check soil moisture before watering - stick your finger 2 inches into soil. If dry, water deeply but less frequently to encourage deep root growth.",
        "fertilizer": "Use balanced NPK fertilizers (Nitrogen-Phosphorus-Potassium) for most crops. Organic options include compost, manure, and bone meal. Apply fertilizer during growing season, typically every 4-6 weeks. Always follow package instructions and avoid over-fertilizing.",
        "pest control": "Integrated Pest Management (IPM) is best. Start with prevention: crop rotation, companion planting, and healthy soil. Use beneficial insects like ladybugs. For treatment, try neem oil, insecticidal soap, or diatomaceous earth before chemical pesticides.",
        "soil health": "Healthy soil is the foundation of good farming. Test soil pH (most crops prefer 6.0-7.0). Add organic matter like compost annually. Practice crop rotation to prevent nutrient depletion. Avoid compaction by not walking on wet soil.",
        "crop rotation": "Rotate crops to prevent soil depletion and pest buildup. Follow heavy feeders (tomatoes, corn) with light feeders (herbs, lettuce), then soil builders (legumes like beans, peas). A 3-4 year rotation cycle is ideal.",
        "composting": "Compost improves soil structure and provides nutrients. Mix 'greens' (nitrogen-rich: kitchen scraps, grass clippings) with 'browns' (carbon-rich: dry leaves, paper). Keep moist and turn regularly. Ready in 3-6 months."
    }
    
    topic_lower = topic.lower()
    
    for key, value in farming_knowledge.items():
        if key in topic_lower or topic_lower in key:
            return value
    
    return f"I'd be happy to help with {topic}! For specific farming advice, I can provide information on irrigation, fertilizers, pest control, soil health, crop rotation, and composting."

def get_seasonal_advice(season: str) -> str:
    """
    Provides seasonal farming advice.
    
    Args:
        season (str): The season to get advice for
    
    Returns:
        str: Seasonal farming advice
    """
    seasonal_advice = {
        "spring": "Spring is planting season! Start seeds indoors 6-8 weeks before last frost. Prepare garden beds by adding compost. Plant cool-season crops like lettuce, peas, and radishes first. Wait until after last frost for warm-season crops like tomatoes and peppers.",
        "summer": "Summer focus on maintenance and harvesting. Water deeply and regularly, preferably early morning. Mulch around plants to retain moisture. Harvest regularly to encourage continued production. Watch for pests and diseases in hot, humid weather.",
        "fall": "Fall is harvest and preparation time. Harvest summer crops before first frost. Plant cool-season crops for fall harvest. Start composting fallen leaves. Begin planning next year's garden and ordering seeds.",
        "winter": "Winter is planning and preparation season. Review this year's garden notes. Order seeds and plan next year's layout. Maintain tools and equipment. In mild climates, grow cold-hardy crops like kale and Brussels sprouts."
    }
    
    season_lower = season.lower()
    return seasonal_advice.get(
        season_lower,
        "I can provide seasonal advice for spring, summer, fall, and winter farming activities."
    )

root_agent = Agent(
    name="bloom_farming_agent",
    model="gemini-2.5-flash",
    description="AI farming assistant for Bloom - provides comprehensive farming guidance",
    instruction="You are a helpful farming assistant. Answer questions about crops, soil, irrigation, pest control, and general farming practices. Be practical and encouraging. Use the available tools when you need specific farming information. Pay attention to the conversation history and answer the user's questions based on the context provided.",
    tools=[get_farming_info, get_seasonal_advice]
)