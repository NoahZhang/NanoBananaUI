import { useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Rect } from 'react-konva';
import useImage from 'use-image';
import { DrawingTool, MaskShape, BrushStroke, RectangleShape } from './types';

interface MaskCanvasProps {
  sourceImage: string;
  width: number;
  height: number;
  tool: DrawingTool;
  brushSize: number;
  shapes: MaskShape[];
  onAddShape: (shape: MaskShape) => void;
  stageRef: React.RefObject<any>;
  disabled?: boolean;
}

export function MaskCanvas({
  sourceImage,
  width,
  height,
  tool,
  brushSize,
  shapes,
  onAddShape,
  stageRef,
  disabled,
}: MaskCanvasProps) {
  const [image] = useImage(sourceImage);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<MaskShape | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  const getPointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    return pos;
  }, [stageRef]);

  const handleMouseDown = useCallback(() => {
    if (disabled) return;
    setIsDrawing(true);
    const pos = getPointerPosition();
    if (!pos) return;

    if (tool === 'brush' || tool === 'eraser') {
      const newStroke: BrushStroke = {
        id: crypto.randomUUID(),
        type: tool === 'eraser' ? 'eraser' : 'brush',
        points: [pos.x, pos.y],
        brushSize,
      };
      setCurrentShape(newStroke);
    } else if (tool === 'rectangle') {
      setStartPoint({ x: pos.x, y: pos.y });
      const newRect: RectangleShape = {
        id: crypto.randomUUID(),
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      };
      setCurrentShape(newRect);
    }
  }, [disabled, tool, brushSize, getPointerPosition]);

  const handleMouseMove = useCallback(() => {
    if (!isDrawing || !currentShape || disabled) return;
    const pos = getPointerPosition();
    if (!pos) return;

    if ((tool === 'brush' || tool === 'eraser') && currentShape.type !== 'rectangle') {
      const brushShape = currentShape as BrushStroke;
      setCurrentShape({
        ...brushShape,
        points: [...brushShape.points, pos.x, pos.y],
      });
    } else if (tool === 'rectangle' && startPoint && currentShape.type === 'rectangle') {
      setCurrentShape({
        ...currentShape,
        x: Math.min(startPoint.x, pos.x),
        y: Math.min(startPoint.y, pos.y),
        width: Math.abs(pos.x - startPoint.x),
        height: Math.abs(pos.y - startPoint.y),
      } as RectangleShape);
    }
  }, [isDrawing, currentShape, tool, startPoint, getPointerPosition, disabled]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentShape) return;
    setIsDrawing(false);

    // 检查是否有实际绘制内容
    if (currentShape.type === 'rectangle') {
      if (currentShape.width > 5 && currentShape.height > 5) {
        onAddShape(currentShape);
      }
    } else {
      if ((currentShape as BrushStroke).points.length > 2) {
        onAddShape(currentShape);
      }
    }

    setCurrentShape(null);
    setStartPoint(null);
  }, [isDrawing, currentShape, onAddShape]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-checkerboard">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{ cursor: disabled ? 'not-allowed' : 'crosshair' }}
      >
        {/* 背景图片层 */}
        <Layer>
          {image && <KonvaImage image={image} width={width} height={height} />}
        </Layer>

        {/* 遮罩绘制层 */}
        <Layer opacity={0.5}>
          {/* 已完成的形状 */}
          {shapes.map((shape) => {
            if (shape.type === 'rectangle') {
              return (
                <Rect
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill="#FF6B6B"
                />
              );
            } else {
              return (
                <Line
                  key={shape.id}
                  points={shape.points}
                  stroke={shape.type === 'eraser' ? '#000000' : '#FF6B6B'}
                  strokeWidth={shape.brushSize}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    shape.type === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              );
            }
          })}

          {/* 当前正在绘制的形状 */}
          {currentShape &&
            (currentShape.type === 'rectangle' ? (
              <Rect
                x={currentShape.x}
                y={currentShape.y}
                width={currentShape.width}
                height={currentShape.height}
                fill="#FF6B6B"
                stroke="#FF0000"
                strokeWidth={2}
                dash={[5, 5]}
              />
            ) : (
              <Line
                points={(currentShape as BrushStroke).points}
                stroke={
                  (currentShape as BrushStroke).type === 'eraser' ? '#000000' : '#FF6B6B'
                }
                strokeWidth={(currentShape as BrushStroke).brushSize}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  (currentShape as BrushStroke).type === 'eraser'
                    ? 'destination-out'
                    : 'source-over'
                }
              />
            ))}
        </Layer>
      </Stage>
    </div>
  );
}
