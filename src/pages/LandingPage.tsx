import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { Target, LineChart, Percent } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="text-center w-full max-w-5xl mx-auto py-16">
          {/* Title */}
          <h1 className="text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-[#ffffff] via-[#00ff9d]/90 to-[#00ff9d] bg-clip-text text-transparent">
              TradeA
            </span>
            <span className="inline-block bg-gradient-to-r from-[#00ff9d] to-[#00bf76] bg-clip-text text-transparent">
              +
            </span>
          </h1>

          {/* Slogan */}
          <p className="text-2xl font-['JetBrains_Mono'] text-[#00ff9d] max-w-2xl mx-auto mb-16">
            With TradeA+, You Will Only See Green
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="glass-panel p-10 text-center transform hover:scale-[1.02] hover:-translate-y-1
              transition-all duration-500 ease-out animate-float"
            >
              <div className="mb-4 inline-block p-3 rounded-xl bg-[#00ff9d]/10">
                <Percent className="w-6 h-6 text-[#00ff9d]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#00ff9d]">
                Win Rate Tracking
              </h3>
              <p className="text-gray-300">
                Track your success with our advanced win/loss calculator
              </p>
            </div>
            <div className="glass-panel p-10 text-center transform hover:scale-[1.02] hover:-translate-y-1
              transition-all duration-500 ease-out animate-float animation-delay-200"
            >
              <div className="mb-4 inline-block p-3 rounded-xl bg-[#00ff9d]/10">
                <LineChart className="w-6 h-6 text-[#00ff9d]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#00ff9d]">
                Real-Time Analysis
              </h3>
              <p className="text-gray-300">
                Instant insights for better trading decisions
              </p>
            </div>
            <div className="glass-panel p-10 text-center transform hover:scale-[1.02] hover:-translate-y-1
              transition-all duration-500 ease-out animate-float animation-delay-400"
            >
              <div className="mb-4 inline-block p-3 rounded-xl bg-[#00ff9d]/10">
                <Target className="w-6 h-6 text-[#00ff9d]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#00ff9d]">
                Multi-Timeframe
              </h3>
              <p className="text-gray-300">
                Comprehensive analysis across multiple timeframes
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-16">
            {isSignedIn ? (
              <button
                onClick={handleGetStarted}
                className="neon-button glow-effect group relative px-12 py-5 text-2xl font-semibold
                  rounded-xl transition-all duration-300 ease-out hover:-translate-y-1"
              >
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Go to App
                </span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-purple-500/0
                  rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </button>
            ) : (
              <SignInButton mode="modal" redirectUrl="/app">
                <button className="neon-button glow-effect group relative px-12 py-5 text-2xl font-semibold
                  rounded-xl transition-all duration-300 ease-out hover:-translate-y-1"
                >
                  <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Get Started
                  </span>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-purple-500/0
                    rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
