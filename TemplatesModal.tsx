import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { TEMPLATES } from '../store/templates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (imageUrl: string) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="templates-modal-overlay">
      <div className="templates-modal-content">
        <div className="templates-modal-header">
          <h2 className="templates-modal-title">Device & Grid Templates</h2>
          <button onClick={onClose} className="templates-modal-close">
            <X size={20} />
          </button>
        </div>

        <p className="templates-modal-subtitle">
          Ընտրեք սարքի էկրանի մակետ կամ տեխնիկական ֆոն՝ որպես հիմնական շերտ ավելացնելու համար։
        </p>

        <div className="templates-grid">
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="template-card"
              onClick={() => {
                onSelectTemplate(tmpl.url);
                onClose();
              }}
            >
              <div className="template-preview-wrapper">
                <img
                  src={tmpl.url}
                  alt={tmpl.name}
                  className="template-preview-img"
                  loading="lazy"
                />
                <span className="template-category-badge">
                  <ImageIcon size={12} />
                  <span style={{ marginLeft: '4px' }}>
                    Template Image
                  </span>
                </span>
              </div>
              
              <div className="template-info">
                <h3 className="template-name">{tmpl.name}</h3>
                <p className="template-desc">{tmpl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
