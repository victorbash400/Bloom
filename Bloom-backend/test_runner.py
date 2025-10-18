#!/usr/bin/env python3
"""
Test runner for test.py agent
"""
import asyncio
import os
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from test import root_agent

# Load environment variables
load_dotenv()

async def test_agent():
    """Test the search assistant agent"""
    
    # Setup
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name="test_app",
        user_id="test_user",
        session_id="test_session"
    )
    
    runner = Runner(
        agent=root_agent,
        app_name="test_app",
        session_service=session_service
    )
    
    # Test queries
    test_queries = [
        "What's the weather like today?",
        "Tell me about Python programming",
        "What are the latest news about AI?"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Testing query: {query}")
        print("=" * 50)
        
        content = Content(role='user', parts=[Part(text=query)])
        
        try:
            async for event in runner.run_async(
                user_id="test_user",
                session_id="test_session",
                new_message=content
            ):
                if event.is_final_response():
                    response = event.content.parts[0].text
                    print(f"✅ Response: {response[:200]}...")
                    break
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print("\n" + "=" * 50)

if __name__ == "__main__":
    print("🚀 Starting agent tests...")
    asyncio.run(test_agent())
    print("🏁 Tests completed!")