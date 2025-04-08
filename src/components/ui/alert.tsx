import React from 'react';

interface AlertProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export const Alert: React.FC<AlertProps> = ({ 
  className = '', 
  variant = 'default',
  children 
}) => {
  const variantClasses = {
    default: 'bg-gray-800 text-gray-200',
    destructive: 'bg-red-900/20 text-red-400 border-red-700/50'
  };

  return (
    <div className={`relative w-full rounded-lg border border-gray-700 p-4 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  className = '', 
  children 
}) => {
  return (
    <div className={`mt-1 text-sm ${className}`}>
      {children}
    </div>
  );
};