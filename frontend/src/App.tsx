import { useEffect, useState } from 'react';
import { ControlPanel, ImageGallery } from './components/ImageStudio';
import { useImageGeneration } from './hooks/useImageGeneration';
import { checkHealth, fetchModels, ModelInfo } from './services/api';
import { Banana, RefreshCw } from 'lucide-react';

function App() {
  const {
    mode,
    prompt,
    model: selectedModel,
    referenceImages,
    aspectRatio,
    resolution,
    thinkingLevel,
    googleSearch,
    generatedImages,
    selectedImage,
    isGenerating,
    error,
    handleModeChange,
    setPrompt,
    setModel,
    setMaskImage,
    setAspectRatio,
    setResolution,
    setThinkingLevel,
    setGoogleSearch,
    setSelectedImage,
    addReferenceImage,
    removeReferenceImage,
    removeGeneratedImage,
    generate,
    clearAll,
  } = useImageGeneration();

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [, modelsData] = await Promise.all([checkHealth(), fetchModels()]);
        setIsConnected(true);
        setModels(modelsData.models);
        if (!selectedModel) {
          setModel(modelsData.default);
        }
      } catch {
        setIsConnected(false);
      }
    };

    init();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banana className="w-8 h-8 text-yellow-500" />
          <h1 className="text-xl font-bold text-gray-800">NanoBananaUI</h1>
          {selectedModel && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {models.find((m) => m.id === selectedModel)?.name || selectedModel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected === null
                  ? 'bg-gray-400'
                  : isConnected
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected === null
                ? 'Connecting...'
                : isConnected
                ? 'Connected'
                : 'Disconnected'}
            </span>
          </div>

          {/* Clear button */}
          <button
            onClick={clearAll}
            disabled={isGenerating}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <ControlPanel
          mode={mode}
          onModeChange={handleModeChange}
          models={models}
          selectedModel={selectedModel}
          onModelChange={setModel}
          referenceImages={referenceImages}
          onAddReferenceImage={addReferenceImage}
          onRemoveReferenceImage={removeReferenceImage}
          onMaskChange={setMaskImage}
          prompt={prompt}
          onPromptChange={setPrompt}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          resolution={resolution}
          onResolutionChange={setResolution}
          thinkingLevel={thinkingLevel}
          onThinkingLevelChange={setThinkingLevel}
          googleSearch={googleSearch}
          onGoogleSearchChange={setGoogleSearch}
          onGenerate={generate}
          isGenerating={isGenerating}
          error={error}
        />

        {/* Right Image Gallery */}
        <div className="flex-1 bg-gray-50">
          <ImageGallery
            images={generatedImages}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
            onDeleteImage={removeGeneratedImage}
            isGenerating={isGenerating}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
