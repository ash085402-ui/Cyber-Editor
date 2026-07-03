import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Star, Text, Image as KonvaImage, Transformer, RegularPolygon, Group } from 'react-konva';
import { Undo2, Redo2, Trash2, Download, Plus, Copy } from 'lucide-react';
import { useCanvasStore, type Shape } from '../store/canvasStore';
import { ExportModal } from './ExportModal';
import { translations } from '../store/translations';

// Custom Image Component to handle image loading
interface CanvasImageProps {
  shapeProps: Shape;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newProps: Partial<Shape>) => void;
  draggable: boolean;
  dragBoundFunc?: (pos: any) => any;
}

const CanvasImage: React.FC<CanvasImageProps> = ({ shapeProps, isSelected: _isSelected, onSelect, onChange, draggable, dragBoundFunc }) => {
  const groupRef = useRef<any>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let active = true;
    if (shapeProps.src) {
      const img = new window.Image();
      img.src = shapeProps.src;
      img.onload = () => {
        if (active) {
          setImage(img);
        }
      };
    }
    return () => {
      active = false;
    };
  }, [shapeProps.src]);

  const hasCrop = shapeProps.cropX !== undefined;
  
  let drawWidth = shapeProps.width;
  let drawHeight = shapeProps.height;
  let localX = 0;
  let localY = 0;

  if (image && !hasCrop) {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const containerRatio = shapeProps.width / shapeProps.height;

    if (imageRatio > containerRatio) {
      drawWidth = shapeProps.width;
      drawHeight = shapeProps.width / imageRatio;
      localX = 0;
      localY = (shapeProps.height - drawHeight) / 2;
    } else {
      drawWidth = shapeProps.height * imageRatio;
      drawHeight = shapeProps.height;
      localX = (shapeProps.width - drawWidth) / 2;
      localY = 0;
    }
  }

  const cropProps = hasCrop ? {
    crop: {
      x: shapeProps.cropX!,
      y: shapeProps.cropY || 0,
      width: shapeProps.cropWidth || 100,
      height: shapeProps.cropHeight || 100,
    }
  } : {};

  return image ? (
    <Group
      ref={groupRef}
      id={shapeProps.id}
      x={shapeProps.x}
      y={shapeProps.y}
      width={shapeProps.width}
      height={shapeProps.height}
      rotation={shapeProps.rotation}
      draggable={draggable}
      dragBoundFunc={dragBoundFunc}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        if (e.target === groupRef.current) {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    >
      <KonvaImage
        image={image}
        {...cropProps}
        x={localX}
        y={localY}
        width={drawWidth}
        height={drawHeight}
        opacity={shapeProps.opacity}
        shadowColor={shapeProps.glowColor || shapeProps.shadowColor}
        shadowBlur={shapeProps.glowBlur || shapeProps.shadowBlur || 0}
        shadowOpacity={shapeProps.glowBlur ? 0.8 : 0}
      />
    </Group>
  ) : null;
};


export const InteractiveCanvas: React.FC = () => {
  const { 
    shapes, 
    selectedId, 
    setSelectedId, 
    updateShape, 
    addShape, 
    undo, 
    redo, 
    deleteShape,
    past,
    future,
    clearCanvas,
    pages,
    activePageId,
    sidebarOpen,
    language,
    addPage
  } = useCanvasStore();
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  
  const activePage = pages.find(p => p.id === activePageId) || pages[0]!;
  const t = translations[language];


  // Pan and zoom states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 150, y: 100 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isMiddleMouseDown, setIsMiddleMouseDown] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [hasCentered, setHasCentered] = useState(false);

  const selectedShape = shapes.find(s => s.id === selectedId);

  const handleCopy = () => {
    const selectedNodes = transformerRef.current?.nodes() || [];
    if (selectedNodes.length > 0) {
      selectedNodes.forEach((node: any) => {
        const shapeId = node.id();
        const shape = shapes.find(s => s.id === shapeId);
        if (shape && !shape.locked) {
          addShape({
            ...shape,
            x: shape.x + 25,
            y: shape.y + 25,
          });
        }
      });
    } else if (selectedShape && !selectedShape.locked) {
      addShape({
        ...selectedShape,
        x: selectedShape.x + 25,
        y: selectedShape.y + 25,
      });
    }
  };

  const handleDeleteSelected = () => {
    const selectedNodes = transformerRef.current?.nodes() || [];
    if (selectedNodes.length > 0) {
      selectedNodes.forEach((node: any) => {
        const shapeId = node.id();
        const shape = shapes.find(s => s.id === shapeId);
        if (shape && !shape.locked) {
          deleteShape(shapeId);
        }
      });
      setSelectedId(null);
      transformerRef.current?.nodes([]);
    } else if (selectedId) {
      const selectedShape = shapes.find(s => s.id === selectedId);
      if (selectedShape && !selectedShape.locked) {
        deleteShape(selectedId);
      }
    }
  };

  const handleAddNew = () => {
    addShape({
      type: 'text',
      x: 100,
      y: 100,
      width: 250,
      height: 40,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: t.placeholderText,
      fontSize: 16,
      fontFamily: 'Inter',
    });
  };

  // Dynamic Canvas dimensions to account for left sidebar and right panel (if open on desktop)
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth > 768 
      ? window.innerWidth - (sidebarOpen ? 280 : 0) - 260
      : window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth > 768 
          ? window.innerWidth - (sidebarOpen ? 280 : 0) - 260
          : window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Center page on load
  useEffect(() => {
    if (hasCentered) return;
    
    const padding = 40;
    const targetWidth = activePage.width + padding * 2;
    const targetHeight = activePage.height + padding * 2;
    
    const scaleX = canvasSize.width / targetWidth;
    const scaleY = canvasSize.height / targetHeight;
    const autoScale = Math.min(1.2, Math.min(scaleX, scaleY));
    
    setScale(autoScale);
    
    const xOffset = (canvasSize.width - activePage.width * autoScale) / 2;
    const yOffset = (canvasSize.height - activePage.height * autoScale) / 2;
    setPosition({ x: xOffset, y: yOffset });
    
    const stage = stageRef.current;
    if (stage) {
      stage.scale({ x: autoScale, y: autoScale });
      stage.position({ x: xOffset, y: yOffset });
      stage.batchDraw();
    }
    
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      setHasCentered(true);
    }
  }, [canvasSize.width, canvasSize.height, activePage.width, activePage.height, hasCentered]);

  // Listen for reset canvas events from home navigation button click
  useEffect(() => {
    const handleReset = () => {
      setHasCentered(false);
    };
    window.addEventListener('reset-canvas', handleReset);
    return () => window.removeEventListener('reset-canvas', handleReset);
  }, []);
  
  // Drag and drop overlay state
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Inline text editing states
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingStyle, setEditingStyle] = useState<React.CSSProperties>({});
  const [tempText, setTempText] = useState('');
  
  // Listen for Space key for panning and keyboard shortcuts
  const [copiedShape, setCopiedShape] = useState<Omit<Shape, 'id'> | null>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(true);
        if (document.activeElement === document.body) {
          e.preventDefault();
        }
      }
      
      // Shortcuts for Undo, Redo, Delete, Copy, Paste, Arrows
      if (document.activeElement === document.body) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const selectedNodes = transformerRef.current?.nodes() || [];
          if (selectedNodes.length > 0) {
            e.preventDefault();
            selectedNodes.forEach((node: any) => {
              const shapeId = node.id();
              const shape = shapes.find(s => s.id === shapeId);
              if (shape && !shape.locked) {
                deleteShape(shapeId);
              }
            });
            setSelectedId(null);
            transformerRef.current?.nodes([]);
          } else if (selectedId) {
            const selectedShape = shapes.find(s => s.id === selectedId);
            if (selectedShape && !selectedShape.locked) {
              e.preventDefault();
              deleteShape(selectedId);
            }
          }
        }
        
        // Select All Text Elements (Ctrl+A / Cmd+A)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
          const textShapes = shapes.filter(s => s.type === 'text' && !s.locked);
          const stage = stageRef.current;
          if (stage && textShapes.length > 0) {
            e.preventDefault();
            const nodesToSelect = textShapes
              .map(s => stage.findOne(`#${s.id}`))
              .filter(Boolean);
            if (nodesToSelect.length > 0) {
              setSelectedId(textShapes[0]!.id);
              transformerRef.current?.nodes(nodesToSelect);
              transformerRef.current?.getLayer().batchDraw();
            }
          }
        }
        
        // Copy / Paste
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
          if (selectedId) {
            const shapeToCopy = shapes.find(s => s.id === selectedId);
            if (shapeToCopy) {
              e.preventDefault();
              const { id: _, ...cleanShape } = shapeToCopy;
              setCopiedShape(cleanShape);
            }
          }
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
          if (copiedShape) {
            e.preventDefault();
            addShape({
              ...copiedShape,
              x: copiedShape.x + 20,
              y: copiedShape.y + 20,
            });
          }
        }

        // Arrow keys movement
        if (selectedId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          const selectedShape = shapes.find(s => s.id === selectedId);
          if (selectedShape) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            let dx = 0;
            let dy = 0;
            if (e.key === 'ArrowLeft') dx = -step;
            if (e.key === 'ArrowRight') dx = step;
            if (e.key === 'ArrowUp') dy = -step;
            if (e.key === 'ArrowDown') dy = step;
            
            updateShape(selectedId, {
              x: selectedShape.x + dx,
              y: selectedShape.y + dy,
            });
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, shapes, copiedShape, undo, redo, deleteShape, addShape, updateShape, setSelectedId]);

  // Connect Transformer to Selected Node
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedId && !editingTextId) {
        const stage = stageRef.current;
        const selectedNode = stage.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer().batchDraw();
          return;
        }
      }
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, shapes, editingTextId]);

  // Handle zooming
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const zoomFactor = 1.08;
    const newScale = e.evt.deltaY < 0 ? oldScale * zoomFactor : oldScale / zoomFactor;
    const boundedScale = Math.max(0.15, Math.min(8, newScale));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: boundedScale, y: boundedScale });
    
    const newPos = {
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    };
    
    stage.position(newPos);
    stage.batchDraw();
    
    setScale(boundedScale);
    setPosition(newPos);
  };

  // Handle stage drag for panning (only if space pressed, middle mouse button pressed, or clicked empty canvas)
  const handleStageDrag = (e: any) => {
    if (e.target === stageRef.current) {
      setPosition(stageRef.current.position());
    }
  };

  const checkDeselect = (e: any) => {
    // Deselect if click is on stage background
    if (e.target === stageRef.current) {
      setSelectedId(null);
    }
  };

  // Drag and Drop files (images)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Convert screen coordinates to canvas coordinates (taking pan and zoom into account)
    const canvasX = (pointer.x - stage.x()) / stage.scaleX();
    const canvasY = (pointer.y - stage.y()) / stage.scaleY();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addShape({
            type: 'image',
            x: canvasX - 100,
            y: canvasY - 100,
            width: 200,
            height: 200,
            fill: '',
            stroke: '',
            strokeWidth: 0,
            rotation: 0,
            opacity: 1,
            src: event.target.result as string,
            glowColor: '#00f2fe',
            glowBlur: 0,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Text shape double click to trigger inline editing
  const handleTextDblClick = (e: any, shape: Shape) => {
    const textNode = e.target;
    const stage = stageRef.current;
    if (!textNode || !stage) return;

    setEditingTextId(shape.id);
    setTempText(shape.text || '');

    // Get exact bounding box on the screen
    const textPosition = textNode.getAbsolutePosition();
    const stageBox = stage.container().getBoundingClientRect();
    const scaleX = textNode.getAbsoluteScale().x;
    const scaleY = textNode.getAbsoluteScale().y;

    setEditingStyle({
      position: 'absolute',
      top: `${stageBox.top + textPosition.y}px`,
      left: `${stageBox.left + textPosition.x}px`,
      width: `${Math.max(100, textNode.width() * scaleX + 10)}px`,
      height: `${Math.max(30, textNode.height() * scaleY + 10)}px`,
      fontSize: `${textNode.fontSize() * scaleY}px`,
      fontFamily: textNode.fontFamily() || 'Inter',
      color: textNode.fill(),
      transform: `rotate(${textNode.rotation()}deg)`,
      transformOrigin: 'top left',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(8px)',
      border: '1px dashed var(--purple)',
      boxShadow: '0 0 10px rgba(79, 70, 229, 0.3)',
      outline: 'none',
      padding: '4px',
      overflow: 'hidden',
      zIndex: 1000,
    });
  };

  const finishTextEditing = () => {
    if (editingTextId) {
      updateShape(editingTextId, { text: tempText });
      setEditingTextId(null);
    }
  };

  const getDragBound = (nodeWidth: number, nodeHeight: number, xOffset = 0, yOffset = 0) => {
    return (pos: any) => {
      const groupNode = stageRef.current?.findOne('#a4-page-group');
      if (!groupNode) return pos;

      const groupAbsX = groupNode.absolutePosition().x;
      const groupAbsY = groupNode.absolutePosition().y;
      const scaleX = groupNode.getAbsoluteScale().x;
      const scaleY = groupNode.getAbsoluteScale().y;

      const relX = (pos.x - groupAbsX) / scaleX - xOffset;
      const relY = (pos.y - groupAbsY) / scaleY - yOffset;

      const clampedRelX = Math.max(0, Math.min(relX, activePage.width - nodeWidth));
      const clampedRelY = Math.max(0, Math.min(relY, activePage.height - nodeHeight));

      return {
        x: (clampedRelX + xOffset) * scaleX + groupAbsX,
        y: (clampedRelY + yOffset) * scaleY + groupAbsY
      };
    };
  };

  // Dynamic CSS variables for grid background sync
  const gridStyle: React.CSSProperties = {
    backgroundSize: `${40 * scale}px ${40 * scale}px`,
    backgroundPosition: `${position.x}px ${position.y}px`,
  };

  return (
    <div 
      className={`canvas-container ${sidebarOpen ? '' : 'sidebar-closed'}`} 
      style={gridStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={(e) => {
        if (e.button === 1) { // Middle click
          setIsMiddleMouseDown(true);
        }
      }}
      onMouseUp={(e) => {
        if (e.button === 1) {
          setIsMiddleMouseDown(false);
        }
      }}
    >
      {/* Top Action HUD Overlay */}
      <div className="top-hud glass-panel">
        <button 
          className="hud-button" 
          onClick={undo} 
          disabled={past.length === 0}
          title={t.undo}
        >
          <Undo2 size={14} />
        </button>
        <button 
          className="hud-button" 
          onClick={redo} 
          disabled={future.length === 0}
          title={t.redo}
        >
          <Redo2 size={14} />
        </button>
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
        <button 
          className="hud-button danger" 
          onClick={clearCanvas} 
          title={t.clearCanvas}
        >
          <Trash2 size={14} />
        </button>
        <button 
          className="hud-button" 
          onClick={() => addPage(794, 1123)} 
          title={t.addPage}
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <Plus size={14} />
        </button>
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Copy Button */}
        <button 
          className="hud-button" 
          onClick={handleCopy} 
          disabled={!selectedId || !!selectedShape?.locked}
          title={t.duplicate || "Copy"}
        >
          <Copy size={14} style={{ marginRight: '6px' }} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-cyber)', fontWeight: 'bold' }}>{language === 'hy' ? 'ԿՐԿՆՕՐԻՆԱԿԵԼ' : language === 'ru' ? 'КОПИРОВАТЬ' : 'COPY'}</span>
        </button>

        {/* Delete Button */}
        <button 
          className="hud-button danger" 
          onClick={handleDeleteSelected} 
          disabled={!selectedId || !!selectedShape?.locked}
          title={t.delete || "Delete"}
        >
          <Trash2 size={14} style={{ marginRight: '6px' }} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-cyber)', fontWeight: 'bold' }}>{language === 'hy' ? 'ՋՆՋԵԼ' : language === 'ru' ? 'УДАЛИТЬ' : 'DELETE'}</span>
        </button>

        {/* Add New Button */}
        <button 
          className="hud-button" 
          onClick={handleAddNew} 
          title="Add New Text"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <Plus size={14} style={{ marginRight: '6px' }} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-cyber)', fontWeight: 'bold' }}>{language === 'hy' ? 'ԱՎԵԼԱՑՆԵԼ' : language === 'ru' ? 'ДОБАВИТЬ' : 'ADD NEW'}</span>
        </button>

        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
        <button 
          className="hud-button" 
          onClick={() => setIsExportOpen(true)} 
          title={t.exportSave}
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <Download size={14} style={{ marginRight: '6px' }} />
          <span className="export-btn-text" style={{ fontSize: '10px', fontFamily: 'var(--font-cyber)', fontWeight: 'bold', letterSpacing: '0.5px' }}>{t.exportSave}</span>
        </button>
      </div>

      {/* File Drag and Drop Overlay Indicator */}
      <div className={`file-drag-overlay ${isDragOver ? 'active' : ''}`}>
        <div className="drag-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>{t.dropImage}</span>
        </div>
      </div>

      {/* Inline Text Area Editor */}
      {editingTextId && (
        <textarea
          style={editingStyle}
          value={tempText}
          onChange={(e) => setTempText(e.target.value)}
          onBlur={finishTextEditing}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              finishTextEditing();
            }
            if (e.key === 'Escape') {
              setEditingTextId(null);
            }
          }}
          autoFocus
        />
      )}

      {/* Main Canvas Stage */}
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        onWheel={handleWheel}
        draggable={isSpacePressed || isMiddleMouseDown}
        onDragMove={handleStageDrag}
        onDragEnd={handleStageDrag}
      >
        <Layer>
          {/* Draggable/Movable A4 Page Group */}
          <Group
            id="a4-page-group"
            x={position.x}
            y={position.y}
            draggable={!(isSpacePressed || isMiddleMouseDown)}
            onDragEnd={(e) => {
              if (e.target.id() === 'a4-page-group') {
                setPosition({ x: e.target.x(), y: e.target.y() });
              }
            }}
          >
            <Rect
              id="page-rect"
              x={0}
              y={0}
              width={activePage.width}
              height={activePage.height}
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth={1}
              shadowColor="rgba(0,0,0,0.15)"
              shadowBlur={20}
              shadowOpacity={0.4}
              listening={true}
              onClick={() => setSelectedId(null)}
              onTap={() => setSelectedId(null)}
            />

            {/* Clipped Group for shapes boundary masking (overflow: hidden) */}
            <Group
              clipX={0}
              clipY={0}
              clipWidth={activePage.width}
              clipHeight={activePage.height}
            >
              {shapes.map((shape) => {
                const isSelected = shape.id === selectedId;
                const commonProps = {
                  id: shape.id,
                  x: shape.x,
                  y: shape.y,
                  rotation: shape.rotation,
                  opacity: shape.opacity,
                  fill: shape.fill,
                  stroke: shape.stroke,
                  strokeWidth: shape.strokeWidth,
                  shadowColor: shape.glowColor || shape.shadowColor,
                  shadowBlur: shape.glowBlur || shape.shadowBlur || 0,
                  shadowOpacity: shape.glowBlur ? 0.8 : 0,
                  draggable: !editingTextId && !shape.locked,
                  onClick: shape.locked ? undefined : () => setSelectedId(shape.id),
                  onTap: shape.locked ? undefined : () => setSelectedId(shape.id),
                  onDragEnd: (e: any) => {
                    updateShape(shape.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  },
                  onTransformEnd: (e: any) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    
                    node.scaleX(1);
                    node.scaleY(1);
                    
                    updateShape(shape.id, {
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(5, node.width() * scaleX),
                      height: Math.max(5, node.height() * scaleY),
                      rotation: node.rotation(),
                    });
                  }
                };

                if (shape.type === 'rect') {
                  return (
                    <Rect
                      key={shape.id}
                      {...commonProps}
                      width={shape.width}
                      height={shape.height}
                      dragBoundFunc={getDragBound(shape.width, shape.height)}
                    />
                  );
                }

                if (shape.type === 'circle') {
                  const radius = shape.width / 2;
                  return (
                    <Circle
                      key={shape.id}
                      {...commonProps}
                      radius={radius}
                      x={shape.x + radius}
                      y={shape.y + radius}
                      dragBoundFunc={getDragBound(shape.width, shape.width, radius, radius)}
                      onDragEnd={(e: any) => {
                        updateShape(shape.id, {
                          x: e.target.x() - radius,
                          y: e.target.y() - radius,
                        });
                      }}
                      onTransformEnd={(e: any) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const r = node.radius() * scaleX;
                        node.scaleX(1);
                        node.scaleY(1);
                        updateShape(shape.id, {
                          x: node.x() - r,
                          y: node.y() - r,
                          width: r * 2,
                          height: r * 2,
                          rotation: node.rotation(),
                        });
                      }}
                    />
                  );
                }

                if (shape.type === 'star') {
                  const radius = shape.width / 2;
                  return (
                    <Star
                      key={shape.id}
                      {...commonProps}
                      numPoints={5}
                      innerRadius={shape.width / 2.5}
                      outerRadius={radius}
                      x={shape.x + radius}
                      y={shape.y + radius}
                      dragBoundFunc={getDragBound(shape.width, shape.width, radius, radius)}
                      onDragEnd={(e: any) => {
                        updateShape(shape.id, {
                          x: e.target.x() - radius,
                          y: e.target.y() - radius,
                        });
                      }}
                      onTransformEnd={(e: any) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const outerRadius = node.outerRadius() * scaleX;
                        node.scaleX(1);
                        node.scaleY(1);
                        updateShape(shape.id, {
                          x: node.x() - outerRadius,
                          y: node.y() - outerRadius,
                          width: outerRadius * 2,
                          height: outerRadius * 2,
                          rotation: node.rotation(),
                        });
                      }}
                    />
                  );
                }

                if (shape.type === 'triangle') {
                  const radius = shape.width / 2;
                  return (
                    <RegularPolygon
                      key={shape.id}
                      {...commonProps}
                      sides={3}
                      radius={radius}
                      x={shape.x + radius}
                      y={shape.y + radius}
                      dragBoundFunc={getDragBound(shape.width, shape.width, radius, radius)}
                      onDragEnd={(e: any) => {
                        updateShape(shape.id, {
                          x: e.target.x() - radius,
                          y: e.target.y() - radius,
                        });
                      }}
                      onTransformEnd={(e: any) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const r = node.radius() * scaleX;
                        node.scaleX(1);
                        node.scaleY(1);
                        updateShape(shape.id, {
                          x: node.x() - r,
                          y: node.y() - r,
                          width: r * 2,
                          height: r * 2,
                          rotation: node.rotation(),
                        });
                      }}
                    />
                  );
                }

                if (shape.type === 'text') {
                  const textHeight = shape.height || (shape.fontSize || 24) * 2;
                  return (
                    <Text
                      key={shape.id}
                      {...commonProps}
                      name="text-shape"
                      text={shape.text || t.doubleClickText}
                      fontSize={shape.fontSize || 24}
                      fontFamily={shape.fontFamily || 'Inter'}
                      width={shape.width}
                      align="justify"
                      dragBoundFunc={getDragBound(shape.width, textHeight)}
                      onDblClick={shape.locked ? undefined : (e) => handleTextDblClick(e, shape)}
                      onDblTap={shape.locked ? undefined : (e) => handleTextDblClick(e, shape)}
                    />
                  );
                }

                if (shape.type === 'image') {
                  return (
                    <CanvasImage
                      key={shape.id}
                      shapeProps={shape}
                      isSelected={isSelected}
                      onSelect={() => setSelectedId(shape.id)}
                      onChange={(newProps) => updateShape(shape.id, newProps)}
                      draggable={!editingTextId && !shape.locked}
                      dragBoundFunc={getDragBound(shape.width, shape.height)}
                    />
                  );
                }

                return null;
              })}
            </Group>
          </Group>

          {/* Cyberpunk Custom Transformer (rendered outside the clipped group so handles remain fully visible) */}
          {selectedId && !editingTextId && (
            <Transformer
              ref={transformerRef}
              borderStroke="#00f2fe"
              borderStrokeWidth={1.5}
              anchorStroke="#ff007f"
              anchorFill="#030307"
              anchorSize={8}
              anchorCornerRadius={2}
              rotateAnchorOffset={25}
              enabledAnchors={
                shapes.find(s => s.id === selectedId)?.type === 'image'
                  ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                  : undefined
              }
              keepRatio={
                shapes.find(s => s.id === selectedId)?.type === 'image'
              }
              rotateEnabled={true}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 10 || newBox.height < 10) {
                  return oldBox;
                }
                const isOutside = 
                  newBox.x < 0 || 
                  newBox.y < 0 || 
                  (newBox.x + newBox.width) > activePage.width || 
                  (newBox.y + newBox.height) > activePage.height;
                if (isOutside) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
      {isExportOpen && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          stageRef={stageRef}
          shapes={shapes}
          activePage={activePage}
        />
      )}
    </div>
  );
};
