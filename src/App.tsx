import React from 'react';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { RadialMenu } from './components/RadialMenu';
import { ContextHUD } from './components/ContextHUD';
import { Sidebar } from './components/Sidebar';
// RightPanel removed per UI simplification request
import { Toolbar } from './components/Toolbar';
import './index.css';

function App() {
  return (
    <React.Fragment>
      <button
        className="top-open-image-button"
        onClick={() => {
          const input = document.getElementById('open-image-input') as HTMLInputElement | null;
          input?.click();
        }}
      >
        Բացել նկարը
      </button>

      {/* Sidebar Navigation & Tools on Left */}
      <Sidebar />

      {/* Interactive Infinite Canvas on Right */}
      <InteractiveCanvas />

      {/* Bottom Toolbar */}
      <Toolbar />

      {/* RightPanel removed to simplify layout */}

      {/* Context HUD - Only visible when a shape is selected */}
      <ContextHUD />

      {/* Right-click/Touch Radial Menu */}
      <RadialMenu />
    </React.Fragment>
  );
}

export default App;

