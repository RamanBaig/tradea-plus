import { Outlet, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { Navbar } from './components/Navbar';
import { HelpButton } from './components/HelpButton';
import { InteractiveCursor } from './components/InteractiveCursor';
import { InteractiveBubbles } from './components/InteractiveBubbles';
import { GridBackground } from './components/GridBackground';
import { GlowingBorder } from './components/GlowingBorder';

function App() {
  const { pathname } = useLocation();
  const isPublicRoute = pathname === '/';

  return (
    <div className="min-h-screen relative bg-gray-900">
      <GridBackground />
      <GlowingBorder />
      <InteractiveBubbles />
      <InteractiveCursor />
      {isPublicRoute ? (
        <Outlet />
      ) : (
        <>
          <SignedIn>
            <Navbar />
            <div className="relative">
              <Outlet />
              <HelpButton />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center justify-center min-h-screen">
              <SignIn redirectUrl={pathname} />
            </div>
          </SignedOut>
        </>
      )}
    </div>
  );
}

export default App;