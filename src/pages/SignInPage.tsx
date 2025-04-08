import { SignIn } from '@clerk/clerk-react';
import { SpaceBackground } from '../components/SpaceBackground';

export const SignInPage = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-900">
      <SpaceBackground />
      <div className="fixed inset-0 bg-blue-500/5 mix-blend-multiply pointer-events-none" />
      <div className="relative z-10 w-full max-w-md px-4 py-6">
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full" />
        <SignIn 
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/app"
          appearance={{
            elements: {
              rootBox: "relative z-10",
              card: "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButton: "bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700",
              socialButtonsBlockButtonText: "text-white",
              formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
              formFieldInput: "bg-gray-700/50 border-gray-600/50 text-white",
              formFieldLabel: "text-gray-300",
              footerActionLink: "!hidden",
              footerActionText: "!hidden",
              footer: "!hidden opacity-0 invisible h-0",
              footerText: "!hidden"
            }
          }}
        />
      </div>
    </div>
  );
};

export default SignInPage;
