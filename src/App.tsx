import React from 'react';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { RadialMenu } from './components/RadialMenu';
import { ContextHUD } from './components/ContextHUD';
import { Sidebar } from './components/Sidebar';
import './index.css';

function App() {
  return (
    <React.Fragment>


      {/* Sidebar Navigation & Tools on Left */}
      <Sidebar />

      {/* Interactive Infinite Canvas on Right */}
      <InteractiveCanvas />

      {/* Context HUD - Only visible when a shape is selected */}
      <ContextHUD />

      {/* Right-click/Touch Radial Menu */}
      <RadialMenu />
    </React.Fragment>
  );
}

export default App;

