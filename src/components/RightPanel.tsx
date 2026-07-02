import React, { useState } from 'react';
import { Plus, Trash2, Copy, Move, Settings, Check, X } from 'lucide-react';
import { useCanvasStore, type Page } from '../store/canvasStore';
import { translations } from '../store/translations';

export const RightPanel: React.FC = () => {
  const {
    pages,
    activePageId,
    setActivePageId,
    addPage,
    deletePage,
    duplicatePage,
    reorderPages,
    updatePageName,
    language
  } = useCanvasStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const t = translations[language];

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderPages(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  const startEditing = (page: Page, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPageId(page.id);
    setEditName(page.name);
  };

  const savePageSettings = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      updatePageName(id, editName);
    }
    setEditingPageId(null);
  };

  return (
    <div className="right-pages-panel glass-panel">
      <div className="right-panel-header">
        <h3 className="panel-title">{t.pages}</h3>
        <button className="add-page-btn" onClick={() => addPage()} title={t.addPage}>
          <Plus size={16} /> {t.addPage}
        </button>
      </div>

      <div className="pages-list">
        {pages.map((page, index) => {
          const isActive = page.id === activePageId;
          const isEditing = page.id === editingPageId;

          return (
            <div
              key={page.id}
              className={`page-card ${isActive ? 'active' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
              onClick={() => setActivePageId(page.id)}
              draggable={!isEditing}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              <div className="page-card-header">
                <div className="drag-handle" title="Move">
                  <Move size={12} className="text-muted" />
                </div>
                <span className="page-index-label">{t.pageIndex} {index + 1}</span>

                <div className="page-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => startEditing(page, e)}
                    title={t.settings}
                  >
                    <Settings size={12} />
                  </button>
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicatePage(page.id);
                    }}
                    title={t.duplicatePage}
                  >
                    <Copy size={12} />
                  </button>
                  {pages.length > 1 && (
                    <button
                      className="action-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(page.id);
                      }}
                      title={t.deletePage}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <form
                  className="page-edit-form"
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={(e) => savePageSettings(page.id, e)}
                >
                  <div className="form-group">
                    <label>{t.name}</label>
                    <input
                      type="text"
                      className="cyber-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="form-btn success" title={t.save}>
                      <Check size={12} />
                    </button>
                    <button
                      type="button"
                      className="form-btn cancel"
                      onClick={() => setEditingPageId(null)}
                      title={t.cancel}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="page-preview-container">
                  {/* Miniature A4 aspect ratio display representing the page */}
                  <div 
                    className="page-miniature-box"
                    style={{
                      aspectRatio: `${page.width} / ${page.height}`,
                    }}
                  >
                    {/* Small representation of internal shapes */}
                    {page.shapes.slice(0, 5).map((shape, idx) => {
                      const rx = (shape.x / page.width) * 100;
                      const ry = (shape.y / page.height) * 100;
                      const rw = (shape.width / page.width) * 100;
                      const rh = (shape.height / page.height) * 100;

                      return (
                        <div
                          key={shape.id || idx}
                          className="mini-shape-rep"
                          style={{
                            left: `${rx}%`,
                            top: `${ry}%`,
                            width: `${Math.max(5, rw)}%`,
                            height: `${Math.max(5, rh)}%`,
                            borderRadius: shape.type === 'circle' ? '50%' : '2px',
                            background: shape.fill || 'var(--purple)',
                            opacity: 0.6,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="page-details-text">
                    <div className="page-title-name">{page.name}</div>
                    <div className="page-size-label">
                      {page.width} × {page.height} px
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
