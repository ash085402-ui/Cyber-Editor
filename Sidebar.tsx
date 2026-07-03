import React, { useRef } from 'react';
import { Menu, X, Image as ImageIcon } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { translations } from '../store/translations';

export const Sidebar: React.FC = () => {
  const { addShape, sidebarOpen, toggleSidebar, language, pages, activePageId } = useCanvasStore();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            const activePage = pages.find((p) => p.id === activePageId) || pages[0]!;
            const centerX = 150 + activePage.width / 2;
            const centerY = 100 + activePage.height / 2;

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
              glowBlur: 0
            });
          };
        }
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <>
      <button
        className="hamburger-toggle-btn"
        onClick={toggleSidebar}
        title={sidebarOpen ? t.closeMenu : t.openMenu}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`nav-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div style={{ padding: '12px' }}>
          <button className="hud-button w-full" onClick={() => imageInputRef.current?.click()}>
            <ImageIcon size={16} style={{ marginRight: '8px' }} /> {t.openImage}
          </button>
        </div>

        <input type="file" ref={imageInputRef} id="open-image-input" style={{ display: 'none' }} accept="image/*" onChange={handleImageFileChange} />

        {/* Sidebar restricted: only Open Image button is shown */}
      </div>
    </>
  );
};
