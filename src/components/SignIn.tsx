import { SignIn as ClerkSignIn } from "@clerk/clerk-react";

export function SignIn() {
  return (
    <ClerkSignIn
      path="/sign-in"
      routing="path"
      afterSignInUrl="/app"
      redirectUrl="/app"
      signUpUrl="/sign-up"
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
          card: 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 [&_div:last-child]:!hidden',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-300',
          socialButtonsBlockButton: 'bg-gray-700/50 hover:bg-gray-600 border border-gray-600/50',
          socialButtonsBlockButtonText: 'text-white',
          formFieldLabel: 'text-gray-300',
          formFieldInput: 'bg-gray-700/50 border-gray-600/50 text-white',
          footerActionLink: '!hidden opacity-0',
          footer: "!hidden opacity-0 invisible h-0 [&_*]:!hidden",
          footerText: "!hidden opacity-0",
          footerAction: "!hidden opacity-0",
          footerActionText: "!hidden opacity-0",
          rootBox: "mx-auto [&_cl-development-mode-badge]:!hidden [&>div:last-child]:!hidden"
        }
      }}
    />
  );
}
