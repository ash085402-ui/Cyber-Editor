import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { translations } from '../store/translations';

export const ContextHUD: React.FC = () => {
  const replaceImageRef = React.useRef<HTMLInputElement>(null);

  const { 
    selectedId, 
    shapes, 
    updateShape, 
    language
  } = useCanvasStore();

  const selectedShape = shapes.find((s) => s.id === selectedId);

  if (!selectedShape || selectedShape.type !== 'image') return null;

  const t = translations[language];

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

  return (
    <div className="floating-hud glass-panel">
      <input
        type="file"
        ref={replaceImageRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleReplaceImageChange}
      />
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
    </div>
  );
};
