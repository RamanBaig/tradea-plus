import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <BaseClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#60A5FA',
          colorBackground: 'rgba(15, 23, 42, 0.3)',
          colorText: '#fff',
          colorTextSecondary: '#94A3B8'
        },
        elements: {
          card: "bg-slate-900/30 backdrop-blur-xl border border-blue-500/20 shadow-2xl shadow-blue-500/5 rounded-xl mx-auto max-w-md w-full",
          headerTitle: "text-white text-2xl font-bold",
          headerSubtitle: "text-blue-200/80",
          socialButtonsBlockButton: "bg-slate-800/50 border border-blue-300/10 hover:bg-slate-700/50 hover:border-blue-400/20 transition-all duration-200",
          socialButtonsBlockButtonText: "text-white",
          formButtonPrimary: "bg-blue-500/80 hover:bg-blue-600/80 shadow-lg shadow-blue-500/20 transition-all duration-200",
          formFieldInput: "bg-slate-800/30 border-blue-300/20 text-white placeholder-blue-200/30 focus:border-blue-400/50 transition-all duration-200",
          formFieldLabel: "text-blue-100/80",
          dividerLine: "bg-blue-300/10",
          dividerText: "text-blue-200/50",
          footerActionLink: "text-blue-400 hover:text-blue-300",
          footer: "[&>*:first-child]:block [&>*:nth-child(n+2)]:!hidden",
          rootBox: "p-4 sm:p-6 z-50",
          main: "relative",
          card__main: "relative z-10 p-6",
          badge: "[&_div[data-localization-key='developmentBadge']]:!hidden"
        }
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}
