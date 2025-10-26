"""
Robust JSON parsing utilities for Bloom Backend
Handles malformed JSON, nested structures, and edge cases
"""

import json
import re
import logging
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)


def clean_json_string(json_str: str) -> str:
    """
    Clean a JSON string by removing common issues that cause parsing errors.
    
    Args:
        json_str: Raw JSON string that might have formatting issues
        
    Returns:
        Cleaned JSON string
    """
    if not json_str:
        return "{}"
    
    # Handle case where json_str is already a dict (shouldn't happen, but be safe)
    if isinstance(json_str, dict):
        return json.dumps(json_str)
    
    # Convert to string if not already
    if not isinstance(json_str, str):
        json_str = str(json_str)
    
    # Strip whitespace
    cleaned = json_str.strip()
    
    # Remove any leading/trailing quotes if the entire string is wrapped
    if cleaned.startswith('"') and cleaned.endswith('"'):
        cleaned = cleaned[1:-1]
    
    # Fix escaped newlines that might break parsing
    cleaned = cleaned.replace('\\n', '\n')
    
    # Fix double-escaped quotes
    cleaned = cleaned.replace('\\"', '"')
    
    return cleaned


def extract_json_from_text(text: str) -> Optional[str]:
    """
    Extract JSON object or array from text that might contain other content.
    
    Args:
        text: Text that might contain JSON
        
    Returns:
        Extracted JSON string or None
    """
    # Handle non-string input
    if not isinstance(text, str):
        return None
    
    # Try to find JSON object
    obj_match = re.search(r'\{.*\}', text, re.DOTALL)
    if obj_match:
        return obj_match.group(0)
    
    # Try to find JSON array
    arr_match = re.search(r'\[.*\]', text, re.DOTALL)
    if arr_match:
        return arr_match.group(0)
    
    return None


def count_braces(json_str: str) -> Tuple[int, int, int, int]:
    """
    Count opening and closing braces/brackets in a JSON string.
    
    Args:
        json_str: JSON string to analyze
        
    Returns:
        Tuple of (open_braces, close_braces, open_brackets, close_brackets)
    """
    # Handle non-string input
    if not isinstance(json_str, str):
        json_str = str(json_str)
    
    open_braces = json_str.count('{')
    close_braces = json_str.count('}')
    open_brackets = json_str.count('[')
    close_brackets = json_str.count(']')
    
    return open_braces, close_braces, open_brackets, close_brackets


def validate_json_structure(json_str: str) -> Tuple[bool, str]:
    """
    Validate JSON structure by checking brace/bracket balance.
    
    Args:
        json_str: JSON string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    open_braces, close_braces, open_brackets, close_brackets = count_braces(json_str)
    
    if open_braces != close_braces:
        return False, f"Mismatched braces: {open_braces} open, {close_braces} close"
    
    if open_brackets != close_brackets:
        return False, f"Mismatched brackets: {open_brackets} open, {close_brackets} close"
    
    return True, ""


def safe_json_loads(json_str: str, default: Any = None) -> Tuple[Optional[Any], Optional[str]]:
    """
    Safely parse JSON with multiple fallback strategies.
    
    Args:
        json_str: JSON string to parse
        default: Default value to return if parsing fails
        
    Returns:
        Tuple of (parsed_data, error_message)
    """
    if not json_str:
        return default or {}, None
    
    # Handle case where input is already parsed (dict/list)
    if isinstance(json_str, (dict, list)):
        return json_str, None
    
    # Convert to string if needed
    if not isinstance(json_str, str):
        try:
            json_str = str(json_str)
        except Exception as e:
            return default, f"Cannot convert to string: {e}"
    
    # Strategy 1: Try direct parsing
    try:
        return json.loads(json_str), None
    except json.JSONDecodeError as e:
        logger.debug(f"Direct JSON parsing failed: {e}")
    except TypeError as e:
        logger.debug(f"Type error in JSON parsing: {e}")
        return default, f"Type error: {e}"
    
    # Strategy 2: Clean and try again
    try:
        cleaned = clean_json_string(json_str)
        return json.loads(cleaned), None
    except json.JSONDecodeError as e:
        logger.debug(f"Cleaned JSON parsing failed: {e}")
    
    # Strategy 3: Extract JSON from text and try
    try:
        extracted = extract_json_from_text(json_str)
        if extracted:
            return json.loads(extracted), None
    except json.JSONDecodeError as e:
        logger.debug(f"Extracted JSON parsing failed: {e}")
    
    # Strategy 4: Validate structure and provide helpful error
    is_valid, error_msg = validate_json_structure(json_str)
    if not is_valid:
        return default, f"Invalid JSON structure: {error_msg}"
    
    # All strategies failed
    return default, f"Failed to parse JSON after all strategies"


def parse_function_response(response_data: Dict[str, Any], function_name: str) -> Tuple[Optional[Dict], Optional[str]]:
    """
    Parse a function response with robust error handling.
    
    Args:
        response_data: Raw response data from function
        function_name: Name of the function for logging
        
    Returns:
        Tuple of (parsed_data, error_message)
    """
    try:
        # Get the result field
        result = response_data.get('result', '{}')
        
        # Handle case where result is already a dict
        if isinstance(result, dict):
            return result, None
        
        # Handle case where result is a string
        if isinstance(result, str):
            parsed, error = safe_json_loads(result)
            if error:
                logger.warning(f"Failed to parse {function_name} response: {error}")
                logger.debug(f"Raw response: {result[:200]}...")
            return parsed, error
        
        # Unexpected type
        return None, f"Unexpected result type: {type(result)}"
        
    except Exception as e:
        logger.error(f"Error parsing {function_name} response: {e}")
        return None, str(e)


def extract_widget_data(function_response: Any) -> Optional[Dict[str, Any]]:
    """
    Extract widget data from a create_widget function response.
    
    Args:
        function_response: Function response object
        
    Returns:
        Widget data dict or None
    """
    try:
        if not hasattr(function_response, 'response'):
            return None
        
        parsed_data, error = parse_function_response(
            function_response.response,
            'create_widget'
        )
        
        if error:
            logger.warning(f"Widget parsing error: {error}")
            return None
        
        if not isinstance(parsed_data, dict):
            logger.warning(f"Widget data is not a dict: {type(parsed_data)}")
            return None
        
        # Validate required fields
        if 'widget_type' not in parsed_data:
            logger.warning("Widget data missing 'widget_type' field")
            return None
        
        if 'widget_data' not in parsed_data:
            logger.warning("Widget data missing 'widget_data' field")
            return None
        
        return parsed_data
        
    except Exception as e:
        logger.error(f"Error extracting widget data: {e}")
        return None


def extract_citations(function_response: Any) -> list:
    """
    Extract citations from a search_web function response.
    
    Args:
        function_response: Function response object
        
    Returns:
        List of citations
    """
    try:
        if not hasattr(function_response, 'response'):
            return []
        
        parsed_data, error = parse_function_response(
            function_response.response,
            'search_web'
        )
        
        if error:
            logger.warning(f"Citations parsing error: {error}")
            return []
        
        if not isinstance(parsed_data, dict):
            return []
        
        citations = parsed_data.get('citations', [])
        
        if not isinstance(citations, list):
            logger.warning(f"Citations is not a list: {type(citations)}")
            return []
        
        return citations
        
    except Exception as e:
        logger.error(f"Error extracting citations: {e}")
        return []
