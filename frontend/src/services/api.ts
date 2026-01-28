export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];  // User uploaded images
  generatedImages?: string[];  // Model generated images
}

export interface ImageSettings {
  aspect_ratio?: string;  // 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
  resolution?: string;    // 1K, 2K, 4K
  number_of_images?: number;  // 1-4
}

export interface ChatRequest {
  message: string;
  images?: string[];
  history?: ChatMessage[];
  image_settings?: ImageSettings;
}

export const ASPECT_RATIOS = [
  { value: '', label: 'Auto' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '3:2', label: '3:2' },
  { value: '2:3', label: '2:3' },
  { value: '5:4', label: '5:4' },
  { value: '4:5', label: '4:5' },
  { value: '21:9', label: '21:9 (Ultrawide)' },
];

export const RESOLUTIONS = [
  { value: '', label: 'Auto' },
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

export interface ChatResponse {
  response: string;
  images?: string[];  // Generated images
  id: string;
}

export interface StreamChunk {
  chunk?: string;
  image?: string;  // Generated image
  done?: boolean;
  id?: string;
  error?: string;
}

export interface UploadResponse {
  filename: string;
  content_type: string;
  size_mb: number;
  base64: string;
}

// 检测是否在 Electron 生产环境中运行
const isElectronProd = typeof window !== 'undefined' &&
  (window as any).electronAPI?.isElectron &&
  !window.location.href.includes('localhost:5173');

// 在 Electron 生产环境中直接连接后端，否则使用代理
const API_BASE = isElectronProd ? 'http://127.0.0.1:8000/api' : '/api';

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to send message');
  }

  return response.json();
}

export async function* streamMessage(
  request: ChatRequest
): AsyncGenerator<StreamChunk, void, unknown> {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to send message');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield data as StreamChunk;
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload image');
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string; model: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}
