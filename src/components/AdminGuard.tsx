import { useUser } from '@clerk/nextjs';
import { Navigate } from 'react-router-dom';

// Add the admin user IDs here
const ADMIN_USER_IDS = [
  'user_2v0X4Rfy4U6wsZnT6OMKJGSpNqo`', // Replace with your admin user ID
  'user_2sF7P8RmU30ZAPZRMJkJ1NjUBib'  // Replace with your second admin user ID
];

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};