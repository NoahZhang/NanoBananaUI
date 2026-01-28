interface ResolutionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RESOLUTIONS = [
  { value: '', label: 'Auto' },
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
];

export function ResolutionSelector({
  value,
  onChange,
  disabled = false,
}: ResolutionSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Resolution
      </label>
      <div className="flex gap-2">
        {RESOLUTIONS.map((res) => (
          <button
            key={res.value || 'auto'}
            onClick={() => onChange(res.value)}
            disabled={disabled}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
              value === res.value
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {res.label}
          </button>
        ))}
      </div>
    </div>
  );
}
