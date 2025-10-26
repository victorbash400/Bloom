"""
Test the growth tracker tool function
"""

import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from tools.vector_search_tool import get_growth_tracker_data

def test_growth_tracker_tool():
    print("\n" + "="*80)
    print("TESTING GROWTH TRACKER TOOL")
    print("="*80)
    
    # Test 1: Get all plots
    print("\n1. Testing growth tracker for all plots...")
    result = get_growth_tracker_data()
    data = json.loads(result)
    
    print(f"✓ Analysis type: {data.get('analysis_type')}")
    print(f"✓ Plots analyzed: {data.get('plots_analyzed')}")
    
    if 'plot_data' in data:
        for plot_name, plot_info in data['plot_data'].items():
            print(f"\n  Plot: {plot_name}")
            print(f"    - Seasons: {plot_info['total_seasons']}")
            print(f"    - Crops: {plot_info['crops_grown']}")
            print(f"    - Avg yield: {plot_info['avg_yield']} t/ha")
            print(f"    - Trend: {plot_info['yield_trend']} ({plot_info['yield_change_percent']}%)")
            print(f"    - Time series records: {len(plot_info['time_series'])}")
    
    # Test 2: Filter by plot
    print("\n2. Testing growth tracker for North Field...")
    result = get_growth_tracker_data(plot_name="North Field")
    data = json.loads(result)
    
    print(f"✓ Plots analyzed: {data.get('plots_analyzed')}")
    if 'plot_data' in data and 'North Field' in data['plot_data']:
        nf = data['plot_data']['North Field']
        print(f"✓ North Field seasons: {nf['total_seasons']}")
        print(f"✓ Yield trend: {nf['yield_trend']}")
        
        # Show first 3 time series entries
        print("\n  Recent seasons:")
        for record in nf['time_series'][-3:]:
            print(f"    - {record['period']}: {record['crop']} - {record['yield_tons_per_ha']} t/ha")
    
    # Test 3: Filter by crop
    print("\n3. Testing growth tracker for Maize...")
    result = get_growth_tracker_data(crop_type="Maize")
    data = json.loads(result)
    
    print(f"✓ Plots analyzed: {data.get('plots_analyzed')}")
    
    print("\n" + "="*80)
    print("✅ Growth tracker tool is working!")
    print("="*80 + "\n")

if __name__ == "__main__":
    try:
        test_growth_tracker_tool()
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
