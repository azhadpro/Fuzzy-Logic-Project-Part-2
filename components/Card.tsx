import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-ios-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};