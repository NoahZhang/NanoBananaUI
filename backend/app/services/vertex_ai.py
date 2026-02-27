import base64
from typing import AsyncGenerator

from google import genai
from google.genai import types
from google.oauth2 import service_account

from app.config import (
    VERTEX_PROJECT_ID,
    VERTEX_LOCATION,
    VERTEX_MODEL_NAME,
    CREDENTIALS_PATH,
)


class VertexAIService:
    def __init__(self):
        self._client: genai.Client | None = None
        self._initialized = False

    def initialize(self):
        """Initialize Google GenAI client with service account credentials."""
        if self._initialized:
            return

        # Load service account credentials
        credentials = service_account.Credentials.from_service_account_file(
            str(CREDENTIALS_PATH),
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )

        # Initialize the client for Vertex AI
        self._client = genai.Client(
            vertexai=True,
            project=VERTEX_PROJECT_ID,
            location=VERTEX_LOCATION,
            credentials=credentials,
        )
        self._initialized = True

    def _build_contents(
        self, message: str, images: list[str] | None = None, is_image_generation: bool = True
    ) -> list[types.Part]:
        """Build multimodal content from text and images."""
        parts = []

        # Add images first if present
        if images:
            for img_base64 in images:
                # Remove data URL prefix if present
                mime_type = "image/jpeg"
                if img_base64.startswith("data:"):
                    # Extract mime type and base64 data
                    header, img_base64 = img_base64.split(",", 1)
                    if "image/png" in header:
                        mime_type = "image/png"
                    elif "image/webp" in header:
                        mime_type = "image/webp"
                    elif "image/gif" in header:
                        mime_type = "image/gif"

                # Decode base64 to bytes
                img_bytes = base64.b64decode(img_base64)
                parts.append(types.Part.from_bytes(data=img_bytes, mime_type=mime_type))

        # Add text message with image generation instruction
        if is_image_generation:
            prompt = f"Generate an image: {message}"
        else:
            prompt = message
        parts.append(types.Part.from_text(text=prompt))

        return parts

    def _build_history(
        self, history: list[dict] | None
    ) -> list[types.Content] | None:
        """Build conversation history for the model."""
        if not history:
            return None

        contents = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            parts = self._build_contents(msg["content"], msg.get("images"))
            contents.append(types.Content(role=role, parts=parts))

        return contents

    def _build_config(
        self,
        aspect_ratio: str | None = None,
        resolution: str | None = None,
    ) -> types.GenerateContentConfig:
        """Build generation config with image settings."""
        # Build image config if any image settings are provided
        image_config = None
        if aspect_ratio or resolution:
            image_config_params = {}
            if aspect_ratio:
                image_config_params["aspect_ratio"] = aspect_ratio
            if resolution:
                # resolution uses image_size parameter with values: 1K, 2K, 4K
                image_config_params["image_size"] = resolution
            image_config = types.ImageConfig(**image_config_params)

        return types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            image_config=image_config,
        )

    def _extract_response(self, response) -> tuple[str, list[str]]:
        """Extract text and images from model response."""
        text_parts = []
        image_parts = []

        for part in response.candidates[0].content.parts:
            if part.text:
                text_parts.append(part.text)
            elif part.inline_data:
                # Convert image to base64 data URL
                img_data = part.inline_data
                b64_data = base64.b64encode(img_data.data).decode("utf-8")
                data_url = f"data:{img_data.mime_type};base64,{b64_data}"
                image_parts.append(data_url)

        return "\n".join(text_parts), image_parts

    async def generate_response(
        self,
        message: str,
        images: list[str] | None = None,
        history: list[dict] | None = None,
        aspect_ratio: str | None = None,
        resolution: str | None = None,
        model: str | None = None,
    ) -> tuple[str, list[str]]:
        """Generate a non-streaming response. Returns (text, images)."""
        self.initialize()

        # Build the content and config
        parts = self._build_contents(message, images)
        history_contents = self._build_history(history)
        config = self._build_config(aspect_ratio, resolution)

        # Build full contents list
        if history_contents:
            contents = history_contents + [
                types.Content(role="user", parts=parts)
            ]
        else:
            contents = parts

        # Generate response
        response = self._client.models.generate_content(
            model=model or VERTEX_MODEL_NAME,
            contents=contents,
            config=config,
        )

        return self._extract_response(response)

    async def generate_stream(
        self,
        message: str,
        images: list[str] | None = None,
        history: list[dict] | None = None,
        aspect_ratio: str | None = None,
        resolution: str | None = None,
        model: str | None = None,
    ) -> AsyncGenerator[dict, None]:
        """Generate a streaming response. Yields {text, images} chunks."""
        print(f"[generate_stream] Starting generation with message: {message[:100]}...")
        print(f"[generate_stream] aspect_ratio={aspect_ratio}, resolution={resolution}")

        self.initialize()

        # Build the content and config
        parts = self._build_contents(message, images)
        history_contents = self._build_history(history)
        config = self._build_config(aspect_ratio, resolution)
        print(f"[generate_stream] Config: {config}")

        # Build full contents list
        if history_contents:
            contents = history_contents + [
                types.Content(role="user", parts=parts)
            ]
        else:
            contents = parts

        # Generate streaming response
        use_model = model or VERTEX_MODEL_NAME
        print(f"[generate_stream] Calling generate_content_stream with model={use_model}...")
        chunk_count = 0
        for chunk in self._client.models.generate_content_stream(
            model=use_model,
            contents=contents,
            config=config,
        ):
            chunk_count += 1
            print(f"[generate_stream] Received chunk #{chunk_count}")

            if chunk.candidates and chunk.candidates[0].content.parts:
                for part in chunk.candidates[0].content.parts:
                    if part.text:
                        print(f"[generate_stream] Text part: {part.text[:100] if len(part.text) > 100 else part.text}")
                        yield {"text": part.text}
                    elif part.inline_data:
                        print(f"[generate_stream] Image part received! mime_type={part.inline_data.mime_type}")
                        img_data = part.inline_data
                        b64_data = base64.b64encode(img_data.data).decode("utf-8")
                        data_url = f"data:{img_data.mime_type};base64,{b64_data}"
                        yield {"image": data_url}
                    else:
                        print(f"[generate_stream] Unknown part type: {part}")
            else:
                print(f"[generate_stream] Chunk has no candidates or parts: {chunk}")

        print(f"[generate_stream] Done. Total chunks: {chunk_count}")


# Singleton instance
vertex_ai_service = VertexAIService()
