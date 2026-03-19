from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    images: Optional[list[str]] = None  # Base64 encoded images


class ImageSettings(BaseModel):
    aspect_ratio: Optional[str] = None  # 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
    resolution: Optional[str] = None  # 1K, 2K, 4K
    thinking_level: Optional[str] = None  # "minimal" or "high" (Flash model only)
    google_search: Optional[bool] = None  # Enable Google Search grounding (Flash model only)


class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = None  # Model ID, e.g. "gemini-3-pro-image-preview"
    images: Optional[list[str]] = None  # Base64 encoded images
    history: Optional[list[ChatMessage]] = None
    image_settings: Optional[ImageSettings] = None


class ModelInfo(BaseModel):
    id: str
    name: str


class ModelsResponse(BaseModel):
    models: list[ModelInfo]
    default: str


class ChatResponse(BaseModel):
    response: str
    images: Optional[list[str]] = None  # Generated images from model
    id: str


class StreamChunk(BaseModel):
    chunk: Optional[str] = None  # Text chunk
    image: Optional[str] = None  # Generated image (base64 data URL)
    done: bool = False
    id: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model: str
    auth_mode: str
