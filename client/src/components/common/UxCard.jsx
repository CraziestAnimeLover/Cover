import React from 'react';

export default function UxCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}

