"""
Google Earth Engine Tool for Bloom Agents
Provides satellite imagery, NDVI analysis, and soil data for agricultural insights.
"""

import os
import ee
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Earth Engine configuration
SERVICE_ACCOUNT_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if not SERVICE_ACCOUNT_PATH:
    raise ValueError("Missing required environment variable: GOOGLE_APPLICATION_CREDENTIALS")

class EarthEngineError(Exception):
    """Custom exception for Earth Engine errors"""
    pass

class EarthEngineTool:
    def __init__(self):
        self._initialize_earth_engine()
    
    def _initialize_earth_engine(self):
        """Initialize Earth Engine with service account"""
        try:
            credentials = ee.ServiceAccountCredentials(
                email=None,
                key_file=SERVICE_ACCOUNT_PATH
            )
            ee.Initialize(credentials)
        except Exception as e:
            raise EarthEngineError(f"Failed to initialize Earth Engine: {e}")
    
    def _create_geometry(self, coordinates: List[List[float]]) -> ee.Geometry:
        """Create Earth Engine geometry from coordinates"""
        if len(coordinates) == 1:
            # Single point
            return ee.Geometry.Point(coordinates[0])
        else:
            # Polygon
            return ee.Geometry.Polygon(coordinates)
    
    def _get_best_image(self, geometry: ee.Geometry, start_date: str, end_date: str, 
                       max_cloud_cover: int = 20) -> Optional[ee.Image]:
        """Get the best available satellite image for the area and time period"""
        try:
            # Use the newer Sentinel-2 Level-2A collection (not deprecated)
            collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                         .filterBounds(geometry)
                         .filterDate(start_date, end_date)
                         .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', max_cloud_cover))
                         .sort('CLOUDY_PIXEL_PERCENTAGE'))
            
            # Get the image with least cloud cover
            best_image = collection.first()
            
            # Check if we found any images
            image_count = collection.size().getInfo()
            if image_count == 0:
                return None
            
            return best_image
            
        except Exception as e:
            raise EarthEngineError(f"Failed to get satellite image: {e}")
    
    def _calculate_ndvi(self, image: ee.Image) -> ee.Image:
        """Calculate NDVI from Sentinel-2 image"""
        # NDVI = (NIR - Red) / (NIR + Red)
        # For Sentinel-2: NIR = B8, Red = B4
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        return ndvi
    
    def _get_ndvi_stats(self, ndvi_image: ee.Image, geometry: ee.Geometry) -> Dict[str, float]:
        """Get NDVI statistics for the given area"""
        try:
            stats = ndvi_image.reduceRegion(
                reducer=ee.Reducer.mean().combine(
                    reducer2=ee.Reducer.minMax().combine(
                        reducer2=ee.Reducer.stdDev(),
                        sharedInputs=True
                    ),
                    sharedInputs=True
                ),
                geometry=geometry,
                scale=10,  # 10m resolution
                maxPixels=1e9
            ).getInfo()
            
            return {
                'mean': stats.get('NDVI_mean', 0),
                'min': stats.get('NDVI_min', 0),
                'max': stats.get('NDVI_max', 0),
                'std_dev': stats.get('NDVI_stdDev', 0)
            }
        except Exception as e:
            raise EarthEngineError(f"Failed to calculate NDVI statistics: {e}")
    
    def _interpret_ndvi(self, mean_ndvi: float) -> Dict[str, str]:
        """Interpret NDVI values for agricultural context"""
        if mean_ndvi > 0.7:
            health = "Excellent"
            description = "Very healthy, dense vegetation"
            recommendation = "Crops are thriving. Monitor for optimal harvest timing."
        elif mean_ndvi > 0.5:
            health = "Good"
            description = "Healthy vegetation with good coverage"
            recommendation = "Crops are doing well. Continue current management practices."
        elif mean_ndvi > 0.3:
            health = "Moderate"
            description = "Moderate vegetation health"
            recommendation = "Consider irrigation or nutrient management to improve crop health."
        elif mean_ndvi > 0.1:
            health = "Poor"
            description = "Sparse or stressed vegetation"
            recommendation = "Immediate attention needed. Check for pests, disease, or water stress."
        else:
            health = "Very Poor"
            description = "Little to no healthy vegetation"
            recommendation = "Urgent intervention required. Investigate soil, water, and crop conditions."
        
        return {
            'health_status': health,
            'description': description,
            'recommendation': recommendation
        }
    
    def _get_soil_data(self, geometry: ee.Geometry) -> Dict[str, Any]:
        """Get soil information for the area"""
        try:
            # OpenLandMap soil datasets
            soil_ph = ee.Image('OpenLandMap/SOL/SOL_PH-H2O_USDA-4C1A2A_M/v02').select('b0')
            soil_texture = ee.Image('OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02').select('b0')
            
            # Get soil statistics
            soil_stats = soil_ph.addBands(soil_texture).reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=250,  # 250m resolution for soil data
                maxPixels=1e9
            ).getInfo()
            
            ph_value = soil_stats.get('b0', 70) / 10  # Convert to pH scale
            texture_class = soil_stats.get('b0_1', 0)
            
            # Interpret texture class (simplified)
            texture_map = {
                1: "Clay", 2: "Silty Clay", 3: "Sandy Clay",
                4: "Clay Loam", 5: "Silty Clay Loam", 6: "Sandy Clay Loam",
                7: "Loam", 8: "Silty Loam", 9: "Sandy Loam",
                10: "Silt", 11: "Loamy Sand", 12: "Sand"
            }
            
            texture_name = texture_map.get(int(texture_class), "Unknown")
            
            return {
                'ph': round(ph_value, 1),
                'texture_class': int(texture_class),
                'texture_name': texture_name,
                'ph_interpretation': self._interpret_ph(ph_value),
                'texture_suitability': self._interpret_texture(texture_name)
            }
            
        except Exception as e:
            return {
                'error': f"Failed to get soil data: {e}",
                'ph': None,
                'texture_name': 'Unknown'
            }
    
    def _interpret_ph(self, ph: float) -> str:
        """Interpret soil pH for agriculture"""
        if ph < 5.5:
            return "Very acidic - may need lime application"
        elif ph < 6.0:
            return "Acidic - suitable for acid-loving crops"
        elif ph < 7.0:
            return "Slightly acidic - good for most crops"
        elif ph < 7.5:
            return "Neutral to slightly alkaline - excellent for most crops"
        else:
            return "Alkaline - may need sulfur to lower pH"
    
    def _interpret_texture(self, texture: str) -> str:
        """Interpret soil texture for agriculture"""
        texture_advice = {
            "Clay": "Good water retention, may need drainage improvement",
            "Loam": "Excellent for most crops - ideal soil type",
            "Sandy Loam": "Good drainage, may need more frequent watering",
            "Sand": "Excellent drainage, requires frequent irrigation and fertilization",
            "Silt": "Good water retention, may compact easily"
        }
        return texture_advice.get(texture, "Moderate suitability for agriculture")

def get_satellite_crop_health(coordinates: List[List[float]], days_back: int = 30) -> str:
    """
    Get crop health analysis using satellite NDVI data.
    
    Args:
        coordinates: List of coordinate pairs [[lon, lat], ...] defining the area
        days_back: Number of days back to search for images
    
    Returns:
        JSON string with crop health analysis
    """
    tool = EarthEngineTool()
    
    try:
        # Create geometry
        geometry = tool._create_geometry(coordinates)
        
        # Define date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        start_str = start_date.strftime('%Y-%m-%d')
        end_str = end_date.strftime('%Y-%m-%d')
        
        # Get best available image
        image = tool._get_best_image(geometry, start_str, end_str)
        
        if image is None:
            return json.dumps({
                "error": "No suitable satellite images found for the specified area and time period",
                "coordinates": coordinates,
                "search_period": f"{start_str} to {end_str}"
            })
        
        # Get image metadata
        image_info = image.getInfo()
        image_properties = image_info.get('properties', {})
        image_date = image_properties.get('system:time_start')
        cloud_cover = image_properties.get('CLOUDY_PIXEL_PERCENTAGE', 0)
        
        # Calculate NDVI
        ndvi_image = tool._calculate_ndvi(image)
        ndvi_stats = tool._get_ndvi_stats(ndvi_image, geometry)
        
        # Interpret NDVI
        interpretation = tool._interpret_ndvi(ndvi_stats['mean'])
        
        # Format image date
        if image_date:
            image_date_readable = datetime.fromtimestamp(image_date / 1000).strftime('%Y-%m-%d')
        else:
            image_date_readable = "Unknown"
        
        # Generate visualization URLs
        # RGB True Color visualization
        rgb_vis_params = {
            'bands': ['B4', 'B3', 'B2'],
            'min': 0,
            'max': 3000,
            'gamma': 1.4
        }
        
        # NDVI visualization (green = healthy, red = stressed)
        ndvi_vis_params = {
            'min': 0,
            'max': 1,
            'palette': ['red', 'yellow', 'green']
        }
        
        try:
            # Get thumbnail URLs with better zoom level
            # Add buffer around geometry to show surrounding context (500m buffer)
            buffered_geometry = geometry.buffer(500)  # 500 meters buffer
            bounds = buffered_geometry.bounds()
            
            rgb_thumb_url = image.visualize(**rgb_vis_params).getThumbURL({
                'region': bounds,
                'dimensions': 512,
                'format': 'png'
            })
            
            ndvi_thumb_url = ndvi_image.visualize(**ndvi_vis_params).getThumbURL({
                'region': bounds,
                'dimensions': 512,
                'format': 'png'
            })
        except Exception as e:
            rgb_thumb_url = None
            ndvi_thumb_url = None
        
        result = {
            "analysis_type": "satellite_crop_health",
            "coordinates": coordinates,
            "image_info": {
                "date": image_date_readable,
                "cloud_cover_percent": round(cloud_cover, 1),
                "satellite": "Sentinel-2"
            },
            "ndvi_analysis": {
                "mean_ndvi": round(ndvi_stats['mean'], 3),
                "min_ndvi": round(ndvi_stats['min'], 3),
                "max_ndvi": round(ndvi_stats['max'], 3),
                "std_deviation": round(ndvi_stats['std_dev'], 3)
            },
            "crop_health": interpretation,
            "imagery": {
                "rgb_image_url": rgb_thumb_url,
                "ndvi_image_url": ndvi_thumb_url
            },
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return json.dumps(result, indent=2)
        
    except EarthEngineError as e:
        return json.dumps({"error": str(e), "coordinates": coordinates})
    except Exception as e:
        return json.dumps({"error": f"Unexpected error: {e}", "coordinates": coordinates})

def get_soil_analysis(coordinates: List[List[float]]) -> str:
    """
    Get soil analysis for agricultural planning.
    
    Args:
        coordinates: List of coordinate pairs [[lon, lat], ...] defining the area
    
    Returns:
        JSON string with soil analysis
    """
    tool = EarthEngineTool()
    
    try:
        # Create geometry
        geometry = tool._create_geometry(coordinates)
        
        # Get soil data
        soil_data = tool._get_soil_data(geometry)
        
        # Calculate area
        area_m2 = geometry.area().getInfo()
        area_hectares = area_m2 / 10000
        
        result = {
            "analysis_type": "soil_analysis",
            "coordinates": coordinates,
            "area_hectares": round(area_hectares, 2),
            "soil_properties": soil_data,
            "agricultural_recommendations": {
                "ph_management": soil_data.get('ph_interpretation', 'Unknown'),
                "texture_suitability": soil_data.get('texture_suitability', 'Unknown'),
                "general_advice": "Consider soil testing for detailed nutrient analysis"
            },
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return json.dumps(result, indent=2)
        
    except EarthEngineError as e:
        return json.dumps({"error": str(e), "coordinates": coordinates})
    except Exception as e:
        return json.dumps({"error": f"Unexpected error: {e}", "coordinates": coordinates})

def get_soil_moisture_map(coordinates: List[List[float]], include_soil_properties: bool = True) -> str:
    """
    Get soil moisture analysis and mapping data for agricultural planning.
    
    Args:
        coordinates: List of coordinate pairs [[lon, lat], ...] defining the area
        include_soil_properties: Include soil pH and texture analysis
    
    Returns:
        JSON string with soil moisture and properties
    """
    tool = EarthEngineTool()
    
    try:
        # Create geometry
        geometry = tool._create_geometry(coordinates)
        
        # Get soil properties if requested
        soil_properties = None
        if include_soil_properties:
            soil_properties = tool._get_soil_data(geometry)
        
        # Get NDVI as a proxy for vegetation water stress
        # (Real soil moisture would require SMAP/SMOS datasets with authentication)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=16)  # Last 16 days
        
        start_str = start_date.strftime('%Y-%m-%d')
        end_str = end_date.strftime('%Y-%m-%d')
        
        # Get recent image for vegetation analysis
        image = tool._get_best_image(geometry, start_str, end_str)
        
        moisture_status = "Unknown"
        moisture_level = 0.5  # Default medium
        recommendation = "Monitor soil conditions"
        
        if image:
            # Calculate NDVI as indicator of plant water stress
            ndvi_image = tool._calculate_ndvi(image)
            ndvi_stats = tool._get_ndvi_stats(ndvi_image, geometry)
            mean_ndvi = ndvi_stats['mean']
            
            # Interpret moisture based on NDVI and soil properties
            # High NDVI = good moisture, Low NDVI = potential water stress
            if mean_ndvi > 0.6:
                moisture_status = "Good"
                moisture_level = 0.75
                recommendation = "Soil moisture appears adequate. Continue monitoring."
            elif mean_ndvi > 0.4:
                moisture_status = "Moderate"
                moisture_level = 0.5
                recommendation = "Consider irrigation if no rain expected in next 3-5 days."
            elif mean_ndvi > 0.2:
                moisture_status = "Low"
                moisture_level = 0.3
                recommendation = "Irrigation recommended. Check soil moisture levels."
            else:
                moisture_status = "Very Low"
                moisture_level = 0.15
                recommendation = "Urgent irrigation needed. Crops may be water-stressed."
            
            image_date = datetime.fromtimestamp(
                image.getInfo()['properties'].get('system:time_start', 0) / 1000
            ).strftime('%Y-%m-%d')
        else:
            image_date = "No recent data"
        
        # Calculate area
        area_m2 = geometry.area().getInfo()
        area_hectares = area_m2 / 10000
        
        # Create moisture map data (simplified - one value per area)
        moisture_map = {
            "coordinates": coordinates,
            "moisture_level": moisture_level,
            "moisture_status": moisture_status,
            "color": _get_moisture_color(moisture_level),
            "area_hectares": round(area_hectares, 2)
        }
        
        result = {
            "analysis_type": "soil_moisture_map",
            "coordinates": coordinates,
            "area_hectares": round(area_hectares, 2),
            "moisture_analysis": {
                "status": moisture_status,
                "level": moisture_level,
                "recommendation": recommendation,
                "analysis_date": image_date,
                "method": "NDVI-based estimation"
            },
            "soil_properties": soil_properties,
            "moisture_map": moisture_map,
            "irrigation_priority": "High" if moisture_level < 0.4 else "Medium" if moisture_level < 0.6 else "Low",
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return json.dumps(result, indent=2)
        
    except EarthEngineError as e:
        return json.dumps({"error": str(e), "coordinates": coordinates})
    except Exception as e:
        return json.dumps({"error": f"Unexpected error: {e}", "coordinates": coordinates})

def _get_moisture_color(level: float) -> str:
    """Get color code for moisture level"""
    if level > 0.7:
        return "#22c55e"  # Green - good moisture
    elif level > 0.5:
        return "#84cc16"  # Light green - moderate
    elif level > 0.3:
        return "#eab308"  # Yellow - low
    else:
        return "#ef4444"  # Red - very low

def get_crop_monitoring_time_series(coordinates: List[List[float]], months_back: int = 6) -> str:
    """
    Get time series analysis of crop health over multiple months.
    
    Args:
        coordinates: List of coordinate pairs [[lon, lat], ...] defining the area
        months_back: Number of months back to analyze
    
    Returns:
        JSON string with time series crop health analysis
    """
    tool = EarthEngineTool()
    
    try:
        # Create geometry
        geometry = tool._create_geometry(coordinates)
        
        # Define date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months_back * 30)
        
        start_str = start_date.strftime('%Y-%m-%d')
        end_str = end_date.strftime('%Y-%m-%d')
        
        # Get image collection
        collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                     .filterBounds(geometry)
                     .filterDate(start_str, end_str)
                     .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
                     .sort('system:time_start'))
        
        # Get collection size
        collection_size = collection.size().getInfo()
        
        if collection_size == 0:
            return json.dumps({
                "error": "No suitable satellite images found for the specified area and time period",
                "coordinates": coordinates,
                "time_period": f"{start_str} to {end_str}"
            })
        
        # Calculate NDVI for each image and get mean values
        def calculate_mean_ndvi(image):
            ndvi = tool._calculate_ndvi(image)
            mean_ndvi = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=10,
                maxPixels=1e9
            ).get('NDVI')
            
            return ee.Feature(None, {
                'date': image.date().millis(),
                'ndvi': mean_ndvi,
                'cloud_cover': image.get('CLOUDY_PIXEL_PERCENTAGE')
            })
        
        # Map over collection and get results
        features = collection.map(calculate_mean_ndvi)
        feature_list = features.getInfo()
        
        # Process time series data
        processed_data = []
        for feature in feature_list['features']:
            props = feature['properties']
            date_ms = props.get('date')
            ndvi_value = props.get('ndvi')
            cloud_cover = props.get('cloud_cover')
            
            if date_ms and ndvi_value is not None:
                date_readable = datetime.fromtimestamp(date_ms / 1000).strftime('%Y-%m-%d')
                processed_data.append({
                    'date': date_readable,
                    'ndvi': round(ndvi_value, 3),
                    'cloud_cover': round(cloud_cover, 1) if cloud_cover else None,
                    'health_status': tool._interpret_ndvi(ndvi_value)['health_status']
                })
        
        # Sort by date
        processed_data.sort(key=lambda x: x['date'])
        
        # Calculate trends
        if len(processed_data) >= 2:
            recent_ndvi = processed_data[-1]['ndvi']
            older_ndvi = processed_data[0]['ndvi']
            change = recent_ndvi - older_ndvi
            trend = "Improving" if change > 0.05 else "Declining" if change < -0.05 else "Stable"
        else:
            trend = "Insufficient data"
            change = 0
        
        result = {
            "analysis_type": "crop_monitoring_time_series",
            "coordinates": coordinates,
            "time_period": f"{start_str} to {end_str}",
            "data_points": len(processed_data),
            "time_series_data": processed_data,
            "trend_analysis": {
                "overall_trend": trend,
                "ndvi_change": round(change, 3) if len(processed_data) >= 2 else None,
                "latest_ndvi": processed_data[-1]['ndvi'] if processed_data else None,
                "latest_health": processed_data[-1]['health_status'] if processed_data else None,
                "earliest_ndvi": processed_data[0]['ndvi'] if processed_data else None
            },
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return json.dumps(result, indent=2)
        
    except EarthEngineError as e:
        return json.dumps({"error": str(e), "coordinates": coordinates})
    except Exception as e:
        return json.dumps({"error": f"Unexpected error: {e}", "coordinates": coordinates})

# Export the main functions for use by agents
__all__ = [
    'get_satellite_crop_health',
    'get_soil_analysis',
    'get_crop_monitoring_time_series',
    'get_soil_moisture_map'
]