import { create } from 'zustand';

export interface Shape {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'image' | 'star';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  shadowColor?: string;
  shadowBlur?: number;
  glowColor?: string;
  glowBlur?: number;
}

interface CanvasState {
  shapes: Shape[];
  selectedId: string | null;
  past: Shape[][];
  future: Shape[][];
  
  // Selection
  setSelectedId: (id: string | null) => void;
  
  // History
  saveToHistory: () => void;
  
  // Shape Operations
  addShape: (shape: Omit<Shape, 'id'>) => void;
  updateShape: (id: string, newProps: Partial<Shape>, skipHistory?: boolean) => void;
  deleteShape: (id: string) => void;
  clearCanvas: () => void;
  
  // Reordering (Layers)
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
}

// Deep clone helper
const cloneShapes = (shapes: Shape[]): Shape[] => {
  return JSON.parse(JSON.stringify(shapes));
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  shapes: [],
  selectedId: null,
  past: [],
  future: [],

  setSelectedId: (id) => set({ selectedId: id }),

  saveToHistory: () => {
    const { shapes, past } = get();
    set({
      past: [...past, cloneShapes(shapes)],
      future: [], // Clear redo history on new action
    });
  },

  addShape: (shapeProps) => {
    const { saveToHistory, shapes } = get();
    saveToHistory();
    
    const newShape: Shape = {
      ...shapeProps,
      id: `${shapeProps.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    set({
      shapes: [...shapes, newShape],
      selectedId: newShape.id,
    });
  },

  updateShape: (id, newProps, skipHistory = false) => {
    const { saveToHistory, shapes } = get();
    if (!skipHistory) {
      saveToHistory();
    }
    
    set({
      shapes: shapes.map((s) => (s.id === id ? { ...s, ...newProps } : s)),
    });
  },

  deleteShape: (id) => {
    const { saveToHistory, shapes, selectedId } = get();
    saveToHistory();
    
    set({
      shapes: shapes.filter((s) => s.id !== id),
      selectedId: selectedId === id ? null : selectedId,
    });
  },

  clearCanvas: () => {
    const { saveToHistory } = get();
    saveToHistory();
    
    set({
      shapes: [],
      selectedId: null,
    });
  },

  // Layers Management
  bringToFront: (id) => {
    const { saveToHistory, shapes } = get();
    const index = shapes.findIndex((s) => s.id === id);
    if (index === -1 || index === shapes.length - 1) return;
    
    saveToHistory();
    const newShapes = cloneShapes(shapes);
    const [element] = newShapes.splice(index, 1);
    newShapes.push(element);
    
    set({ shapes: newShapes });
  },

  sendToBack: (id) => {
    const { saveToHistory, shapes } = get();
    const index = shapes.findIndex((s) => s.id === id);
    if (index === -1 || index === 0) return;
    
    saveToHistory();
    const newShapes = cloneShapes(shapes);
    const [element] = newShapes.splice(index, 1);
    newShapes.unshift(element);
    
    set({ shapes: newShapes });
  },

  moveUp: (id) => {
    const { saveToHistory, shapes } = get();
    const index = shapes.findIndex((s) => s.id === id);
    if (index === -1 || index === shapes.length - 1) return;
    
    saveToHistory();
    const newShapes = cloneShapes(shapes);
    const temp = newShapes[index];
    newShapes[index] = newShapes[index + 1];
    newShapes[index + 1] = temp;
    
    set({ shapes: newShapes });
  },

  moveDown: (id) => {
    const { saveToHistory, shapes } = get();
    const index = shapes.findIndex((s) => s.id === id);
    if (index === -1 || index === 0) return;
    
    saveToHistory();
    const newShapes = cloneShapes(shapes);
    const temp = newShapes[index];
    newShapes[index] = newShapes[index - 1];
    newShapes[index - 1] = temp;
    
    set({ shapes: newShapes });
  },

  undo: () => {
    if (get().past.length === 0) return;
    
    const previous = get().past[get().past.length - 1];
    const newPast = get().past.slice(0, get().past.length - 1);
    const current = get().shapes;
    
    set({
      past: newPast,
      shapes: previous,
      future: [cloneShapes(current), ...get().future],
    });
  },

  redo: () => {
    if (get().future.length === 0) return;
    
    const next = get().future[0];
    const newFuture = get().future.slice(1);
    const current = get().shapes;
    
    set({
      past: [...get().past, cloneShapes(current)],
      shapes: next,
      future: newFuture,
    });
  },
}));
