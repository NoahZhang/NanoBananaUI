# NanoBananaUI Docker Image
# 单一镜像包含前端 + 后端 + 认证文件

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ ./

# Build production bundle
RUN npm run build

# ============================================
# Stage 2: Python Backend + Static Files + Auth
# ============================================
FROM python:3.11-slim

LABEL maintainer="NanoBanana"
LABEL description="NanoBananaUI - AI Image Generation Studio"
LABEL version="1.0.0"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend \
    # Default Vertex AI settings (can be overridden at runtime)
    VERTEX_PROJECT_ID=sensoro-gemini \
    VERTEX_LOCATION=global \
    VERTEX_MODEL_NAME=gemini-3-pro-image-preview

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/app ./backend/app

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy auth credentials into image
COPY auth/ ./auth/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
