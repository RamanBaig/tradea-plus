import { useState, useEffect } from 'react';

const COOLDOWN_DURATION = 60; // 60 seconds cooldown

export const useAnalysisCooldown = () => {
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!isInCooldown) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = COOLDOWN_DURATION - elapsed;
      
      if (remaining <= 0) {
        setIsInCooldown(false);
        setRemainingTime(0);
        clearInterval(timer);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isInCooldown]);

  const startCooldown = () => {
    setIsInCooldown(true);
    setRemainingTime(COOLDOWN_DURATION);
  };

  return {
    isInCooldown,
    remainingTime,
    startCooldown
  };
};
