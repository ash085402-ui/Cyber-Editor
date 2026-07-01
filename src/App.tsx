import React from 'react';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { RadialMenu } from './components/RadialMenu';
import { ContextHUD } from './components/ContextHUD';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import './index.css';

function App() {
  return (
    <React.Fragment>
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
