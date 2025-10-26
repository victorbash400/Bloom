
import pandas as pd
import json
import os

# Define data directory
data_dir = r"C:\Users\Victo\Desktop\Bloom\Bloom-backend\data"

# Read all CSV files
csv_files = {
    'plot_base_info': 'plot_base_information.csv',
    'plot_details': 'plot_details_and_status.csv', 
    'crop_performance': 'crop_performance_summary.csv',
    'farm_identity': 'farm_identity.csv',
    'financial_history': 'financial_history.csv',
    'financial_summary': 'financial_summary_by_season.csv',
    'input_costs': 'input_costs_breakdown.csv',
    'profitability': 'profitability_summary.csv',
    'yields_inventory': 'yields_and_inventory.csv',
    'current_inventory': 'current_inventory.csv',
    'crop_rotation': 'crop_rotation_schedule.csv'
}

# Check if this is being called by vector search (no debug output)
import sys
vector_search_mode = len(sys.argv) > 1 and sys.argv[1] == '--json-only'

# Load all CSV files and inspect their structure
dataframes = {}
for key, filename in csv_files.items():
    filepath = os.path.join(data_dir, filename)
    if os.path.exists(filepath):
        dataframes[key] = pd.read_csv(filepath)
        if not vector_search_mode:
            print(f"Loaded {filename}: {len(dataframes[key])} rows, columns: {list(dataframes[key].columns)}")
    else:
        if not vector_search_mode:
            print(f"Warning: {filename} not found")

# Start with plot details as the base (has the most granular data)
if 'plot_details' not in dataframes:
    raise ValueError("plot_details_and_status.csv is required as the base dataset")

base_df = dataframes['plot_details'].copy()

# Extract base plot_id for merging
base_df['base_plot_id'] = base_df['plot_id'].apply(lambda x: '_'.join(x.split('_')[:2]))

# Merge with plot base information
if 'plot_base_info' in dataframes:
    plot_base_cols = dataframes['plot_base_info'].columns
    if 'plot_id' in plot_base_cols:
        base_df = pd.merge(base_df, dataframes['plot_base_info'], 
                          left_on='base_plot_id', right_on='plot_id', 
                          how='left', suffixes=('', '_base'))

# Merge with farm identity (for farm-level coordinates)
if 'farm_identity' in dataframes:
    # Add farm identity data to all records
    farm_info = dataframes['farm_identity'].iloc[0]  # Assuming single farm
    for col in dataframes['farm_identity'].columns:
        base_df[f'farm_{col}'] = farm_info[col]

# Merge with crop performance
if 'crop_performance' in dataframes:
    crop_perf_cols = dataframes['crop_performance'].columns
    if 'crop_type' in crop_perf_cols:
        base_df = pd.merge(base_df, dataframes['crop_performance'], 
                          left_on='current_crop', right_on='crop_type', 
                          how='left', suffixes=('', '_perf'))

# Merge with financial data by season
if 'financial_summary' in dataframes:
    fin_cols = dataframes['financial_summary'].columns
    if 'plot_id' in fin_cols:
        if not vector_search_mode:
            print(f"Base plot_ids sample: {base_df['plot_id'].head().tolist()}")
            print(f"Financial plot_ids: {dataframes['financial_summary']['plot_id'].tolist()}")
            
            # Check which base plot_ids are missing from financial
            missing_financial = set(base_df['plot_id']) - set(dataframes['financial_summary']['plot_id'])
            print(f"Plot_ids in base but NOT in financial: {missing_financial}")
        
        # Direct merge on plot_id
        before_merge = len(base_df)
        base_df = pd.merge(base_df, dataframes['financial_summary'], 
                          on='plot_id', how='left', suffixes=('', '_fin'))
        after_merge = len(base_df)
        if not vector_search_mode:
            print(f"Financial merge: {before_merge} -> {after_merge} records")

# Merge with financial history (aggregate by plot)
if 'financial_history' in dataframes:
    fin_hist_cols = dataframes['financial_history'].columns
    if 'related_plot_id' in fin_hist_cols:
        if not vector_search_mode:
            print(f"Financial history plot_ids: {dataframes['financial_history']['related_plot_id'].unique().tolist()}")
        
        # Aggregate financial history by plot
        fin_hist_agg = dataframes['financial_history'].groupby('related_plot_id').agg({
            'cost_kes': 'sum',
            'category': lambda x: ', '.join(x.unique())
        }).reset_index()
        fin_hist_agg.rename(columns={'related_plot_id': 'plot_id'}, inplace=True)
        
        if not vector_search_mode:
            missing_hist = set(base_df['plot_id']) - set(fin_hist_agg['plot_id'])
            print(f"Plot_ids in base but NOT in financial history: {len(missing_hist)} records")
        
        base_df = pd.merge(base_df, fin_hist_agg, on='plot_id', how='left', suffixes=('', '_hist'))

# Merge with yields and inventory
if 'yields_inventory' in dataframes:
    yields_cols = dataframes['yields_inventory'].columns
    if 'plot_id' in yields_cols:
        base_df = pd.merge(base_df, dataframes['yields_inventory'], 
                          on='plot_id', how='left', suffixes=('', '_yield'))

# Merge with profitability data
if 'profitability' in dataframes:
    profit_cols = dataframes['profitability'].columns
    if 'plot_id' in profit_cols:
        base_df = pd.merge(base_df, dataframes['profitability'], 
                          on='plot_id', how='left', suffixes=('', '_profit'))

# Merge with input costs (aggregate data - add to all records)
if 'input_costs' in dataframes:
    input_cols = dataframes['input_costs'].columns
    if 'category' in input_cols and 'total_cost_kes' in input_cols:
        # Convert input costs to a single record with all categories
        input_costs_pivot = dataframes['input_costs'].set_index('category')['total_cost_kes'].to_dict()
        for category, cost in input_costs_pivot.items():
            base_df[f'{category.lower()}_cost_kes'] = cost

# Merge with current inventory
if 'current_inventory' in dataframes:
    inv_cols = dataframes['current_inventory'].columns
    if 'crop_type' in inv_cols:
        base_df = pd.merge(base_df, dataframes['current_inventory'], 
                          left_on='current_crop', right_on='crop_type', 
                          how='left', suffixes=('', '_inv'))

# Merge with crop rotation schedule
if 'crop_rotation' in dataframes:
    rotation_cols = dataframes['crop_rotation'].columns
    if 'plot_id' in rotation_cols:
        # Create a mapping for next crop in rotation
        rotation_df = dataframes['crop_rotation'].copy()
        rotation_df['base_plot_id'] = rotation_df['plot_id']
        # Get the next crop for each plot (simplified - just get the next row)
        rotation_df = rotation_df.sort_values(['plot_id', 'year', 'season'])
        rotation_df['next_crop'] = rotation_df.groupby('plot_id')['crop'].shift(-1)
        rotation_next = rotation_df.groupby('base_plot_id')['next_crop'].last().reset_index()
        base_df = pd.merge(base_df, rotation_next, on='base_plot_id', how='left')

# Convert to a list of JSON objects
plot_documents = base_df.to_dict(orient="records")

if not vector_search_mode:
    print(f"Final merged dataset: {len(plot_documents)} records with {len(base_df.columns)} columns")

# Write to file in generated_data directory
output_dir = os.path.join(os.path.dirname(data_dir), 'generated_data')
os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, 'merged_farm_data.json')
with open(output_file, 'w') as f:
    json.dump(plot_documents, f, indent=2)

if not vector_search_mode:
    print(f"Merged data written to: {output_file}")
    print(f"Sample record keys: {list(plot_documents[0].keys()) if plot_documents else 'No records'}")

    # Count NaN values in the final dataset
    import numpy as np
    nan_counts = {}
    for record in plot_documents:
        for key, value in record.items():
            if pd.isna(value):
                nan_counts[key] = nan_counts.get(key, 0) + 1

    print(f"\nNaN value counts:")
    for key, count in sorted(nan_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {key}: {count} NaN values")

    print(f"\nTotal NaN values across all fields: {sum(nan_counts.values())}")

# For vector search, output only JSON
if vector_search_mode:
    print(json.dumps(plot_documents, indent=2))
