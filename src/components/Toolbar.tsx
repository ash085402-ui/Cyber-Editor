import React, { useRef } from 'react';
import { Square, Triangle, Star, Type, Image as ImageIcon } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';

export const Toolbar: React.FC = () => {
  const { addShape, pages, activePageId } = useCanvasStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePage = pages.find((p) => p.id === activePageId) || pages[0]!;
  const centerX = 150 + activePage.width / 2;
  const centerY = 100 + activePage.height / 2;

  const handleAddRect = () => {
    addShape({
      type: 'rect',
      x: centerX - 60 + (Math.random() * 40 - 20),
      y: centerY - 60 + (Math.random() * 40 - 20),
      width: 120,
      height: 120,
      fill: '#00f2fe',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 0.85,
      glowColor: '#00f2fe',
      glowBlur: 0,
    });
  };

  const handleAddTriangle = () => {
    addShape({
      type: 'triangle',
      x: centerX - 60 + (Math.random() * 40 - 20),
      y: centerY - 60 + (Math.random() * 40 - 20),
      width: 120,
      height: 120,
      fill: '#00ff66',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 0.85,
      glowColor: '#00ff66',
      glowBlur: 0,
    });
  };

  const handleAddStar = () => {
    addShape({
      type: 'star',
      x: centerX - 60 + (Math.random() * 40 - 20),
      y: centerY - 60 + (Math.random() * 40 - 20),
      width: 120,
      height: 120,
      fill: '#ff007f',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 0.85,
      glowColor: '#ff007f',
      glowBlur: 0,
    });
  };

  const handleAddText = () => {
    addShape({
      type: 'text',
      x: centerX - 125,
      y: centerY - 20,
      width: 250,
      height: 40,
      fill: '#ffffff',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: 'Մուտքագրեք տեքստ...',
      fontSize: 24,
      fontFamily: 'Orbitron',
      glowColor: '#ffffff',
      glowBlur: 0,
    });
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addShape({
            type: 'image',
            x: centerX - 125,
            y: centerY - 125,
            width: 250,
            height: 250,
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
    // Reset file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bottom-toolbar glass-panel">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />
      <button className="toolbar-btn" onClick={handleAddText} title="Ավելացնել Տեքստ">
        <Type size={20} />
        <span className="btn-label">Տեքստ</span>
      </button>
      <button className="toolbar-btn" onClick={handleAddRect} title="Ավելացնել Քառակուսի">
        <Square size={20} />
        <span className="btn-label">Քառակուսի</span>
      </button>
      <button className="toolbar-btn" onClick={handleAddTriangle} title="Ավելացնել Եռանկյունի">
        <Triangle size={20} />
        <span className="btn-label">Եռանկյունի</span>
      </button>
      <button className="toolbar-btn" onClick={handleAddStar} title="Ավելացնել Աստղ">
        <Star size={20} />
        <span className="btn-label">Աստղ</span>
      </button>
      <div className="toolbar-divider" />
      <button className="toolbar-btn primary" onClick={handleImageUploadClick} title="Բացել նկարը">
        <ImageIcon size={20} />
        <span className="btn-label">Բացել նկարը</span>
      </button>
    </div>
  );
};
