import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { LineChart } from "lucide-react";
import { WinRateStats } from './WinRateStats';
import { FreeAnalysisCounter } from './FreeAnalysisCounter';
import { AdminNavButton } from './AdminNavButton';
import { NotificationsIndicator } from './NotificationsIndicator';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800/40 backdrop-blur-md border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Admin Button */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <LineChart className="w-6 h-6 text-[#00ff9d] transition-all duration-300 
                group-hover:scale-110 group-hover:rotate-12 
                drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]" 
              />
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-[#ffffff] via-[#00ff9d]/90 to-[#00ff9d] bg-clip-text text-transparent">
                  TradeA
                </span>
                <span className="inline-block bg-gradient-to-r from-[#00ff9d] to-[#00bf76] bg-clip-text text-transparent">
                  +
                </span>
              </span>
            </Link>
            <SignedIn>
              <AdminNavButton />
            </SignedIn>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <FreeAnalysisCounter />
              <WinRateStats />
              <NotificationsIndicator />
              <UserButton 
                afterSignOutUrl="/sign-in"
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
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}
