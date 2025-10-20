#!/usr/bin/env python3
"""
Test script for the Perplexity search tool
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tools.search_tool import get_search_tool

def test_search():
    """Test the search functionality"""
    print("Testing Perplexity Search Tool...")
    
    # Test query
    query = "current corn prices in the United States 2024"
    print(f"\nSearching for: {query}")
    
    try:
        search_tool = get_search_tool()
        result = search_tool.search(query)
        print("\n--- Raw Result ---")
        print(f"Answer: {result.get('answer', 'No answer')}")
        print(f"Citations: {result.get('citations', [])}")
        
        print("\n--- Formatted Result ---")
        formatted = search_tool.format_response_with_citations(result)
        print(formatted)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search()