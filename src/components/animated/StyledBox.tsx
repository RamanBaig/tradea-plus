import React from 'react';

interface StyledBoxProps {
  children: React.ReactNode;
  variant?: 'glass' | 'neumorphic' | 'floating';
  className?: string;
  onClick?: () => void;
}

export const StyledBox: React.FC<StyledBoxProps> = ({
  children,
  variant = 'glass',
  className = '',
  onClick
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'neumorphic':
        return 'bg-gray-800/80 shadow-[20px_20px_60px_#1a1f35,-20px_-20px_60px_#24293f] hover:shadow-[#00ff9d]/5';
      case 'floating':
        return 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 hover:translate-y-[-2px] hover:shadow-[#00ff9d]/20';
      default: // glass
        return 'bg-gray-800/50 backdrop-blur-xl border border-[#00ff9d]/10 hover:border-[#00ff9d]/30';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl transition-all duration-300
        ${getVariantClasses()}
        hover:shadow-lg
        group
        ${className}
      `}
    >
      {children}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 
        bg-gradient-to-r from-[#00ff9d]/0 via-[#00ff9d]/10 to-[#00ff9d]/0
        blur-xl transition-opacity duration-500 pointer-events-none" 
      />
    </div>
  );
};
