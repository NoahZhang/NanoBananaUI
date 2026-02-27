import { Globe } from 'lucide-react';

interface GoogleSearchToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function GoogleSearchToggle({
  value,
  onChange,
  disabled = false,
}: GoogleSearchToggleProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Google Search
      </label>
      <button
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={`w-full flex items-center gap-3 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
          value
            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
            : 'border-gray-200 text-gray-600 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Globe className="w-4 h-4" />
        <span>{value ? 'Enabled' : 'Disabled'}</span>
      </button>
    </div>
  );
}
