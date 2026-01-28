import { useState } from 'react';
import { Download, Maximize2, ImageIcon, Loader2, X } from 'lucide-react';
import { GeneratedImage } from '../../hooks/useImageGeneration';

interface ImageGalleryProps {
  images: GeneratedImage[];
  selectedImage: GeneratedImage | null;
  onSelectImage: (image: GeneratedImage) => void;
  onDeleteImage: (id: string) => void;
  isGenerating: boolean;
}

export function ImageGallery({
  images,
  selectedImage,
  onSelectImage,
  onDeleteImage,
  isGenerating,
}: ImageGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleDownload = async (imageUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  // 空状态
  if (images.length === 0 && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <ImageIcon className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">No images generated yet</p>
        <p className="text-sm">Enter a prompt and click Generate to create images</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* 主图片展示区 */}
      <div className="flex-1 flex items-center justify-center p-8">
        {isGenerating && !selectedImage ? (
          // 生成中状态（还没有图片）
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Generating...</p>
          </div>
        ) : selectedImage ? (
          // 显示选中的图片
          <div className="relative group max-h-full">
            <img
              src={selectedImage.url}
              alt="Generated"
              className="max-h-[calc(100vh-200px)] max-w-full object-contain rounded-lg shadow-lg"
            />
            {/* 悬浮操作按钮 */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
              <button
                onClick={() => setLightboxImage(selectedImage.url)}
                className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title="Full screen"
              >
                <Maximize2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => handleDownload(selectedImage.url)}
                className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            {/* 生成中指示器 */}
            {isGenerating && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </div>
            )}
          </div>
        ) : (
          // 有图片但未选中（不应该出现）
          <div className="text-gray-400">Select an image from the list</div>
        )}
      </div>

      {/* 右侧缩略图列表 */}
      {images.length > 0 && (
        <div className="w-28 border-l border-gray-200 bg-white overflow-y-auto p-2">
          <div className="space-y-2">
            {images.map((img) => (
              <div
                key={img.id}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:opacity-80 ${
                  selectedImage?.id === img.id
                    ? 'border-yellow-500 shadow-md'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={img.url}
                  alt="Thumbnail"
                  className="w-full h-auto object-cover"
                  onClick={() => onSelectImage(img)}
                />
                {/* 删除按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(img.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  title="Delete"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* Lightbox 下载按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(lightboxImage);
            }}
            className="absolute bottom-4 right-4 p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Download"
          >
            <Download className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
}
