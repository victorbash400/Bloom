"""
Widget Tool for Bloom Agents
Allows agents to create interactive widgets that appear in the sidebar.
"""

import json
from typing import Dict, Any

def create_widget(widget_type: str, widget_data: str) -> str:
    """
    Create a widget to display data.
    
    Args:
        widget_type: Widget type like 'weather-today' or 'farm-map'
        widget_data: JSON string with the data
    
    Returns:
        Confirmation message
    """
    
    try:
        # Clean the widget_data string if needed
        cleaned_data = widget_data.strip()
        
        # Parse the JSON data
        parsed_data = json.loads(cleaned_data)
        
        # Return a special format that the backend can detect
        widget_response = {
            "widget_type": widget_type,
            "widget_data": parsed_data,
            "message": f"Widget created successfully: {widget_type} widget is now displayed in the sidebar."
        }
        
        return json.dumps(widget_response)
    
    except json.JSONDecodeError as e:
        # Return error information for debugging
        return json.dumps({
            "widget_type": widget_type,
            "error": f"Failed to parse widget data: {str(e)}",
            "message": f"Widget creation failed due to invalid JSON data."
        })

# Export for agent use
__all__ = ['create_widget']