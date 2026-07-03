import React, { useState } from 'react';
import { X, Download, FileJson, FileText, Image as ImageIcon } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { translations } from '../store/translations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageRef: React.RefObject<any>;
  shapes: any[];
  activePage: {
    width: number;
    height: number;
  };
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  stageRef,
  shapes,
  activePage,
}) => {
  const { language } = useCanvasStore();
  const t = translations[language];
  const [filename, setFilename] = useState(`design-${Date.now()}`);
  const [format, setFormat] = useState<'png' | 'jpg' | 'txt' | 'rtf'>('png');
  const [isExporting, setIsExporting] = useState(false);


  if (!isOpen) return null;

  const dataURLToBlob = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    const header = arr[0] || '';
    const match = header.match(/:(.*?);/);
    const mime = match && match[1] ? match[1] : 'image/png';
    const base64Data = arr[1] || '';
    const bstr = atob(base64Data);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const saveFile = async (blob: Blob, suggestedName: string, mimeType: string, extension: string) => {
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName,
          types: [
            {
              description:
                format === 'png' ? 'PNG Image' :
                format === 'jpg' ? 'JPEG Image' :
                format === 'txt' ? 'Plain Text File' : 'Rich Text File',
              accept: {
                [mimeType]: [extension],
              },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return false; // User cancelled
        }
        console.error('Save File Picker failed, falling back:', err);
      }
    }

    // Fallback standard download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) return;

    setIsExporting(true);

    try {
      const nameWithExt = `${filename.trim()}.${format}`;
      
      if (format === 'txt') {
        const textShapes = shapes
          .filter((s) => s.type === 'text')
          .sort((a, b) => {
            if (Math.abs(a.y - b.y) < 15) return a.x - b.x;
            return a.y - b.y;
          });
        const textContent = textShapes.map((s) => s.text || '').join('\n');
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        await saveFile(blob, nameWithExt, 'text/plain', '.txt');
      } 
      else if (format === 'rtf') {
        const textShapes = shapes
          .filter((s) => s.type === 'text')
          .sort((a, b) => {
            if (Math.abs(a.y - b.y) < 15) return a.x - b.x;
            return a.y - b.y;
          });

        let rtf = '{\\rtf1\\ansi\\deff0\n';
        rtf += '{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fnil\\fcharset204 Arial;}}\n';
        rtf += '{\\colortbl ;\\red0\\green0\\blue0;\\red255\\green255\\blue255;}\n';
        rtf += '\\viewkind4\\uc1\\pard\\f0\\fs24 \n';
        
        textShapes.forEach((s) => {
          const textVal = s.text || '';
          const escapedText = textVal
            .replace(/\\/g, '\\\\')
            .replace(/{/g, '\\{')
            .replace(/}/g, '\\}');
          rtf += `\\line ${escapedText}\n`;
        });
        
        rtf += '}';
        const blob = new Blob([rtf], { type: 'application/rtf' });
        await saveFile(blob, nameWithExt, 'application/rtf', '.rtf');
      } 
      else {
        // PNG or JPG image export using Konva
        const stage = stageRef.current;
        if (stage) {
          // Temporarily hide transformer/selection highlights
          // The transformer is managed in the InteractiveCanvas layer
          const layer = stage.getLayers()[0];
          const transformer = layer?.findOne('Transformer');
          let originalNodes = [];
          if (transformer) {
            originalNodes = transformer.nodes();
            transformer.nodes([]);
            layer.batchDraw();
          }

          // Save current position and scale
          const oldScale = stage.scaleX();
          const oldPos = stage.position();

          // Reset to 1:1 scale and origin for exact cropping
          stage.scale({ x: 1, y: 1 });
          stage.position({ x: 0, y: 0 });
          stage.batchDraw();

          const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
          const extension = format === 'png' ? '.png' : '.jpg';

          const pageGroup = stage.findOne('#a4-page-group');
          const exportX = pageGroup ? pageGroup.x() : 150;
          const exportY = pageGroup ? pageGroup.y() : 100;

          const dataURL = stage.toDataURL({
            x: exportX,
            y: exportY,
            width: activePage.width,
            height: activePage.height,
            pixelRatio: 2,
            mimeType,
          });

          // Restore canvas pan/zoom
          stage.scale({ x: oldScale, y: oldScale });
          stage.position(oldPos);
          stage.batchDraw();

          // Restore transformer selection
          if (transformer && originalNodes.length > 0) {
            transformer.nodes(originalNodes);
            layer.batchDraw();
          }

          const blob = dataURLToBlob(dataURL);
          await saveFile(blob, nameWithExt, mimeType, extension);
        }
      }
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      alert(language === 'hy' ? 'Արտահանման սխալ տեղի ունեցավ:' : language === 'ru' ? 'Произошла ошибка при экспорте.' : 'An error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content export-modal-content">
        <div className="login-modal-header">
          <h2 className="login-modal-title">{t.exportTitle}</h2>
          <button onClick={onClose} className="login-modal-close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleExport} className="export-form">
          <div className="form-group mt-4">
            <label className="cyber-label">{t.name}</label>
            <input
              type="text"
              className="cyber-input w-full"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={t.placeholderText}
              required
              autoFocus
            />
          </div>

          <div className="form-group mt-4">
            <label className="cyber-label">{t.exportFormat}</label>
            <div className="format-grid">
              <button
                type="button"
                className={`format-card ${format === 'png' ? 'active' : ''}`}
                onClick={() => setFormat('png')}
              >
                <ImageIcon size={20} className="format-icon" />
                <span className="format-name">PNG Image</span>
              </button>
              <button
                type="button"
                className={`format-card ${format === 'jpg' ? 'active' : ''}`}
                onClick={() => setFormat('jpg')}
              >
                <ImageIcon size={20} className="format-icon" />
                <span className="format-name">JPG Image</span>
              </button>
              <button
                type="button"
                className={`format-card ${format === 'txt' ? 'active' : ''}`}
                onClick={() => setFormat('txt')}
              >
                <FileText size={20} className="format-icon" />
                <span className="format-name">Plain Text</span>
              </button>
              <button
                type="button"
                className={`format-card ${format === 'rtf' ? 'active' : ''}`}
                onClick={() => setFormat('rtf')}
              >
                <FileJson size={20} className="format-icon" />
                <span className="format-name">Rich Text (RTF)</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isExporting}
            className="google-login-btn mt-6"
            style={{ boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)', background: 'var(--cyan)' }}
          >
            <Download size={16} />
            {isExporting 
              ? (language === 'hy' ? 'Պահպանվում է...' : language === 'ru' ? 'Сохранение...' : 'Saving...') 
              : t.exportBtn}
          </button>
        </form>
      </div>
    </div>
  );
};
