import { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Check } from 'lucide-react';
import { ModelInfo } from '../../services/api';

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ models, selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = models.find((m) => m.id === selectedModel);
  const displayName = current?.name || selectedModel || 'Select Model';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={ref}>
      <label className="block text-sm font-medium text-gray-700">Model</label>
      <div className="relative">
        <button
          className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
          } ${isOpen ? 'ring-2 ring-yellow-400 border-yellow-400' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-gray-800">{displayName}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {models.map((m) => (
              <button
                key={m.id}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                  m.id === selectedModel
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => {
                  onModelChange(m.id);
                  setIsOpen(false);
                }}
              >
                <div>
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-gray-400">{m.id}</div>
                </div>
                {m.id === selectedModel && <Check className="w-4 h-4 text-yellow-500" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
