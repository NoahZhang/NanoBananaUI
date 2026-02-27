import { useState, useCallback } from 'react';
import { ImageSettings, streamMessage } from '../services/api';

export type GenerationMode = 'image-to-image' | 'text-to-image';

export interface GeneratedImage {
  id: string;
  url: string;
  timestamp: Date;
}

export interface GenerationState {
  mode: GenerationMode;
  prompt: string;
  referenceImages: string[];
  aspectRatio: string;
  resolution: string;
  imageCount: number;
  generatedImages: GeneratedImage[];
  isGenerating: boolean;
  error: string | null;
}

export function useImageGeneration() {
  const [mode, setMode] = useState<GenerationMode>('text-to-image');
  const [prompt, setPrompt] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState('');
  const [resolution, setResolution] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [maskImage, setMaskImage] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [thinkingLevel, setThinkingLevel] = useState<string>('minimal');
  const [googleSearch, setGoogleSearch] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 切换模式时清空 prompt 和参考图片
  const handleModeChange = useCallback((newMode: GenerationMode) => {
    setMode(newMode);
    setPrompt('');
    setReferenceImages([]);
    setMaskImage('');
    setError(null);
  }, []);

  const addReferenceImage = useCallback((imageBase64: string) => {
    setReferenceImages((prev) => [...prev, imageBase64]);
  }, []);

  const removeReferenceImage = useCallback((index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearReferenceImages = useCallback(() => {
    setReferenceImages([]);
  }, []);

  const generate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (mode === 'image-to-image' && referenceImages.length === 0) {
      setError('Please upload at least one reference image');
      return;
    }

    setIsGenerating(true);
    setError(null);
    // 只清空当前选中的图片，保留缩略图列表
    setSelectedImage(null);

    try {
      const settings: ImageSettings = {};
      if (aspectRatio) {
        settings.aspect_ratio = aspectRatio;
      }
      if (resolution) {
        settings.resolution = resolution;
      }
      if (thinkingLevel && thinkingLevel !== 'minimal') {
        settings.thinking_level = thinkingLevel;
      }
      if (googleSearch) {
        settings.google_search = true;
      }
      const newImages: GeneratedImage[] = [];

      // 如果有遮罩图（合成图），使用合成图；否则使用原图
      const imagesToSend = mode === 'image-to-image'
        ? (maskImage ? [maskImage] : referenceImages)
        : undefined;

      for await (const chunk of streamMessage({
        message: prompt,
        model: model || undefined,
        images: imagesToSend,
        image_settings: Object.keys(settings).length > 0 ? settings : undefined,
      })) {
        console.log('Received chunk:', chunk);

        if (chunk.error) {
          throw new Error(chunk.error);
        }

        if (chunk.chunk) {
          console.log('Text chunk:', chunk.chunk);
        }

        if (chunk.image) {
          console.log('Image received!', chunk.image.substring(0, 100) + '...');
          const newImage: GeneratedImage = {
            id: crypto.randomUUID(),
            url: chunk.image,
            timestamp: new Date(),
          };
          newImages.push(newImage);
          setGeneratedImages((prev) => [...prev, newImage]);
          setSelectedImage(newImage);  // 自动选中新生成的图片
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during generation';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, mode, model, referenceImages, maskImage, aspectRatio, resolution, thinkingLevel, googleSearch]);

  const removeGeneratedImage = useCallback((id: string) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== id));
    // 如果删除的是当前选中的图片，选中列表中的下一张
    setSelectedImage((current) => {
      if (current?.id === id) {
        const remaining = generatedImages.filter((img) => img.id !== id);
        return remaining.length > 0 ? remaining[remaining.length - 1] : null;
      }
      return current;
    });
  }, [generatedImages]);

  const clearGenerated = useCallback(() => {
    setGeneratedImages([]);
    setError(null);
  }, []);

  const clearAll = useCallback(() => {
    setPrompt('');
    setReferenceImages([]);
    setMaskImage('');
    setGeneratedImages([]);
    setError(null);
  }, []);

  return {
    // State
    mode,
    prompt,
    model,
    referenceImages,
    maskImage,
    aspectRatio,
    resolution,
    thinkingLevel,
    googleSearch,
    generatedImages,
    selectedImage,
    isGenerating,
    error,
    // Setters
    handleModeChange,
    setPrompt,
    setModel,
    setMaskImage,
    setAspectRatio,
    setResolution,
    setThinkingLevel,
    setGoogleSearch,
    setSelectedImage,
    // Actions
    addReferenceImage,
    removeReferenceImage,
    clearReferenceImages,
    generate,
    removeGeneratedImage,
    clearGenerated,
    clearAll,
  };
}
