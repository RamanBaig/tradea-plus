import React from 'react';
import { motion } from 'framer-motion';
import { futuristicCardVariants } from '../../utils/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
  variant?: 'glass' | 'neumorphic' | 'floating';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  glowOnHover = true,
  variant = 'glass'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'neumorphic':
        return `
          bg-[#141b24]/90
          shadow-[20px_20px_60px_#0a0f16,-20px_-20px_60px_#1e2732]
          border border-[#00ff9d]/10
        `;
      case 'floating':
        return `
          bg-gradient-to-br from-[#141b24]/90 to-[#0a0f16]/90
          border border-[#00ff9d]/20
          shadow-lg shadow-[#00ff9d]/10
        `;
      default: // glass
        return `
          futuristic-panel
          border-[#00ff9d]/20
        `;
    }
  };

  return (
    <motion.div
      variants={futuristicCardVariants}
      initial="initial"
      animate="visible"
      whileHover="hover"
      className={`
        relative group overflow-hidden
        rounded-xl transition-all duration-300
        ${getVariantClasses()}
        hover:border-[#00ff9d]/40
        ${className}
      `}
    >
      {glowOnHover && (
        <>
          <div className="absolute inset-0 -z-10 rounded-xl 
            opacity-0 group-hover:opacity-100 
            bg-gradient-to-r from-[#00ff9d]/0 via-[#00ff9d]/10 to-[#00ff9d]/0
            blur-xl transition-opacity duration-500"
          />
          <div className="absolute inset-0 tech-pattern opacity-10" />
        </>
      )}
      {children}
    </motion.div>
  );
};
