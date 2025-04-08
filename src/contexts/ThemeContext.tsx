import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserMetadata, updateUserMetadata } from '../services/userMetadata';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    if (!isLoaded || !user) return;
    
    // Load theme from user metadata
    getUserMetadata(user).then(metadata => {
      setTheme(metadata.theme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(metadata.theme);
    });
  }, [user, isLoaded]);

  const toggleTheme = async () => {
    if (!user) return;
    
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    
    await updateUserMetadata(user, { theme: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
