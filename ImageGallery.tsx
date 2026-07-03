import React from 'react';

interface Props {
  isOpen: boolean;
  images: string[];
  onClose: () => void;
  onSelect: (src: string) => void;
}

const ImageGallery: React.FC<Props> = ({ isOpen, images, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: 16, borderRadius: 8, maxWidth: '90%', maxHeight: '80%', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3>Ընտրել նկար</h3>
          <button onClick={onClose}>Փակել</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 140px)', gap: 12 }}>
          {images.map((src) => (
            <div key={src} style={{ cursor: 'pointer' }} onClick={() => onSelect(src)}>
              <img src={src} alt="gallery" style={{ width: 140, height: 100, objectFit: 'cover', display: 'block', borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
