import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false }) => {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        ${hoverable ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-6 py-4 border-b border-neutral-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-6 py-4 border-t border-neutral-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;