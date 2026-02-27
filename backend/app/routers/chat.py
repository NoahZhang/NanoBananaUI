import uuid
import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException, UploadFile, File
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    HealthResponse,
    ModelInfo,
    ModelsResponse,
)
from app.services.vertex_ai import vertex_ai_service
from app.config import MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_TYPES, VERTEX_MODEL_NAME, AVAILABLE_MODELS, DEFAULT_MODEL

router = APIRouter(prefix="/api", tags=["chat"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", model=VERTEX_MODEL_NAME)


@router.get("/models", response_model=ModelsResponse)
async def list_models():
    """List available models."""
    return ModelsResponse(
        models=[ModelInfo(**m) for m in AVAILABLE_MODELS],
        default=DEFAULT_MODEL,
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Non-streaming chat endpoint."""
    try:
        # Convert history to dict format
        history = None
        if request.history:
            history = [msg.model_dump() for msg in request.history]

        # Extract image settings
        aspect_ratio = None
        resolution = None
        if request.image_settings:
            aspect_ratio = request.image_settings.aspect_ratio
            resolution = request.image_settings.resolution

        model = request.model or DEFAULT_MODEL

        response_text, response_images = await vertex_ai_service.generate_response(
            message=request.message,
            images=request.images,
            history=history,
            aspect_ratio=aspect_ratio,
            resolution=resolution,
            model=model,
        )

        return ChatResponse(
            response=response_text,
            images=response_images if response_images else None,
            id=str(uuid.uuid4()),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming chat endpoint using Server-Sent Events."""
    print(f"[chat_stream] Received request: message={request.message[:100] if len(request.message) > 100 else request.message}")
    print(f"[chat_stream] image_settings={request.image_settings}")

    async def event_generator() -> AsyncGenerator[dict, None]:
        try:
            # Convert history to dict format
            history = None
            if request.history:
                history = [msg.model_dump() for msg in request.history]

            # Extract image settings
            aspect_ratio = None
            resolution = None
            if request.image_settings:
                aspect_ratio = request.image_settings.aspect_ratio
                resolution = request.image_settings.resolution

            model = request.model or DEFAULT_MODEL
            print(f"[chat_stream] Calling vertex_ai_service.generate_stream with model={model}...")
            response_id = str(uuid.uuid4())

            async for chunk in vertex_ai_service.generate_stream(
                message=request.message,
                images=request.images,
                history=history,
                aspect_ratio=aspect_ratio,
                resolution=resolution,
                model=model,
            ):
                if "text" in chunk:
                    print(f"[chat_stream] Sending text chunk to client")
                    yield {
                        "event": "message",
                        "data": json.dumps({"chunk": chunk["text"]}),
                    }
                elif "image" in chunk:
                    print(f"[chat_stream] Sending image chunk to client")
                    yield {
                        "event": "message",
                        "data": json.dumps({"image": chunk["image"]}),
                    }

            # Send completion message
            print(f"[chat_stream] Sending done message")
            yield {
                "event": "message",
                "data": json.dumps({"done": True, "id": response_id}),
            }

        except Exception as e:
            print(f"[chat_stream] Error: {e}")
            yield {
                "event": "message",
                "data": json.dumps({"error": str(e), "done": True}),
            }

    return EventSourceResponse(event_generator())


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload and validate an image file."""
    # Check file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    # Read file content
    content = await file.read()

    # Check file size
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_IMAGE_SIZE_MB}MB",
        )

    # Convert to base64
    import base64

    base64_content = base64.b64encode(content).decode("utf-8")

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size_mb": round(size_mb, 2),
        "base64": f"data:{file.content_type};base64,{base64_content}",
    }
