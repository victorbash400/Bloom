"""
Planner Tool for Bloom Agents
Provides crop planning, budgeting, rotation, and profitability forecasting.
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

def get_crop_recommendation(plot_name: Optional[str] = None) -> str:
    """
    Get crop recommendations based on profitability, soil suitability, and rotation.
    
    Args:
        plot_name: Optional plot name to get specific recommendations
    
    Returns:
        JSON string with crop recommendations ranked by suitability
    """
    data = _load_farm_data()
    
    # Analyze crop profitability
    crop_analysis = defaultdict(lambda: {
        'profit_margins': [],
        'yields': [],
        'revenues': [],
        'success_count': 0
    })
    
    for record in data:
        crop = record.get('current_crop') or record.get('crop')
        margin = record.get('profit_margin_percent')
        yield_val = record.get('yield_tonnes_per_ha') or record.get('yield_tonnes_per_ha_profit')
        revenue = record.get('revenue_kes') or record.get('revenue_kes_profit')
        
        if crop and margin:
            crop_analysis[crop]['profit_margins'].append(margin)
            crop_analysis[crop]['success_count'] += 1
            if yield_val:
                crop_analysis[crop]['yields'].append(yield_val)
            if revenue:
                crop_analysis[crop]['revenues'].append(revenue)
    
    # Calculate averages and rank
    recommendations = []
    for crop, stats in crop_analysis.items():
        margins = stats['profit_margins']
        yields = stats['yields']
        revenues = stats['revenues']
        
        avg_margin = sum(margins) / len(margins) if margins else 0
        avg_yield = sum(yields) / len(yields) if yields else 0
        avg_revenue = sum(revenues) / len(revenues) if revenues else 0
        
        # Simple scoring: weighted by margin and success rate
        score = (avg_margin * 0.6) + (stats['success_count'] * 5)
        
        recommendations.append({
            'crop': crop,
            'score': round(score, 1),
            'avg_profit_margin': round(avg_margin, 1),
            'avg_yield_tons_per_ha': round(avg_yield, 2),
            'avg_revenue_kes': round(avg_revenue, 2),
            'success_rate': stats['success_count'],
            'recommendation': _get_recommendation_text(avg_margin)
        })
    
    # Sort by score
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    
    result = {
        "analysis_type": "crop_recommendation",
        "plot_name": plot_name,
        "recommendations": recommendations,
        "top_crop": recommendations[0]['crop'] if recommendations else None,
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

def _get_recommendation_text(margin: float) -> str:
    """Get recommendation text based on profit margin"""
    if margin > 70:
        return "Highly Profitable - Strongly Recommended"
    elif margin > 50:
        return "Very Profitable - Recommended"
    elif margin > 40:
        return "Profitable - Good Choice"
    else:
        return "Moderate Returns - Consider Alternatives"

def get_profitability_forecast(crop: str, area_hectares: float = 1.0) -> str:
    """
    Forecast profitability for a crop based on historical data.
    
    Args:
        crop: Crop type to forecast
        area_hectares: Area to plant in hectares
    
    Returns:
        JSON string with profitability forecast
    """
    data = _load_farm_data()
    
    # Gather historical data for this crop
    crop_data = []
    for record in data:
        record_crop = record.get('current_crop') or record.get('crop')
        if record_crop and record_crop.lower() == crop.lower():
            profit = record.get('profit_kes')
            revenue = record.get('revenue_kes') or record.get('revenue_kes_profit')
            cost = record.get('total_cost_kes') or record.get('total_cost_kes_profit')
            margin = record.get('profit_margin_percent')
            area = record.get('area_hectares') or record.get('area_hectares_fin')
            
            if profit and revenue and cost and area:
                crop_data.append({
                    'profit': profit,
                    'revenue': revenue,
                    'cost': cost,
                    'margin': margin,
                    'area': area,
                    'profit_per_ha': profit / area,
                    'revenue_per_ha': revenue / area,
                    'cost_per_ha': cost / area
                })
    
    if not crop_data:
        return json.dumps({"error": f"No historical data found for {crop}"})
    
    # Calculate averages
    avg_profit_per_ha = sum(d['profit_per_ha'] for d in crop_data) / len(crop_data)
    avg_revenue_per_ha = sum(d['revenue_per_ha'] for d in crop_data) / len(crop_data)
    avg_cost_per_ha = sum(d['cost_per_ha'] for d in crop_data) / len(crop_data)
    avg_margin = sum(d['margin'] for d in crop_data) / len(crop_data)
    
    # Forecast for specified area
    forecast_revenue = avg_revenue_per_ha * area_hectares
    forecast_cost = avg_cost_per_ha * area_hectares
    forecast_profit = avg_profit_per_ha * area_hectares
    
    result = {
        "analysis_type": "profitability_forecast",
        "crop": crop,
        "area_hectares": area_hectares,
        "forecast": {
            "expected_revenue_kes": round(forecast_revenue, 2),
            "expected_cost_kes": round(forecast_cost, 2),
            "expected_profit_kes": round(forecast_profit, 2),
            "expected_margin_percent": round(avg_margin, 1)
        },
        "historical_averages": {
            "profit_per_ha": round(avg_profit_per_ha, 2),
            "revenue_per_ha": round(avg_revenue_per_ha, 2),
            "cost_per_ha": round(avg_cost_per_ha, 2),
            "margin_percent": round(avg_margin, 1)
        },
        "data_points": len(crop_data),
        "confidence": "High" if len(crop_data) >= 5 else "Medium" if len(crop_data) >= 3 else "Low",
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

def get_rotation_plan(plot_name: Optional[str] = None) -> str:
    """
    Get crop rotation plan based on historical patterns.
    
    Args:
        plot_name: Optional plot name to get specific rotation plan
    
    Returns:
        JSON string with rotation recommendations
    """
    data = _load_farm_data()
    
    # Gather rotation history by plot
    plot_rotations = defaultdict(list)
    
    for record in data:
        plot_id = record.get('plot_id', '')
        if not plot_id:
            continue
        
        parts = plot_id.split('_')
        if len(parts) >= 4:
            plot = record.get('plot_name', 'Unknown')
            year = parts[2]
            season = parts[3]
            crop = record.get('current_crop') or record.get('crop')
            
            if crop:
                plot_rotations[plot].append({
                    'year': year,
                    'season': season,
                    'crop': crop,
                    'period': f"{year} {season}"
                })
    
    # Filter by plot if specified
    if plot_name:
        plot_rotations = {k: v for k, v in plot_rotations.items() if k.lower() == plot_name.lower()}
    
    # Sort rotations and suggest next crop
    rotation_plans = {}
    for plot, rotations in plot_rotations.items():
        rotations.sort(key=lambda x: (x['year'], x['season']))
        
        # Get crop sequence
        crop_sequence = [r['crop'] for r in rotations]
        last_crop = crop_sequence[-1] if crop_sequence else None
        
        # Simple rotation logic: avoid repeating same crop
        all_crops = ['Maize', 'Beans', 'Potatoes']
        suggested_next = [c for c in all_crops if c != last_crop][0] if last_crop else 'Maize'
        
        rotation_plans[plot] = {
            'historical_sequence': crop_sequence,
            'last_crop': last_crop,
            'suggested_next_crop': suggested_next,
            'rotation_pattern': ' → '.join(crop_sequence[-4:]) if len(crop_sequence) >= 4 else ' → '.join(crop_sequence),
            'total_seasons': len(rotations)
        }
    
    result = {
        "analysis_type": "rotation_plan",
        "plot_name": plot_name,
        "plots_analyzed": len(rotation_plans),
        "rotation_plans": rotation_plans,
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return json.dumps(result, indent=2)

# Export functions
__all__ = [
    'get_crop_recommendation',
    'get_profitability_forecast',
    'get_rotation_plan'
]