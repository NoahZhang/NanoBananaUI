import { useState, useCallback, useRef } from 'react';
import { DrawingTool, MaskShape } from '../components/ImageStudio/MaskEditor/types';

const MAX_HISTORY = 50;

export function useMaskEditor() {
  const [tool, setTool] = useState<DrawingTool>('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [shapes, setShapes] = useState<MaskShape[]>([]);
  const [history, setHistory] = useState<MaskShape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const stageRef = useRef<any>(null);

  // 添加形状
  const addShape = useCallback(
    (shape: MaskShape) => {
      console.log('[addShape] Adding shape:', shape.type, shape);
      const newShapes = [...shapes, shape];
      setShapes(newShapes);
      console.log('[addShape] Total shapes:', newShapes.length);

      // 更新历史记录
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newShapes);
      // 限制历史记录数量
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [shapes, history, historyIndex]
  );

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  // 清除全部
  const clearAll = useCallback(() => {
    setShapes([]);
    const newHistory = [...history.slice(0, historyIndex + 1), []];
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // 重置状态
  const reset = useCallback(() => {
    setShapes([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setTool('brush');
    setBrushSize(5);
  }, []);

  // 导出带遮罩的合成图片为 Base64 (异步)
  const exportMask = useCallback(
    async (
      originalWidth: number,
      originalHeight: number,
      displayWidth: number,
      displayHeight: number,
      sourceImage: string
    ): Promise<string> => {
      console.log('[exportMask] shapes count:', shapes.length);

      if (shapes.length === 0) return '';

      console.log('[exportMask] original:', originalWidth, 'x', originalHeight);
      console.log('[exportMask] display:', displayWidth, 'x', displayHeight);

      // 等待图片加载完成
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = sourceImage;
      });

      // 创建临时 canvas（使用传入的原始尺寸）
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalWidth;
      tempCanvas.height = originalHeight;
      const ctx = tempCanvas.getContext('2d')!;

      // 先绘制原图（缩放到原始尺寸）
      ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

      // 计算缩放比例
      const scale = originalWidth / displayWidth;
      console.log('[exportMask] canvas size:', originalWidth, 'x', originalHeight);
      console.log('[exportMask] scale:', scale);

      // 绘制半透明红色遮罩区域
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      shapes.forEach((shape) => {
        if (shape.type === 'rectangle') {
          ctx.fillRect(
            shape.x * scale,
            shape.y * scale,
            shape.width * scale,
            shape.height * scale
          );
        } else if (shape.type === 'brush') {
          ctx.lineWidth = shape.brushSize * scale;
          ctx.beginPath();
          const points = shape.points;
          if (points.length >= 2) {
            ctx.moveTo(points[0] * scale, points[1] * scale);
            for (let i = 2; i < points.length; i += 2) {
              ctx.lineTo(points[i] * scale, points[i + 1] * scale);
            }
          }
          ctx.stroke();
        } else if (shape.type === 'eraser') {
          // 橡皮擦暂时跳过
        }
      });

      return tempCanvas.toDataURL('image/png');
    },
    [shapes]
  );

  return {
    // State
    tool,
    brushSize,
    shapes,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    stageRef,
    // Actions
    setTool,
    setBrushSize,
    addShape,
    undo,
    redo,
    clearAll,
    reset,
    exportMask,
  };
}
