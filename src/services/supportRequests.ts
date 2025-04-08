import type { UserResource } from '@clerk/types';

export interface SupportRequest {
  id: string;
  userId: string;
  userEmail: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  updatedAt: string;
  responses?: Array<{
    id: string;
    message: string;
    createdAt: string;
    isStaff: boolean;
  }>;
}

const API_URL = import.meta.env.VITE_SUPPORT_API_URL || 'https://api.tradea.plus/v1';


// Removed unused handleResponse function to resolve the error

export async function createSupportRequest(
  user: UserResource,
  data: { email: string; description: string }
): Promise<SupportRequest> {
  try {
    const token = user.publicMetadata.token as string;
    
    const response = await fetch(`${API_URL}/support/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        userId: user.id,
        email: data.email,
        description: data.description,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create support request';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      
      throw new Error(`${errorMessage} (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error('Support request failed:', error);
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to reach support service. Please check your connection.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

export async function getUserSupportRequests(user: UserResource): Promise<SupportRequest[]> {
  const response = await fetch(`${API_URL}/requests/user/${user.id}`, {
    headers: {
      'Authorization': `Bearer ${user.publicMetadata.token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch support requests');
  }

  return response.json();
}
