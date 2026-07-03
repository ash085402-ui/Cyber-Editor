import React from 'react';

export const Toolbar: React.FC = () => {
  // Keep bottom toolbar container for layout but remove shape/text/image buttons
  // as requested — the "Open Image" action is available via the main menu (sidebar).
  return <div className="bottom-toolbar glass-panel" />;
};
