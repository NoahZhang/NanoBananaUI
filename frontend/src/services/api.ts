export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];  // User uploaded images
  generatedImages?: string[];  // Model generated images
}

export interface ImageSettings {
  aspect_ratio?: string;
  resolution?: string;
  thinking_level?: string;  // "minimal" or "high" (Flash model only)
  google_search?: boolean;  // Enable Google Search grounding (Flash model only)
}

export interface ChatRequest {
  message: string;
  model?: string;  // Model ID
  images?: string[];  // 原图或带遮罩的合成图
  history?: ChatMessage[];
  image_settings?: ImageSettings;
}

export interface ModelInfo {
  id: string;
  name: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
  default: string;
}

// Per-model aspect ratio and resolution options
export interface AspectRatioOption {
  value: string;
  label: string;
  width: number;
  height: number;
}

export interface ResolutionOption {
  value: string;
  label: string;
}

const BASE_ASPECT_RATIOS: AspectRatioOption[] = [
  { value: '', label: 'Auto', width: 16, height: 16 },
  { value: '1:1', label: '1:1', width: 16, height: 16 },
  { value: '16:9', label: '16:9', width: 20, height: 11 },
  { value: '9:16', label: '9:16', width: 11, height: 20 },
  { value: '4:3', label: '4:3', width: 18, height: 14 },
  { value: '3:4', label: '3:4', width: 14, height: 18 },
  { value: '3:2', label: '3:2', width: 18, height: 12 },
  { value: '2:3', label: '2:3', width: 12, height: 18 },
  { value: '5:4', label: '5:4', width: 18, height: 14 },
  { value: '4:5', label: '4:5', width: 14, height: 18 },
  { value: '21:9', label: '21:9', width: 24, height: 10 },
];

const FLASH_EXTRA_ASPECT_RATIOS: AspectRatioOption[] = [
  { value: '4:1', label: '4:1', width: 24, height: 6 },
  { value: '1:4', label: '1:4', width: 6, height: 24 },
  { value: '8:1', label: '8:1', width: 24, height: 3 },
  { value: '1:8', label: '1:8', width: 3, height: 24 },
];

const BASE_RESOLUTIONS: ResolutionOption[] = [
  { value: '', label: 'Auto' },
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

export interface ModelConfig {
  aspectRatios: AspectRatioOption[];
  resolutions: ResolutionOption[];
  supportsThinking: boolean;
  supportsGoogleSearch: boolean;
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gemini-3-pro-image-preview': {
    aspectRatios: BASE_ASPECT_RATIOS,
    resolutions: BASE_RESOLUTIONS,
    supportsThinking: false,
    supportsGoogleSearch: false,
  },
  'gemini-3.1-flash-image-preview': {
    aspectRatios: [...BASE_ASPECT_RATIOS, ...FLASH_EXTRA_ASPECT_RATIOS],
    resolutions: [
      { value: '', label: 'Auto' },
      { value: '0.5K', label: '0.5K' },
      { value: '1K', label: '1K' },
      { value: '2K', label: '2K' },
      { value: '4K', label: '4K' },
    ],
    supportsThinking: true,
    supportsGoogleSearch: true,
  },
};

export const DEFAULT_MODEL_CONFIG: ModelConfig = MODEL_CONFIGS['gemini-3-pro-image-preview'];

export function getModelConfig(modelId: string): ModelConfig {
  return MODEL_CONFIGS[modelId] || DEFAULT_MODEL_CONFIG;
}

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

export async function fetchModels(): Promise<ModelsResponse> {
  const response = await fetch(`${API_BASE}/models`);
  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }
  return response.json();
}
