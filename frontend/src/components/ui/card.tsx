import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
}

export function Card({ children, className = '', hover = false, gradient = false, glass = false }: CardProps) {
  const baseStyles: React.CSSProperties = {
    padding: '24px',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
  };

  const hoverStyles: React.CSSProperties = hover ? {
    cursor: 'pointer',
  } : {};

  let backgroundStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
  };

  if (glass) {
    backgroundStyles = {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    };
  }

  if (gradient) {
    backgroundStyles = {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      border: '1px solid rgba(102, 126, 234, 0.3)',
    };
  }

  return (
    <div
      className={`${hover ? 'hover-lift' : ''} ${className}`}
      style={{
        ...baseStyles,
        ...backgroundStyles,
        ...hoverStyles,
      }}
    >
      {children}
    </div>
  );
}


