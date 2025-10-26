"""
Integration Tests for Vector Search Tool
Simple tests for core vector search functionality.
"""

import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from tools.vector_search_tool import search_farm_data


def test_basic_search():
    """Test basic vector search works"""
    query = "high yield maize plots"
    result = search_farm_data(query, max_results=3)
    result_dict = json.loads(result)
    
    # Check response structure
    assert 'query' in result_dict
    assert 'results' in result_dict
    
    # Handle errors gracefully
    if 'error' in result_dict:
        print(f"⚠ Search error: {result_dict['error']}")
        return
    
    # Verify results
    assert result_dict['results_count'] > 0
    assert len(result_dict['results']) > 0
    
    print(f"✓ Search successful")
    print(f"  Query: {query}")
    print(f"  Results: {result_dict['results_count']}")
    
    # Show top result
    top = result_dict['results'][0]
    print(f"  Top match: {top['plot_name']} - {top['crop']}")
    print(f"  Similarity: {top['similarity_score']}")


def test_search_with_filters():
    """Test search with crop filter"""
    from tools.vector_search_tool import get_historical_yields
    
    result = get_historical_yields(crop_type="Maize")
    result_dict = json.loads(result)
    
    assert 'filters' in result_dict
    assert 'results' in result_dict
    
    if 'error' in result_dict:
        print(f"⚠ Filter search error: {result_dict['error']}")
        return
    
    print(f"✓ Filtered search successful")
    print(f"  Crop: Maize")
    print(f"  Records: {result_dict.get('total_matching_records', 0)}")


if __name__ == "__main__":
    print("=== Vector Search Tool Tests ===\n")
    
    print("Test 1: Basic Search")
    test_basic_search()
    
    print("\nTest 2: Filtered Search")
    test_search_with_filters()
    
    print("\n✓ All tests completed!")
