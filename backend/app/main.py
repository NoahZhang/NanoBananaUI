from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.routers import chat
from app.config import FRONTEND_DIST_PATH, IS_DOCKER

app = FastAPI(
    title="NanoBananaUI API",
    description="Multimodal chat API powered by Vertex AI",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)

# Serve frontend static files in Docker/production mode
if IS_DOCKER and FRONTEND_DIST_PATH.exists():
    # Mount static assets
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST_PATH / "assets"), name="assets")

    # Serve index.html for all non-API routes (SPA support)
    @app.get("/")
    async def serve_root():
        return FileResponse(FRONTEND_DIST_PATH / "index.html")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Don't serve index.html for API routes
        if full_path.startswith("api/"):
            return {"error": "Not found"}

        # Check if file exists in dist
        file_path = FRONTEND_DIST_PATH / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)

        # Return index.html for SPA routing
        return FileResponse(FRONTEND_DIST_PATH / "index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "NanoBananaUI API", "docs": "/docs"}
