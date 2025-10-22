"""
Vector Search Tool for Bloom Agents
Provides semantic search over farm data using the deployed Vector Search endpoint.
"""

import json
import os
import requests
import subprocess
from typing import Dict, List, Any, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Vector Search endpoint configuration from environment variables
API_ENDPOINT = os.getenv("VECTOR_SEARCH_API_ENDPOINT")
INDEX_ENDPOINT = os.getenv("VECTOR_SEARCH_INDEX_ENDPOINT")
DEPLOYED_INDEX_ID = os.getenv("VECTOR_SEARCH_DEPLOYED_INDEX_ID")
SERVICE_ACCOUNT_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
GCLOUD_PATH = os.getenv("GCLOUD_PATH")

# Validate required environment variables
required_vars = {
    "VECTOR_SEARCH_API_ENDPOINT": API_ENDPOINT,
    "VECTOR_SEARCH_INDEX_ENDPOINT": INDEX_ENDPOINT,
    "VECTOR_SEARCH_DEPLOYED_INDEX_ID": DEPLOYED_INDEX_ID,
    "GOOGLE_APPLICATION_CREDENTIALS": SERVICE_ACCOUNT_PATH,
    "GCLOUD_PATH": GCLOUD_PATH
}

missing_vars = [var for var, value in required_vars.items() if not value]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

class VectorSearchTool:
    def __init__(self):
        self.metadata = self._load_metadata()
        self.client = None
        self._setup_gemini_client()
    
    def _setup_gemini_client(self):
        """Initialize Gemini client for embeddings"""
        try:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_ACCOUNT_PATH
            self.client = genai.Client()
        except Exception as e:
            print(f"Warning: Failed to initialize Gemini client: {e}")
    
    def _load_metadata(self):
        """Load farm metadata for interpreting search results"""
        try:
            with open('generated_data/farm_metadata.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load farm metadata: {e}")
            return {}
    
    def _get_access_token(self):
        """Get GCP access token for Vector Search authentication"""
        try:
            cmd = ["powershell", "-Command", f"& '{GCLOUD_PATH}' auth print-access-token"]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        except Exception as e:
            print(f"Error getting access token: {e}")
            return None
    
    def _create_embedding(self, text: str) -> Optional[List[float]]:
        """Create embedding for search query"""
        if not self.client:
            return None
        
        try:
            result = self.client.models.embed_content(
                model="gemini-embedding-001",
                contents=text,
                config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
            )
            return result.embeddings[0].values
        except Exception as e:
            print(f"Error creating embedding: {e}")
            return None
    
    def _query_vector_search(self, embedding: List[float], num_results: int = 10) -> Optional[Dict]:
        """Query the Vector Search endpoint"""
        access_token = self._get_access_token()
        if not access_token:
            return None
        
        url = f"https://{API_ENDPOINT}/v1/{INDEX_ENDPOINT}:findNeighbors"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "deployedIndexId": DEPLOYED_INDEX_ID,
            "queries": [{
                "datapoint": {
                    "featureVector": embedding
                },
                "neighborCount": num_results
            }],
            "returnFullDatapoint": False
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Vector search query failed: {e}")
            return None
    
    def _format_results(self, search_results: Dict, query: str) -> List[Dict[str, Any]]:
        """Format search results with metadata"""
        if not search_results or 'nearestNeighbors' not in search_results:
            return []
        
        neighbors = search_results['nearestNeighbors'][0]['neighbors']
        formatted_results = []
        
        for neighbor in neighbors:
            plot_id = neighbor['datapoint']['datapointId']
            distance = neighbor.get('distance', 0)
            similarity = 1 - distance  # Convert distance to similarity score
            
            # Get metadata
            metadata = self.metadata.get(plot_id, {})
            
            result = {
                'plot_id': plot_id,
                'similarity_score': round(similarity, 3),
                'plot_name': metadata.get('plot_name', 'Unknown'),
                'crop': metadata.get('crop', 'Unknown'),
                'stage': metadata.get('stage', 'Unknown'),
                'yield_tons_per_ha': metadata.get('yield', 0),
                'revenue_kes': metadata.get('revenue', 0),
                'area_hectares': metadata.get('area', 0),
                'full_description': metadata.get('text', '')
            }
            formatted_results.append(result)
        
        return formatted_results

def search_farm_data(query: str, max_results: int = 5) -> str:
    """
    Search farm data using semantic vector search.
    
    Args:
        query: Natural language query about farm data
        max_results: Maximum number of results to return
    
    Returns:
        JSON string with search results and analysis
    """
    tool = VectorSearchTool()
    
    # Create embedding for the query
    embedding = tool._create_embedding(query)
    if not embedding:
        return json.dumps({
            "error": "Failed to create embedding for query",
            "query": query,
            "results": []
        })
    
    # Search vector index
    search_results = tool._query_vector_search(embedding, max_results)
    if not search_results:
        return json.dumps({
            "error": "Vector search failed",
            "query": query,
            "results": []
        })
    
    # Format results
    formatted_results = tool._format_results(search_results, query)
    
    # Analyze results for insights
    analysis = _analyze_results(formatted_results, query)
    
    return json.dumps({
        "query": query,
        "results_count": len(formatted_results),
        "results": formatted_results,
        "analysis": analysis
    }, indent=2)

def get_historical_yields(crop_type: str = None, plot_name: str = None, min_yield: float = None) -> str:
    """
    Get historical yield data with optional filtering.
    
    Args:
        crop_type: Filter by crop type (e.g., 'Maize', 'Potatoes', 'Beans')
        plot_name: Filter by plot name (e.g., 'North Field', 'East Ridge')
        min_yield: Filter by minimum yield threshold
    
    Returns:
        JSON string with historical yield analysis
    """
    # Build query based on filters
    query_parts = ["historical yields"]
    
    if crop_type:
        query_parts.append(f"for {crop_type}")
    if plot_name:
        query_parts.append(f"from {plot_name}")
    if min_yield:
        query_parts.append(f"with yields above {min_yield} tons per hectare")
    
    query = " ".join(query_parts)
    
    # Search with larger result set for historical analysis
    tool = VectorSearchTool()
    embedding = tool._create_embedding(query)
    if not embedding:
        return json.dumps({"error": "Failed to create embedding", "results": []})
    
    search_results = tool._query_vector_search(embedding, 20)  # Get more results for analysis
    if not search_results:
        return json.dumps({"error": "Vector search failed", "results": []})
    
    formatted_results = tool._format_results(search_results, query)
    
    # Apply additional filters
    filtered_results = []
    for result in formatted_results:
        if crop_type and result['crop'].lower() != crop_type.lower():
            continue
        if plot_name and plot_name.lower() not in result['plot_name'].lower():
            continue
        if min_yield and result['yield_tons_per_ha'] < min_yield:
            continue
        filtered_results.append(result)
    
    # Calculate yield statistics
    yields = [r['yield_tons_per_ha'] for r in filtered_results if r['yield_tons_per_ha'] > 0]
    revenues = [r['revenue_kes'] for r in filtered_results if r['revenue_kes'] > 0]
    
    stats = {}
    if yields:
        stats = {
            "avg_yield": round(sum(yields) / len(yields), 2),
            "max_yield": max(yields),
            "min_yield": min(yields),
            "total_records": len(filtered_results)
        }
    
    if revenues:
        stats["avg_revenue"] = round(sum(revenues) / len(revenues), 2)
        stats["max_revenue"] = max(revenues)
        stats["total_revenue"] = sum(revenues)
    
    return json.dumps({
        "query": query,
        "filters": {
            "crop_type": crop_type,
            "plot_name": plot_name,
            "min_yield": min_yield
        },
        "statistics": stats,
        "results": filtered_results[:10],  # Return top 10 results
        "total_matching_records": len(filtered_results)
    }, indent=2)

def get_crop_performance_comparison(crops: List[str] = None) -> str:
    """
    Compare performance across different crops.
    
    Args:
        crops: List of crops to compare (defaults to all crops)
    
    Returns:
        JSON string with crop performance comparison
    """
    if not crops:
        crops = ["Maize", "Potatoes", "Beans"]
    
    tool = VectorSearchTool()
    comparison_data = {}
    
    for crop in crops:
        query = f"performance data for {crop} crops with yields and revenue"
        embedding = tool._create_embedding(query)
        
        if embedding:
            search_results = tool._query_vector_search(embedding, 15)
            if search_results:
                formatted_results = tool._format_results(search_results, query)
                
                # Filter for this specific crop
                crop_results = [r for r in formatted_results if r['crop'].lower() == crop.lower()]
                
                if crop_results:
                    yields = [r['yield_tons_per_ha'] for r in crop_results if r['yield_tons_per_ha'] > 0]
                    revenues = [r['revenue_kes'] for r in crop_results if r['revenue_kes'] > 0]
                    
                    comparison_data[crop] = {
                        "records_count": len(crop_results),
                        "avg_yield": round(sum(yields) / len(yields), 2) if yields else 0,
                        "max_yield": max(yields) if yields else 0,
                        "avg_revenue": round(sum(revenues) / len(revenues), 2) if revenues else 0,
                        "max_revenue": max(revenues) if revenues else 0,
                        "revenue_per_hectare": round(sum(revenues) / sum([r['area_hectares'] for r in crop_results if r['area_hectares'] > 0]), 2) if revenues else 0
                    }
    
    # Determine best performing crop
    best_crop = None
    best_revenue_per_ha = 0
    
    for crop, data in comparison_data.items():
        if data["revenue_per_hectare"] > best_revenue_per_ha:
            best_revenue_per_ha = data["revenue_per_hectare"]
            best_crop = crop
    
    return json.dumps({
        "comparison_type": "crop_performance",
        "crops_analyzed": crops,
        "performance_data": comparison_data,
        "best_performing_crop": best_crop,
        "best_revenue_per_hectare": best_revenue_per_ha
    }, indent=2)

def get_plot_analysis(plot_name: str = None) -> str:
    """
    Get detailed analysis for specific plots.
    
    Args:
        plot_name: Name of the plot to analyze
    
    Returns:
        JSON string with plot analysis
    """
    if not plot_name:
        query = "all plots with detailed performance data"
    else:
        query = f"detailed analysis for {plot_name} plot with all seasons and crops"
    
    tool = VectorSearchTool()
    embedding = tool._create_embedding(query)
    
    if not embedding:
        return json.dumps({"error": "Failed to create embedding", "results": []})
    
    search_results = tool._query_vector_search(embedding, 20)
    if not search_results:
        return json.dumps({"error": "Vector search failed", "results": []})
    
    formatted_results = tool._format_results(search_results, query)
    
    # Filter by plot name if specified
    if plot_name:
        formatted_results = [r for r in formatted_results if plot_name.lower() in r['plot_name'].lower()]
    
    # Group by plot
    plots_data = {}
    for result in formatted_results:
        plot = result['plot_name']
        if plot not in plots_data:
            plots_data[plot] = {
                "seasons": [],
                "crops_grown": set(),
                "total_revenue": 0,
                "avg_yield": 0,
                "area_hectares": result['area_hectares']
            }
        
        plots_data[plot]["seasons"].append({
            "plot_id": result['plot_id'],
            "crop": result['crop'],
            "stage": result['stage'],
            "yield": result['yield_tons_per_ha'],
            "revenue": result['revenue_kes']
        })
        plots_data[plot]["crops_grown"].add(result['crop'])
        plots_data[plot]["total_revenue"] += result['revenue_kes']
    
    # Calculate averages and convert sets to lists
    for plot, data in plots_data.items():
        yields = [s['yield'] for s in data['seasons'] if s['yield'] > 0]
        data['avg_yield'] = round(sum(yields) / len(yields), 2) if yields else 0
        data['crops_grown'] = list(data['crops_grown'])
        data['seasons_count'] = len(data['seasons'])
    
    return json.dumps({
        "query": query,
        "plot_filter": plot_name,
        "plots_analyzed": len(plots_data),
        "plots_data": plots_data
    }, indent=2)

def _analyze_results(results: List[Dict], query: str) -> Dict[str, Any]:
    """Analyze search results to provide insights"""
    if not results:
        return {"message": "No results found"}
    
    analysis = {
        "total_results": len(results),
        "avg_similarity": round(sum(r['similarity_score'] for r in results) / len(results), 3),
        "crops_found": list(set(r['crop'] for r in results)),
        "plots_found": list(set(r['plot_name'] for r in results)),
        "stages_found": list(set(r['stage'] for r in results))
    }
    
    # Yield analysis
    yields = [r['yield_tons_per_ha'] for r in results if r['yield_tons_per_ha'] > 0]
    if yields:
        analysis["yield_stats"] = {
            "avg_yield": round(sum(yields) / len(yields), 2),
            "max_yield": max(yields),
            "min_yield": min(yields)
        }
    
    # Revenue analysis
    revenues = [r['revenue_kes'] for r in results if r['revenue_kes'] > 0]
    if revenues:
        analysis["revenue_stats"] = {
            "avg_revenue": round(sum(revenues) / len(revenues), 2),
            "max_revenue": max(revenues),
            "total_revenue": sum(revenues)
        }
    
    return analysis

# Export the main functions for use by agents
__all__ = [
    'search_farm_data',
    'get_historical_yields', 
    'get_crop_performance_comparison',
    'get_plot_analysis'
]