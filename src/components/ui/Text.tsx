import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedText } from '../animated/AnimatedText';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  glow?: boolean;
  gradient?: boolean;
  animate?: boolean;
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  glow = false,
  gradient = false,
  animate = false,
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'h1':
        return 'text-4xl md:text-5xl font-bold tracking-tight';
      case 'h2':
        return 'text-3xl md:text-4xl font-semibold tracking-tight';
      case 'h3':
        return 'text-2xl md:text-3xl font-semibold tracking-tight';
      case 'h4':
        return 'text-xl md:text-2xl font-semibold tracking-tight';
      case 'caption':
        return 'text-sm text-gray-400';
      default:
        return 'text-base leading-relaxed';
    }
  };

  const combinedClasses = `
    ${getVariantClasses()}
    ${glow ? 'neon-text' : ''}
    ${gradient ? 'text-gradient-neon' : ''}
    ${className}
  `;

  if (animate) {
    return (
      <AnimatedText className={combinedClasses}>
        {children}
      </AnimatedText>
    );
  }

  return (
    <motion.div
      className={combinedClasses}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
