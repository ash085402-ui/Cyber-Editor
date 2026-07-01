import React, { useState, useEffect, useRef } from 'react';
import { Square, Circle as CircleIcon, Star, Type, Image as ImageIcon, Undo2, Redo2, Trash2 } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';

export const RadialMenu: React.FC = () => {
  const { addShape, undo, redo, clearCanvas, past, future } = useCanvasStore();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Touch long press support
  const touchTimerRef = useRef<any>(null);

  const openMenu = (x: number, y: number) => {
    setCoords({ x, y });
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      openMenu(e.clientX, e.clientY);
    };

    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    // Long press detection for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchTimerRef.current = setTimeout(() => {
        e.preventDefault();
        openMenu(touch.clientX, touch.clientY);
      }, 700); // 700ms for long press
    };

    const handleTouchEnd = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleAddRect = () => {
    addShape({
      type: 'rect',
      x: window.innerWidth / 2 - 250 + (Math.random() * 60 - 30),
      y: window.innerHeight / 2 - 200 + (Math.random() * 60 - 30),
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
    closeMenu();
  };

  const handleAddCircle = () => {
    addShape({
      type: 'circle',
      x: window.innerWidth / 2 - 250 + (Math.random() * 60 - 30),
      y: window.innerHeight / 2 - 200 + (Math.random() * 60 - 30),
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
    closeMenu();
  };

  const handleAddStar = () => {
    addShape({
      type: 'star',
      x: window.innerWidth / 2 - 250 + (Math.random() * 60 - 30),
      y: window.innerHeight / 2 - 200 + (Math.random() * 60 - 30),
      width: 120,
      height: 120,
      fill: '#7928ca',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 0.85,
      glowColor: '#7928ca',
      glowBlur: 0,
    });
    closeMenu();
  };

  const handleAddText = () => {
    addShape({
      type: 'text',
      x: window.innerWidth / 2 - 250,
      y: window.innerHeight / 2 - 200,
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
    closeMenu();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    closeMenu();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addShape({
            type: 'image',
            x: window.innerWidth / 2 - 350,
            y: window.innerHeight / 2 - 300,
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
  };

  // 8 items in total. Radius is 75px
  const items = [
    { icon: <Square size={18} />, label: 'Rect', action: handleAddRect },
    { icon: <CircleIcon size={18} />, label: 'Circle', action: handleAddCircle },
    { icon: <Star size={18} />, label: 'Star', action: handleAddStar },
    { icon: <Type size={18} />, label: 'Text', action: handleAddText },
    { icon: <ImageIcon size={18} />, label: 'Image', action: triggerFileInput },
    { icon: <Undo2 size={18} />, label: 'Undo', action: () => { undo(); closeMenu(); }, disabled: past.length === 0 },
    { icon: <Redo2 size={18} />, label: 'Redo', action: () => { redo(); closeMenu(); }, disabled: future.length === 0 },
    { icon: <Trash2 size={18} />, label: 'Clear', action: () => { clearCanvas(); closeMenu(); } },
  ];

  const radius = 75;

  return (
    <div className="radial-menu-overlay">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange}
      />
      {isOpen && (
        <div 
          ref={menuRef} 
          className={`radial-menu ${isOpen ? 'open' : ''}`}
          style={{ top: coords.y, left: coords.x }}
        >
          <div className="radial-center" onClick={closeMenu}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          
          {items.map((item, index) => {
            const angle = (index * 2 * Math.PI) / items.length - Math.PI / 2; // Offset by -90deg so first item starts at the top
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <button
                key={index}
                className="radial-btn"
                style={{ 
                  transform: `translate(${x}px, ${y}px)`,
                  opacity: item.disabled ? 0.3 : 1,
                  pointerEvents: item.disabled ? 'none' : 'auto'
                }}
                onClick={item.action}
                title={item.label}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
