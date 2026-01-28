import { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadImage } from '../../services/api';

interface ImageDropzoneProps {
  images: string[];
  onAddImage: (imageBase64: string) => void;
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
}

export function ImageDropzone({
  images,
  onAddImage,
  onRemoveImage,
  disabled = false,
}: ImageDropzoneProps) {
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      for (const file of files) {
        try {
          const response = await uploadImage(file);
          onAddImage(response.base64);
        } catch (err) {
          console.error('Failed to upload image:', err);
        }
      }
    },
    [onAddImage, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = Array.from(e.target.files || []);
      for (const file of files) {
        try {
          const response = await uploadImage(file);
          onAddImage(response.base64);
        } catch (err) {
          console.error('Failed to upload image:', err);
        }
      }
      e.target.value = '';
    },
    [onAddImage, disabled]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Reference Images
      </label>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Reference ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => onRemoveImage(index)}
                disabled={disabled}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-yellow-400 cursor-pointer'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <Upload
          className={`w-8 h-8 mx-auto mb-2 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`}
        />
        <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          Drag and drop images here
        </p>
        <p className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
          or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Supports: JPG, PNG, WebP (Max 10MB)
        </p>
      </div>
    </div>
  );
}
