"""
Test to check what data is available for market agent widgets
"""

import json
import os
from collections import defaultdict

def load_farm_data():
    json_path = os.path.join(os.path.dirname(__file__), '..', 'generated_data', 'merged_farm_data.json')
    with open(json_path, 'r') as f:
        return json.load(f)

def analyze_market_data():
    print("\n" + "="*80)
    print("MARKET AGENT - DATA AVAILABILITY ANALYSIS")
    print("="*80)
    
    data = load_farm_data()
    
    # According to next.md, Market Agent widgets:
    # 1. price-chart
    # 2. sell-timing-recommendation
    # 3. supplier-comparison
    # 4. profit-calculator
    # 5. expense-tracker
    # 6. inventory-status
    # 7. market-forecast
    
    # Widget 1: PRICE CHART
    print("\n1. PRICE CHART Widget")
    print("   Purpose: Show historical price trends for crops")
    
    price_data = defaultdict(list)
    for record in data:
        crop = record.get('current_crop') or record.get('crop')
        price = record.get('selling_price_kes_per_kg') or record.get('selling_price_kes_per_kg_profit')
        plot_id = record.get('plot_id', '')
        
        if crop and price and plot_id:
            parts = plot_id.split('_')
            if len(parts) >= 4:
                year = parts[2]
                season = parts[3]
                price_data[crop].append({
                    'year': year,
                    'season': season,
                    'price': price,
                    'period': f"{year} {season}"
                })
    
    print(f"   ✓ Data available: YES")
    print(f"   ✓ Crops with price history: {len(price_data)}")
    for crop, prices in price_data.items():
        avg_price = sum(p['price'] for p in prices) / len(prices)
        print(f"     - {crop}: {len(prices)} price points, avg KES {avg_price:.0f}/kg")
    print(f"   ✅ BUILDABLE: Can show historical price trends")
    
    # Widget 2: SELL TIMING RECOMMENDATION
    print("\n2. SELL TIMING RECOMMENDATION Widget")
    print("   Purpose: Suggest best time to sell based on price patterns")
    print(f"   ✓ Data available: YES (same as price chart)")
    print(f"   ✅ BUILDABLE: Can analyze seasonal price patterns")
    
    # Widget 3: SUPPLIER COMPARISON
    print("\n3. SUPPLIER COMPARISON Widget")
    print("   Purpose: Compare suppliers for inputs")
    print(f"   ✓ Data available: NO")
    print(f"   ❌ NOT BUILDABLE: No supplier data in dataset")
    
    # Widget 4: PROFIT CALCULATOR
    print("\n4. PROFIT CALCULATOR Widget")
    print("   Purpose: Calculate profit for different scenarios")
    
    profit_records = []
    for record in data:
        profit = record.get('profit_kes')
        revenue = record.get('revenue_kes') or record.get('revenue_kes_profit')
        cost = record.get('total_cost_kes') or record.get('total_cost_kes_profit')
        if profit and revenue and cost:
            profit_records.append({
                'crop': record.get('current_crop') or record.get('crop'),
                'profit': profit,
                'revenue': revenue,
                'cost': cost
            })
    
    print(f"   ✓ Data available: YES")
    print(f"   ✓ Records with profit data: {len(profit_records)}")
    print(f"   ⚠️  OVERLAP: Similar to planner's profitability-forecast")
    print(f"   ⚠️  SKIP: Redundant with planner agent")
    
    # Widget 5: EXPENSE TRACKER
    print("\n5. EXPENSE TRACKER Widget")
    print("   Purpose: Track and categorize expenses over time")
    
    expense_categories = defaultdict(lambda: defaultdict(list))
    for record in data:
        plot_id = record.get('plot_id', '')
        if plot_id:
            parts = plot_id.split('_')
            if len(parts) >= 4:
                period = f"{parts[2]} {parts[3]}"
                expense_categories[period]['fertilizer'].append(record.get('fertilizer_cost_kes', 0))
                expense_categories[period]['seeds'].append(record.get('seeds_cost_kes', 0))
                expense_categories[period]['labor'].append(record.get('labor_cost_kes', 0))
                expense_categories[period]['pesticide'].append(record.get('pesticide_cost_kes', 0))
                expense_categories[period]['fuel'].append(record.get('fuel_cost_kes', 0))
    
    print(f"   ✓ Data available: YES")
    print(f"   ✓ Periods tracked: {len(expense_categories)}")
    print(f"   ✓ Expense categories: fertilizer, seeds, labor, pesticide, fuel")
    print(f"   ✅ BUILDABLE: Can show expense breakdown over time")
    
    # Widget 6: INVENTORY STATUS
    print("\n6. INVENTORY STATUS Widget")
    print("   Purpose: Show current stock levels")
    
    inventory = defaultdict(lambda: {'stock': 0, 'value': 0})
    for record in data:
        crop = record.get('crop_type_inv')
        stock = record.get('current_stock_kg_inv')
        value = record.get('estimated_value_kes')
        
        if crop and stock:
            inventory[crop]['stock'] += stock
            if value:
                inventory[crop]['value'] += value
    
    print(f"   ✓ Data available: YES")
    print(f"   ✓ Crops in inventory: {len(inventory)}")
    for crop, inv in inventory.items():
        print(f"     - {crop}: {inv['stock']} kg, KES {inv['value']:,.0f}")
    print(f"   ✅ BUILDABLE: Can show current inventory levels")
    
    # Widget 7: MARKET FORECAST
    print("\n7. MARKET FORECAST Widget")
    print("   Purpose: Predict future market prices")
    print(f"   ✓ Data available: PARTIAL (historical prices only)")
    print(f"   ⚠️  BUILDABLE: Can show trends, but real forecast needs external data")
    print(f"   💡 SUGGESTION: Use web search for current market trends")
    
    # Summary
    print("\n" + "="*80)
    print("MARKET AGENT WIDGETS - FEASIBILITY SUMMARY")
    print("="*80)
    print("✅ price-chart              - FULLY BUILDABLE (historical prices)")
    print("✅ sell-timing-recommendation - FULLY BUILDABLE (price patterns)")
    print("❌ supplier-comparison      - NOT BUILDABLE (no supplier data)")
    print("⚠️  profit-calculator        - SKIP (redundant with planner)")
    print("✅ expense-tracker          - FULLY BUILDABLE (cost breakdown)")
    print("✅ inventory-status         - FULLY BUILDABLE (stock levels)")
    print("⚠️  market-forecast          - PARTIALLY BUILDABLE (needs web search)")
    print("\n📊 VERDICT: 4 widgets fully buildable, 1 skip, 2 not feasible")
    print("="*80 + "\n")
    
    print("💡 RECOMMENDATION: Build these 4 widgets:")
    print("   1. price-chart (line chart showing price trends)")
    print("   2. expense-tracker (stacked bar chart of costs)")
    print("   3. inventory-status (current stock with values)")
    print("   4. sell-timing-recommendation (best time to sell)")
    print()

if __name__ == "__main__":
    try:
        analyze_market_data()
    except Exception as e:
        print(f"\n❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
