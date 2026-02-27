import { Pen, Square, Eraser, Undo2, Redo2, Trash2, Download } from 'lucide-react';
import { DrawingTool } from './types';

interface MaskToolbarProps {
  tool: DrawingTool;
  brushSize: number;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: DrawingTool) => void;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDownloadMask?: () => void;
  disabled?: boolean;
}

export function MaskToolbar({
  tool,
  brushSize,
  canUndo,
  canRedo,
  onToolChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClear,
  onDownloadMask,
  disabled,
}: MaskToolbarProps) {
  const tools: { id: DrawingTool; icon: typeof Pen; label: string }[] = [
    { id: 'brush', icon: Pen, label: 'Pen' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
      {/* 绘制工具 */}
      <div className="flex items-center gap-1">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onToolChange(id)}
            disabled={disabled}
            title={label}
            className={`p-2 rounded-lg transition-colors ${
              tool === id
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* 画笔大小 */}
        {(tool === 'brush' || tool === 'eraser') && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-6">{brushSize}</span>
            <input
              type="range"
              min="5"
              max="50"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              disabled={disabled}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={disabled || !canUndo}
          title="Undo (Ctrl+Z)"
          className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={disabled || !canRedo}
          title="Redo (Ctrl+Y)"
          className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onClear}
          disabled={disabled}
          title="Clear All"
          className="p-2 rounded-lg bg-white text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {onDownloadMask && (
          <button
            onClick={onDownloadMask}
            disabled={disabled}
            title="Download Mask"
            className="p-2 rounded-lg bg-white text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
