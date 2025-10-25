"""
Market Tool for Bloom Agents
Provides price tracking, expense analysis, inventory status, and sell timing.
"""

import json
import os
from typing import Dict, List, Any, Optional
from collections import defaultdict
from datetime import datetime

# Path to the JSON data file
JSON_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'generated_data', 'merged_farm_data.json')

def _load_farm_data() -> List[Dict]:
    """Load farm data from JSON file"""
    try:
        with open(JSON_DATA_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading farm data: {e}")
        return []

def get_price_chart(crop: Optional[str] = None) -> str:
    """
    Get historical price trends for crops.
    
    Args:
        crop: Optional crop type to filter by
    
    Returns:
        JSON string with price history data
    """
    data = _load_farm_data()
    
    # Gather price data
    price_data = defaultdict(list)
    
    for record in data:
        record_crop = record.get('current_crop') or record.get('crop')
        price = record.get('selling_price_kes_per_kg') or record.get('selling_price_kes_per_kg_profit')
        plot_id = record.get('plot_id', '')
        
        if record_crop and price and plot_id:
            parts = plot_id.split('_')
            if len(parts) >= 4:
                year = parts[2]
                season = parts[3]
                
                # Filter by crop if specified
                if crop and record_crop.lower() != crop.lower():
                    continue
                
                price_data[record_crop].append({
                    'year': year,
                    'season': season,
                    'period': f"{year} {season}",
                    'price_per_kg': price
                })
    
    # Sort by period
    for crop_name in price_data:
        price_data[crop_name].sort(key=lambda x: (x['year'], x['season']))
    
    # Calculate trends
    trends = {}
    for crop_name, prices in price_data.items():
        if len(prices) >= 2:
            first_price = prices[0]['price_per_kg']
            last_price = prices[-1]['price_per_kg']
            change = ((last_price - first_price) / first_price * 100) if first_price > 0 else 0
            trend = 'Increasing' if change > 5 else 'Decreasing' if change < -5 else 'Stable'
        else:
            change = 0
            trend = 'Insufficient data'
        
        trends[crop_name] = {
            'trend': trend,
            'change_percent': round(change, 1),
            'current_price': prices[-1]['price_per_kg'] if prices else 0,
            'avg_price': round(sum(p['price_per_kg'] for p in prices) / len(prices), 2) if prices else 0
        }
    
    result = {
        "analysis_type": "price_chart",
        "crop_filter": crop,
        "price_data": dict(price_data),
        "trends": trends,
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

def get_expense_tracker() -> str:
    """
    Get expense breakdown by category over time.
    
    Returns:
        JSON string with expense tracking data
    """
    data = _load_farm_data()
    
    # Aggregate expenses by category
    total_expenses = {
        'fertilizer': 0,
        'seeds': 0,
        'labor': 0,
        'pesticide': 0,
        'fuel': 0,
        'maintenance': 0,
        'transport': 0
    }
    
    # Also track by period
    period_expenses = defaultdict(lambda: defaultdict(float))
    
    for record in data:
        plot_id = record.get('plot_id', '')
        
        # Aggregate totals
        total_expenses['fertilizer'] += record.get('fertilizer_cost_kes', 0)
        total_expenses['seeds'] += record.get('seeds_cost_kes', 0)
        total_expenses['labor'] += record.get('labor_cost_kes', 0)
        total_expenses['pesticide'] += record.get('pesticide_cost_kes', 0)
        total_expenses['fuel'] += record.get('fuel_cost_kes', 0)
        total_expenses['maintenance'] += record.get('maintenance_cost_kes', 0)
        total_expenses['transport'] += record.get('transport_cost_kes', 0)
        
        # Track by period
        if plot_id:
            parts = plot_id.split('_')
            if len(parts) >= 4:
                period = f"{parts[2]} {parts[3]}"
                period_expenses[period]['fertilizer'] += record.get('fertilizer_cost_kes', 0)
                period_expenses[period]['seeds'] += record.get('seeds_cost_kes', 0)
                period_expenses[period]['labor'] += record.get('labor_cost_kes', 0)
                period_expenses[period]['pesticide'] += record.get('pesticide_cost_kes', 0)
                period_expenses[period]['fuel'] += record.get('fuel_cost_kes', 0)
    
    # Calculate percentages
    total = sum(total_expenses.values())
    expense_breakdown = []
    for category, amount in total_expenses.items():
        if amount > 0:
            expense_breakdown.append({
                'category': category.capitalize(),
                'amount': amount,
                'percentage': round((amount / total * 100), 1) if total > 0 else 0
            })
    
    # Sort by amount
    expense_breakdown.sort(key=lambda x: x['amount'], reverse=True)
    
    result = {
        "analysis_type": "expense_tracker",
        "total_expenses": total,
        "expense_breakdown": expense_breakdown,
        "period_expenses": dict(period_expenses),
        "top_expense": expense_breakdown[0]['category'] if expense_breakdown else None,
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

def get_inventory_status() -> str:
    """
    Get current inventory status for all crops.
    
    Returns:
        JSON string with inventory data
    """
    data = _load_farm_data()
    
    # Aggregate inventory
    inventory = defaultdict(lambda: {'stock_kg': 0, 'value_kes': 0})
    
    for record in data:
        crop = record.get('crop_type_inv')
        stock = record.get('current_stock_kg_inv')
        value = record.get('estimated_value_kes')
        
        if crop and stock:
            inventory[crop]['stock_kg'] += stock
            if value:
                inventory[crop]['value_kes'] += value
    
    # Format inventory list
    inventory_list = []
    total_value = 0
    
    for crop, inv in inventory.items():
        inventory_list.append({
            'crop': crop,
            'stock_kg': inv['stock_kg'],
            'value_kes': inv['value_kes'],
            'value_per_kg': round(inv['value_kes'] / inv['stock_kg'], 2) if inv['stock_kg'] > 0 else 0
        })
        total_value += inv['value_kes']
    
    # Sort by value
    inventory_list.sort(key=lambda x: x['value_kes'], reverse=True)
    
    result = {
        "analysis_type": "inventory_status",
        "total_inventory_value": total_value,
        "inventory_items": inventory_list,
        "crops_in_stock": len(inventory_list),
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

def get_sell_timing_recommendation(crop: str) -> str:
    """
    Get sell timing recommendation based on price patterns.
    
    Args:
        crop: Crop type to analyze
    
    Returns:
        JSON string with sell timing recommendation
    """
    data = _load_farm_data()
    
    # Gather price data for this crop
    price_history = []
    
    for record in data:
        record_crop = record.get('current_crop') or record.get('crop')
        price = record.get('selling_price_kes_per_kg') or record.get('selling_price_kes_per_kg_profit')
        plot_id = record.get('plot_id', '')
        
        if record_crop and record_crop.lower() == crop.lower() and price and plot_id:
            parts = plot_id.split('_')
            if len(parts) >= 4:
                year = parts[2]
                season = parts[3]
                price_history.append({
                    'year': year,
                    'season': season,
                    'period': f"{year} {season}",
                    'price': price
                })
    
    if not price_history:
        return json.dumps({"error": f"No price history found for {crop}"})
    
    # Sort by period
    price_history.sort(key=lambda x: (x['year'], x['season']))
    
    # Analyze seasonal patterns
    season_prices = defaultdict(list)
    for entry in price_history:
        season_prices[entry['season']].append(entry['price'])
    
    # Calculate average by season
    season_averages = {}
    for season, prices in season_prices.items():
        season_averages[season] = sum(prices) / len(prices)
    
    # Find best season
    best_season = max(season_averages, key=season_averages.get) if season_averages else None
    best_price = season_averages.get(best_season, 0) if best_season else 0
    
    # Current price
    current_price = price_history[-1]['price']
    
    # Recommendation
    if current_price >= best_price * 0.95:
        recommendation = "Excellent time to sell - prices are near peak"
        timing = "Sell Now"
    elif current_price >= best_price * 0.85:
        recommendation = "Good time to sell - prices are favorable"
        timing = "Sell Soon"
    else:
        recommendation = f"Consider waiting - prices typically peak in {best_season}"
        timing = "Wait"
    
    result = {
        "analysis_type": "sell_timing_recommendation",
        "crop": crop,
        "current_price": current_price,
        "best_season": best_season,
        "best_season_avg_price": round(best_price, 2),
        "recommendation": recommendation,
        "timing": timing,
        "price_history": price_history,
        "season_averages": {k: round(v, 2) for k, v in season_averages.items()},
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

# Export functions
__all__ = [
    'get_price_chart',
    'get_expense_tracker',
    'get_inventory_status',
    'get_sell_timing_recommendation'
]
