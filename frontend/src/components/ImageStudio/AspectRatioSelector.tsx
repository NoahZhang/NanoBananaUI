import { AspectRatioOption } from '../../services/api';

interface AspectRatioSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: AspectRatioOption[];
  disabled?: boolean;
}

export function AspectRatioSelector({
  value,
  onChange,
  options,
  disabled = false,
}: AspectRatioSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Aspect Ratio
      </label>
      <div className="grid grid-cols-6 gap-2">
        {options.map((ratio) => (
          <button
            key={ratio.value || 'auto'}
            onClick={() => onChange(ratio.value)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors ${
              value === ratio.value
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`bg-gray-400 rounded-sm ${
                value === ratio.value ? 'bg-yellow-500' : ''
              }`}
              style={{
                width: `${ratio.width}px`,
                height: `${ratio.height}px`,
              }}
            />
            <span className="text-xs mt-1 text-gray-600">{ratio.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
