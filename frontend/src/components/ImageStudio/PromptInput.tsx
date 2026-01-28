import { GenerationMode } from '../../hooks/useImageGeneration';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  mode: GenerationMode;
  disabled?: boolean;
  maxLength?: number;
}

export function PromptInput({
  value,
  onChange,
  mode,
  disabled = false,
  maxLength = 3000,
}: PromptInputProps) {
  const placeholder =
    mode === 'text-to-image'
      ? 'Describe what you want to generate...'
      : 'Describe how to transform the image...';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Prompt</label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <span className="absolute bottom-3 right-3 text-xs text-gray-400">
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}
