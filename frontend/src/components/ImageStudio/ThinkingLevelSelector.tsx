interface ThinkingLevelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const THINKING_LEVELS = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'high', label: 'High' },
];

export function ThinkingLevelSelector({
  value,
  onChange,
  disabled = false,
}: ThinkingLevelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Thinking Level
      </label>
      <div className="flex gap-2">
        {THINKING_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            disabled={disabled}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
              value === level.value
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
