from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    images: Optional[list[str]] = None  # Base64 encoded images


class ImageSettings(BaseModel):
    aspect_ratio: Optional[str] = None  # 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
    resolution: Optional[str] = None  # 1K, 2K, 4K
    number_of_images: Optional[int] = None  # 1-4


class ChatRequest(BaseModel):
    message: str
    images: Optional[list[str]] = None  # Base64 encoded images
    history: Optional[list[ChatMessage]] = None
    image_settings: Optional[ImageSettings] = None


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
