import os
import json
import uuid
import logging
import asyncio
from fastapi import FastAPI, HTTPException, UploadFile, File
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
import PyPDF2
import io

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

# Store for uploaded PDF content (in production, use a proper database)
pdf_context_store = {}

class ChatRequest(BaseModel):
    message: str
    user_id: str = "default_user"
    session_id: Optional[str] = None
    pdf_context_ids: Optional[list[str]] = None

class HealthResponse(BaseModel):
    status: str
    version: str

class PDFUploadResponse(BaseModel):
    success: bool
    file_id: str
    filename: str
    text_length: int

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

            # Prepare message with PDF context if available
            message_text = request.message
            if request.pdf_context_ids:
                pdf_contexts = []
                for pdf_id in request.pdf_context_ids:
                    if pdf_id in pdf_context_store:
                        pdf_data = pdf_context_store[pdf_id]
                        pdf_contexts.append(f"--- Content from {pdf_data['filename']} ---\n{pdf_data['content']}\n--- End of {pdf_data['filename']} ---\n")
                
                if pdf_contexts:
                    context_text = "\n".join(pdf_contexts)
                    message_text = f"Context from uploaded documents:\n{context_text}\n\nUser question: {request.message}"

            async for event in runner.run_async(
                user_id=request.user_id,
                session_id=session_id,
                new_message=Content(role='user', parts=[Part(text=message_text)]),
                run_config=RunConfig(streaming_mode=StreamingMode.SSE),
            ):
                # Handle different event types from ADK multi-agent system
                
                # Check for agent delegation (when sub-agent starts working)
                if hasattr(event, 'agent_name') and event.agent_name != 'bloom_main_agent':
                    agent_name = None
                    agent_display = None
                    
                    if 'planner' in event.agent_name.lower():
                        agent_name = 'planner'
                        agent_display = 'Planner Agent'
                    elif 'farm' in event.agent_name.lower():
                        agent_name = 'farm' 
                        agent_display = 'Farm Agent'
                    elif 'market' in event.agent_name.lower():
                        agent_name = 'market'
                        agent_display = 'Market Agent'
                    
                    if agent_name:
                        agent_data = {
                            'type': 'agent_working',
                            'agent_name': agent_name,
                            'agent_display': agent_display
                        }
                        yield f"data: {json.dumps(agent_data)}\n\n"
                        logger.info(f"🤖 Sub-agent working: {agent_display}")

                # Handle content from agents
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        # Check if this part is a function call (tool usage)
                        if hasattr(part, 'function_call') and part.function_call:
                            tool_name = part.function_call.name
                            tool_data = {
                                'type': 'tool_call',
                                'tool_name': tool_name
                            }
                            yield f"data: {json.dumps(tool_data)}\n\n"
                            logger.info(f"🔧 Tool call detected: {tool_name}")
                            
                        elif hasattr(part, 'text') and part.text and event.partial:
                            # Regular text content
                            content = part.text
                            
                            # Determine which agent is responding
                            agent_name = None
                            agent_display = None
                            if hasattr(event, 'agent_name') and event.agent_name != 'bloom_main_agent':
                                if 'planner' in event.agent_name.lower():
                                    agent_name = 'planner'
                                    agent_display = 'Planner Agent'
                                elif 'farm' in event.agent_name.lower():
                                    agent_name = 'farm'
                                    agent_display = 'Farm Agent' 
                                elif 'market' in event.agent_name.lower():
                                    agent_name = 'market'
                                    agent_display = 'Market Agent'
                            
                            chunk_data = {
                                'type': 'content',
                                'content': content,
                                'agent_name': agent_name,
                                'agent_display': agent_display
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

@app.post("/upload-pdf", response_model=PDFUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Validate file type
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Read file content
        content = await file.read()
        
        # Extract text from PDF
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text_content = ""
        
        for page in pdf_reader.pages:
            text_content += page.extract_text() + "\n"
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Store the extracted text (in production, use proper database)
        pdf_context_store[file_id] = {
            "filename": file.filename,
            "content": text_content,
            "upload_time": asyncio.get_event_loop().time()
        }
        
        logger.info(f"📄 PDF processed: {file.filename} ({len(text_content)} characters)")
        
        return PDFUploadResponse(
            success=True,
            file_id=file_id,
            filename=file.filename or "unknown.pdf",
            text_length=len(text_content)
        )
        
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="healthy", version="1.0.0")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)