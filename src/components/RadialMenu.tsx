import React, { useState, useEffect, useRef } from 'react';
import { Type, Image as ImageIcon, Undo2, Redo2, Trash2 } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { translations } from '../store/translations';

const getRadialLabels = (lang: 'hy' | 'en' | 'ru') => {
  if (lang === 'hy') {
    return {
      undo: 'Ետ',
      redo: 'Առաջ',
      delete: 'Ջնջել',
      text: 'Տեքստ',
      image: 'Ընտրել նկար'
    };
  }
  if (lang === 'ru') {
    return {
      undo: 'Назад',
      redo: 'Вперед',
      delete: 'Удалить',
      text: 'Текст',
      image: 'Выбрать картинку'
    };
  }
  return {
    undo: 'Undo',
    redo: 'Redo',
    delete: 'Delete',
    text: 'Text',
    image: 'Select Image'
  };
};

export const RadialMenu: React.FC = () => {
  const { 
    addShape, 
    undo, 
    redo, 
    past, 
    future, 
    pages, 
    activePageId, 
    language,
    deleteShape,
    selectedId
  } = useCanvasStore();

  const activePage = pages.find(p => p.id === activePageId) || pages[0]!;
  const centerX = 150 + activePage.width / 2;
  const centerY = 100 + activePage.height / 2;
  const t = translations[language];

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const touchTimerRef = useRef<number | null>(null);

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

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches?.[0] || e.changedTouches?.[0];
      
      if (touch) {
        touchTimerRef.current = window.setTimeout(() => {
          e.preventDefault();
          openMenu(touch.clientX, touch.clientY);
        }, 700);
      }
    };

    const handleTouchEnd = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
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

  const handleAddText = () => {
    addShape({
      type: 'text',
      x: centerX - 125,
      y: centerY - 20,
      width: 250,
      height: 40,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      text: t.placeholderText,
      fontSize: 24,
      fontFamily: 'Inter',
      glowColor: '',
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
          const img = new Image();
          img.src = event.target.result as string;
          img.onload = () => {
            const maxDim = 250;
            let w = img.naturalWidth;
            let h = img.naturalHeight;
            if (w > h) {
              h = (h / w) * maxDim;
              w = maxDim;
            } else {
              w = (w / h) * maxDim;
              h = maxDim;
            }

            addShape({
              type: 'image',
              x: centerX - w / 2,
              y: centerY - h / 2,
              width: w,
              height: h,
              fill: '',
              stroke: '',
              strokeWidth: 0,
              rotation: 0,
              opacity: 1,
              src: img.src,
              glowColor: '#00f2fe',
              glowBlur: 0,
            });
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const labels = getRadialLabels(language);

  const items = [
    { 
      icon: <Undo2 size={18} />, 
      label: labels.undo, 
      action: () => { undo(); closeMenu(); }, 
      disabled: past.length === 0 
    },
    { 
      icon: <Redo2 size={18} />, 
      label: labels.redo, 
      action: () => { redo(); closeMenu(); }, 
      disabled: future.length === 0 
    },
    { 
      icon: <Trash2 size={18} />, 
      label: labels.delete, 
      action: () => { if (selectedId) deleteShape(selectedId); closeMenu(); }, 
      disabled: !selectedId 
    },
    { 
      icon: <Type size={18} />, 
      label: labels.text, 
      action: handleAddText 
    },
    { 
      icon: <ImageIcon size={18} />, 
      label: labels.image, 
      action: triggerFileInput 
    },
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
            const angle = (index * 2 * Math.PI) / items.length - Math.PI / 2;
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