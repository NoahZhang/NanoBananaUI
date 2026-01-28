import { ModeTabs } from './ModeTabs';
import { ModelSelector } from './ModelSelector';
import { ImageDropzone } from './ImageDropzone';
import { PromptInput } from './PromptInput';
import { AspectRatioSelector } from './AspectRatioSelector';
import { ResolutionSelector } from './ResolutionSelector';
import { ImageCountSelector } from './ImageCountSelector';
import { GenerateButton } from './GenerateButton';
import { GenerationMode } from '../../hooks/useImageGeneration';

interface ControlPanelProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  modelName?: string;
  referenceImages: string[];
  onAddReferenceImage: (imageBase64: string) => void;
  onRemoveReferenceImage: (index: number) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  resolution: string;
  onResolutionChange: (value: string) => void;
  imageCount: number;
  onImageCountChange: (value: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
}

export function ControlPanel({
  mode,
  onModeChange,
  modelName,
  referenceImages,
  onAddReferenceImage,
  onRemoveReferenceImage,
  prompt,
  onPromptChange,
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  imageCount,
  onImageCountChange,
  onGenerate,
  isGenerating,
  error,
}: ControlPanelProps) {
  return (
    <div className="w-[420px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Mode Tabs */}
        <ModeTabs mode={mode} onModeChange={onModeChange} />

        {/* Model Selector */}
        <ModelSelector modelName={modelName} />

        {/* Reference Images (only for image-to-image mode) */}
        {mode === 'image-to-image' && (
          <ImageDropzone
            images={referenceImages}
            onAddImage={onAddReferenceImage}
            onRemoveImage={onRemoveReferenceImage}
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
          disabled={isGenerating}
        />

        {/* Resolution Selector */}
        <ResolutionSelector
          value={resolution}
          onChange={onResolutionChange}
          disabled={isGenerating}
        />

        {/* Image Count Selector */}
        <ImageCountSelector
          value={imageCount}
          onChange={onImageCountChange}
          disabled={isGenerating}
        />

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
