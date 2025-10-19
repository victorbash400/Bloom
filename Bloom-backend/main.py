import os
import json
import uuid
import logging
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from google.genai.types import Content, Part
from pydantic import BaseModel
from typing import Optional
from agents.mainagent import root_agent

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Bloom Backend API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize session service
session_service = InMemorySessionService()

class ChatRequest(BaseModel):
    message: str
    user_id: str = "default_user"
    session_id: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    async def generate_stream():
        try:
            session_id = request.session_id or str(uuid.uuid4())
            yield f"data: {json.dumps({'type': 'session', 'session_id': session_id})}\n\n"

            # Ensure session exists
            session = await session_service.get_session(
                app_name="bloom_app",
                user_id=request.user_id,
                session_id=session_id
            )
            if not session:
                session = await session_service.create_session(
                    app_name="bloom_app",
                    user_id=request.user_id,
                    session_id=session_id,
                    state={}
                )

            from google.adk.agents.run_config import RunConfig, StreamingMode

            runner = Runner(
                agent=root_agent,
                app_name="bloom_app",
                session_service=session_service
            )

            async for event in runner.run_async(
                user_id=request.user_id,
                session_id=session_id,
                new_message=Content(role='user', parts=[Part(text=request.message)]),
                run_config=RunConfig(streaming_mode=StreamingMode.SSE),
            ):
                # Check if this event contains a function call
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        # Check if this part is a function call
                        if hasattr(part, 'function_call') and part.function_call:
                            tool_name = part.function_call.name
                            tool_data = {
                                'type': 'tool_call',
                                'tool_name': tool_name,
                            }
                            yield f"data: {json.dumps(tool_data)}\n\n"
                            logger.info(f"🔧 Tool call detected: {tool_name}")
                        elif hasattr(part, 'text') and part.text and event.partial:
                            # Regular text content
                            content = part.text
                            chunk_data = {
                                'type': 'content',
                                'content': content,
                            }
                            yield f"data: {json.dumps(chunk_data)}\n\n"
            
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            logger.error(f"Error in streaming chat: {str(e)}")
            error_data = {'type': 'error', 'error': str(e)}
            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="healthy", version="1.0.0")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)