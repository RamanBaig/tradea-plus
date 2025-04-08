import React from 'react';

type AnimationVariant = 'fade' | 'slideUp' | 'typewriter' | 'glow';

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: AnimationVariant;
  duration?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  children, 
  delay = 0,
  duration = 800,
  variant = 'fade',
  className = '' 
}) => {
  const getAnimationClass = () => {
    switch (variant) {
      case 'slideUp':
        return 'animate-slideUp';
      case 'typewriter':
        return 'animate-typewriter';
      case 'glow':
        return 'animate-glow';
      default:
        return 'animate-fadeIn';
    }
  };

  return (
    <div
      className={`opacity-0 ${getAnimationClass()} ${className}`}
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'forwards' 
      }}
    >
      {children}
    </div>
  );
};
