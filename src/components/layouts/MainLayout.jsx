import React from 'react';

/**
 * MainLayout component for career tools pages
 * Provides a consistent layout structure
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
};

export default MainLayout;
