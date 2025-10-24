"""
Widget Tool for Bloom Agents
Allows agents to create interactive widgets that appear in the sidebar.
"""

import json
from typing import Dict, Any

def create_widget(widget_type: str, widget_data: str) -> str:
    """
    Create a widget to display data in the sidebar.
    
    Args:
        widget_type: Type of widget (weather-today, ndvi-chart, price-chart, etc.)
        widget_data: JSON string containing the widget data
    
    Returns:
        Special formatted response that the backend will detect and convert to a widget
    """
    
    # Return a special format that the backend can detect
    widget_response = {
        "widget_type": widget_type,
        "widget_data": widget_data,
        "message": f"Widget created successfully: {widget_type} widget is now displayed in the sidebar."
    }
    
    return json.dumps(widget_response)

# Export for agent use
__all__ = ['create_widget']