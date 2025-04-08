import { useUser } from '@clerk/nextjs';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

// Admin user IDs
const ADMIN_USER_IDS = [
  'user_2v0X4Rfy4U6wsZnT6OMKJGSpNqo`',
  'user_2sF7P8RmU30ZAPZRMJkJ1NjUBib'
];

export const AdminNavButton = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user || !ADMIN_USER_IDS.includes(user.id)) {
    return null;
  }

  return (
    <Link 
      to="/admin" 
      className="flex items-center gap-2 px-3 py-2 rounded-lg
        bg-gray-700/40 hover:bg-gray-700/60
        border border-gray-600/50 hover:border-blue-500/30
        text-gray-300 hover:text-white
        transition-all duration-300"
    >
      <Settings className="w-4 h-4" />
      <span className="text-sm">Admin</span>
    </Link>
  );
};