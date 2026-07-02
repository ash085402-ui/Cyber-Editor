import React from 'react';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { RadialMenu } from './components/RadialMenu';
import { ContextHUD } from './components/ContextHUD';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { useCanvasStore } from './store/canvasStore';
import './index.css';

function App() {
  const { language, setLanguage } = useCanvasStore();

  return (
    <React.Fragment>
      {/* Language Selector in Top Right Corner */}
      <div className="language-selector glass-panel">
        <button
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          EN
        </button>
        <button
          className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
          onClick={() => setLanguage('ru')}
        >
          RU
        </button>
        <button
          className={`lang-btn ${language === 'hy' ? 'active' : ''}`}
          onClick={() => setLanguage('hy')}
        >
          HY
        </button>
      </div>

      {/* Sidebar Navigation & Tools on Left */}
      <Sidebar />

      {/* Interactive Infinite Canvas on Right */}
      <InteractiveCanvas />

      {/* Pages list panel on the right */}
      <RightPanel />

      {/* Context HUD - Only visible when a shape is selected */}
      <ContextHUD />

      {/* Right-click/Touch Radial Menu */}
      <RadialMenu />
    </React.Fragment>
  );
}

export default App;

