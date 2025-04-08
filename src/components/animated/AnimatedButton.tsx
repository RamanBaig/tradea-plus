import React from 'react';
import { motion } from 'framer-motion';
import { modernButtonVariants } from '../../utils/animations';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  glowColor?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  glowColor = 'rgba(0, 255, 157, 0.5)', // Updated default glow color
  className = '',
  variant = 'primary',
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-800/50 hover:bg-gray-700/50 text-[#00ff9d] border-[#00ff9d]/30';
      case 'ghost':
        return 'bg-transparent hover:bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30';
      default:
        return 'bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30 text-[#00ff9d] border-[#00ff9d]/30';
    }
  };

  return (
    <motion.button
      variants={modernButtonVariants}
      initial="initial"
      animate="visible"
      whileHover="whileHover"
      whileTap="whileTap"
      className={`
        relative group rounded-lg px-4 py-2
        backdrop-blur-sm
        shadow-lg shadow-[#00ff9d]/5
        hover:shadow-[#00ff9d]/20
        ${getVariantClasses()}
        transition-all duration-300
        ${className}
      `}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {/* Updated glow effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
          blur-xl transition-all duration-500"
        style={{ 
          background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`
        }}
      />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
        bg-gradient-to-r from-transparent via-white/5 to-transparent
        transition-transform duration-1000 ease-in-out opacity-50"
      />
      
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
    </motion.button>
  );
};
