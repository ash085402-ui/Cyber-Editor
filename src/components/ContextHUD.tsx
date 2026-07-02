import React from 'react';
import { Trash2, Copy, ArrowUpToLine, ArrowDownToLine, ChevronUp, ChevronDown, Type } from 'lucide-react';
import { useCanvasStore, type Shape } from '../store/canvasStore';
import { translations } from '../store/translations';

export const ContextHUD: React.FC = () => {
  const replaceImageRef = React.useRef<HTMLInputElement>(null);

  const { 
    selectedId, 
    shapes, 
    updateShape, 
    deleteShape, 
    bringToFront, 
    sendToBack, 
    moveUp, 
    moveDown, 
    addShape,
    language
  } = useCanvasStore();

  const selectedShape = shapes.find((s) => s.id === selectedId);

  if (!selectedShape) return null;

  const t = translations[language];


  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateShape(selectedShape.id, { fill: e.target.value });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateShape(selectedShape.id, { opacity: parseFloat(e.target.value) });
  };

  const handleGlowColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateShape(selectedShape.id, { glowColor: e.target.value });
  };

  const handleGlowBlurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateShape(selectedShape.id, { glowBlur: parseInt(e.target.value, 10) });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateShape(selectedShape.id, { fontSize: parseInt(e.target.value, 10) });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateShape(selectedShape.id, { fontFamily: e.target.value });
  };

  const handleDuplicate = () => {
    const duplicate: Omit<Shape, 'id'> = {
      ...selectedShape,
      x: selectedShape.x + 25,
      y: selectedShape.y + 25,
    };
    addShape(duplicate);
  };

  const handleDelete = () => {
    deleteShape(selectedShape.id);
  };

  const handleReplaceImageClick = () => {
    replaceImageRef.current?.click();
  };

  const handleReplaceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateShape(selectedShape.id, { src: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const hasFill = selectedShape.type !== 'image';
  const shapeTypeLabel = (t as any)[selectedShape.type] || selectedShape.type;

  return (
    <div className="floating-hud glass-panel">
      <input
        type="file"
        ref={replaceImageRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleReplaceImageChange}
      />
      {/* Title / Indicator */}
      <div className="hud-section">
        <span className="hud-title">{shapeTypeLabel}</span>
      </div>

      {selectedShape.type === 'image' && (
        <div className="hud-section">
          <button 
            className="hud-button" 
            onClick={handleReplaceImageClick} 
            title={t.replaceImage}
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-cyber)', fontWeight: 'bold' }}>{t.replaceImage.toUpperCase()}</span>
          </button>
        </div>
      )}

      {/* Fill Color Picker */}
      {hasFill && (
        <div className="hud-section" title={t.rect}>
          <div className="color-picker-wrapper">
            <input 
              type="color" 
              className="color-input" 
              value={selectedShape.fill.startsWith('#') ? selectedShape.fill : '#00f2fe'} 
              onChange={handleColorChange}
            />
          </div>
        </div>
      )}

      {/* Cyber Opacity Control */}
      <div className="hud-section" title={t.opacity}>
        <span className="hud-title">{t.opacity}</span>
        <input 
          type="range" 
          className="cyber-slider" 
          min="0.1" 
          max="1" 
          step="0.05" 
          value={selectedShape.opacity} 
          onChange={handleOpacityChange}
        />
      </div>

      {/* Cyber Neon Glow Controls */}
      <div className="hud-section" title={t.glow}>
        <span className="hud-title">{t.glow}</span>
        <div className="color-picker-wrapper" style={{ marginRight: '8px' }}>
          <input 
            type="color" 
            className="color-input" 
            value={selectedShape.glowColor || '#00f2fe'} 
            onChange={handleGlowColorChange}
          />
        </div>
        <input 
          type="range" 
          className="cyber-slider" 
          min="0" 
          max="40" 
          step="1" 
          value={selectedShape.glowBlur || 0} 
          onChange={handleGlowBlurChange}
        />
      </div>

      {/* Text specific controls */}
      {selectedShape.type === 'text' && (
        <div className="hud-section">
          <Type size={16} className="text-muted" style={{ marginRight: '6px' }} />
          
          <input 
            type="range" 
            className="cyber-slider" 
            min="12" 
            max="120" 
            step="1" 
            value={selectedShape.fontSize || 24} 
            onChange={handleFontSizeChange}
            title={t.fontSize}
            style={{ width: '60px', marginRight: '10px' }}
          />

          <select 
            value={selectedShape.fontFamily || 'Inter'} 
            onChange={handleFontFamilyChange}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px',
              color: 'var(--text-main)',
              fontSize: '11px',
              padding: '4px',
              outline: 'none',
              fontFamily: 'var(--font-cyber)',
              cursor: 'pointer'
            }}
          >
            <option value="Inter">Inter</option>
            <option value="Orbitron">Orbitron</option>
            <option value="Courier New">Courier</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
      )}

      {/* Layers Panel */}
      <div className="hud-section">
        <button className="hud-button" onClick={() => moveUp(selectedShape.id)} title={t.moveUp}>
          <ChevronUp size={16} />
        </button>
        <button className="hud-button" onClick={() => moveDown(selectedShape.id)} title={t.moveDown}>
          <ChevronDown size={16} />
        </button>
        <button className="hud-button" onClick={() => bringToFront(selectedShape.id)} title={t.bringToFront}>
          <ArrowUpToLine size={16} />
        </button>
        <button className="hud-button" onClick={() => sendToBack(selectedShape.id)} title={t.sendToBack}>
          <ArrowDownToLine size={16} />
        </button>
      </div>

      {/* Duplicate and Delete Actions */}
      <div className="hud-section">
        <button className="hud-button" onClick={handleDuplicate} title={t.duplicate}>
          <Copy size={16} />
        </button>
        <button className="hud-button danger" onClick={handleDelete} title={t.delete}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
