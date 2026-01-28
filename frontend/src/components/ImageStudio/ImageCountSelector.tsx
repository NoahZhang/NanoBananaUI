interface ImageCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const IMAGE_COUNTS = [1, 2, 3, 4];

export function ImageCountSelector({
  value,
  onChange,
  disabled = false,
}: ImageCountSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Number of Images
      </label>
      <div className="flex gap-2">
        {IMAGE_COUNTS.map((count) => (
          <button
            key={count}
            onClick={() => onChange(count)}
            disabled={disabled}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
              value === count
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}
