"""
Perplexity Search Tool for real-time web search with citations
"""
import requests
import os
from typing import Dict, List, Any, Optional
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PerplexitySearchTool:
    def __init__(self):
        self.api_key = None
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.headers = None
    
    def _ensure_initialized(self):
        """Lazy initialization of API key and headers"""
        if self.api_key is None:
            self.api_key = os.getenv("PERPLEXITY_API_KEY")
            if not self.api_key:
                raise ValueError("PERPLEXITY_API_KEY not found in environment variables")
            
            self.headers = {
                "accept": "application/json",
                "authorization": f"Bearer {self.api_key}",
                "content-type": "application/json"
            }
    
    def search(self, query: str, model: str = "sonar-pro") -> Dict[str, Any]:
        """
        Perform a search using Perplexity API with citations
        
        Args:
            query: The search query/question
            model: The Sonar model to use (sonar-pro, sonar-reasoning, etc.)
        
        Returns:
            Dictionary containing the response with citations
        """
        self._ensure_initialized()
        
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": query}],
            "stream": False,
            "enable_search_classifier": True
        }
        
        try:
            response = requests.post(self.base_url, headers=self.headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            
            # Extract and format the response
            formatted_result = {
                "answer": "",
                "citations": [],
                "search_results": [],
                "raw_response": result
            }
            
            if "choices" in result and len(result["choices"]) > 0:
                formatted_result["answer"] = result["choices"][0]["message"]["content"]
            
            if "citations" in result:
                formatted_result["citations"] = result["citations"]
            
            if "search_results" in result:
                formatted_result["search_results"] = result["search_results"]
            
            return formatted_result
            
        except requests.exceptions.RequestException as e:
            return {
                "error": f"Search request failed: {str(e)}",
                "answer": "I'm sorry, I couldn't perform the search at this time.",
                "citations": [],
                "search_results": []
            }
        except Exception as e:
            return {
                "error": f"Unexpected error: {str(e)}",
                "answer": "I'm sorry, an unexpected error occurred during the search.",
                "citations": [],
                "search_results": []
            }
    
    def format_response_with_citations(self, search_result: Dict[str, Any]) -> str:
        """
        Format the search result - return clean answer without embedded citations
        
        Args:
            search_result: The result from the search method
        
        Returns:
            Clean answer text without citation markers
        """
        if "error" in search_result:
            return search_result["answer"]
        
        answer = search_result["answer"]
        
        # Remove citation markers like [1], [2], [3] from the answer
        import re
        clean_answer = re.sub(r'\[\d+\]', '', answer)
        
        # Remove the Sources section if it exists
        if "**Sources:**" in clean_answer:
            clean_answer = clean_answer.split("**Sources:**")[0]
        
        return clean_answer.strip()
    
    def get_citations(self, search_result: Dict[str, Any]) -> List[str]:
        """
        Extract citations from search result
        
        Args:
            search_result: The result from the search method
        
        Returns:
            List of citation URLs
        """
        if "error" in search_result:
            return []
        
        citations = search_result.get("citations", [])
        return citations

# Create instance when needed to avoid import-time initialization
def get_search_tool():
    """Get a search tool instance"""
    return PerplexitySearchTool()