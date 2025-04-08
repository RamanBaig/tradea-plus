declare module '@clerk/clerk-react' {
  import { ComponentType, ReactNode } from 'react';
  import type { UserResource } from '@clerk/types';

  export interface ClerkProviderProps {
    publishableKey: string;
    children: ReactNode;
    appearance?: {
      baseTheme?: any;
      variables?: Record<string, string>;
      elements?: Record<string, string | {
        badge?: string;
      }>;
    };
  }

  export interface SignInProps {
    routing?: 'path' | 'hash' | 'virtual';
    path?: string;
    signUpUrl?: string;
    afterSignInUrl?: string;
    redirectUrl?: string;
    appearance?: {
      baseTheme?: any;
      variables?: Record<string, string>;
      elements?: Record<string, string>;
    };
  }

  export interface SignUpProps {
    routing?: 'path' | 'hash' | 'virtual';
    path?: string;
    signInUrl?: string;
    afterSignUpUrl?: string;
    redirectUrl?: string;
    appearance?: {
      baseTheme?: any;
      variables?: Record<string, string>;
      elements?: Record<string, string>;
    };
  }

  export interface SignInButtonProps {
    mode?: 'modal' | 'redirect';
    redirectUrl?: string;
    children?: ReactNode;
    appearance?: {
      elements?: Record<string, string>;
    };
  }

  export interface UserButtonProps {
    afterSignOutUrl?: string;
    appearance?: {
      elements?: Record<string, string>;
    };
  }

  export const ClerkProvider: ComponentType<ClerkProviderProps>;
  export const SignedIn: ComponentType<{ children: ReactNode }>;
  export const SignedOut: ComponentType<{ children: ReactNode }>;
  export const SignIn: ComponentType<SignInProps>;
  export const SignUp: ComponentType<SignUpProps>;
  export const SignInButton: ComponentType<SignInButtonProps>;
  export const UserButton: ComponentType<UserButtonProps>;
  export const useClerk: () => { signOut: () => Promise<void> };
  export const useAuth: () => { 
    isSignedIn: boolean;
    isLoaded: boolean;
  };
  export const useUser: () => {
    user: UserResource | null;
    isLoaded: boolean;
    isSignedIn: boolean;
  }
}
