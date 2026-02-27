import os
from pathlib import Path

# Project root directory (NanoBananaUI/)
# config.py -> app/ -> backend/ -> NanoBananaUI/
PROJECT_ROOT = Path(__file__).parent.parent.parent

# Check if running in Docker (frontend is at /app/frontend/dist)
DOCKER_ROOT = Path("/app")
IS_DOCKER = DOCKER_ROOT.exists() and (DOCKER_ROOT / "frontend" / "dist").exists()

# Use Docker paths if running in Docker, otherwise use project paths
APP_ROOT = DOCKER_ROOT if IS_DOCKER else PROJECT_ROOT

# Vertex AI Configuration (support environment variables)
VERTEX_PROJECT_ID = os.getenv("VERTEX_PROJECT_ID", "sensoro-gemini")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION", "global")
VERTEX_MODEL_NAME = os.getenv("VERTEX_MODEL_NAME", "gemini-3-pro-image-preview")

# Available models
AVAILABLE_MODELS = [
    {"id": "gemini-3-pro-image-preview", "name": "Gemini 3 Pro Image"},
    {"id": "gemini-3.1-flash-image-preview", "name": "Gemini 3.1 Flash Image"},
]
DEFAULT_MODEL = VERTEX_MODEL_NAME

# Credentials path
# In Docker: /app/auth/sensoro-gemini-*.json
# Local: PROJECT_ROOT/auth/sensoro-gemini-*.json
AUTH_DIR = APP_ROOT / "auth"
CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if not CREDENTIALS_PATH:
    # Auto-detect credentials file in auth directory
    if AUTH_DIR.exists():
        cred_files = list(AUTH_DIR.glob("*.json"))
        if cred_files:
            CREDENTIALS_PATH = cred_files[0]
        else:
            CREDENTIALS_PATH = AUTH_DIR / "sensoro-gemini-7d73824224ec.json"
    else:
        CREDENTIALS_PATH = PROJECT_ROOT / "auth" / "sensoro-gemini-7d73824224ec.json"
else:
    CREDENTIALS_PATH = Path(CREDENTIALS_PATH)

# Frontend static files path (for Docker production)
FRONTEND_DIST_PATH = APP_ROOT / "frontend" / "dist"

# API Configuration
MAX_IMAGE_SIZE_MB = 10
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
