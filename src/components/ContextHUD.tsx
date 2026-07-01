import React from 'react';
import { Trash2, Copy, ArrowUpToLine, ArrowDownToLine, ChevronUp, ChevronDown, Type } from 'lucide-react';
import { useCanvasStore, type Shape } from '../store/canvasStore';

export const ContextHUD: React.FC = () => {
  const { 
    selectedId, 
    shapes, 
    updateShape, 
    deleteShape, 
    bringToFront, 
    sendToBack, 
    moveUp, 
    moveDown, 
    addShape 
  } = useCanvasStore();

  const selectedShape = shapes.find((s) => s.id === selectedId);

  if (!selectedShape) return null;

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

  const hasFill = selectedShape.type !== 'image';

  return (
    <div className="floating-hud glass-panel">
      {/* Title / Indicator */}
      <div className="hud-section">
        <span className="hud-title">{selectedShape.type}</span>
      </div>

      {/* Fill Color Picker */}
      {hasFill && (
        <div className="hud-section" title="Գույն">
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
      <div className="hud-section" title="Թափանցիկություն">
        <span className="hud-title">Opacity</span>
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
      <div className="hud-section" title="Նեոնային լուսավորություն">
        <span className="hud-title">Glow</span>
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
            title="Տառաչափ"
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
        <button className="hud-button" onClick={() => moveUp(selectedShape.id)} title="Բարձրացնել շերտը">
          <ChevronUp size={16} />
        </button>
        <button className="hud-button" onClick={() => moveDown(selectedShape.id)} title="Իջեցնել շերտը">
          <ChevronDown size={16} />
        </button>
        <button className="hud-button" onClick={() => bringToFront(selectedShape.id)} title="Բերել առաջին պլան">
          <ArrowUpToLine size={16} />
        </button>
        <button className="hud-button" onClick={() => sendToBack(selectedShape.id)} title="Տանել հետին պլան">
          <ArrowDownToLine size={16} />
        </button>
      </div>

      {/* Duplicate and Delete Actions */}
      <div className="hud-section">
        <button className="hud-button" onClick={handleDuplicate} title="Կրկնօրինակել տարրը">
          <Copy size={16} />
        </button>
        <button className="hud-button danger" onClick={handleDelete} title="Ջնջել տարրը">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
