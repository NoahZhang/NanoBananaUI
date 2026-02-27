export type DrawingTool = 'brush' | 'rectangle' | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface BrushStroke {
  id: string;
  type: 'brush' | 'eraser';
  points: number[]; // [x1, y1, x2, y2, ...]
  brushSize: number;
}

export interface RectangleShape {
  id: string;
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MaskShape = BrushStroke | RectangleShape;

export interface MaskEditorState {
  tool: DrawingTool;
  brushSize: number;
  shapes: MaskShape[];
  history: MaskShape[][];
  historyIndex: number;
}
