import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getUserMetadata, updateUserMetadata } from '../services/userMetadata';
import { FREE_ANALYSES_LIMIT } from '../constants/limits';

export const usePremiumStatus = () => {
  const { user, isLoaded } = useUser();
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Load stored values from metadata
    getUserMetadata(user).then(metadata => {
      setAnalysisCount(metadata.analysisCount || 0);
      setIsPremium(metadata.isPremium || false);
    });
  }, [user, isLoaded]);

  const incrementAnalysisCount = async () => {
    if (!user) return false;
    if (isPremium) return true;

    // Strict check if already at or exceeded limit
    if (analysisCount >= FREE_ANALYSES_LIMIT) {
      setShowPopup(true);
      return false;
    }

    try {
      const newCount = analysisCount + 1;
      setAnalysisCount(newCount);
      
      await updateUserMetadata(user, { analysisCount: newCount });

      // Show popup when analysis count reaches the limit
      if (newCount >= FREE_ANALYSES_LIMIT) {
        setShowPopup(true);
      }
      return true;
    } catch (error) {
      console.error('Failed to update analysis count:', error);
      setAnalysisCount(analysisCount);
      return false;
    }
  };

  const handlePayment = async () => {
    if (!user) return;
    
    await updateUserMetadata(user, { isPremium: true });
    setIsPremium(true);
    setShowPopup(false);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return {
    isPremium,
    showPopup,
    incrementAnalysisCount,
    handlePayment,
    closePopup,
    analysisCount
  };
};
