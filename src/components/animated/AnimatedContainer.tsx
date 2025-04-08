import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { containerVariants } from '../../utils/animations';

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  withParallax?: boolean;
  delay?: number;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className = '',
  withParallax = false,
  delay = 0
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, 
    [0, 300], 
    [0, withParallax ? 50 : 0]
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      style={withParallax ? { y } : undefined}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
};
