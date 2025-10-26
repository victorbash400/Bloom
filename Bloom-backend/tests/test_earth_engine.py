"""
Simple test script to check if Google Earth Engine works with existing credentials.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_earth_engine_setup():
    """Test basic Earth Engine setup and authentication"""
    print("🌍 Testing Google Earth Engine Setup")
    print("=" * 50)
    
    # Check if service account file exists
    service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not service_account_path or not os.path.exists(service_account_path):
        print("❌ Service account file not found")
        print(f"   Looking for: {service_account_path}")
        return False
    
    print(f"✅ Service account file found: {service_account_path}")
    
    # Try to import and initialize Earth Engine
    try:
        import ee
        print("✅ Earth Engine package imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import Earth Engine: {e}")
        print("💡 Run: pip install earthengine-api")
        return False
    
    # Try to initialize Earth Engine
    try:
        # Initialize with service account
        credentials = ee.ServiceAccountCredentials(
            email=None,  # Will be read from the service account file
            key_file=service_account_path
        )
        ee.Initialize(credentials)
        print("✅ Earth Engine initialized with service account")
    except Exception as e:
        print(f"❌ Failed to initialize Earth Engine: {e}")
        print("💡 You might need to enable Earth Engine API in Google Cloud Console")
        return False
    
    return True

def test_basic_earth_engine_query():
    """Test a basic Earth Engine query"""
    print("\n🛰️ Testing Basic Earth Engine Query")
    print("-" * 40)
    
    try:
        import ee
        
        # Test with a simple image collection query
        # Get a recent Sentinel-2 image over Nairobi area
        nairobi_point = ee.Geometry.Point([36.8219, -1.2921])
        
        # Get Sentinel-2 collection
        collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                     .filterBounds(nairobi_point)
                     .filterDate('2024-01-01', '2024-12-31')
                     .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                     .sort('system:time_start', False))
        
        # Get the count of available images
        count = collection.size()
        count_value = count.getInfo()
        
        print(f"✅ Found {count_value} Sentinel-2 images over Nairobi area")
        
        if count_value > 0:
            # Get the most recent image
            recent_image = collection.first()
            image_info = recent_image.getInfo()
            
            # Extract some basic info
            image_id = image_info['id']
            properties = image_info.get('properties', {})
            date = properties.get('system:time_start')
            cloud_cover = properties.get('CLOUDY_PIXEL_PERCENTAGE', 'Unknown')
            
            print(f"✅ Most recent image details:")
            print(f"   Image ID: {image_id}")
            print(f"   Cloud cover: {cloud_cover}%")
            
            if date:
                from datetime import datetime
                date_readable = datetime.fromtimestamp(date / 1000).strftime('%Y-%m-%d')
                print(f"   Date: {date_readable}")
        
        return True
        
    except Exception as e:
        print(f"❌ Earth Engine query failed: {e}")
        return False

def test_ndvi_calculation():
    """Test NDVI calculation capability"""
    print("\n🌱 Testing NDVI Calculation")
    print("-" * 30)
    
    try:
        import ee
        
        # Define a small area around Nairobi for testing
        test_area = ee.Geometry.Rectangle([36.7, -1.4, 36.9, -1.2])
        
        # Get a recent Sentinel-2 image
        image = (ee.ImageCollection('COPERNICUS/S2_SR')
                .filterBounds(test_area)
                .filterDate('2024-01-01', '2024-12-31')
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                .first())
        
        if image is None:
            print("❌ No suitable image found for NDVI calculation")
            return False
        
        # Calculate NDVI
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        
        # Get NDVI statistics for the test area
        ndvi_stats = ndvi.reduceRegion(
            reducer=ee.Reducer.mean().combine(
                reducer2=ee.Reducer.minMax(),
                sharedInputs=True
            ),
            geometry=test_area,
            scale=10,
            maxPixels=1e9
        )
        
        stats = ndvi_stats.getInfo()
        
        if stats and 'NDVI_mean' in stats:
            mean_ndvi = stats['NDVI_mean']
            min_ndvi = stats.get('NDVI_min', 'N/A')
            max_ndvi = stats.get('NDVI_max', 'N/A')
            
            print(f"✅ NDVI calculation successful!")
            print(f"   Mean NDVI: {mean_ndvi:.3f}")
            print(f"   NDVI range: {min_ndvi:.3f} to {max_ndvi:.3f}")
            
            # Interpret NDVI values
            if mean_ndvi > 0.6:
                health = "Healthy vegetation"
            elif mean_ndvi > 0.3:
                health = "Moderate vegetation"
            else:
                health = "Sparse vegetation"
            
            print(f"   Vegetation health: {health}")
            return True
        else:
            print("❌ NDVI calculation returned no data")
            return False
            
    except Exception as e:
        print(f"❌ NDVI calculation failed: {e}")
        return False

def main():
    """Run all Earth Engine tests"""
    print("🧪 Google Earth Engine Test Suite")
    print("=" * 60)
    
    # Test 1: Basic setup
    if not test_earth_engine_setup():
        print("\n❌ Earth Engine setup failed. Cannot proceed with other tests.")
        print("\n💡 Next steps:")
        print("1. Install: pip install earthengine-api")
        print("2. Enable Earth Engine API in Google Cloud Console")
        print("3. Ensure your service account has Earth Engine permissions")
        return
    
    # Test 2: Basic query
    if not test_basic_earth_engine_query():
        print("\n⚠️ Basic queries failed, but authentication worked")
        return
    
    # Test 3: NDVI calculation
    if not test_ndvi_calculation():
        print("\n⚠️ NDVI calculation failed, but basic queries worked")
        return
    
    print("\n" + "=" * 60)
    print("🎉 All Earth Engine tests passed!")
    print("\n✅ Earth Engine is ready for:")
    print("   - Satellite imagery retrieval")
    print("   - NDVI crop health analysis") 
    print("   - Soil data analysis")
    print("   - Time series analysis")
    print("\n💡 Ready to create the full Earth Engine tool!")

if __name__ == "__main__":
    main()