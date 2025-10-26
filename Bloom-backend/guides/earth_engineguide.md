# Vertex AI Matching Engine Integration Guide

A detailed guide for building a FastAPI Python service to work with Google Cloud Vertex AI Matching Engine (vector search index) and access images/data—useful for app or agent backend endpoints.

## Pre-requisites

- Python 3.8+
- FastAPI installed (`pip install fastapi uvicorn`)
- Install Google Cloud SDK (`pip install google-cloud-aiplatform google-auth`)
- GCP Project set up with Vertex AI endpoint
- Service account key configured via `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Or use `gcloud auth application-default login` for local development

## Security Note

⚠️ **Never hardcode credentials in your code!** Always use environment variables for:
- Project IDs
- Endpoint IDs
- API endpoints
- Service account keys

See `SECURITY.md` for detailed security guidelines.

---

## FastAPI Implementation

### Environment Variables Setup

Add these to your `.env` file:

```env
# Vector Search Configuration
GCP_PROJECT_ID=your-gcp-project-id
GCP_REGION=us-central1
VECTOR_SEARCH_INDEX_ENDPOINT_ID=your-index-endpoint-id
VECTOR_SEARCH_DEPLOYED_INDEX_ID=your-deployed-index-id
VECTOR_SEARCH_API_ENDPOINT=your-api-endpoint

# Google Cloud Authentication
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

### FastAPI Application Code

```python
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.cloud import aiplatform_v1
from google.auth import default
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Define your endpoint details from environment variables
PROJECT = os.getenv("GCP_PROJECT_ID")
LOCATION = os.getenv("GCP_REGION", "us-central1")
INDEX_ENDPOINT_ID = os.getenv("VECTOR_SEARCH_INDEX_ENDPOINT_ID")
DEPLOYED_INDEX_ID = os.getenv("VECTOR_SEARCH_DEPLOYED_INDEX_ID")
API_ENDPOINT = os.getenv("VECTOR_SEARCH_API_ENDPOINT")

# Validate required environment variables
if not all([PROJECT, INDEX_ENDPOINT_ID, DEPLOYED_INDEX_ID, API_ENDPOINT]):
    raise ValueError("Missing required environment variables for Vector Search")

class QueryRequest(BaseModel):
    feature_vector: list  # e.g. [0.1, 0.2, 0.3, ...]
    num_neighbors: int = 10  # Number of nearest neighbors to return

@app.post('/search')
async def search_index(query: QueryRequest):
    """
    Search the vector index for nearest neighbors.
    
    Args:
        query: QueryRequest with feature_vector and optional num_neighbors
        
    Returns:
        Dictionary with nearest neighbors and their metadata
    """
    try:
        creds, _ = default()
        client_options = {"api_endpoint": API_ENDPOINT}
        client = aiplatform_v1.IndexEndpointServiceClient(
            client_options=client_options, 
            credentials=creds
        )

        index_endpoint = f"projects/{PROJECT}/locations/{LOCATION}/indexEndpoints/{INDEX_ENDPOINT_ID}"

        request = aiplatform_v1.FindNeighborsRequest(
            index_endpoint=index_endpoint,
            deployed_index_id=DEPLOYED_INDEX_ID,
            queries=[
                aiplatform_v1.Query(
                    datapoint={"feature_vector": query.feature_vector},
                    neighbor_count=query.num_neighbors
                )
            ],
            return_full_datapoint=True
        )
        
        response = client.find_neighbors(request=request)
        return response.to_dict()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/health')
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "vector-search"}
```

---

## Usage

### Starting the Server

```bash
uvicorn main:app --reload --port 8000
```

### Making Requests

**Search for nearest neighbors:**

```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{
    "feature_vector": [0.123, 0.456, 0.789, ...],
    "num_neighbors": 10
  }'
```

**From Python:**

```python
import requests

response = requests.post(
    "http://localhost:8000/search",
    json={
        "feature_vector": [0.123, 0.456, 0.789],
        "num_neighbors": 5
    }
)

results = response.json()
```

---

## Accessing Images or Data

The response gives you nearest datapoints. If the index stores URLs/image paths, you can retrieve them from the response:

```python
# Example response structure
{
    "neighbors": [
        {
            "datapoint": {
                "datapoint_id": "image_123",
                "feature_vector": [...],
                "image_url": "gs://bucket/image.jpg",
                "metadata": {...}
            },
            "distance": 0.123
        }
    ]
}

# Access image URL
image_url = results["neighbors"][0]["datapoint"]["image_url"]
```

To fetch the actual image:
- Use standard HTTP requests (`requests.get()`, etc.)
- Or return the URL/path in your FastAPI response for the client to access
- For GCS URLs, use `google-cloud-storage` library

---

## Best Practices

### 1. Store Metadata with Vectors

When building your index, include metadata alongside vectors:

```python
datapoint = {
    "id": "unique_id",
    "embedding": [0.1, 0.2, ...],
    "metadata": {
        "image_url": "gs://bucket/image.jpg",
        "label": "crop_health",
        "timestamp": "2025-01-01",
        "farm_id": "farm_123"
    }
}
```

### 2. Add Authentication

Secure your endpoint with API key or JWT:

```python
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

@app.post('/search')
async def search_index(
    query: QueryRequest,
    api_key: str = Security(api_key_header)
):
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    # ... rest of the code
```

### 3. Add Rate Limiting

Use libraries like `slowapi` to prevent abuse:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post('/search')
@limiter.limit("10/minute")
async def search_index(request: Request, query: QueryRequest):
    # ... your code
```

### 4. Error Handling

Add comprehensive error handling:

```python
from google.api_core import exceptions

try:
    response = client.find_neighbors(request=request)
    return response.to_dict()
except exceptions.NotFound:
    raise HTTPException(status_code=404, detail="Index not found")
except exceptions.PermissionDenied:
    raise HTTPException(status_code=403, detail="Permission denied")
except Exception as e:
    logger.error(f"Vector search error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

### 5. Logging

Add proper logging for debugging:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post('/search')
async def search_index(query: QueryRequest):
    logger.info(f"Searching for {query.num_neighbors} neighbors")
    try:
        # ... your code
        logger.info(f"Found {len(response.neighbors)} results")
        return response.to_dict()
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise
```

---

## Additional Endpoints

### Batch Search

```python
class BatchQueryRequest(BaseModel):
    queries: list[list]  # List of feature vectors
    num_neighbors: int = 10

@app.post('/batch-search')
async def batch_search(request: BatchQueryRequest):
    """Search multiple vectors at once"""
    queries = [
        aiplatform_v1.Query(
            datapoint={"feature_vector": vec},
            neighbor_count=request.num_neighbors
        )
        for vec in request.queries
    ]
    
    # ... rest of implementation
```

### Index Info

```python
@app.get('/index-info')
async def get_index_info():
    """Get information about the deployed index"""
    return {
        "project": PROJECT,
        "location": LOCATION,
        "index_endpoint_id": INDEX_ENDPOINT_ID,
        "deployed_index_id": DEPLOYED_INDEX_ID
    }
```

---

## Troubleshooting

### Authentication Errors

```bash
# Verify credentials
gcloud auth application-default login

# Check service account
gcloud auth list

# Set credentials explicitly
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

### Connection Errors

- Verify API endpoint is correct
- Check firewall rules
- Ensure Vertex AI API is enabled in GCP

### Performance Issues

- Use batch queries for multiple searches
- Consider caching frequent queries
- Monitor API quotas and limits

---

## Resources

- [Vertex AI Matching Engine Documentation](https://cloud.google.com/vertex-ai/docs/matching-engine/overview)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Google Cloud Python Client](https://cloud.google.com/python/docs/reference)

---

## See Also

- `guides/setup.md` - Complete backend setup guide
- `SECURITY.md` - Security best practices
- `guides/embedding-guide.md` - Creating embeddings for vector search
