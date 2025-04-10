import React from 'react';

type MobileContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function MobileContainer({ children, className = '' }: MobileContainerProps) {
  return (
    <div 
      className={`mobile-container mx-auto ${className}`}
      style={{
        width: '308px',
        maxWidth: '308px',
        fontFamily: 'Arial, sans-serif',
        margin: '0 auto',
        backgroundColor: '#F9FAFB'
      }}
    >
      {children}
    </div>
  );
}