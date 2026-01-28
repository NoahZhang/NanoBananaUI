interface AspectRatioSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ASPECT_RATIOS = [
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

export function AspectRatioSelector({
  value,
  onChange,
  disabled = false,
}: AspectRatioSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Aspect Ratio
      </label>
      <div className="grid grid-cols-6 gap-2">
        {ASPECT_RATIOS.map((ratio) => (
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
