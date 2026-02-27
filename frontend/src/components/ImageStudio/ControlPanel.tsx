import { ModeTabs } from './ModeTabs';
import { ModelSelector } from './ModelSelector';
import { ImageDropzone } from './ImageDropzone';
import { MaskEditor } from './MaskEditor';
import { PromptInput } from './PromptInput';
import { AspectRatioSelector } from './AspectRatioSelector';
import { ResolutionSelector } from './ResolutionSelector';
import { ThinkingLevelSelector } from './ThinkingLevelSelector';
import { GoogleSearchToggle } from './GoogleSearchToggle';
import { GenerateButton } from './GenerateButton';
import { GenerationMode } from '../../hooks/useImageGeneration';
import { ModelInfo, getModelConfig } from '../../services/api';

interface ControlPanelProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  models: ModelInfo[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  referenceImages: string[];
  onAddReferenceImage: (imageBase64: string) => void;
  onRemoveReferenceImage: (index: number) => void;
  onMaskChange: (mask: string) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  resolution: string;
  onResolutionChange: (value: string) => void;
  thinkingLevel: string;
  onThinkingLevelChange: (value: string) => void;
  googleSearch: boolean;
  onGoogleSearchChange: (value: boolean) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
}

export function ControlPanel({
  mode,
  onModeChange,
  models,
  selectedModel,
  onModelChange,
  referenceImages,
  onAddReferenceImage,
  onRemoveReferenceImage,
  onMaskChange,
  prompt,
  onPromptChange,
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  thinkingLevel,
  onThinkingLevelChange,
  googleSearch,
  onGoogleSearchChange,
  onGenerate,
  isGenerating,
  error,
}: ControlPanelProps) {
  const modelConfig = getModelConfig(selectedModel);

  return (
    <div className="w-[420px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Mode Tabs */}
        <ModeTabs mode={mode} onModeChange={onModeChange} />

        {/* Model Selector */}
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          disabled={isGenerating}
        />

        {/* Reference Images (only for image-to-image mode) */}
        {mode === 'image-to-image' && (
          <ImageDropzone
            images={referenceImages}
            onAddImage={onAddReferenceImage}
            onRemoveImage={onRemoveReferenceImage}
            disabled={isGenerating}
          />
        )}

        {/* Mask Editor (only for image-to-image mode with uploaded image) */}
        {mode === 'image-to-image' && referenceImages.length > 0 && (
          <MaskEditor
            sourceImage={referenceImages[0]}
            onMaskChange={onMaskChange}
            disabled={isGenerating}
          />
        )}

        {/* Prompt Input */}
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
          mode={mode}
          disabled={isGenerating}
        />

        {/* Aspect Ratio Selector */}
        <AspectRatioSelector
          value={aspectRatio}
          onChange={onAspectRatioChange}
          options={modelConfig.aspectRatios}
          disabled={isGenerating}
        />

        {/* Resolution Selector */}
        <ResolutionSelector
          value={resolution}
          onChange={onResolutionChange}
          options={modelConfig.resolutions}
          disabled={isGenerating}
        />

        {/* Thinking Level (Flash model only) */}
        {modelConfig.supportsThinking && (
          <ThinkingLevelSelector
            value={thinkingLevel}
            onChange={onThinkingLevelChange}
            disabled={isGenerating}
          />
        )}

        {/* Google Search (Flash model only) */}
        {modelConfig.supportsGoogleSearch && (
          <GoogleSearchToggle
            value={googleSearch}
            onChange={onGoogleSearchChange}
            disabled={isGenerating}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="p-6 border-t border-gray-200">
        <GenerateButton
          onClick={onGenerate}
          isGenerating={isGenerating}
          disabled={!prompt.trim()}
        />
      </div>
    </div>
  );
}
