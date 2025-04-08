import { UserButton } from '@clerk/clerk-react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function UserProfileDropdown() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2.5 ml-1">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded-lg 
          bg-gray-800/40 hover:bg-gray-700/40 
          border border-gray-700/30 hover:border-blue-500/30 
          transition-all duration-300
          shadow-sm hover:shadow-md hover:shadow-blue-500/10"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-yellow-400" />
        ) : (
          <Moon className="w-4 h-4 text-blue-400" />
        )}
      </button>

      {/* User Profile Button */}
      <UserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-8 h-8 rounded-lg",
            userButtonPopoverCard: "bg-gray-800/95 backdrop-blur-sm border border-gray-700/50",
            userButtonPopoverActionButton: "hover:bg-gray-700/50",
            userButtonPopoverActionButtonText: "text-gray-300 hover:text-white",
            userButtonPopoverFooter: "hidden"
          }
        }}
      />
    </div>
  );
}
