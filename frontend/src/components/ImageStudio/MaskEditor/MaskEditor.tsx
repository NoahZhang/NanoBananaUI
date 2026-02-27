import { useRef, useEffect, useState, useCallback } from 'react';
import { MaskCanvas } from './MaskCanvas';
import { MaskToolbar } from './MaskToolbar';
import { useMaskEditor } from '../../../hooks/useMaskEditor';

interface MaskEditorProps {
  sourceImage: string;
  onMaskChange: (mask: string) => void;
  disabled?: boolean;
}

export function MaskEditor({ sourceImage, onMaskChange, disabled }: MaskEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    tool,
    brushSize,
    shapes,
    canUndo,
    canRedo,
    stageRef,
    setTool,
    setBrushSize,
    addShape,
    undo,
    redo,
    clearAll,
    reset,
    exportMask,
  } = useMaskEditor();

  // 图片变化时重置遮罩并加载图片尺寸
  useEffect(() => {
    console.log('[MaskEditor] sourceImage changed, resetting...');
    // 先重置状态
    reset();
    setImageLoaded(false);

    // 然后加载图片获取尺寸
    const img = new Image();
    img.onload = () => {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      console.log('[MaskEditor] Image loaded:', naturalW, 'x', naturalH);
      // 保存原始尺寸
      setOriginalDimensions({ width: naturalW, height: naturalH });

      // 根据容器大小计算显示尺寸，保持宽高比
      const container = containerRef.current;
      console.log('[MaskEditor] Container:', container?.clientWidth);
      if (!container) {
        console.error('[MaskEditor] Container ref is null!');
        // 使用默认宽度
        const maxWidth = 350;
        const maxHeight = 300;
        const scale = Math.min(maxWidth / naturalW, maxHeight / naturalH, 1);
        setDimensions({
          width: naturalW * scale,
          height: naturalH * scale,
        });
        setImageLoaded(true);
        return;
      }

      const maxWidth = container.clientWidth - 16;
      const maxHeight = 300;
      const scale = Math.min(maxWidth / naturalW, maxHeight / naturalH, 1);

      console.log('[MaskEditor] Display dimensions:', naturalW * scale, 'x', naturalH * scale);
      setDimensions({
        width: naturalW * scale,
        height: naturalH * scale,
      });
      setImageLoaded(true);
    };
    img.onerror = (e) => {
      console.error('[MaskEditor] Failed to load image:', e);
    };
    img.src = sourceImage;
  }, [sourceImage, reset]);

  // 遮罩变化时导出
  useEffect(() => {
    if (imageLoaded && shapes.length > 0) {
      exportMask(
        originalDimensions.width,
        originalDimensions.height,
        dimensions.width,
        dimensions.height,
        sourceImage
      ).then((mask) => {
        onMaskChange(mask);
      });
    } else if (shapes.length === 0) {
      onMaskChange('');
    }
  }, [shapes, imageLoaded, exportMask, onMaskChange, originalDimensions, dimensions, sourceImage]);

  // 下载遮罩图片
  const handleDownloadMask = useCallback(async () => {
    if (!imageLoaded || shapes.length === 0) return;

    const mask = await exportMask(
      originalDimensions.width,
      originalDimensions.height,
      dimensions.width,
      dimensions.height,
      sourceImage
    );

    if (mask) {
      const link = document.createElement('a');
      link.href = mask;
      link.download = `mask-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [imageLoaded, shapes, exportMask, originalDimensions, dimensions, sourceImage]);

  // 键盘快捷键
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    },
    [disabled, undo, redo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!imageLoaded) {
    return (
      <div ref={containerRef} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Draw Mask Area</label>
        <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Draw Mask Area</label>

      {/* 工具栏 */}
      <MaskToolbar
        tool={tool}
        brushSize={brushSize}
        canUndo={canUndo}
        canRedo={canRedo}
        onToolChange={setTool}
        onBrushSizeChange={setBrushSize}
        onUndo={undo}
        onRedo={redo}
        onClear={clearAll}
        onDownloadMask={handleDownloadMask}
        disabled={disabled}
      />

      {/* Canvas 画布 */}
      <MaskCanvas
        sourceImage={sourceImage}
        width={dimensions.width}
        height={dimensions.height}
        tool={tool}
        brushSize={brushSize}
        shapes={shapes}
        onAddShape={addShape}
        stageRef={stageRef}
        disabled={disabled}
      />

      <p className="text-xs text-gray-500">
        Draw on the image to mark areas for AI to regenerate. Red areas will be replaced.
      </p>
    </div>
  );
}
