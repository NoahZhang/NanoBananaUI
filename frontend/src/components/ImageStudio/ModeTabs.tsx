import { ImageIcon, Type } from 'lucide-react';
import { GenerationMode } from '../../hooks/useImageGeneration';

interface ModeTabsProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

export function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onModeChange('image-to-image')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          mode === 'image-to-image'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <ImageIcon className="w-4 h-4" />
        Image to Image
      </button>
      <button
        onClick={() => onModeChange('text-to-image')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          mode === 'text-to-image'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Type className="w-4 h-4" />
        Text to Image
      </button>
    </div>
  );
}
