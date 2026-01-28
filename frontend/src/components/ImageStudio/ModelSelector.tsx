import { Sparkles, ChevronDown } from 'lucide-react';

interface ModelSelectorProps {
  modelName?: string;
}

export function ModelSelector({ modelName = 'Nano Banana' }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Model</label>
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100 transition-colors"
        disabled
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-gray-800">{modelName}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}
