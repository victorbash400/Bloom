"""
CLI-based setup for GCP Vector Search using gcloud commands.
This is simpler and more reliable than the Python API approach.
"""

import json
import subprocess
import os
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration from environment variables
PROJECT_ID = os.getenv("GCP_PROJECT_ID")
REGION = os.getenv("GCP_REGION", "us-central1")
INDEX_DISPLAY_NAME = os.getenv("VECTOR_INDEX_NAME", "bloom-farm-data-index")
BUCKET_NAME = f"{PROJECT_ID}-bloom-vectors" if PROJECT_ID else None
SERVICE_ACCOUNT_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
GCLOUD_PATH = os.getenv("GCLOUD_PATH", r"C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.ps1")

# Validate required environment variables
if not PROJECT_ID:
    raise ValueError("GCP_PROJECT_ID environment variable is required")
if not SERVICE_ACCOUNT_PATH:
    raise ValueError("GOOGLE_APPLICATION_CREDENTIALS environment variable is required")

def run_gcloud_command(args):
    """Run a gcloud command using PowerShell"""
    # Properly quote arguments that contain spaces or special characters
    quoted_args = []
    for arg in args:
        if ' ' in arg or '"' in arg:
            quoted_args.append(f'"{arg}"')
        else:
            quoted_args.append(arg)
    
    cmd_str = f"& '{GCLOUD_PATH}' {' '.join(quoted_args)}"
    cmd = ["powershell", "-Command", cmd_str]
    return subprocess.run(cmd, capture_output=True, text=True)

def setup_gcp_auth():
    """Authenticate with GCP using service account"""
    print("🔐 Setting up GCP authentication...")
    
    try:
        # Activate service account
        result = run_gcloud_command([
            "auth", "activate-service-account",
            "--key-file", SERVICE_ACCOUNT_PATH
        ])
        if result.returncode != 0:
            print(f"❌ Auth activation failed: {result.stderr}")
            return False
        
        # Set project
        result = run_gcloud_command(["config", "set", "project", PROJECT_ID])
        if result.returncode != 0:
            print(f"❌ Project set failed: {result.stderr}")
            return False
        
        print(f"✅ Authenticated with project: {PROJECT_ID}")
        return True
        
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return False

def run_data_processing():
    """Get fresh farm data"""
    print("🔄 Getting fresh farm data...")
    try:
        result = subprocess.run(['python', 'setup/data_processing.py', '--json-only'], 
                              capture_output=True, text=True, check=True)
        
        # Debug: show what we actually got
        print(f"Script stdout length: {len(result.stdout)}")
        print(f"Script stderr: {result.stderr}")
        if len(result.stdout) < 200:
            print(f"Script stdout: {repr(result.stdout)}")
        else:
            print(f"Script stdout preview: {repr(result.stdout[:200])}")
        
        if not result.stdout.strip():
            print("❌ No output from data processing script")
            return None
            
        farm_data = json.loads(result.stdout)
        print(f"✅ Processed {len(farm_data)} farm records")
        return farm_data
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
        print(f"Output was: {repr(result.stdout[:500])}")
        return None
    except Exception as e:
        print(f"❌ Error getting farm data: {e}")
        return None

def create_text_representation(record):
    """Convert farm record to text for embedding"""
    
    # Get coordinates from either plot-level or farm-level data
    plot_coords = record.get('coordinates_geojson', '')
    farm_lat = record.get('farm_latitude', record.get('latitude', ''))
    farm_lon = record.get('farm_longitude', record.get('longitude', ''))
    
    text = f"""
    Farm: {record.get('farm_farm_name', 'Unknown Farm')}
    Farm Location: Latitude {farm_lat}, Longitude {farm_lon}
    County: {record.get('farm_county', 'Unknown')}
    Plot: {record.get('plot_name', 'Unknown')} ({record.get('plot_id', 'Unknown')})
    Plot Coordinates: {plot_coords}
    Area: {record.get('area_hectares', 0)} hectares
    Soil Type: {record.get('farm_soil_type_main', 'Unknown')}
    Current Crop: {record.get('current_crop', 'Unknown')}
    Planting Date: {record.get('planting_date', 'Unknown')}
    Expected Harvest: {record.get('expected_harvest', 'Unknown')}
    Crop Stage: {record.get('crop_stage', 'Unknown')}
    Average Yield per Hectare: {record.get('avg_yield_per_ha', 0)} tons
    Total Harvest: {record.get('total_harvest_kg', 0)} kg
    Total Revenue: {record.get('total_revenue_kes', 0)} KES
    Profit Margin: {record.get('profit_margin_percent', 0)}%
    Input Costs: Seeds {record.get('seeds_cost_kes', 0)} KES, Fertilizer {record.get('fertilizer_cost_kes', 0)} KES
    Current Inventory: {record.get('current_stock_kg', 0)} kg available
    Next Rotation Crop: {record.get('next_crop', 'Unknown')}
    Yield Performance: Min {record.get('min_yield_per_ha', 0)} - Max {record.get('max_yield_per_ha', 0)} tons/ha
    """.strip()
    return text

def generate_embeddings_batch(farm_data, batch_size=5):
    """Generate embeddings in batches to avoid rate limits"""
    print("🧠 Generating embeddings in batches...")
    
    # Set up authentication for Gemini
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_ACCOUNT_PATH
    client = genai.Client()
    
    all_embeddings = []
    
    # Process in batches
    for i in range(0, len(farm_data), batch_size):
        batch = farm_data[i:i+batch_size]
        print(f"  Processing batch {i//batch_size + 1}/{(len(farm_data) + batch_size - 1)//batch_size}")
        
        # Prepare texts for this batch
        texts = [create_text_representation(record) for record in batch]
        
        try:
            # Generate embeddings for the batch
            result = client.models.embed_content(
                model="gemini-embedding-001",
                contents=texts,
                config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
            )
            
            # Store embeddings with metadata
            for j, embedding in enumerate(result.embeddings):
                record = batch[j]
                data_point = {
                    "id": record.get('plot_id_y', f"record_{i+j}"),
                    "embedding": embedding.values,
                    "embedding_metadata": {
                        "plot_name": record.get('plot_name_x', 'Unknown'),
                        "crop": record.get('current_crop', 'Unknown'),
                        "stage": record.get('crop_stage', 'Unknown'),
                        "yield": record.get('avg_yield_per_ha', 0),
                        "revenue": record.get('total_revenue_kes', 0),
                        "area": record.get('area_hectares_x', 0),
                        "farm_name": record.get('farm_farm_name', 'Unknown'),
                        "latitude": record.get('farm_latitude', 0),
                        "longitude": record.get('farm_longitude', 0),
                        "county": record.get('farm_county', 'Unknown'),
                        "coordinates_geojson": record.get('coordinates_geojson', ''),
                        "text": create_text_representation(record)
                    }
                }
                all_embeddings.append(data_point)
            
            # Wait between batches to avoid rate limiting
            time.sleep(2)
            
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print(f"    Rate limited, waiting 30 seconds...")
                time.sleep(30)
                # Retry this batch
                i -= batch_size
                continue
            else:
                print(f"    Error processing batch: {e}")
                continue
    
    print(f"✅ Generated {len(all_embeddings)} embeddings")
    return all_embeddings

def create_gcs_bucket():
    """Create GCS bucket for storing embeddings"""
    print(f"🪣 Creating GCS bucket: {BUCKET_NAME}")
    
    try:
        result = run_gcloud_command([
            "storage", "buckets", "create", 
            f"gs://{BUCKET_NAME}",
            "--location", REGION
        ])
        
        if result.returncode == 0:
            print(f"✅ Created bucket: gs://{BUCKET_NAME}")
        else:
            if "already exists" in result.stderr or "you already own it" in result.stderr:
                print(f"✅ Bucket already exists: gs://{BUCKET_NAME}")
            else:
                print(f"❌ Error creating bucket: {result.stderr}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating bucket: {e}")
        return False

def prepare_embeddings_file(embeddings_data):
    """Create JSONL file for Vector Search import with versioning"""
    print("📄 Preparing embeddings file...")
    
    # Create JSONL format for Vector Search
    jsonl_lines = []
    for data_point in embeddings_data:
        # Vector Search format with metadata
        jsonl_record = {
            "id": data_point["id"],
            "embedding": data_point["embedding"],
            "embedding_metadata": data_point["embedding_metadata"]
        }
        jsonl_lines.append(json.dumps(jsonl_record))
    
    # Generate timestamp for versioning
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save embeddings file with version in embeddings folder
    embeddings_file = f"embeddings/farm_embeddings_v{timestamp}.json"
    with open(embeddings_file, 'w') as f:
        f.write('\n'.join(jsonl_lines))
    
    print(f"✅ Created {embeddings_file} ({len(jsonl_lines)} records)")
    print("📝 Note: All metadata (coordinates, etc.) is embedded in the vector data")
    
    return embeddings_file

def upload_to_gcs(embeddings_file):
    """Upload embeddings file to GCS"""
    print(f"☁️ Uploading {embeddings_file} to GCS...")
    
    try:
        result = run_gcloud_command([
            "storage", "cp", 
            embeddings_file,
            f"gs://{BUCKET_NAME}/"
        ])
        
        if result.returncode == 0:
            print(f"✅ Uploaded to gs://{BUCKET_NAME}/{embeddings_file}")
            return f"gs://{BUCKET_NAME}/{embeddings_file}"
        else:
            print(f"❌ Upload failed: {result.stderr}")
            return None
        
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return None

def print_manual_steps(gcs_uri, dimensions, embeddings_file):
    """Print manual steps for creating the Vector Search index"""
    print("🏗️ Ready for Vector Search index creation!")
    print("\n📋 Manual steps to complete setup:")
    print("1. Go to: https://console.cloud.google.com/vertex-ai/matching-engine/indexes")
    print("2. Click 'Create Index'")
    print("3. Use these settings:")
    print(f"   - Display Name: {INDEX_DISPLAY_NAME}-{embeddings_file.replace('.json', '').replace('farm_embeddings_', '')}")
    print(f"   - Description: Bloom farm data semantic search index ({embeddings_file})")
    print(f"   - Region: {REGION}")
    print(f"   - Dimensions: {dimensions}")
    print(f"   - Data file: {gcs_uri}")
    print(f"   - Approximate neighbors count: 10")
    print(f"   - Distance measure: DOT_PRODUCT_DISTANCE")
    print("4. Create Index Endpoint and deploy the index")
    print("5. Note the endpoint URL for the vector search tool")
    print(f"\n💡 Tip: Use index name with version for easy identification!")
    
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up GCP Vector Search for Bloom Farm Data (CLI)")
    print("=" * 65)
    
    # Step 1: Setup authentication
    if not setup_gcp_auth():
        return
    
    # Step 2: Get farm data
    farm_data = run_data_processing()
    if not farm_data:
        return
    
    # Step 3: Generate embeddings
    embeddings_data = generate_embeddings_batch(farm_data)
    if not embeddings_data:
        return
    
    # Step 4: Create GCS bucket
    if not create_gcs_bucket():
        return
    
    # Step 5: Prepare embeddings file
    embeddings_file = prepare_embeddings_file(embeddings_data)
    
    # Step 6: Upload to GCS
    gcs_uri = upload_to_gcs(embeddings_file)
    if not gcs_uri:
        return
    
    # Step 7: Print manual steps for index creation
    dimensions = len(embeddings_data[0]["embedding"])
    print_manual_steps(gcs_uri, dimensions, embeddings_file)
    
    print("\n" + "=" * 65)
    print("✅ Vector Search data preparation completed!")
    
    print(f"\n📊 Summary:")
    print(f"  - Records processed: {len(embeddings_data)}")
    print(f"  - Embedding dimensions: {dimensions}")
    print(f"  - GCS bucket: gs://{BUCKET_NAME}")
    print(f"  - Embeddings file: {gcs_uri}")
    print(f"  - All metadata included in embeddings")
    
    print(f"\n🎉 All data is ready for Vector Search!")
    print(f"   Complete the manual steps above to finish the setup.")

if __name__ == "__main__":
    main()